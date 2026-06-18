import React, { useEffect, useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../hooks/useAuth";
import { Activity } from "../types/activity";
import ActivityCard from "../components/ActivityCard";
import EmptyState from "../components/EmptyState";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOW,
} from "../theme";
import { getInitials } from "../utils";

export default function HomeScreen({ navigation }: any) {
  const { user, profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("dateTime", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setActivities(
        snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title ?? "",
            description: data.description ?? "",
            dateTime: data.dateTime ?? "",
            locationName: data.locationName ?? null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            hostId: data.hostId ?? "",
            hostEmail: data.hostEmail ?? null,
            hostName: data.hostName ?? null,
            participants: data.participants ?? [],
            participantCount: (data.participants ?? []).length,
            maxParticipants: data.maxParticipants ?? null,
            category: data.category ?? "other",
            createdAt: data.createdAt ?? null,
          };
        }),
      );
    });
    return unsub;
  }, []);

  const upcoming = useMemo(
    () => activities.filter((a) => new Date(a.dateTime) > new Date()),
    [activities],
  );

  const joinedCount = useMemo(
    () =>
      user
        ? activities.filter((a) => a.participants.includes(user.uid)).length
        : 0,
    [activities, user],
  );

  // Short preview — next 3 upcoming activities only. Full browsing lives in Discover tab.
  const preview = upcoming.slice(0, 3);

  const displayName = profile?.name || user?.email?.split("@")[0] || "there";
  const initials = getInitials(profile?.name, user?.email);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <Text style={styles.heroGreeting}>Hello, {displayName} 👋</Text>
            <Text style={styles.heroTagline}>Here's what's happening</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.avatarInitials}>{initials}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatPill
            icon="event"
            value={String(upcoming.length)}
            label="Upcoming"
          />
          <View style={styles.statDivider} />
          <StatPill
            icon="check-circle"
            value={String(joinedCount)}
            label="Joined"
          />
          <View style={styles.statDivider} />
          <StatPill
            icon="group"
            value={String(activities.length)}
            label="Total"
          />
        </View>
      </LinearGradient>

      {/* Primary actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("Add")}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Create activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.discoverBtn}
          onPress={() => navigation.navigate("Discover")}
          activeOpacity={0.85}
        >
          <MaterialIcons name="explore" size={22} color={COLORS.primary} />
          <Text style={styles.discoverBtnText}>Browse all activities</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <Text style={styles.sectionTitle}>Coming up</Text>
          {preview.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate("Discover")}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          )}
        </View>

        {preview.length === 0 ? (
          <EmptyState
            message="No upcoming activities yet."
            subMessage="Create one or check Discover to join others."
            icon="event"
          />
        ) : (
          <View style={{ gap: SPACING.md }}>
            {preview.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statPill}>
      <MaterialIcons
        name={icon as any}
        size={16}
        color="rgba(255,255,255,0.75)"
      />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xl },
  hero: {
    paddingTop: 56,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  heroText: { flex: 1 },
  heroGreeting: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  heroTagline: {
    fontSize: FONT_SIZE.md,
    color: "rgba(255,255,255,0.75)",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statPill: { alignItems: "center", flex: 1 },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: "#FFFFFF",
    marginTop: 2,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  actionsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.md,
  },
  createBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: "#FFFFFF",
  },
  discoverBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  discoverBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  previewSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
});
