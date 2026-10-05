// Shared types and option lists for Incudorm.
// These are lists of choices shown in forms, not sample data.

export const SKILL_OPTIONS = [
  "Frontend",
  "Backend",
  "Mobile",
  "ML/AI",
  "Data",
  "UI/UX design",
  "Graphic design",
  "Marketing",
  "Content",
  "Sales",
  "Finance",
  "Product",
  "Hardware",
  "Embedded",
  "Research",
  "Legal",
] as const;

export const STAGES = ["Just an idea", "Prototype", "Validating", "Building"] as const;
export type Stage = (typeof STAGES)[number];

export const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Postgraduate"] as const;

export const GOALS = ["both", "post", "join"] as const;
export type Goal = (typeof GOALS)[number];

export const HOURS_OPTIONS = [2, 4, 6, 8, 10, 15, 20] as const;

export const CARD_COLORS = [
  { id: "sun", label: "Sun yellow", value: "#FFD23F" },
  { id: "mint", label: "Mint green", value: "#46E0A0" },
  { id: "lilac", label: "Lilac purple", value: "#CFCBFF" },
  { id: "brand", label: "Brand blue", value: "#3B3BFF" },
  { id: "coral", label: "Coral pink", value: "#FF8FA3" },
] as const;

export type CardColor = (typeof CARD_COLORS)[number]["id"];

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  college: string;
  course: string;
  year: string;
  bio: string;
  skills: string[];
  hoursPerWeek: number;
  links: { github: string; linkedin: string; website: string };
  portfolio: PortfolioItem[];
  /** True once the student has entered the code sent to their college email. */
  verified: boolean;
  /** True once the profile setup wizard is finished. */
  onboarded: boolean;
  /** What the student came to do. Chosen in onboarding. */
  goal: Goal;
  createdAt: string;
}

export interface RoleNeed {
  id: string;
  title: string;
  skills: string[];
}

export type ProjectStatus = "open" | "closed";

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  pitch: string;
  description: string;
  stage: Stage;
  hoursPerWeek: number;
  roles: RoleNeed[];
  teamIds: string[];
  status: ProjectStatus;
  createdAt: string;
  color?: CardColor;
}

export type ApplicationStatus = "pending" | "accepted" | "declined";

export interface Application {
  id: string;
  projectId: string;
  roleId: string;
  applicantId: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Thread {
  id: string;
  participantIds: string[];
  /** Set when the conversation comes from an accepted application. */
  projectId: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  /** null means a system note, like "Aanya joined as Frontend developer". */
  senderId: string | null;
  text: string;
  createdAt: string;
}
