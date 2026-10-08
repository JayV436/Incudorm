import { createContext, useContext } from "react";
import type {
  Application,
  ApplicationStatus,
  CardColor,
  Message,
  Project,
  ProjectStatus,
  RoleNeed,
  Stage,
  Student,
  Thread,
} from "./types";

export type Result<T> =
  | { ok: true; value: T; error?: undefined }
  | { ok: false; error: string; value?: undefined };

export interface SignUpInput {
  name: string;
  email: string;
  college: string;
  course: string;
  year: string;
  password: string;
}

export interface NewProjectInput {
  title: string;
  pitch: string;
  description: string;
  stage: Stage;
  hoursPerWeek: number;
  roles: RoleNeed[];
  color?: CardColor;
}

export type ProfilePatch = Partial<Omit<Student, "id" | "email" | "createdAt" | "verified">>;

export interface AppContextValue {
  currentUser: Student | null;
  users: Student[];
  projects: Project[];
  applications: Application[];
  threads: Thread[];
  messages: Message[];
  getUser: (id: string) => Student | undefined;
  signUp: (input: SignUpInput) => Promise<Result<Student>>;
  logIn: (email: string, password: string) => Promise<Result<Student>>;
  logOut: () => void | Promise<void>;
  updateProfile: (patch: ProfilePatch) => void | Promise<void>;
  createProject: (input: NewProjectInput) => Promise<Result<Project>>;
  setProjectStatus: (projectId: string, status: ProjectStatus) => void | Promise<void>;
  applyToProject: (projectId: string, roleId: string, message: string) => Promise<Result<Application>>;
  respondToApplication: (applicationId: string, status: Exclude<ApplicationStatus, "pending">) => void | Promise<void>;
  startThread: (otherUserId: string, projectId?: string | null) => Thread;
  sendMessage: (threadId: string, text: string) => void | Promise<void>;
  /** Checks the 6 digit code and marks the student's email as verified. */
  verifyEmail: (code: string) => Result<Student> | Promise<Result<Student>>;
  /** Issues a new verification code for the signed in student. */
  resendVerification: () => void | Promise<void>;
  /** Dev builds only: the code that would have been emailed, so you can test the flow. Always null in production. */
  devVerificationCode: string | null;
  /** Lets an applicant take back a pending application. */
  withdrawApplication: (applicationId: string) => void | Promise<void>;
  /** Deletes the signed in student and everything they posted or sent. */
  deleteAccount: () => void | Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
