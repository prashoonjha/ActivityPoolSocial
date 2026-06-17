
import { ActivityCategory } from "../types/activity";
import { COLORS } from "../theme";

export const CATEGORY_CONFIG: Record<
  ActivityCategory,
  { label: string; icon: string; color: string; bg: string }
> = {
  sports:   { label: "Sports",   icon: "sports-soccer",      color: COLORS.catSports,   bg: "#D1FAE5" },
  arts:     { label: "Arts",     icon: "palette",             color: COLORS.catArts,     bg: "#EDE9FE" },
  food:     { label: "Food",     icon: "restaurant",          color: COLORS.catFood,     bg: "#FFF7ED" },
  outdoors: { label: "Outdoors", icon: "terrain",             color: COLORS.catOutdoors, bg: "#CFFAFE" },
  games:    { label: "Games",    icon: "sports-esports",      color: COLORS.catGames,    bg: "#FFE4E6" },
  learning: { label: "Learning", icon: "school",              color: COLORS.catLearning, bg: "#DBEAFE" },
  other:    { label: "Other",    icon: "star",                color: COLORS.textMuted,   bg: COLORS.surfaceVariant },
};

export const CATEGORIES: ActivityCategory[] = [
  "sports", "arts", "food", "outdoors", "games", "learning", "other",
];

/**
 * Format an ISO date string into a readable date+time label.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "Date TBD";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
}

/**
 * Format just the date portion.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Format just the time portion.
 */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/**
 * Get user initials from a display name or email.
 */
export function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.trim().slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AP";
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Sanitize plain text input — trims whitespace, collapses internal runs.
 */
export function sanitizeText(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate password strength (min 8 chars, 1 uppercase, 1 digit).
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}