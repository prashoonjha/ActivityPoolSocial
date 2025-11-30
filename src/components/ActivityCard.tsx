import React, { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { Activity } from "../types/activity";

type Props = {
  activity: Activity;
  actionSlot?: ReactNode; // Join / Delete / Unjoin buttons
};

export default function ActivityCard({ activity, actionSlot }: Props) {
  const dateLabel = activity.dateTime
    ? new Date(activity.dateTime).toLocaleString()
    : "No date";

  return (
    <Card style={styles.card}>
      <Card.Title title={activity.title} subtitle={dateLabel} />

      <Card.Content>
        <Text>{activity.description}</Text>

        {activity.locationName && (
          <Text style={styles.locationText}>{activity.locationName}</Text>
        )}

        <Text style={styles.metaText}>
          Host: {activity.hostEmail ?? "Unknown"}
        </Text>
        <Text style={styles.metaText}>
          Participants: {activity.participants.length}
        </Text>
      </Card.Content>

      {actionSlot && <Card.Actions>{actionSlot}</Card.Actions>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0, 
  },
  metaText: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
  locationText: {
    marginTop: 4,
  },
});
