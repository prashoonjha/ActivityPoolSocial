import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View, Image
} from "react-native";
import { Button, Text, TextInput, Card } from "react-native-paper";
import { useAuth } from "../hooks/useAuth";


type Props = {
  navigation: any;
};

function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);

    if (!email || !password) {
      setError("Fill in both fields.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
    } catch (e: any) {
      console.log("Login error", e);
      setError("Login failed. Check your email/password.");
    } finally {
      setSubmitting(false);
    }
  }

  function goToRegister() {
    navigation.navigate("Register");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.center}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Image
  source={require("../../assets/splash.png")}
  style={{
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 12,
    borderRadius: 16,
  }}
/>

            <Text variant="headlineMedium" style={styles.title}>
              ActivityPool Social
            </Text>

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

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={submitting}
              disabled={submitting}
              style={styles.button}
            >
              Log in
            </Button>

            <Button onPress={goToRegister}>Create an account</Button>
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
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  input: { marginBottom: 12 },
  button: { marginTop: 8, marginBottom: 8 },
  error: { color: "red", marginBottom: 8 },
});

export default LoginScreen;
