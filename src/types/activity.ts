export type Activity = {
  id: string;
  title: string;
  description: string;
  dateTime: string; // ISO string
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  hostId: string;
  hostEmail: string | null;
  participants: string[];
  createdAt: any; // Firestore timestamp
};
