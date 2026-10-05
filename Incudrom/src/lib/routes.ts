import type { Student } from "../types";

/** Where a signed in student should land, based on how far they are through sign up. */
export function homeFor(user: Student): string {
  if (!user.verified) return "/auth?mode=verify";
  if (!user.onboarded) return "/onboarding";
  return "/projects";
}
