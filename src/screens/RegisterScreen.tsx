import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useAuth } from "../hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import ActionButton from "../components/ActionButton";
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from "../theme";

type Props = {
  navigation: any;
};

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Fill in all fields.");
      return;
    }
    try {
      setSubmitting(true);
      await register(name, email, password);
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered. Try signing in.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <MaterialIcons name="person-add" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Join ActivityPool Social and start meeting people
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons
              name="error-outline"
              size={16}
              color={COLORS.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          label="Full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="account-outline" />}
        />

        <TextInput
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="email-outline" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        <Text style={styles.passwordHint}>
          Min 8 characters · at least one uppercase letter and one number
        </Text>

        <ActionButton
          label="Create account"
          onPress={handleRegister}
          loading={submitting}
          disabled={submitting}
          fullWidth
          style={styles.cta}
        />

        <ActionButton
          label="Already have an account? Sign in"
          onPress={() => navigation.goBack()}
          variant="ghost"
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.xs,
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    flex: 1,
  },
  input: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  passwordHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 16,
  },
  cta: {
    marginBottom: SPACING.md,
  },
});
