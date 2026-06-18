import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../hooks/useAuth";
import ActionButton from "../components/ActionButton";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOW,
} from "../theme";
import { getInitials, sanitizeText } from "../utils";

// Avatar options — simple gradient-letter avatars styled in code
const AVATAR_COLORS = [
  { id: "a1", bg: "#4F46E5", label: "Indigo" },
  { id: "a2", bg: "#F97316", label: "Orange" },
  { id: "a3", bg: "#10B981", label: "Green" },
  { id: "a4", bg: "#F43F5E", label: "Rose" },
  { id: "a5", bg: "#8B5CF6", label: "Purple" },
  { id: "a6", bg: "#06B6D4", label: "Cyan" },
];

export default function ProfileScreen() {
  const { user, profile, updateProfile, logout } = useAuth();

  const [name, setName] = useState(profile?.name ?? "");
  const [interests, setInterests] = useState(profile?.interests ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.avatarId ?? "a1",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setInterests(profile.interests ?? "");
      setBio(profile.bio ?? "");
      setSelectedAvatar(profile.avatarId ?? "a1");
    }
  }, [profile]);

  async function handleSave() {
    try {
      setSaving(true);
      await updateProfile({
        name: sanitizeText(name) || null,
        interests: sanitizeText(interests) || null,
        bio: sanitizeText(bio) || null,
        avatarId: selectedAvatar,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  }

  const initials = getInitials(name || profile?.name, user?.email);
  const avatarColor =
    AVATAR_COLORS.find((a) => a.id === selectedAvatar)?.bg ?? COLORS.primary;
  const email = user?.email ?? "";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.hero}
      >
        {/* Big avatar */}
        <View style={[styles.avatarLarge, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>{name || email.split("@")[0]}</Text>
        <Text style={styles.heroEmail}>{email}</Text>
      </LinearGradient>

      {/* Avatar picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose avatar colour</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_COLORS.map((av) => (
            <TouchableOpacity
              key={av.id}
              style={[
                styles.avatarOption,
                { backgroundColor: av.bg },
                selectedAvatar === av.id && styles.avatarOptionSelected,
              ]}
              onPress={() => setSelectedAvatar(av.id)}
              activeOpacity={0.8}
            >
              {selectedAvatar === av.id && (
                <MaterialIcons name="check" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Profile form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal info</Text>

        <Text style={styles.fieldLabel}>Email</Text>
        <View style={styles.readonlyField}>
          <MaterialIcons name="email" size={16} color={COLORS.textMuted} />
          <Text style={styles.readonlyText}>{email}</Text>
        </View>

        <TextInput
          label="Full name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
          left={<TextInput.Icon icon="account-outline" />}
        />

        <TextInput
          label="Bio (optional)"
          value={bio}
          onChangeText={setBio}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={2}
          maxLength={160}
          left={<TextInput.Icon icon="text-short" />}
        />

        <TextInput
          label="Interests (e.g. hiking, board games, cooking)"
          value={interests}
          onChangeText={setInterests}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={2}
          maxLength={200}
          left={<TextInput.Icon icon="star-outline" />}
        />

        <ActionButton
          label={saved ? "Saved ✓" : "Save profile"}
          onPress={handleSave}
          loading={saving}
          disabled={saving || saved}
          fullWidth
          variant={saved ? "outline" : "primary"}
          style={styles.saveBtn}
        />
      </View>

      {/* Sign out */}
      <View style={styles.section}>
        <ActionButton
          label="Sign out"
          onPress={handleLogout}
          variant="danger"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingBottom: SPACING.xxl },
  hero: {
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: SPACING.md,
    ...SHADOW.lg,
  },
  avatarInitials: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: "#FFFFFF",
  },
  heroName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.75)",
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.sm,
  },
  avatarOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  readonlyField: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  readonlyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  saveBtn: {
    marginTop: SPACING.xs,
  },
});
