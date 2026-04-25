import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE is not defined");
}

//  Wait until Firebase fully initializes
function waitForAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });

    // Optional safety timeout (prevents infinite wait)
    setTimeout(() => {
      unsubscribe();
      reject(new Error("Auth initialization timeout"));
    }, 5000);
  });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  let user = auth.currentUser;

  if (!user) {
    try {
      user = await waitForAuth();
    } catch {
      throw new Error("User not authenticated");
    }
  }

  const token = await user.getIdToken();

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  //  ONLY set JSON header when body is NOT FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}
