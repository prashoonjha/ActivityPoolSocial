// src/components/MapActivityMarker.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Callout, Marker } from "react-native-maps";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { Activity } from "../types/activity";
import {
  COLORS,
  RADIUS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOW,
} from "../theme";
import { CATEGORY_CONFIG, formatDateTime } from "../utils";

type Props = {
  activity: Activity;
  onPress?: (activity: Activity) => void;
};

export default function MapActivityMarker({ activity, onPress }: Props) {
  if (activity.latitude == null || activity.longitude == null) return null;

  const catConfig = CATEGORY_CONFIG[activity.category ?? "other"];

  return (
    <Marker
      coordinate={{
        latitude: activity.latitude,
        longitude: activity.longitude,
      }}
      onPress={() => onPress?.(activity)}
    >
      {/* Custom marker pin */}
      <View style={[styles.pin, { backgroundColor: catConfig.color }]}>
        <MaterialIcons name={catConfig.icon as any} size={16} color="#FFFFFF" />
      </View>

      <Callout tooltip onPress={() => onPress?.(activity)}>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle} numberOfLines={1}>
            {activity.title}
          </Text>
          <Text style={styles.calloutDate}>
            {formatDateTime(activity.dateTime)}
          </Text>
          {activity.locationName && (
            <Text style={styles.calloutLocation} numberOfLines={1}>
              {activity.locationName}
            </Text>
          )}
          <View style={styles.calloutFooter}>
            <MaterialIcons name="group" size={12} color={COLORS.textMuted} />
            <Text style={styles.calloutParticipants}>
              {activity.participants.length} going
            </Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    ...SHADOW.md,
  },
  callout: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    minWidth: 180,
    maxWidth: 240,
    ...SHADOW.lg,
  },
  calloutTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  calloutDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  calloutLocation: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  calloutFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  calloutParticipants: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
});
