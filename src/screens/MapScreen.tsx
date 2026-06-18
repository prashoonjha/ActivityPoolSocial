import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Activity } from "../types/activity";
import MapActivityMarker from "../components/MapActivityMarker";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOW,
} from "../theme";

const INITIAL_REGION = {
  latitude: 60.1699,
  longitude: 24.9384,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  // Real-time activities with location
  useEffect(() => {
    const q = query(collection(db, "activities"));
    const unsub = onSnapshot(q, (snap) => {
      setActivities(
        snap.docs
          .map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              title: data.title ?? "",
              description: data.description ?? "",
              dateTime: data.dateTime ?? "",
              locationName: data.locationName ?? null,
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,
              hostId: data.hostId ?? "",
              hostEmail: data.hostEmail ?? null,
              hostName: data.hostName ?? null,
              participants: data.participants ?? [],
              participantCount: (data.participants ?? []).length,
              maxParticipants: data.maxParticipants ?? null,
              category: data.category ?? "other",
              createdAt: data.createdAt ?? null,
            };
          })
          .filter((a) => a.latitude != null && a.longitude != null),
      );
    });
    return unsub;
  }, []);

  // Request location permission and get current position
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        600,
      );
    })();
  }, []);

  function goToUserLocation() {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      {
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      600,
    );
  }

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {activities.map((a) => (
          <MapActivityMarker
            key={a.id}
            activity={a}
            onPress={setSelectedActivity}
          />
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={goToUserLocation}>
          <MaterialIcons name="my-location" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Activity count badge */}
      <View style={styles.badge}>
        <MaterialIcons name="event" size={14} color={COLORS.primary} />
        <Text style={styles.badgeText}>
          {activities.length} activities on map
        </Text>
      </View>

      {/* Selected activity preview */}
      {selectedActivity && (
        <View style={styles.previewCard}>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {selectedActivity.title}
            </Text>
            <Text style={styles.previewLocation} numberOfLines={1}>
              {selectedActivity.locationName ?? "Location not specified"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setSelectedActivity(null)}
          >
            <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 },
  controls: {
    position: "absolute",
    right: SPACING.md,
    bottom: SPACING.xxl + SPACING.lg,
  },
  controlBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.lg,
  },
  badge: {
    position: "absolute",
    top: SPACING.md,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    ...SHADOW.md,
  },
  badgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  previewCard: {
    position: "absolute",
    bottom: SPACING.xxl,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    ...SHADOW.lg,
  },
  previewContent: { flex: 1 },
  previewTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  previewLocation: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  previewClose: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});
