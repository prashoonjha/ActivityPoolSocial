import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import { Activity } from "../types/activity";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { Text } from "react-native-paper";
import * as Location from "expo-location";
import MapActivityMarker from "../components/MapActivityMarker";

function MapScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "activities"), (snapshot) => {
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

  // Center on first activity if available
  useEffect(() => {
    if (region) return;
    const first = activities.find((a) => a.latitude && a.longitude);
    if (first && first.latitude && first.longitude) {
      setRegion({
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [activities, region]);

  // try user location via Expo Location 
  useEffect(() => {
    (async () => {
      if (region) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    })();
  }, [region]);

  const fallbackRegion: Region = {
    latitude: 60.1699, // Helsinki
    longitude: 24.9384,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region ?? fallbackRegion}>
        {activities.map((activity) => (
          <MapActivityMarker key={activity.id} activity={activity} />
        ))}
      </MapView>
      {activities.length === 0 && (
        <Text style={styles.emptyText}>No activities on the map yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  emptyText: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    marginHorizontal: 32,
    borderRadius: 8,
    padding: 8,
  },
});

export default MapScreen;
