"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { useAuth, User } from "./AuthContext";

export default function AuthListener() {
  const { setUser } = useAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      const token = await firebaseUser.getIdToken();

      const res = await apiFetch("/users/sync/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: firebaseUser.displayName,
          photo_url: firebaseUser.photoURL,
        }),
      });

      const user: User = await res.json();
      setUser(user);
    });

    return () => unsub();
  }, [setUser]);

  return null;
}
