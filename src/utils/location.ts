import axios from "axios";

export type GeoCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
};

export type GeoPosition = {
  coords: GeoCoords;
  timestamp: number;
};

export type GeoWatchOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
};

export const GOOGLE_MAPS_API_KEY = "AIzaSyBkPVyqFsg4_u-TRq7Xux9Pt--ZpKIoW9Q";

/** ✔ Get Current Location (Web Compatible) */
export const getCurrentLocation = (): Promise<GeoPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          },
          timestamp: pos.timestamp,
        });
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  });
};

/** ✔ Reverse Geocode using Google Maps API */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    const { data } = await axios.get(url);

    if (data.status !== "OK" || !data.results.length) return null;

    return data.results[0].formatted_address;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return null;
  }
};
