import { apiFetch } from "./api";

export async function evaluateAttempt(attemptId: number) {
  return apiFetch(`/test-attempts/${attemptId}/`, {
    method: "PATCH",
    body: JSON.stringify({
      evaluated: true,
      total_score: Math.floor(Math.random() * 100),
    }),
  });
}
