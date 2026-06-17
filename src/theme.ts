import { MD3LightTheme} from "react-native-paper";

export const COLORS = {
  // Brand
  primary: "#4F46E5",       // indigo-600 
  primaryDark: "#3730A3",   // indigo-800
  primaryLight: "#EEF2FF",  // indigo-50
  accent: "#F97316",        // orange-500 
  accentLight: "#FFF7ED",   // orange-50
 
  // Neutrals
  background: "#F8FAFC",   
  surface: "#FFFFFF",
  surfaceVariant: "#F1F5F9", // slate-100
  border: "#E2E8F0",         // slate-200
  borderFocus: "#4F46E5",
 
  // Text
  textPrimary: "#0F172A",    // slate-900
  textSecondary: "#475569",  // slate-600
  textMuted: "#94A3B8",      // slate-400
 
  // Semantic
  success: "#10B981",        // emerald-500
  successLight: "#D1FAE5",
  warning: "#F59E0B",        // amber-500
  warningLight: "#FEF3C7",
  error: "#EF4444",          // red-500
  errorLight: "#FEE2E2",
  info: "#3B82F6",           // blue-500
  infoLight: "#DBEAFE",
 
  // Social / Activity categories
  catSports: "#10B981",
  catArts: "#8B5CF6",
  catFood: "#F97316",
  catOutdoors: "#06B6D4",
  catGames: "#F43F5E",
  catLearning: "#3B82F6",
} as const;
 
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
 
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
 
export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
 
export const FONT_WEIGHT = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};
 
export const SHADOW = {
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
 
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    onPrimary: "#FFFFFF",
    primaryContainer: COLORS.primaryLight,
    onPrimaryContainer: COLORS.primaryDark,
    secondary: COLORS.accent,
    onSecondary: "#FFFFFF",
    secondaryContainer: COLORS.accentLight,
    background: COLORS.background,
    surface: COLORS.surface,
    surfaceVariant: COLORS.surfaceVariant,
    onSurface: COLORS.textPrimary,
    onSurfaceVariant: COLORS.textSecondary,
    outline: COLORS.border,
    outlineVariant: COLORS.border,
    error: COLORS.error,
    onError: "#FFFFFF",
    errorContainer: COLORS.errorLight,
  },
};