import React, { ReactNode, memo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOW,
} from "../theme";
import { formatDateTime, CATEGORY_CONFIG } from "../utils";
import { Activity } from "../types/activity";

type Props = {
  activity: Activity;
  actionSlot?: ReactNode; // Join / Delete / Unjoin buttons
  onPress?: () => void;
};

function ActivityCard({ activity, actionSlot, onPress }: Props) {
  const dateLabel = formatDateTime(activity.dateTime);

  const catConfig = CATEGORY_CONFIG[activity.category ?? "other"];
  const isFull =
    activity.maxParticipants !== null &&
    activity.participants.length >= activity.maxParticipants;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Category badge strip */}
      <View
        style={[styles.categoryStrip, { backgroundColor: catConfig.color }]}
      />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          {/* Category chip */}
          <View
            style={[styles.categoryChip, { backgroundColor: catConfig.bg }]}
          >
            <MaterialIcons
              name={catConfig.icon as any}
              size={12}
              color={catConfig.color}
            />
            <Text style={[styles.categoryLabel, { color: catConfig.color }]}>
              {catConfig.label}
            </Text>
          </View>

          {isFull && (
            <View style={styles.fullChip}>
              <Text style={styles.fullChipText}>Full</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        {/* Description */}
        {!!activity.description && (
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        )}

        {/* Meta row */}
        <View style={styles.metaRow}>
          <MetaItem icon="schedule" text={dateLabel} />
          {activity.locationName && (
            <MetaItem icon="place" text={activity.locationName} />
          )}
        </View>

        {/* Footer: host + participants */}
        <View style={styles.footer}>
          <View style={styles.hostRow}>
            <MaterialIcons name="person" size={13} color={COLORS.textMuted} />
            <Text style={styles.hostText} numberOfLines={1}>
              {activity.hostName || activity.hostEmail || "Unknown host"}
            </Text>
          </View>

          <View style={styles.participantsRow}>
            <MaterialIcons
              name="group"
              size={13}
              color={COLORS.textSecondary}
            />
            <Text style={styles.participantsText}>
              {activity.participants.length}
              {activity.maxParticipants ? `/${activity.maxParticipants}` : ""}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {actionSlot && <View style={styles.actions}>{actionSlot}</View>}
      </View>
    </TouchableOpacity>
  );
}

function MetaItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.metaItem}>
      <MaterialIcons name={icon as any} size={13} color={COLORS.textMuted} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOW.md,
  },
  categoryStrip: {
    width: 4,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  body: {
    flex: 1,
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  categoryLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.3,
  },
  fullChip: {
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  fullChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.error,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  hostText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  participantsText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
});

export default memo(ActivityCard);
