"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";

/* ================================================= */
/* AnswerBox Component */
/* ================================================= */
export default function AnswerBox({
  attemptId,
  questionId,
}: {
  attemptId: number;
  questionId: number;
}) {
  const [answer, setAnswer] = useState("");

  const submit = async () => {
    await apiFetch("/answers/", {
      method: "POST",
      body: JSON.stringify({
        test_attempt: attemptId,
        question: questionId,
        answer_type: "subjective",
        answer_text: answer,
      }),
    });
    toast.success("Answer saved");
  };

  return (
    <>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </>
  );
}

/* ================================================= */
/* Test Attempt APIs */
/* ================================================= */
export const testAttemptApi = {
  // Get all attempts (with optional filters)
  getAttempts: async (filters?: { test?: number; status?: string }) => {
    let url = "/test-attempts/";
    const params = new URLSearchParams();

    if (filters?.test) params.append("test", filters.test.toString());
    if (filters?.status) params.append("status", filters.status);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await apiFetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch attempts");
    }

    return res.json();
  },

  // Get a single attempt
  getAttempt: async (attemptId: number) => {
    const res = await apiFetch(`/test-attempts/${attemptId}/`);

    if (!res.ok) {
      throw new Error("Failed to fetch attempt");
    }

    return res.json();
  },

  // Submit a test attempt (auto-evaluates)
  submitAttempt: async (attemptId: number) => {
    const res = await apiFetch(`/test-attempts/${attemptId}/submit/`, {
      method: "POST",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to submit test");
    }

    return res.json();
  },

  // Manually trigger evaluation (teacher only)
  evaluateAttempt: async (attemptId: number) => {
    const res = await apiFetch(`/test-attempts/${attemptId}/evaluate/`, {
      method: "POST",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to evaluate test");
    }

    return res.json();
  },

  // Get detailed report
  getReport: async (attemptId: number) => {
    const res = await apiFetch(`/test-attempts/${attemptId}/report/`);

    if (!res.ok) {
      throw new Error("Failed to fetch report");
    }

    return res.json();
  },
};

/* ================================================= */
/* Answer APIs */
/* ================================================= */
export const answerApi = {
  // Submit an MCQ answer
  submitMCQAnswer: async (
    attemptId: number,
    questionId: number,
    optionId: number,
  ) => {
    const res = await apiFetch("/answers/", {
      method: "POST",
      body: JSON.stringify({
        test_attempt: attemptId,
        question: questionId,
        answer_type: "mcq",
        selected_option: optionId,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to submit answer");
    }

    return res.json();
  },

  // Submit a subjective answer
  submitSubjectiveAnswer: async (
    attemptId: number,
    questionId: number,
    answerText: string,
  ) => {
    const res = await apiFetch("/answers/", {
      method: "POST",
      body: JSON.stringify({
        test_attempt: attemptId,
        question: questionId,
        answer_type: "subjective",
        answer_text: answerText,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to submit answer");
    }

    return res.json();
  },

  // Get all answers for an attempt
  getAnswers: async (attemptId: number) => {
    const res = await apiFetch(`/answers/?test_attempt=${attemptId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch answers");
    }

    return res.json();
  },
};
