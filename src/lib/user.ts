import { apiFetch } from "@/lib/api";
import { Role } from "@/types";

export async function syncUser(payload: {
  role: Role;
  name?: string;
  phone_number?: string;
  photo_url?: string;
  state?: string;
  city?: string;
  country?: string;
  institute?: string;
}) {
  const res = await apiFetch("/users/sync/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("User sync failed");
  return res.json();
}
