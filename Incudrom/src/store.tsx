import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  AppTheme,
  Application,
  CardColor,
  CardTheme,
  Message,
  Project,
  ProjectVisibility,
  Student,
  Thread,
  UserColor,
} from "./types";
import { AppContext } from "./appContext";
import type { AppContextValue } from "./appContext";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

/**
 * Incudorm app store — Supabase edition with local enhancement layer.
 *
 * Auth is handled by Supabase Auth (email + password, with email confirmation).
 * All data lives in Supabase according to schema.sql.
 */

// ---------------------------------------------------------------------------
// Local metadata persistence (for visibility, cardTheme, userColor, appTheme)
// ---------------------------------------------------------------------------

const PROJECT_META_KEY = "incudorm_project_meta";
const USER_META_KEY = "incudorm_user_meta";
export const APP_THEME_KEY = "incudorm_app_theme";

interface ProjectMeta {
  visibility?: ProjectVisibility;
  cardTheme?: CardTheme;
  color?: CardColor;
}

interface UserMeta {
  color?: UserColor;
  theme?: AppTheme;
}

function getStoredProjectMeta(): Record<string, ProjectMeta> {
  try {
    const raw = localStorage.getItem(PROJECT_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredProjectMeta(id: string, meta: ProjectMeta) {
  try {
    const all = getStoredProjectMeta();
    all[id] = { ...all[id], ...meta };
    localStorage.setItem(PROJECT_META_KEY, JSON.stringify(all));
  } catch {}
}

function getStoredUserMeta(): Record<string, UserMeta> {
  try {
    const raw = localStorage.getItem(USER_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredUserMeta(id: string, meta: UserMeta) {
  try {
    const all = getStoredUserMeta();
    all[id] = { ...all[id], ...meta };
    localStorage.setItem(USER_META_KEY, JSON.stringify(all));
  } catch {}
}

// ---------------------------------------------------------------------------
// Row-shape helpers (snake_case DB columns → camelCase app types)
// ---------------------------------------------------------------------------

interface ProfileRow {
  id: string;
  name: string;
  college: string;
  course: string;
  year: string;
  bio: string;
  skills: string[];
  hours_per_week: number;
  github: string;
  linkedin: string;
  website: string;
  goal: string;
  onboarded: boolean;
  portfolio: { id: string; title: string; description: string; url: string }[];
  created_at: string;
  user_color?: string;
  app_theme?: string;
}

interface ProjectRow {
  id: string;
  owner_id: string;
  title: string;
  pitch: string;
  description: string;
  stage: string;
  hours_per_week: number;
  color: string;
  status: string;
  created_at: string;
  project_roles: { id: string; title: string; skills: string[] }[];
  project_members: { user_id: string }[];
  visibility?: string;
  card_theme?: string;
}

interface ApplicationRow {
  id: string;
  project_id: string;
  role_id: string | null;
  applicant_id: string;
  message: string;
  status: string;
  created_at: string;
}

interface ThreadRow {
  id: string;
  project_id: string | null;
  created_at: string;
  thread_participants: { user_id: string }[];
}

interface MessageRow {
  id: string;
  thread_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
}

function profileToStudent(p: ProfileRow, email: string): Student {
  const meta = getStoredUserMeta()[p.id] ?? {};
  return {
    id: p.id,
    name: p.name,
    email,
    college: p.college,
    course: p.course,
    year: p.year,
    bio: p.bio,
    skills: p.skills,
    hoursPerWeek: p.hours_per_week,
    links: { github: p.github, linkedin: p.linkedin, website: p.website },
    portfolio: p.portfolio ?? [],
    verified: true, // Supabase only creates profiles after email confirmation
    onboarded: p.onboarded,
    goal: p.goal as Student["goal"],
    createdAt: p.created_at,
    color: (p.user_color as UserColor) || meta.color || "sun",
    theme: (p.app_theme as AppTheme) || meta.theme || "classic",
  };
}

function projectRowToProject(r: ProjectRow): Project {
  const meta = getStoredProjectMeta()[r.id] ?? {};
  return {
    id: r.id,
    ownerId: r.owner_id,
    title: r.title,
    pitch: r.pitch,
    description: r.description,
    stage: r.stage as Project["stage"],
    hoursPerWeek: r.hours_per_week,
    roles: (r.project_roles ?? []).map((role) => ({
      id: role.id,
      title: role.title,
      skills: role.skills,
    })),
    teamIds: (r.project_members ?? []).map((m) => m.user_id),
    status: r.status as Project["status"],
    createdAt: r.created_at,
    color: ((r.color || meta.color) as Project["color"]) || "sun",
    cardTheme: (r.card_theme as CardTheme) || meta.cardTheme || "classic",
    visibility: (r.visibility as ProjectVisibility) || meta.visibility || "everyone",
  };
}

function appRowToApplication(r: ApplicationRow): Application {
  return {
    id: r.id,
    projectId: r.project_id,
    roleId: r.role_id ?? "",
    applicantId: r.applicant_id,
    message: r.message,
    status: r.status as Application["status"],
    createdAt: r.created_at,
  };
}

function threadRowToThread(r: ThreadRow): Thread {
  return {
    id: r.id,
    projectId: r.project_id,
    participantIds: (r.thread_participants ?? []).map((p) => p.user_id),
    createdAt: r.created_at,
  };
}

function msgRowToMessage(r: MessageRow): Message {
  return {
    id: r.id,
    threadId: r.thread_id,
    senderId: r.sender_id,
    text: r.body,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface State {
  session: Session | null;
  currentUser: Student | null;
  users: Student[];
  projects: Project[];
  applications: Application[];
  threads: Thread[];
  messages: Message[];
}

const EMPTY_STATE: State = {
  session: null,
  currentUser: null,
  users: [],
  projects: [],
  applications: [],
  threads: [],
  messages: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY_STATE);
  const ref = useRef<State>(state);
  const set = useCallback((next: State) => {
    ref.current = next;
    setState(next);
  }, []);

  // ---- Auth session bootstrap & listener ---------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadAll(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadAll(session);
      } else {
        set(EMPTY_STATE);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Load everything for a signed-in session ---------------------------
  async function loadAll(session: Session) {
    const uid = session.user.id;
    const email = session.user.email ?? "";

    const [profilesRes, projectsRes, appsRes, threadsRes, msgsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*"),
      supabase
        .from("projects")
        .select("*, project_roles(*), project_members(user_id)")
        .order("created_at", { ascending: false }),
      supabase
        .from("applications")
        .select("*")
        .or(`applicant_id.eq.${uid},project_id.in.(${await ownedProjectIds(uid)})`),
      supabase
        .from("threads")
        .select("*, thread_participants(user_id)")
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true }),
    ]);

    const profileRows = (profilesRes.data ?? []) as ProfileRow[];
    // We only have the current user's email from the session; other profiles expose no email by design.
    const users: Student[] = profileRows.map((p) =>
      profileToStudent(p, p.id === uid ? email : ""),
    );

    const projects = ((projectsRes.data ?? []) as ProjectRow[]).map(projectRowToProject);
    const applications = ((appsRes.data ?? []) as ApplicationRow[]).map(appRowToApplication);
    const threads = ((threadsRes.data ?? []) as ThreadRow[]).map(threadRowToThread);
    const messages = ((msgsRes.data ?? []) as MessageRow[]).map(msgRowToMessage);
    const currentUser = users.find((u) => u.id === uid) ?? null;
    if (currentUser?.theme) {
      setAppThemeState(currentUser.theme);
    }

    set({ session, currentUser, users, projects, applications, threads, messages });

    subscribeRealtime();
  }

  // Helper: comma-separated list of project IDs owned by uid (for applications query)
  async function ownedProjectIds(uid: string): Promise<string> {
    const { data } = await supabase.from("projects").select("id").eq("owner_id", uid);
    return (data ?? []).map((r: { id: string }) => r.id).join(",") || "null";
  }

  // ---- Realtime subscriptions --------------------------------------------
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  function subscribeRealtime() {
    if (realtimeRef.current) return; // already subscribed

    const channel = supabase
      .channel("incudorm-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, async (payload) => {
        if (payload.eventType === "INSERT") {
          const row = payload.new as MessageRow;
          // Only show messages in threads the user is part of
          if (ref.current.threads.some((t) => t.id === row.thread_id)) {
            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, msgRowToMessage(row)],
            }));
          }
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, async (payload) => {
        if (payload.eventType === "INSERT") {
          const row = payload.new as ApplicationRow;
          setState((prev) => ({
            ...prev,
            applications: [appRowToApplication(row), ...prev.applications],
          }));
        }
        if (payload.eventType === "UPDATE") {
          const row = payload.new as ApplicationRow;
          setState((prev) => ({
            ...prev,
            applications: prev.applications.map((a) =>
              a.id === row.id ? appRowToApplication(row) : a,
            ),
          }));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, async () => {
        // Re-fetch projects with roles and members on any project change
        const { data } = await supabase
          .from("projects")
          .select("*, project_roles(*), project_members(user_id)")
          .order("created_at", { ascending: false });
        if (data) {
          const projects = (data as ProjectRow[]).map(projectRowToProject);
          setState((prev) => ({ ...prev, projects }));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "threads" }, async () => {
        const { data } = await supabase
          .from("threads")
          .select("*, thread_participants(user_id)")
          .order("created_at", { ascending: false });
        if (data) {
          const threads = (data as ThreadRow[]).map(threadRowToThread);
          setState((prev) => ({ ...prev, threads }));
        }
      })
      .subscribe();

    realtimeRef.current = channel;
  }

  useEffect(() => {
    return () => {
      if (realtimeRef.current) {
        supabase.removeChannel(realtimeRef.current);
        realtimeRef.current = null;
      }
    };
  }, []);

  // ---- Actions -----------------------------------------------------------

  const getUser = useCallback(
    (id: string) => ref.current.users.find((u) => u.id === id),
    [],
  );

  const signUp = useCallback<AppContextValue["signUp"]>(async (input) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: input.name.trim(),
          college: input.college.trim(),
          course: input.course.trim(),
          year: input.year,
        },
      },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Sign up failed. Please try again." };

    // Build a provisional Student object while email confirmation is pending.
    // The DB trigger creates the real profile row after confirmation.
    const provisional: Student = {
      id: data.user.id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      college: input.college.trim(),
      course: input.course.trim(),
      year: input.year,
      bio: "",
      skills: [],
      hoursPerWeek: 6,
      links: { github: "", linkedin: "", website: "" },
      portfolio: [],
      verified: false,
      onboarded: false,
      goal: "both",
      createdAt: new Date().toISOString(),
    };
    return { ok: true, value: provisional };
  }, []);

  const logIn = useCallback<AppContextValue["logIn"]>(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Login failed. Please try again." };
    // loadAll is triggered by onAuthStateChange; return immediately.
    const existing = ref.current.currentUser;
    if (existing) return { ok: true, value: existing };
    // If the profile hasn't loaded yet, construct a minimal one.
    const minimal: Student = {
      id: data.user.id,
      name: data.user.user_metadata?.name ?? email,
      email: data.user.email ?? email,
      college: data.user.user_metadata?.college ?? "",
      course: data.user.user_metadata?.course ?? "",
      year: data.user.user_metadata?.year ?? "1st year",
      bio: "",
      skills: [],
      hoursPerWeek: 6,
      links: { github: "", linkedin: "", website: "" },
      portfolio: [],
      verified: !!data.user.email_confirmed_at,
      onboarded: false,
      goal: "both",
      createdAt: data.user.created_at,
    };
    return { ok: true, value: minimal };
  }, []);

  const logOut = useCallback(async () => {
    await supabase.auth.signOut();
    // State is reset by onAuthStateChange.
  }, []);

  const [appTheme, setAppThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(APP_THEME_KEY);
      if (saved) return saved as AppTheme;
    } catch {}
    return "classic";
  });

  const setAppTheme = useCallback((theme: AppTheme) => {
    setAppThemeState(theme);
    try {
      localStorage.setItem(APP_THEME_KEY, theme);
    } catch {}
    const me = ref.current.currentUser;
    if (me) {
      saveStoredUserMeta(me.id, { theme });
      void supabase.from("profiles").update({ app_theme: theme } as Record<string, unknown>).eq("id", me.id).then();
    }
  }, []);

  const updateProfile = useCallback<AppContextValue["updateProfile"]>(async (patch) => {
    const me = ref.current.currentUser;
    if (!me) return;
    if (patch.color) {
      saveStoredUserMeta(me.id, { color: patch.color });
    }
    if (patch.theme) {
      saveStoredUserMeta(me.id, { theme: patch.theme });
      setAppThemeState(patch.theme);
      try {
        localStorage.setItem(APP_THEME_KEY, patch.theme);
      } catch {}
    }
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.college !== undefined) dbPatch.college = patch.college;
    if (patch.course !== undefined) dbPatch.course = patch.course;
    if (patch.year !== undefined) dbPatch.year = patch.year;
    if (patch.bio !== undefined) dbPatch.bio = patch.bio;
    if (patch.skills !== undefined) dbPatch.skills = patch.skills;
    if (patch.hoursPerWeek !== undefined) dbPatch.hours_per_week = patch.hoursPerWeek;
    if (patch.links !== undefined) {
      dbPatch.github = patch.links.github;
      dbPatch.linkedin = patch.links.linkedin;
      dbPatch.website = patch.links.website;
    }
    if (patch.portfolio !== undefined) dbPatch.portfolio = patch.portfolio;
    if (patch.goal !== undefined) dbPatch.goal = patch.goal;
    if (patch.onboarded !== undefined) dbPatch.onboarded = patch.onboarded;
    if (patch.color !== undefined) dbPatch.user_color = patch.color;
    if (patch.theme !== undefined) dbPatch.app_theme = patch.theme;

    void supabase.from("profiles").update(dbPatch).eq("id", me.id).then();
    setState((prev) => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, ...patch } : null,
      users: prev.users.map((u) =>
        u.id === me.id ? { ...u, ...patch } : u,
      ),
    }));
  }, []);

  const createProject = useCallback<AppContextValue["createProject"]>(async (input) => {
    const rolesPayload = input.roles.map((r) => ({
      title: r.title,
      skills: r.skills,
    }));
    const chosenColor = input.color ?? "sun";
    const chosenTheme = input.cardTheme ?? "classic";
    const chosenVisibility = input.visibility ?? "everyone";

    const { data, error } = await supabase.rpc("create_project", {
      p_title: input.title,
      p_pitch: input.pitch,
      p_description: input.description,
      p_stage: input.stage,
      p_hours: input.hoursPerWeek,
      p_color: chosenColor,
      p_roles: rolesPayload,
    });
    if (error) return { ok: false, error: error.message };

    const projectId = data as string;
    saveStoredProjectMeta(projectId, {
      color: chosenColor,
      cardTheme: chosenTheme,
      visibility: chosenVisibility,
    });
    void supabase
      .from("projects")
      .update({ visibility: chosenVisibility, card_theme: chosenTheme } as Record<string, unknown>)
      .eq("id", projectId)
      .then();

    // Re-fetch the new project with roles
    const { data: row } = await supabase
      .from("projects")
      .select("*, project_roles(*), project_members(user_id)")
      .eq("id", projectId)
      .single();

    let project: Project;
    if (row) {
      project = projectRowToProject(row as ProjectRow);
      project.color = chosenColor;
      project.cardTheme = chosenTheme;
      project.visibility = chosenVisibility;
    } else {
      project = {
        id: projectId,
        ownerId: ref.current.currentUser?.id ?? "",
        title: input.title,
        pitch: input.pitch,
        description: input.description,
        stage: input.stage,
        hoursPerWeek: input.hoursPerWeek,
        roles: input.roles,
        teamIds: [],
        status: "open",
        createdAt: new Date().toISOString(),
        color: chosenColor,
        cardTheme: chosenTheme,
        visibility: chosenVisibility,
      };
    }
    setState((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
    return { ok: true, value: project };
  }, []);

  const setProjectVisibility = useCallback<AppContextValue["setProjectVisibility"]>(async (projectId, visibility) => {
    saveStoredProjectMeta(projectId, { visibility });
    void supabase
      .from("projects")
      .update({ visibility } as Record<string, unknown>)
      .eq("id", projectId)
      .then();
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === projectId ? { ...p, visibility } : p)),
    }));
  }, []);

  const setProjectStatus = useCallback<AppContextValue["setProjectStatus"]>(async (projectId, status) => {
    await supabase.from("projects").update({ status }).eq("id", projectId);
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === projectId ? { ...p, status } : p)),
    }));
  }, []);

  const applyToProject = useCallback<AppContextValue["applyToProject"]>(async (projectId, roleId, message) => {
    const me = ref.current.currentUser;
    if (!me) return { ok: false, error: "Log in to apply." };
    const { data, error } = await supabase
      .from("applications")
      .insert({
        project_id: projectId,
        role_id: roleId || null,
        applicant_id: me.id,
        message: message.trim(),
        status: "pending",
      })
      .select()
      .single();
    if (error) return { ok: false, error: error.message };
    const app = appRowToApplication(data as ApplicationRow);
    setState((prev) => ({ ...prev, applications: [app, ...prev.applications] }));
    return { ok: true, value: app };
  }, []);

  const respondToApplication = useCallback<AppContextValue["respondToApplication"]>(async (applicationId, status) => {
    await supabase.rpc("respond_to_application", {
      p_application: applicationId,
      p_status: status,
    });
    // Re-fetch threads, messages, and project members since respond_to_application may have created them.
    const me = ref.current.currentUser;
    if (!me) return;
    const [threadsRes, msgsRes, projectsRes] = await Promise.all([
      supabase.from("threads").select("*, thread_participants(user_id)").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: true }),
      supabase.from("projects").select("*, project_roles(*), project_members(user_id)").order("created_at", { ascending: false }),
    ]);
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === applicationId ? { ...a, status } : a,
      ),
      threads: ((threadsRes.data ?? []) as ThreadRow[]).map(threadRowToThread),
      messages: ((msgsRes.data ?? []) as MessageRow[]).map(msgRowToMessage),
      projects: ((projectsRes.data ?? []) as ProjectRow[]).map(projectRowToProject),
    }));
  }, []);

  const startThread = useCallback<AppContextValue["startThread"]>((otherUserId, projectId = null) => {
    const me = ref.current.currentUser?.id ?? "";
    const existing = ref.current.threads.find(
      (t) => (t.projectId ?? null) === (projectId ?? null) &&
        t.participantIds.includes(me) &&
        t.participantIds.includes(otherUserId),
    );
    if (existing) return existing;

    const thread: Thread = {
      id: crypto.randomUUID(),
      projectId: projectId ?? null,
      participantIds: [me, otherUserId],
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      threads: [thread, ...prev.threads],
    }));

    void supabase
      .rpc("start_thread", {
        p_other: otherUserId,
        p_project: projectId ?? null,
      })
      .then();

    return thread;
  }, []);

  const sendMessage = useCallback<AppContextValue["sendMessage"]>(async (threadId, text) => {
    const me = ref.current.currentUser;
    const clean = text.trim();
    if (!me || !clean) return;
    await supabase.from("messages").insert({
      thread_id: threadId,
      sender_id: me.id,
      body: clean,
    });
    // Realtime will push the new message; insert optimistically too for snappiness.
    const optimistic: Message = {
      id: crypto.randomUUID(),
      threadId,
      senderId: me.id,
      text: clean,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, messages: [...prev.messages, optimistic] }));
  }, []);

  // Supabase handles email verification natively — these are no-ops now.
  const verifyEmail = useCallback<AppContextValue["verifyEmail"]>(() => {
    return { ok: true, value: ref.current.currentUser! };
  }, []);

  const resendVerification = useCallback<AppContextValue["resendVerification"]>(async () => {
    const email = ref.current.currentUser?.email;
    if (email) {
      await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
    }
  }, []);

  const withdrawApplication = useCallback<AppContextValue["withdrawApplication"]>(async (applicationId) => {
    await supabase.from("applications").delete().eq("id", applicationId);
    setState((prev) => ({
      ...prev,
      applications: prev.applications.filter((a) => a.id !== applicationId),
    }));
  }, []);

  const deleteAccount = useCallback<AppContextValue["deleteAccount"]>(async () => {
    await supabase.rpc("delete_my_account");
    // onAuthStateChange resets state after deletion.
  }, []);

  // ---- Context value -----------------------------------------------------
  const value = useMemo<AppContextValue>(
    () => ({
      currentUser: state.currentUser,
      users: state.users,
      projects: state.projects,
      applications: state.applications,
      threads: state.threads,
      messages: state.messages,
      appTheme,
      setAppTheme,
      getUser,
      signUp,
      logIn,
      logOut,
      updateProfile,
      createProject,
      setProjectStatus,
      setProjectVisibility,
      applyToProject,
      respondToApplication,
      startThread,
      sendMessage,
      verifyEmail,
      resendVerification,
      devVerificationCode: null, // Supabase handles verification emails
      withdrawApplication,
      deleteAccount,
    }),
    [state, appTheme, setAppTheme, getUser, signUp, logIn, logOut, updateProfile, createProject, setProjectStatus, setProjectVisibility, applyToProject, respondToApplication, startThread, sendMessage, verifyEmail, resendVerification, withdrawApplication, deleteAccount],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
