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
  { id: "sky", label: "Ocean sky", value: "#38BDF8" },
  { id: "orange", label: "Sunset orange", value: "#FB923C" },
  { id: "lime", label: "Lime burst", value: "#A3E635" },
  { id: "violet", label: "Electric violet", value: "#A855F7" },
  { id: "rose", label: "Rose quartz", value: "#F472B6" },
  { id: "sage", label: "Emerald sage", value: "#34D399" },
  { id: "crimson", label: "Crimson ruby", value: "#F87171" },
  { id: "amber", label: "Amber honey", value: "#FBBF24" },
  { id: "indigo", label: "Midnight indigo", value: "#6366F1" },
  { id: "slate", label: "Charcoal slate", value: "#64748B" },
] as const;

export type CardColor = (typeof CARD_COLORS)[number]["id"];

export const CARD_THEMES = [
  { id: "classic", label: "Classic Pop", desc: "Solid top bar with signature bold borders" },
  { id: "brutalist", label: "Neo-Brutalist", desc: "Thick borders, deep shadows & punchy contrast" },
  { id: "gradient", label: "Vibrant Gradient", desc: "Lush multi-hue gradient banner & vivid aura" },
  { id: "pastel", label: "Soft Pastel", desc: "Gentle rounded corners and soft pastel tint" },
  { id: "cyber", label: "Dark Cyber", desc: "Sleek slate frame with glowing neon accents" },
  { id: "editorial", label: "Campus Editorial", desc: "Refined note-card layout with clean index accent" },
] as const;

export type CardTheme = (typeof CARD_THEMES)[number]["id"];

export const PROJECT_VISIBILITY = ["private", "campus", "everyone"] as const;
export type ProjectVisibility = (typeof PROJECT_VISIBILITY)[number];

export const USER_COLORS = [
  { id: "sun", label: "Sun Gold", value: "#FFD23F" },
  { id: "mint", label: "Fresh Mint", value: "#46E0A0" },
  { id: "lilac", label: "Lavender Lilac", value: "#CFCBFF" },
  { id: "brand", label: "Electric Blue", value: "#3B3BFF" },
  { id: "coral", label: "Coral Rose", value: "#FF8FA3" },
  { id: "sky", label: "Cyan Sky", value: "#38BDF8" },
  { id: "orange", label: "Sunset Peach", value: "#FB923C" },
  { id: "lime", label: "Neon Lime", value: "#A3E635" },
  { id: "violet", label: "Deep Violet", value: "#A855F7" },
  { id: "rose", label: "Hot Magenta", value: "#F472B6" },
  { id: "emerald", label: "Emerald Gem", value: "#10B981" },
  { id: "indigo", label: "Royal Indigo", value: "#6366F1" },
] as const;

export type UserColor = (typeof USER_COLORS)[number]["id"];

export const APP_THEMES = [
  { id: "classic", label: "Incudorm Light", desc: "Default crisp neo-brutalist light" },
  { id: "midnight", label: "Midnight Dorm", desc: "Dark mode for late-night builders" },
  { id: "cyber", label: "Cyber Campus", desc: "Neon electric green & cyan contrast" },
  { id: "sunset", label: "Warm Sunset", desc: "Cozy warm cream & terracotta tones" },
  { id: "mint", label: "Fresh Mint", desc: "Crisp clean green & botanical aesthetic" },
  { id: "lavender", label: "Lavender Dream", desc: "Soft pastel lilac & dreamy violet" },
] as const;

export type AppTheme = (typeof APP_THEMES)[number]["id"];

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
  color?: UserColor;
  theme?: AppTheme;
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
  cardTheme?: CardTheme;
  visibility?: ProjectVisibility;
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
