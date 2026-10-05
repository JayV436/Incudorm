import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Application, Message, Project, Student, Thread } from "./types";
import { AppContext } from "./appContext";
import type { AppContextValue } from "./appContext";
import { makeCode, makeId } from "./lib/id";

/**
 * Incudorm app store.
 *
 * Everything starts empty and is kept in the browser's localStorage so the full flow
 * (sign up, post an idea, apply, accept, chat) works with no backend.
 *
 * To connect a real backend (Supabase, Firebase, your own API), keep the same
 * `useApp()` shape and replace the bodies of the actions below with API calls.
 * The pages only talk to `useApp()`, so they won't need to change.
 *
 * NOTE: the local auth here is a placeholder. It does not check or store passwords
 * and it is not secure. Replace signUp/logIn with real auth before launch.
 */

const KEY = "incudorm:v1";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface DB {
  users: Student[];
  currentUserId: string | null;
  projects: Project[];
  applications: Application[];
  threads: Thread[];
  messages: Message[];
  /** Pending email verification codes by user id. A real backend emails these instead. */
  verifications: Record<string, string>;
}

const EMPTY: DB = {
  users: [],
  currentUserId: null,
  projects: [],
  applications: [],
  threads: [],
  messages: [],
  verifications: {},
};

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as Partial<DB>;
    return {
      ...EMPTY,
      ...saved,
      // Accounts saved by an earlier version are treated as verified and onboarded.
      users: ((saved.users ?? []) as Partial<Student>[]).map(
        (u) => ({ ...u, verified: u.verified ?? true, onboarded: u.onboarded ?? true, goal: u.goal ?? "both" }) as Student,
      ),
    };
  } catch {
    return EMPTY;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load);
  // The ref always holds the latest state, so actions can return results synchronously.
  const ref = useRef<DB>(db);

  const commit = useCallback((next: DB) => {
    ref.current = next;
    setDb(next);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* storage full or blocked: the app keeps working in memory */
    }
  }, [db]);

  const getUser = useCallback((id: string) => ref.current.users.find((u) => u.id === id), []);

  const signUp = useCallback<AppContextValue["signUp"]>((input) => {
    const cur = ref.current;
    const email = input.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email, like you@college.edu." };
    if (cur.users.some((u) => u.email === email)) {
      return { ok: false, error: "An account with this email already exists. Log in instead." };
    }
    const user: Student = {
      id: makeId(),
      name: input.name.trim(),
      email,
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
    commit({
      ...cur,
      users: [...cur.users, user],
      currentUserId: user.id,
      verifications: { ...cur.verifications, [user.id]: makeCode() },
    });
    return { ok: true, value: user };
  }, [commit]);

  const logIn = useCallback<AppContextValue["logIn"]>((email) => {
    const cur = ref.current;
    const user = cur.users.find((u) => u.email === email.trim().toLowerCase());
    if (!user) return { ok: false, error: "No account with this email. Sign up first." };
    commit({ ...cur, currentUserId: user.id });
    return { ok: true, value: user };
  }, [commit]);

  const logOut = useCallback(() => {
    commit({ ...ref.current, currentUserId: null });
  }, [commit]);

  const updateProfile = useCallback<AppContextValue["updateProfile"]>((patch) => {
    const cur = ref.current;
    if (!cur.currentUserId) return;
    commit({
      ...cur,
      users: cur.users.map((u) => (u.id === cur.currentUserId ? { ...u, ...patch } : u)),
    });
  }, [commit]);

  const createProject = useCallback<AppContextValue["createProject"]>((input) => {
    const cur = ref.current;
    if (!cur.currentUserId) return { ok: false, error: "Log in to post an idea." };
    const project: Project = {
      id: makeId(),
      ownerId: cur.currentUserId,
      title: input.title.trim(),
      pitch: input.pitch.trim(),
      description: input.description.trim(),
      stage: input.stage,
      hoursPerWeek: input.hoursPerWeek,
      roles: input.roles,
      teamIds: [],
      status: "open",
      createdAt: new Date().toISOString(),
      color: input.color,
    };
    commit({ ...cur, projects: [project, ...cur.projects] });
    return { ok: true, value: project };
  }, [commit]);

  const setProjectStatus = useCallback<AppContextValue["setProjectStatus"]>((projectId, status) => {
    const cur = ref.current;
    commit({
      ...cur,
      projects: cur.projects.map((p) =>
        p.id === projectId && p.ownerId === cur.currentUserId ? { ...p, status } : p,
      ),
    });
  }, [commit]);

  const applyToProject = useCallback<AppContextValue["applyToProject"]>((projectId, roleId, message) => {
    const cur = ref.current;
    const me = cur.currentUserId;
    const project = cur.projects.find((p) => p.id === projectId);
    if (!me || !project) return { ok: false, error: "This idea no longer exists." };
    if (project.ownerId === me) return { ok: false, error: "You can't apply to your own idea." };
    if (project.status !== "open") return { ok: false, error: "This idea isn't taking applications right now." };
    if (cur.applications.some((a) => a.projectId === projectId && a.applicantId === me)) {
      return { ok: false, error: "You've already applied to this idea." };
    }
    const application: Application = {
      id: makeId(),
      projectId,
      roleId,
      applicantId: me,
      message: message.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    commit({ ...cur, applications: [application, ...cur.applications] });
    return { ok: true, value: application };
  }, [commit]);

  const findOrCreateThread = (cur: DB, a: string, b: string, projectId: string | null): { db: DB; thread: Thread } => {
    const existing = cur.threads.find(
      (t) => t.projectId === projectId && t.participantIds.includes(a) && t.participantIds.includes(b),
    );
    if (existing) return { db: cur, thread: existing };
    const thread: Thread = {
      id: makeId(),
      participantIds: [a, b],
      projectId,
      createdAt: new Date().toISOString(),
    };
    return { db: { ...cur, threads: [thread, ...cur.threads] }, thread };
  };

  const respondToApplication = useCallback<AppContextValue["respondToApplication"]>((applicationId, status) => {
    const cur = ref.current;
    const app = cur.applications.find((a) => a.id === applicationId);
    if (!app) return;
    const project = cur.projects.find((p) => p.id === app.projectId);
    if (!project || project.ownerId !== cur.currentUserId) return;

    let next: DB = {
      ...cur,
      applications: cur.applications.map((a) => (a.id === applicationId ? { ...a, status } : a)),
    };

    if (status === "accepted") {
      next = {
        ...next,
        projects: next.projects.map((p) =>
          p.id === project.id && !p.teamIds.includes(app.applicantId)
            ? { ...p, teamIds: [...p.teamIds, app.applicantId] }
            : p,
        ),
      };
      const { db: withThread, thread } = findOrCreateThread(next, project.ownerId, app.applicantId, project.id);
      const applicant = cur.users.find((u) => u.id === app.applicantId);
      const role = project.roles.find((r) => r.id === app.roleId);
      const note: Message = {
        id: makeId(),
        threadId: thread.id,
        senderId: null,
        text: `${applicant?.name ?? "A student"} joined ${project.title}${role ? ` as ${role.title}` : ""}. Say hello.`,
        createdAt: new Date().toISOString(),
      };
      next = { ...withThread, messages: [...withThread.messages, note] };
    }
    commit(next);
  }, [commit]);

  const startThread = useCallback<AppContextValue["startThread"]>((otherUserId, projectId = null) => {
    const cur = ref.current;
    const me = cur.currentUserId ?? "";
    const { db: next, thread } = findOrCreateThread(cur, me, otherUserId, projectId);
    if (next !== cur) commit(next);
    return thread;
  }, [commit]);

  const sendMessage = useCallback<AppContextValue["sendMessage"]>((threadId, text) => {
    const cur = ref.current;
    const clean = text.trim();
    if (!cur.currentUserId || !clean) return;
    const msg: Message = {
      id: makeId(),
      threadId,
      senderId: cur.currentUserId,
      text: clean,
      createdAt: new Date().toISOString(),
    };
    commit({ ...cur, messages: [...cur.messages, msg] });
  }, [commit]);

  const verifyEmail = useCallback<AppContextValue["verifyEmail"]>((code) => {
    const cur = ref.current;
    const me = cur.currentUserId;
    const user = cur.users.find((u) => u.id === me);
    if (!me || !user) return { ok: false, error: "Log in first." };
    if (!cur.verifications[me] || cur.verifications[me] !== code.trim()) {
      return { ok: false, error: "That code isn't right. Check your email and try again." };
    }
    const verified: Student = { ...user, verified: true };
    const rest = { ...cur.verifications };
    delete rest[me];
    commit({
      ...cur,
      users: cur.users.map((u) => (u.id === me ? verified : u)),
      verifications: rest,
    });
    return { ok: true, value: verified };
  }, [commit]);

  const resendVerification = useCallback<AppContextValue["resendVerification"]>(() => {
    const cur = ref.current;
    if (!cur.currentUserId) return;
    commit({ ...cur, verifications: { ...cur.verifications, [cur.currentUserId]: makeCode() } });
  }, [commit]);

  const withdrawApplication = useCallback<AppContextValue["withdrawApplication"]>((applicationId) => {
    const cur = ref.current;
    commit({
      ...cur,
      applications: cur.applications.filter(
        (a) => !(a.id === applicationId && a.applicantId === cur.currentUserId && a.status === "pending"),
      ),
    });
  }, [commit]);

  const deleteAccount = useCallback<AppContextValue["deleteAccount"]>(() => {
    const cur = ref.current;
    const me = cur.currentUserId;
    if (!me) return;
    const myProjectIds = new Set(cur.projects.filter((p) => p.ownerId === me).map((p) => p.id));
    const myThreadIds = new Set(cur.threads.filter((t) => t.participantIds.includes(me)).map((t) => t.id));
    const rest = { ...cur.verifications };
    delete rest[me];
    commit({
      users: cur.users.filter((u) => u.id !== me),
      currentUserId: null,
      projects: cur.projects
        .filter((p) => p.ownerId !== me)
        .map((p) => ({ ...p, teamIds: p.teamIds.filter((t) => t !== me) })),
      applications: cur.applications.filter((a) => a.applicantId !== me && !myProjectIds.has(a.projectId)),
      threads: cur.threads.filter((t) => !myThreadIds.has(t.id)),
      messages: cur.messages.filter((m) => !myThreadIds.has(m.threadId)),
      verifications: rest,
    });
  }, [commit]);

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser: db.users.find((u) => u.id === db.currentUserId) ?? null,
      users: db.users,
      projects: db.projects,
      applications: db.applications,
      threads: db.threads,
      messages: db.messages,
      getUser,
      signUp,
      logIn,
      logOut,
      updateProfile,
      createProject,
      setProjectStatus,
      applyToProject,
      respondToApplication,
      startThread,
      sendMessage,
      verifyEmail,
      resendVerification,
      devVerificationCode:
        import.meta.env.DEV && db.currentUserId ? (db.verifications[db.currentUserId] ?? null) : null,
      withdrawApplication,
      deleteAccount,
    }),
    [db, getUser, signUp, logIn, logOut, updateProfile, createProject, setProjectStatus, applyToProject, respondToApplication, startThread, sendMessage, verifyEmail, resendVerification, withdrawApplication, deleteAccount],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
