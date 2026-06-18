import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { UserProfile } from "../types/activity";
import { sanitizeText, isValidEmail, validatePassword } from "../utils";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  const fetchProfile = useCallback(
    async (uid: string): Promise<UserProfile> => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const d = snap.data() as any;
        return {
          name: d.name ?? null,
          interests: d.interests ?? null,
          photoUrl: d.photoUrl ?? null,
          avatarId: d.avatarId ?? undefined,
          bio: d.bio ?? null,
        };
      }
      return { name: null, interests: null, photoUrl: null };
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const p = await fetchProfile(firebaseUser.uid);
          setProfile(p);
        } catch {
          setProfile({ name: null, interests: null, photoUrl: null });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  async function login(email: string, password: string) {
    const clean = email.trim().toLowerCase();
    if (!isValidEmail(clean)) throw new Error("Invalid email address.");
    await signInWithEmailAndPassword(auth, clean, password);
  }

  async function register(name: string, email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = sanitizeText(name);

    if (!cleanName) throw new Error("Name is required.");
    if (!isValidEmail(cleanEmail)) throw new Error("Invalid email address.");
    const pwError = validatePassword(password);
    if (pwError) throw new Error(pwError);

    const cred = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );

    // Write user profile to Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name: cleanName,
      email: cleanEmail,
      interests: "",
      photoUrl: null,
      avatarId: "avatar1",
      bio: null,
      createdAt: serverTimestamp(),
    });

    setProfile({
      name: cleanName,
      interests: "",
      photoUrl: null,
      avatarId: "avatar1",
    });
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not authenticated.");

    await setDoc(doc(db, "users", uid), updates, { merge: true });
    setProfile((prev) => ({ ...prev!, ...updates }));
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email)
      throw new Error("Not authenticated.");

    const pwError = validatePassword(newPassword);
    if (pwError) throw new Error(pwError);

    // Re-authenticate before changing password (security requirement)
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        initializing,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
