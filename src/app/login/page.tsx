"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";

export default function EntryRedirect() {
  const router = useRouter();
  const [status, setStatus] = useState("Initializing authentication...");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        setStatus("Checking Google login result...");

        // Handle redirect result (user coming back from Google)
        await getRedirectResult(auth);

        setStatus("Restoring session...");

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setStatus("Redirecting to Google login...");
            await signInWithRedirect(auth, googleProvider);
            return;
          }

          setStatus("Verifying profile...");

          const res = await apiFetch("/users/me/");

          if (res.ok) {
            setStatus("Login successful! Redirecting...");
            router.replace("/dashboard");
          } else if (res.status === 404) {
            setStatus("New user detected. Redirecting to registration...");
            router.replace("/register");
          } else {
            throw new Error("Profile check failed");
          }
        });
      } catch (err: any) {
        console.error("Auth error:", err);
        toast.error(err?.message || "Authentication failed");
        router.replace("/role");
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-3">Signing you in...</h2>
        <p className="text-gray-600">{status}</p>

        {/* Optional Loader */}
        <div className="mt-6 animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}