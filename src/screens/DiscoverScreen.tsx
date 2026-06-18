import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { Activity, ActivityCategory } from "../types/activity";
import ActivityCard from "../components/ActivityCard";
import EmptyState from "../components/EmptyState";
import ActionButton from "../components/ActionButton";
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from "../theme";
import { CATEGORIES, CATEGORY_CONFIG } from "../utils";

type FilterType = "all" | "joined" | "hosted";

export default function DiscoverScreen() {
  const { user } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<
    ActivityCategory | "all"
  >("all");

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  async function joinActivity(id: string) {
    if (!user) return;
    await updateDoc(doc(db, "activities", id), {
      participants: arrayUnion(user.uid),
    });
  }

  async function leaveActivity(id: string) {
    if (!user) return;
    await updateDoc(doc(db, "activities", id), {
      participants: arrayRemove(user.uid),
    });
  }

  function confirmDelete(id: string) {
    Alert.alert("Delete activity", "This action can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteDoc(doc(db, "activities", id)),
      },
    ]);
  }

  const visibleActivities = useMemo(() => {
    let list = activities;

    if (user) {
      if (filter === "joined")
        list = list.filter((a) => a.participants.includes(user.uid));
      if (filter === "hosted") list = list.filter((a) => a.hostId === user.uid);
    }

    if (categoryFilter !== "all") {
      list = list.filter((a) => a.category === categoryFilter);
    }

    return list;
  }, [activities, filter, categoryFilter, user]);

  function renderItem({ item }: { item: Activity }) {
    const isHost = user?.uid === item.hostId;
    const isJoined = user ? item.participants.includes(user.uid) : false;
    const isFull =
      item.maxParticipants !== null &&
      item.participants.length >= item.maxParticipants;

    const actions = user ? (
      <View style={styles.cardActions}>
        {isHost && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item.id)}
          >
            <MaterialIcons
              name="delete-outline"
              size={16}
              color={COLORS.error}
            />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        )}
        {isJoined ? (
          <ActionButton
            label="Leave"
            variant="outline"
            onPress={() => leaveActivity(item.id)}
            style={styles.actionBtn}
          />
        ) : (
          <ActionButton
            label={isFull ? "Full" : "Join"}
            variant={isFull ? "ghost" : "primary"}
            disabled={isFull && !isHost}
            onPress={() => joinActivity(item.id)}
            style={styles.actionBtn}
          />
        )}
      </View>
    ) : undefined;

    return <ActivityCard activity={item} actionSlot={actions} />;
  }

  const ListHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.pageTitle}>Discover activities</Text>
      <Text style={styles.pageSubtitle}>Find something happening near you</Text>

      {/* Status filter chips */}
      <View style={styles.filterChips}>
        {(["all", "joined", "hosted"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.chipText, filter === f && styles.chipTextActive]}
            >
              {f === "all" ? "All" : f === "joined" ? "Joined" : "Hosted"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={["all", ...CATEGORIES] as (ActivityCategory | "all")[]}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item: cat }) => {
          const selected = categoryFilter === cat;
          const cfg = cat === "all" ? null : CATEGORY_CONFIG[cat];
          return (
            <TouchableOpacity
              style={[
                styles.catChip,
                selected && {
                  backgroundColor: cfg?.bg ?? COLORS.primaryLight,
                  borderColor: cfg?.color ?? COLORS.primary,
                },
              ]}
              onPress={() => setCategoryFilter(cat)}
              activeOpacity={0.8}
            >
              {cfg && (
                <MaterialIcons
                  name={cfg.icon as any}
                  size={13}
                  color={selected ? cfg.color : COLORS.textMuted}
                />
              )}
              <Text
                style={[
                  styles.catChipText,
                  selected && {
                    color: cfg?.color ?? COLORS.primary,
                    fontWeight: FONT_WEIGHT.semibold,
                  },
                ]}
              >
                {cat === "all" ? "All categories" : cfg!.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <Text style={styles.resultCount}>
        {visibleActivities.length}{" "}
        {visibleActivities.length === 1 ? "activity" : "activities"}
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.root}
      data={visibleActivities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={
        <EmptyState
          message={
            filter === "joined"
              ? "You haven't joined any activities yet."
              : filter === "hosted"
                ? "You haven't created any activities yet."
                : "No activities match this filter."
          }
          subMessage={
            filter === "all" && categoryFilter === "all"
              ? "Be the first to create one!"
              : "Try a different filter."
          }
          icon="search-off"
        />
      }
      ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerSection: {
    marginBottom: SPACING.md,
  },
  pageTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  filterChips: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  categoryRow: {
    gap: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  catChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  resultCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACING.xs,
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minHeight: 36,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  deleteBtnText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    fontWeight: FONT_WEIGHT.medium,
  },
});
