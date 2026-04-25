"use client";

import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

export default function TestPage() {
  const { id } = useParams();

  const startTest = async () => {
    await apiFetch("/test-attempts/", {
      method: "POST",
      body: JSON.stringify({ test: id }),
    });
    toast.success("Test started");
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Test</h1>
      <button onClick={startTest}>Start Test</button>
    </div>
  );
}
