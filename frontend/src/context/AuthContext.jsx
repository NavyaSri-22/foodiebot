
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      setLoading(true);

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (!active) return;

        if (profileSnapshot.exists()) {
          setProfile(profileSnapshot.data());
        } else {
          setProfile({
            uid: currentUser.uid,
            fullName: currentUser.displayName || "Foodie",
            email: currentUser.email
          });
        }
      } catch (error) {
        console.error("Profile loading error:", error);

        if (active) {
          setProfile({
            uid: currentUser.uid,
            fullName: currentUser.displayName || "Foodie",
            email: currentUser.email
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
