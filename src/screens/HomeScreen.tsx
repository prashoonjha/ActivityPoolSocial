import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Image,
  Alert,
  ImageSourcePropType,
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
import { Button, Text, useTheme, Avatar } from "react-native-paper";
import { useAuth } from "../hooks/useAuth";
import { Activity } from "../types/activity";
import ActivityCard from "../components/ActivityCard";
import EmptyState from "../components/EmptyState";

type FilterType = "all" | "joined" | "hosted";

type UserProfile = {
  name?: string;
  interests?: string;
  avatarId?: string;
};

// Map avatarId -> local PNG 
const AVATAR_SOURCES: Record<string, ImageSourcePropType> = {
  avatar1: require("../../assets/avatars/avatar1.png"),
  avatar2: require("../../assets/avatars/avatar2.png"),
  avatar3: require("../../assets/avatars/avatar3.png"),
  avatar4: require("../../assets/avatars/avatar4.png"),
};

function getAvatarSourceById(id?: string): ImageSourcePropType | null {
  if (!id) return null;
  return AVATAR_SOURCES[id] ?? null;
}

function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const theme = useTheme();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showList, setShowList] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Subscribe to activities list
  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("dateTime", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const next: Activity[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title,
          description: data.description,
          dateTime: data.dateTime,
          locationName: data.locationName ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          hostId: data.hostId,
          hostEmail: data.hostEmail ?? null,
          participants: data.participants ?? [],
          createdAt: data.createdAt ?? 0,
        };
      });
      setActivities(next);
    });

    return unsub;
  }, []);

  // Subscribe to user profile (users/{uid})
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (!snap.exists()) {
        setProfile(null);
        return;
      }
      const data = snap.data() as UserProfile;
      setProfile(data);
    });

    return () => unsub();
  }, [user]);

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }

  async function joinActivity(activityId: string) {
    if (!user) return;
    const docRef = doc(db, "activities", activityId);
    await updateDoc(docRef, { participants: arrayUnion(user.uid) });
  }

  async function leaveActivity(activityId: string) {
    if (!user) return;
    const docRef = doc(db, "activities", activityId);
    await updateDoc(docRef, { participants: arrayRemove(user.uid) });
  }

  function confirmDeleteActivity(activityId: string) {
    Alert.alert(
      "Delete activity",
      "Are you sure you want to delete this activity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteActivity(activityId),
        },
      ]
    );
  }

  async function deleteActivity(activityId: string) {
    const docRef = doc(db, "activities", activityId);
    await deleteDoc(docRef);
  }

  const visibleActivities = activities.filter((a) => {
    if (!user) return filter === "all";

    if (filter === "joined") return a.participants.includes(user.uid);
    if (filter === "hosted") return a.hostId === user.uid;

    return true;
  });

  function getEmptyMessage() {
    if (filter === "joined") return "You haven’t joined any activities yet.";
    if (filter === "hosted") return "You haven’t created any activities yet.";
    return "No activities yet. Be the first to create one!";
  }

  function getFilterLabel() {
    if (filter === "joined") return "Joined activities";
    if (filter === "hosted") return "Hosted activities";
    return "All activities";
  }

  const displayName = profile?.name || user?.email || "there";

  const avatarImageSource = getAvatarSourceById(profile?.avatarId);
  const avatarNode = avatarImageSource ? (
    <Avatar.Image size={56} source={avatarImageSource} />
  ) : (
    <Avatar.Text
      size={56}
      label={(displayName.charAt(0) || "A").toUpperCase()}
    />
  );

  function renderItem({ item }: { item: Activity }) {
    if (!user) {
      return <ActivityCard activity={item} />;
    }

    const isHost = item.hostId === user.uid;
    const isJoined = item.participants.includes(user.uid);

    let actionSlot = null;

    if (isHost) {
      // Host can delete and also join/leave their own activity
      actionSlot = (
        <View style={{ flexDirection: "row" }}>
          <Button
            mode="text"
            textColor="red"
            onPress={() => confirmDeleteActivity(item.id)}
          >
            Delete
          </Button>
          {isJoined ? (
            <Button mode="text" onPress={() => leaveActivity(item.id)}>
              Leave
            </Button>
          ) : (
            <Button mode="text" onPress={() => joinActivity(item.id)}>
              Join
            </Button>
          )}
        </View>
      );
    } else if (isJoined) {
      actionSlot = (
        <Button mode="text" onPress={() => leaveActivity(item.id)}>
          Leave
        </Button>
      );
    } else {
      actionSlot = (
        <Button mode="text" onPress={() => joinActivity(item.id)}>
          Join
        </Button>
      );
    }

    return <ActivityCard activity={item} actionSlot={actionSlot} />;
  }

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Top row: text + avatar */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.welcomeTitle}>
            Hi {displayName} 👋
          </Text>
          <Text style={styles.welcomeText}>
            <Text>
              Welcome to ActivityPool Social!
              {"\n"}
            </Text>
            <Text style={styles.subWelcomeText}>
              Ready to start making friends while having fun?
            </Text>
          </Text>
        </View>
        <View style={styles.avatarWrapper}>{avatarNode}</View>
      </View>

      {/* Hero image (shrinks a bit when list is open to give space) */}
      <Image
        source={require("../../assets/splash.png")}
        style={[styles.heroImage, showList && styles.heroImageSmall]}
        resizeMode="contain"
      />

  
      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          style={styles.fullButton}
          onPress={() => navigation.navigate("Add")}
        >
          Create a new activity 🎉
        </Button>

        <Button
          mode="outlined"
          style={styles.fullButton}
          onPress={() => setShowList((prev) => !prev)}
        >
          {showList ? "Hide activities" : "Show activities"}
        </Button>
      </View>

      {/* Filters only visible when list is open */}
      {showList && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Button
              mode={filter === "all" ? "contained" : "outlined"}
              onPress={() => setFilter("all")}
              style={styles.filterButton}
            >
              All
            </Button>
            <Button
              mode={filter === "joined" ? "contained" : "outlined"}
              onPress={() => setFilter("joined")}
              style={styles.filterButton}
            >
              Joined
            </Button>
            <Button
              mode={filter === "hosted" ? "contained" : "outlined"}
              onPress={() => setFilter("hosted")}
              style={styles.filterButton}
            >
              Hosted
            </Button>
          </View>

          <Text style={styles.sectionLabel}>{getFilterLabel()}</Text>
        </View>
      )}
    </View>
  );

  const data = showList ? visibleActivities : [];

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContent}
      refreshControl={
        showList ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListEmptyComponent={
        showList ? <EmptyState message={getEmptyMessage()} /> : null
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarWrapper: {
    marginLeft: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeTitle: {
    marginBottom: 4,
  },
  welcomeText: {
    opacity: 0.9,
  },
  subWelcomeText: {
    fontSize: 15,
    color: "#555",
  },
  heroImage: {
    width: "100%",
    height: 220,
    marginTop: 12,
    marginBottom: 16,
  },
  heroImageSmall: {
    height: 160,
    marginBottom: 12,
  },
  buttonsContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  fullButton: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 8,
  },
  filtersContainer: {
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.7,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
});

export default HomeScreen;
