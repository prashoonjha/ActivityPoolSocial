import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import {
  COLORS,
  RADIUS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOW,
} from "../theme";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

const VARIANT_STYLES: Record<
  Variant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: COLORS.primary, text: "#FFFFFF" },
  secondary: { bg: COLORS.accent, text: "#FFFFFF" },
  outline: { bg: "transparent", text: COLORS.primary, border: COLORS.primary },
  ghost: { bg: "transparent", text: COLORS.textSecondary },
  danger: { bg: COLORS.error, text: "#FFFFFF" },
};

export default function ActionButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: Props) {
  const v = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 1.5, borderColor: v.border },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant !== "ghost" && SHADOW.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[styles.label, { color: v.text }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 44,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.2,
  },
});
