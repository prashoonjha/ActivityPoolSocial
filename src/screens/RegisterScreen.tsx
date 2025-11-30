import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput, Card } from "react-native-paper";
import { useAuth } from "../hooks/useAuth";

type Props = {
  navigation: any;
};

function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!name || !email || !password || !confirm) {
      setError("Fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }

    try {
      setSubmitting(true);
      await register(name, email, password);
      navigation.goBack();
    } catch (e: any) {
      console.log("Register error", e);
      setError("Could not create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.center}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Create account
            </Text>

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />

            <TextInput
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <TextInput
              label="Confirm password"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={submitting}
              disabled={submitting}
              style={styles.button}
            >
              Sign up
            </Button>

            <Button onPress={() => navigation.goBack()}>
              Back to login
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center" },
  card: {
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  title: { textAlign: "center", marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, marginBottom: 8 },
  error: { color: "red", marginBottom: 8 },
});

export default RegisterScreen;
