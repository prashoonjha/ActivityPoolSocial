import 'dotenv/config';

export default {
  expo: {
    name: "ActivityPool Social",
    slug: "activitypool-social",
    scheme: "activitypool",
    version: "1.0.0",
    orientation: "portrait",

    icon: "./assets/splash.png",

    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#05060A",
    },

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.prashoon24.activitypoolsocial",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS,
      },
    },

    android: {
      package: "com.prashoon24.activitypoolsocial",
      adaptiveIcon: {
        foregroundImage: "./assets/splash.png",
        backgroundColor: "#05060A",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
        },
      },
    },

    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/splash.png",
          color: "#1976D2",
        },
      ],
    ],

    web: {
      bundler: "metro",
      output: "single",
    },

    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
      GOOGLE_MAPS_API_KEY_ANDROID: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
      GOOGLE_MAPS_API_KEY_IOS: process.env.GOOGLE_MAPS_API_KEY_IOS,
      eas: {
        projectId: "15543346-8c66-4f9d-9a83-f5c04547c7c9",
      },
    },
  },
};
