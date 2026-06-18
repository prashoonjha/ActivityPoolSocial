// src/screens/AddActivityScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Constants from "expo-constants";
import { db } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
import {
  CATEGORIES,
  CATEGORY_CONFIG,
  sanitizeText,
  formatDate,
  formatTime,
  debounce,
} from "../utils";
import { ActivityCategory } from "../types/activity";

const PLACES_API_KEY: string =
  Constants.expoConfig?.extra?.GOOGLE_PLACES_API_KEY ?? "YOUR_KEY_HERE";

if (__DEV__) {
  console.log(
    "PLACES_API_KEY in use:",
    PLACES_API_KEY === "YOUR_KEY_HERE"
      ? "PLACEHOLDER — extra.GOOGLE_PLACES_API_KEY not loaded!"
      : PLACES_API_KEY.slice(0, 6) + "..." + PLACES_API_KEY.slice(-4),
  );
}

type Suggestion = { place_id: string; description: string };

export default function AddActivityScreen({ navigation }: any) {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("other");
  const [maxParticipants, setMaxParticipants] = useState("");

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationName, setLocationName] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Debounced place autocomplete
  const fetchSuggestions = useCallback(
    debounce(async (input: string) => {
      if (input.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${PLACES_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
          console.warn(
            "Places Autocomplete error:",
            json.status,
            json.error_message,
          );
        }
        setSuggestions(json.predictions ?? []);
      } catch (err) {
        console.warn("Places Autocomplete fetch failed:", err);
        setSuggestions([]);
      }
    }, 350),
    [],
  );

  useEffect(() => {
    fetchSuggestions(locationQuery);
  }, [locationQuery]);

  async function selectPlace(placeId: string, description: string) {
    setLocationQuery(description);
    setLocationName(description);
    setSuggestions([]);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${PLACES_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      if (loc) setCoords({ lat: loc.lat, lng: loc.lng });
    } catch {
      Alert.alert(
        "Error",
        "Could not load place details. Try typing the location manually.",
      );
    }
  }

  function onChangeDate(_: DateTimePickerEvent, d?: Date) {
    setShowDatePicker(false);
    if (d) setDate(d);
  }

  function onChangeTime(_: DateTimePickerEvent, t?: Date) {
    setShowTimePicker(false);
    if (t) setTime(t);
  }

  function buildDateTime(): string | null {
    if (!date) return null;
    const combined = new Date(date);
    if (time) {
      combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    }
    return combined.toISOString();
  }

  async function handleSubmit() {
    const cleanTitle = sanitizeText(title);
    const cleanDesc = sanitizeText(description);

    if (!cleanTitle) {
      Alert.alert("Missing title", "Please enter a title for your activity.");
      return;
    }
    if (!date) {
      Alert.alert("Missing date", "Please pick a date.");
      return;
    }
    if (!user) return;

    const dateTime = buildDateTime();
    if (!dateTime) {
      Alert.alert("Invalid date");
      return;
    }

    const maxPart = maxParticipants ? parseInt(maxParticipants, 10) : null;

    try {
      setSubmitting(true);
      await addDoc(collection(db, "activities"), {
        title: cleanTitle,
        description: cleanDesc,
        dateTime,
        locationName: locationName ?? null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        hostId: user.uid,
        hostEmail: user.email ?? null,
        hostName: profile?.name ?? user.email ?? null,
        participants: [user.uid],
        participantCount: 1,
        maxParticipants: maxPart,
        category,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Activity created! 🎉", "Your activity is live.", [
        {
          text: "View activities",
          onPress: () => {
            resetForm();
            navigation.navigate("Home");
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create activity.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate(null);
    setTime(null);
    setLocationQuery("");
    setLocationName(null);
    setCoords(null);
    setMaxParticipants("");
    setCategory("other");
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Text style={styles.pageTitle}>Create an activity</Text>
      <Text style={styles.pageSubtitle}>
        Fill in the details and invite others to join
      </Text>

      {/* Section: Basic info */}
      <SectionHeader title="Activity details" icon="info-outline" />

      <TextInput
        label="Title *"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
        maxLength={80}
        left={<TextInput.Icon icon="pencil" />}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={3}
        maxLength={500}
        left={<TextInput.Icon icon="text" />}
      />

      {/* Category picker */}
      <Text style={styles.fieldLabel}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const selected = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                selected && { backgroundColor: cfg.bg, borderColor: cfg.color },
              ]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={cfg.icon as any}
                size={14}
                color={selected ? cfg.color : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.catChipText,
                  selected && {
                    color: cfg.color,
                    fontWeight: FONT_WEIGHT.semibold,
                  },
                ]}
              >
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TextInput
        label="Max participants (optional)"
        value={maxParticipants}
        onChangeText={(t) => setMaxParticipants(t.replace(/[^0-9]/g, ""))}
        mode="outlined"
        style={styles.input}
        keyboardType="number-pad"
        maxLength={4}
        left={<TextInput.Icon icon="account-group" />}
      />

      {/* Section: Date & Time */}
      <SectionHeader title="Date & time" icon="schedule" />

      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons
            name="calendar-today"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.dateBtnText}>
            {date ? formatDate(date.toISOString()) : "Pick date *"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
          <Text style={styles.dateBtnText}>
            {time ? formatTime(time.toISOString()) : "Pick time"}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date()}
          onChange={onChangeDate}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={time ?? new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
        />
      )}

      {/* Section: Location */}
      <SectionHeader title="Location" icon="place" />

      <TextInput
        label="Search for a location"
        value={locationQuery}
        onChangeText={setLocationQuery}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="magnify" />}
        right={
          locationName ? (
            <TextInput.Icon
              icon="close"
              onPress={() => {
                setLocationQuery("");
                setLocationName(null);
                setCoords(null);
              }}
            />
          ) : undefined
        }
      />

      {suggestions.length > 0 && (
        <View style={styles.suggestionList}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s.place_id}
              style={styles.suggestionItem}
              onPress={() => selectPlace(s.place_id, s.description)}
            >
              <MaterialIcons name="place" size={16} color={COLORS.textMuted} />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {s.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {coords && (
        <View style={styles.mapPreview}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{ latitude: coords.lat, longitude: coords.lng }}
            />
          </MapView>
        </View>
      )}

      {/* Submit */}
      <ActionButton
        label="Publish activity"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
        fullWidth
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon as any} size={18} color={COLORS.primary} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  pageTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeaderText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  input: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  categoryScroll: { marginBottom: SPACING.md },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: SPACING.xs,
  },
  catChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dateBtnText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  suggestionList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    gap: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  mapPreview: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  map: { width: "100%", height: 180 },
  submitBtn: { marginTop: SPACING.lg },
});
