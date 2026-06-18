import { initializeApp, getApps} from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
// @ts-ignore — getReactNativePersistence exists in the React Native build
// of the Firebase SDK but is not always exposed in the default type defs
// resolved by Node/TypeScript tooling. Metro (Expo's bundler) resolves
// firebase/auth differently for React Native and provides this export.
import { getReactNativePersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  authInstance = getAuth(app);
}
 
 
export const auth = authInstance;
export const db = getFirestore(app);
export default app;