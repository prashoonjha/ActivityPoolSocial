import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from "../theme";

type Props = {
  message: string;
  subMessage?: string;
  icon?: string;
};

export default function EmptyState({
  message,
  subMessage,
  icon = "inbox",
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name={icon as any} size={48} color={COLORS.textMuted} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
