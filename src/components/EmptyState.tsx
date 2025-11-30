import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

type Props = {
  message: string;
};

export default function EmptyState({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: "center",
    opacity: 0.7,
  },
  text: {
    textAlign: "center",
  },
});
