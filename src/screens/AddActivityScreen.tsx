import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Constants from "expo-constants";

type Suggestion = {
  place_id: string;
  description: string;
};

// Load key safely from app.config.js → .env
const extra = Constants.expoConfig?.extra ?? {};
const GOOGLE_PLACES_KEY =
  extra.GOOGLE_PLACES_API_KEY ||
  extra.GOOGLE_MAPS_API_KEY_ANDROID ||
  extra.GOOGLE_MAPS_API_KEY_IOS ||
  "";

export default function AddActivityScreen() {
  const { user } = useAuth();
  const theme = useTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationName, setLocationName] = useState<string | null>(null);

  // Load suggestions when typing
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!GOOGLE_PLACES_KEY) {
      console.log("Missing Google API key");
      return;
    }

    const fetchPlaces = async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${GOOGLE_PLACES_KEY}`;

        const res = await fetch(url);
        const json = await res.json();
        setSuggestions(json.predictions || []);
      } catch (err) {
        console.log("Autocomplete error:", err);
      }
    };

    fetchPlaces();
  }, [query]);

  async function selectPlace(placeId: string, description: string) {
    setQuery(description);
    setLocationName(description);
    setSuggestions([]);

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_KEY}`;

      const res = await fetch(url);
      const json = await res.json();

      const loc = json.result.geometry.location;
      setCoords({ lat: loc.lat, lng: loc.lng });
    } catch (err) {
      console.log("Place details error:", err);
      Alert.alert("Error", "Could not load place details.");
    }
  }

  // Date picker
  function onChangeDate(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  }

  // Time picker
  function onChangeTime(event: DateTimePickerEvent, selectedTime?: Date) {
    setShowTimePicker(false);
    if (event.type === "set" && selectedTime) {
      setTime(selectedTime);
    }
  }

  function getDateTimeLabel() {
    if (!date && !time) return "Pick date & time";

    const d = date ?? new Date();
    const t = time ?? new Date();

    const combined = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      t.getHours(),
      t.getMinutes()
    );

    return combined.toLocaleString();
  }

  async function save() {
    if (!user) return Alert.alert("Not logged in");

    if (!title || !description || !date || !time || !coords) {
      return Alert.alert(
        "Missing data",
        "Please fill all fields and pick date, time, and location."
      );
    }

    const combinedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    try {
      await addDoc(collection(db, "activities"), {
        title,
        description,
        dateTime: combinedDateTime.toISOString(),
        locationName: locationName ?? query,
        latitude: coords.lat,
        longitude: coords.lng,
        hostId: user.uid,
        hostEmail: user.email ?? null,
        participants: [],
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Activity saved!");

      setTitle("");
      setDescription("");
      setDate(null);
      setTime(null);
      setQuery("");
      setLocationName(null);
      setCoords(null);
    } catch (err) {
      console.log("Error saving activity:", err);
      Alert.alert("Error", "Could not save activity.");
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Create Activity
      </Text>

      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        multiline
      />

      <Text style={styles.label}>Date & time</Text>
      <View style={styles.row}>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, styles.half]}
        >
          {date ? date.toLocaleDateString() : "Pick date"}
        </Button>

        <Button
          mode="outlined"
          onPress={() => setShowTimePicker(true)}
          style={[styles.input, styles.half]}
        >
          {time
            ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Pick time"}
        </Button>
      </View>

      <Text style={styles.dateTimePreview}>{getDateTimeLabel()}</Text>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onChangeDate}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
        />
      )}

      <TextInput
        label="Search location"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        mode="outlined"
      />

      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              onPress={() => selectPlace(item.place_id, item.description)}
              style={styles.suggestionItem}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {coords && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coords.lat,
            longitude: coords.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} />
        </MapView>
      )}

      <Button mode="contained" onPress={save} style={{ marginTop: 12 }}>
        Save Activity
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { marginBottom: 8 },
  input: { marginBottom: 12 },
  label: { marginBottom: 4, fontSize: 14, opacity: 0.8 },
  map: { height: 180, marginVertical: 12, borderRadius: 8 },
  suggestions: {
    backgroundColor: "#fff",
    elevation: 2,
    marginBottom: 12,
    borderRadius: 8,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    flex: 1,
    marginRight: 6,
  },
  dateTimePreview: {
    marginBottom: 12,
    fontSize: 13,
    opacity: 0.7,
  },
});
