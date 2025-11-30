import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";

type UserProfile = {
  name: string | null;
  interests: string | null;
  photoUrl: string | null;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  // load user + profile on auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      (async () => {
        if (firebaseUser) {
          setUser(firebaseUser);

          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const snapshot = await getDoc(userDocRef);

            if (snapshot.exists()) {
              const data = snapshot.data() as any;
              setProfile({
                name: data.name ?? null,
                interests: data.interests ?? null,
                photoUrl: data.photoUrl ?? null,
              });
            } else {
              setProfile({
                name: null,
                interests: null,
                photoUrl: null,
              });
            }
          } catch (err) {
            console.log("Error loading user profile:", err);
            setProfile({
              name: null,
              interests: null,
              photoUrl: null,
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }

        setInitializing(false);
      })();
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    const trimmedEmail = email.trim().toLowerCase();
    await signInWithEmailAndPassword(auth, trimmedEmail, password);
  }

  async function register(name: string, email: string, password: string) {
    const trimmedEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(
      auth,
      trimmedEmail,
      password
    );

    const userDoc = doc(db, "users", cred.user.uid);
    const cleanName = name.trim();

    await setDoc(userDoc, {
      name: cleanName,
      email: trimmedEmail,
      interests: "",
      photoUrl: null,
      createdAt: serverTimestamp(),
    });

    // update local profile
    setProfile({
      name: cleanName || null,
      interests: "",
      photoUrl: null,
    });
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;
    const userDocRef = doc(db, "users", uid);

    await setDoc(userDocRef, updates, { merge: true });

    setProfile((prev) => ({
      name:
        updates.name !== undefined
          ? updates.name
          : prev?.name ?? null,
      interests:
        updates.interests !== undefined
          ? updates.interests
          : prev?.interests ?? null,
      photoUrl:
        updates.photoUrl !== undefined
          ? updates.photoUrl
          : prev?.photoUrl ?? null,
    }));
  }

  function logout() {
    return signOut(auth);
  }

  const value: AuthContextValue = {
    user,
    profile,
    initializing,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

export { AuthProvider, useAuth };
