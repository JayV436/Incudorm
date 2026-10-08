import { supabase } from "./supabase";
import type {
  Application,
  ApplicationStatus,
  CardColor,
  Goal,
  Message,
  PortfolioItem,
  Project,
  ProjectStatus,
  Stage,
  Student,
  Thread,
} from "../types";

/* ---------- Row shapes returned by Supabase (snake_case) ---------- */

export interface ProfileRow {
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
  goal: Goal;
  onboarded: boolean;
  portfolio: PortfolioItem[];
  created_at: string;
}

interface RoleRow {
  id: string;
  title: string;
  skills: string[];
  position: number;
}

interface ProjectRow {
  id: string;
  owner_id: string;
  title: string;
  pitch: string;
  description: string;
  stage: Stage;
  hours_per_week: number;
  color: CardColor;
  status: ProjectStatus;
  created_at: string;
  project_roles: RoleRow[];
  project_members: { user_id: string }[];
}

interface ApplicationRow {
  id: string;
  project_id: string;
  role_id: string | null;
  applicant_id: string;
  message: string;
  status: ApplicationStatus;
  created_at: string;
}

interface ThreadRow {
  id: string;
  project_id: string | null;
  created_at: string;
  thread_participants: { user_id: string }[];
}

export interface MessageRow {
  id: string;
  thread_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
}

/* ---------- Row -> app type ---------- */

/** Email is only known for the signed in student. Other students' emails are never sent to the browser. */
export function toStudent(r: ProfileRow, email = ""): Student {
  return {
    id: r.id,
    name: r.name,
    email,
    college: r.college,
    course: r.course,
    year: r.year,
    bio: r.bio,
    skills: r.skills ?? [],
    hoursPerWeek: r.hours_per_week,
    links: { github: r.github, linkedin: r.linkedin, website: r.website },
    portfolio: r.portfolio ?? [],
    // Profiles are only created after the email is confirmed.
    verified: true,
    onboarded: r.onboarded,
    goal: r.goal,
    createdAt: r.created_at,
  };
}

function toProject(r: ProjectRow): Project {
  return {
    id: r.id,
    ownerId: r.owner_id,
    title: r.title,
    pitch: r.pitch,
    description: r.description,
    stage: r.stage,
    hoursPerWeek: r.hours_per_week,
    roles: [...(r.project_roles ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((role) => ({ id: role.id, title: role.title, skills: role.skills ?? [] })),
    color: r.color,
    teamIds: (r.project_members ?? []).map((m) => m.user_id),
    status: r.status,
    createdAt: r.created_at,
  };
}

function toApplication(r: ApplicationRow): Application {
  return {
    id: r.id,
    projectId: r.project_id,
    roleId: r.role_id ?? "",
    applicantId: r.applicant_id,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
  };
}

function toThread(r: ThreadRow): Thread {
  return {
    id: r.id,
    participantIds: (r.thread_participants ?? []).map((p) => p.user_id),
    projectId: r.project_id,
    createdAt: r.created_at,
  };
}

export function toMessage(r: MessageRow): Message {
  return { id: r.id, threadId: r.thread_id, senderId: r.sender_id, text: r.body, createdAt: r.created_at };
}

/* ---------- Fetchers ---------- */

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T[];
}

export async function fetchProfiles(): Promise<ProfileRow[]> {
  return unwrap<ProfileRow>(await supabase.from("profiles").select("*"));
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await supabase
    .from("projects")
    .select("*, project_roles(id, title, skills, position), project_members(user_id)")
    .order("created_at", { ascending: false });
  return unwrap<ProjectRow>(res).map(toProject);
}

export async function fetchApplications(): Promise<Application[]> {
  const res = await supabase.from("applications").select("*").order("created_at", { ascending: false });
  return unwrap<ApplicationRow>(res).map(toApplication);
}

export async function fetchThreads(): Promise<Thread[]> {
  const res = await supabase.from("threads").select("*, thread_participants(user_id)");
  return unwrap<ThreadRow>(res).map(toThread);
}

export async function fetchMessages(): Promise<Message[]> {
  const res = await supabase.from("messages").select("*").order("created_at", { ascending: true });
  return unwrap<MessageRow>(res).map(toMessage);
}

/* ---------- Error messages ---------- */

/** Turns Supabase and Postgres errors into short sentences a student can act on. */
export function describeError(err: unknown): string {
  const e = (err ?? {}) as { message?: string; code?: string };
  const msg = e.message ?? "";
  const code = e.code ?? "";
  const text = `${code} ${msg}`;

  if (/invalid login credentials/i.test(text)) return "Incorrect email or password.";
  if (/email_not_confirmed|email not confirmed/i.test(text)) return "Confirm your email first.";
  if (/user_already_exists|already registered/i.test(text)) return "An account with this email already exists. Log in instead.";
  if (/over_email_send_rate_limit|email rate limit|rate limit/i.test(text)) return "Too many emails sent. Wait a minute and try again.";
  if (/otp_expired|token has expired|invalid.*token/i.test(text)) return "That code isn't right or has expired. Send a new code and try again.";
  if (/weak_password|password should be/i.test(text)) return "Choose a stronger password with at least 8 characters.";
  if (/database error saving new user/i.test(text)) return "Use your college email address to sign up.";
  if (/failed to fetch|networkerror|network request failed/i.test(text)) return "Can't reach the server. Check your internet connection and try again.";
  if (code === "42501" || /row-level security|permission denied/i.test(text)) return "You don't have permission to do that.";
  if (code === "23505") return "That already exists.";
  if (code === "23514") return "One of the values is too long, too short or not allowed.";
  return msg || "Something went wrong. Please try again.";
}
