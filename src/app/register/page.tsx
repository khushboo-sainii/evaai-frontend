"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/firebase";

type Role = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [institute, setInstitute] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =============================
     Load Role + Firebase
  ============================= */
  useEffect(() => {
    const storedRole = localStorage.getItem("role") as Role | null;

    if (!storedRole) {
      router.replace("/role");
      return;
    }

    setRole(storedRole);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setEmail(firebaseUser.email || "");
        setStep(2); // Skip step 1 if logged via Google
      }
    });

    return () => unsubscribe();
  }, [router]);

  /* =============================
     STEP 1 → Firebase Signup
  ============================= */
  async function handleAuthStep() {
    try {
      setLoading(true);
      setError("");

      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      setUser(cred.user);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* =============================
     STEP 2 → Profile Sync
  ============================= */
  async function handleProfileStep() {
    if (!user || !role) return;

    try {
      setLoading(true);
      setError("");

      if (name) {
        await updateProfile(user, { displayName: name });
      }

      const formData = new FormData();

      formData.append("role", role);
      formData.append("name", name);
      formData.append("email", user.email || "");
      formData.append("phone_number", phone);
      formData.append("state", state);
      formData.append("city", city);
      formData.append("country", country);
      formData.append("institute", institute);
      formData.append("photo_url", user.photoURL || "");

      const res = await apiFetch("/users/sync/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Profile creation failed");

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!role) return null;

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Register as {role}</h2>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />

            <button onClick={handleAuthStep} disabled={loading}>
              {loading ? "Creating Account..." : "Continue"}
            </button>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <>
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />

            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
            />

            <input
              placeholder="Institute"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              className="input-field"
            />

            <input
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input-field"
            />

            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-field"
            />

            <input
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field"
            />

            <button onClick={handleProfileStep} disabled={loading}>
              {loading ? "Creating Profile..." : "Finish Registration"}
            </button>
          </>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .register-card {
          background: white;
          padding: 40px;
          border-radius: 16px;
          width: 400px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-field {
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
        }

        button {
          padding: 12px;
          border-radius: 8px;
          background: #4f46e5;
          color: white;
          border: none;
          cursor: pointer;
        }

        .error {
          color: red;
          text-align: center;
        }
      `}</style>
    </div>
  );
}