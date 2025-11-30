import React from "react";
import { Marker } from "react-native-maps";
import { Activity } from "../types/activity";

type Props = {
  activity: Activity;
};

export default function MapActivityMarker({ activity }: Props) {
  if (!activity.latitude || !activity.longitude) return null;

  return (
    <Marker
      coordinate={{
        latitude: activity.latitude,
        longitude: activity.longitude,
      }}
      title={activity.title}
      description={activity.locationName ?? activity.description}
    />
  );
}
