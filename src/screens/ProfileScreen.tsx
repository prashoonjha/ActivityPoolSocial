import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Avatar,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../hooks/useAuth";
import { db } from "../services/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

type UserProfile = {
  name?: string;
  interests?: string;
  avatarId?: string;
};

const AVATARS = [
  { id: "avatar1", source: require("../../assets/avatars/avatar1.png") },
  { id: "avatar2", source: require("../../assets/avatars/avatar2.png") },
  { id: "avatar3", source: require("../../assets/avatars/avatar3.png") },
  { id: "avatar4", source: require("../../assets/avatars/avatar4.png") },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [interests, setInterests] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("avatar1");
  const [saving, setSaving] = useState(false);

  // Subscribe to users/{uid} in Firestore
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (!snap.exists()) {
        // First time: no profile yet
        setProfile({});
        setName("");
        setInterests("");
        setSelectedAvatarId("avatar1");
        return;
      }

      const data = snap.data() as UserProfile;
      setProfile(data);
      setName(data.name ?? "");
      setInterests(data.interests ?? "");
      setSelectedAvatarId(data.avatarId ?? "avatar1");
    });

    return () => unsub();
  }, [user]);

  async function saveProfile() {
    if (!user) return;

    try {
      setSaving(true);

      const userDocRef = doc(db, "users", user.uid);

      await setDoc(
        userDocRef,
        {
          name: name.trim(),
          interests: interests.trim(),
          avatarId: selectedAvatarId,
        },
        { merge: true }
      );
    } catch (err) {
      console.log("Profile save error:", err);
    } finally {
      setSaving(false);
    }
  }

  if (!user || profile === null) {
    return (
      <View
        style={[
          styles.loadingCenter,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const email = user.email ?? "";
  const fallbackInitial = email.charAt(0).toUpperCase() || "A";
  const selectedAvatar = AVATARS.find((a) => a.id === selectedAvatarId);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Your Profile
      </Text>

      {/* avatar preview */}
      <View style={styles.avatarContainer}>
        {selectedAvatar ? (
          <Avatar.Image size={120} source={selectedAvatar.source} />
        ) : (
          <Avatar.Text size={120} label={fallbackInitial} />
        )}
        <Text style={{ marginTop: 8, opacity: 0.7 }}>
          Choose an avatar below
        </Text>
      </View>

      {/* Avatar choices */}
      <Text style={styles.subTitle}>Pick your avatar and click Save profile</Text>
      <View style={styles.avatarGrid}>
        {AVATARS.map((avatar) => {
          const isSelected = avatar.id === selectedAvatarId;
          return (
            <TouchableOpacity
              key={avatar.id}
              onPress={() => setSelectedAvatarId(avatar.id)}
              style={[
                styles.avatarOption,
                isSelected && styles.avatarOptionSelected,
              ]}
            >
              <Avatar.Image size={56} source={avatar.source} />
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.emailText}>{email}</Text>

      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Interests (e.g. hiking, board games...)"
        value={interests}
        onChangeText={setInterests}
        style={styles.input}
        mode="outlined"
        multiline
      />

      <Button
        mode="contained"
        onPress={saveProfile}
        loading={saving}
        disabled={saving}
      >
        Save profile
      </Button>

      <Button onPress={logout} style={{ marginTop: 16 }}>
        Log out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  avatarOption: {
    marginRight: 8,
    marginBottom: 8,
    padding: 2,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionSelected: {
    borderColor: "#1976D2",
  },
  label: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  emailText: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
});
