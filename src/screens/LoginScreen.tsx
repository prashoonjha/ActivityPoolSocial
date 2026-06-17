import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  Image,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useAuth } from "../hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import ActionButton from "../components/ActionButton";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOW,
} from "../theme";

type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);

    if (!email.trim || !password) {
      setError("Fill in both fields.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
    } catch (e: any) {
      const msg = e.message || "";
      if (
        msg.includes("user-not-found") ||
        msg.includes("wrong-password") ||
        msg.includes("invalid-credential")
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Try again later or reset your password.");
      } else {
        setError(msg || "Sign in failed. Please check your connection.");
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
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="group" size={40} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.heroTitle}>ActivityPool Social</Text>
        <Text style={styles.heroSubtitle}>
          Join local activities. Make real connections.
        </Text>
      </LinearGradient>

      {/* Form panel */}
      <ScrollView
        contentContainerStyle={styles.formPanel}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formTitle}>Welcome back</Text>
        <Text style={styles.formSubtitle}>Sign in to continue</Text>

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
          label="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="email-outline" />}
        />

        <TextInput
          label="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
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

        <ActionButton
          label="Sign In"
          onPress={handleLogin}
          loading={submitting}
          disabled={submitting}
          fullWidth
          style={styles.cta}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>New here?</Text>
          <View style={styles.dividerLine} />
        </View>

        <ActionButton
          label="Create an account"
          onPress={() => navigation.navigate("Register")}
          variant="outline"
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
  heroSection: {
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: SPACING.md,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.md,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  formPanel: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    ...SHADOW.lg,
  },
  formTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.errorLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
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
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  cta: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
