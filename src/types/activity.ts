import { Timestamp } from "firebase/firestore";

export type ActivityCategory =
  | "sports"
  | "arts"
  | "food"
  | "outdoors"
  | "games"
  | "learning"
  | "other";
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
  hostName: string | null;
  participantCount: number;
  maxParticipants: number | null;
  category: ActivityCategory;
  participants: string[];
  createdAt: Timestamp | number | null;
};
export type UserProfile = {
  uid?: string;
  name: string | null;
  interests: string | null;
  photoUrl: string | null;
  avatarId?: string;
  bio?: string | null;
};