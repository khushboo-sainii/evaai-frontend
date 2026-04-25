import { apiFetch } from "./api";

// Types
export interface Test {
  id: number;
  title: string;
  duration: number;
  total_marks: number;
  classroom: number;
  teacher: number;
  category: "mcq" | "subjective" | "mixed";
  schedule_type: "instant" | "scheduled";
  start_time?: string;
  end_time?: string;
  created_at: string;
}

export interface Question {
  id: number;
  question_number: number;
  question_text: string;
  type: "mcq" | "subjective";
  marks: number;
  test: number;
  options?: QuestionOption[];
  correct_answer?: string;
}

export interface QuestionOption {
  id: number;
  option_label: string;
  option_text: string;
  is_correct: boolean;
}

export interface TestAttempt {
  id: number;
  test: number;
  student: number;
  status: "in_progress" | "submitted";
  started_at: string;
  submitted_at?: string;
  marks_obtained?: number;
  percentage?: number;
  grade?: string;
  evaluated: boolean;
}

export interface Answer {
  id: number;
  test_attempt: number;
  question: number;
  answer_type: "mcq" | "subjective";
  selected_option?: number;
  answer_text?: string;
  marks_obtained?: number;
  ai_feedback?: string;
}

// Test APIs
export const testApi = {
  // Create a new test
  createTest: async (data: {
    title: string;
    duration: number;
    classroom: number;
    category?: string;
    schedule_type?: string;
    start_time?: string;
    end_time?: string;
  }) => {
    const res = await apiFetch("/tests/", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        total_marks: 0,
        category: data.category || "mixed",
        schedule_type: data.schedule_type || "instant",
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to create test");
    }

    return res.json();
  },

  // Get all tests (optionally filtered by classroom)
  getTests: async (classroomId?: number) => {
    const url = classroomId ? `/tests/?classroom=${classroomId}` : "/tests/";
    const res = await apiFetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch tests");
    }

    return res.json();
  },

  // Get a single test
  getTest: async (testId: number) => {
    const res = await apiFetch(`/tests/${testId}/`);

    if (!res.ok) {
      throw new Error("Failed to fetch test");
    }

    return res.json();
  },

  // Upload and parse document
  uploadDocument: async (testId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("test_id", testId.toString());

    const res = await apiFetch("/document-parser/parse-and-save/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to parse document");
    }

    return res.json();
  },

  // Get questions for a test
  getQuestions: async (
    testId: number,
    includeCorrectAnswers: boolean = false,
  ) => {
    const res = await apiFetch(`/questions/?test=${testId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch questions");
    }

    const questions = await res.json();

    // Hide correct answers for students
    if (!includeCorrectAnswers) {
      return questions.map((q: Question) => ({
        ...q,
        options: q.options?.map((opt) => ({
          ...opt,
          is_correct: undefined,
        })),
        correct_answer: undefined,
      }));
    }

    return questions;
  },
};

// Test Attempt APIs
export const attemptApi = {
  // Start a test attempt
  startAttempt: async (testId: number) => {
    const res = await apiFetch("/test-attempts/", {
      method: "POST",
      body: JSON.stringify({ test: testId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to start test");
    }

    return res.json();
  },

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

  getAttemptsByStudentId: async (filters?: {
    student?: number;
    status?: string;
  }) => {
    let url = "/test-attempts/";
    const params = new URLSearchParams();

    if (filters?.student) params.append("test", filters.student.toString());
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

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("HTML RESPONSE:", text);
      throw new Error("Server returned HTML instead of JSON");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail || "Failed to submit test");
    }

    return data;
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

// Answer APIs
export const answerApi = {
  // Submit an MCQ answer

  submitMCQAnswer: async (
    attemptId: number,
    questionId: number,
    optionId: number,
  ) => {
    const res = await apiFetch("/answers/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test_attempt: attemptId,
        question: questionId,
        answer_type: "mcq",
        selected_option: optionId,
      }),
    });

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("MCQ HTML RESPONSE:", text);
      throw new Error("Server returned HTML instead of JSON");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail || "Failed to submit MCQ answer");
    }

    return data;
  },

  // Submit a subjective answer

  submitSubjectiveAnswer: async (
    attemptId: number,
    questionId: number,
    answerText: string,
  ) => {
    const res = await apiFetch("/answers/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test_attempt: attemptId,
        question: questionId,
        answer_type: "subjective",
        answer_text: answerText,
      }),
    });

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("SUBJECTIVE HTML RESPONSE:", text);
      throw new Error("Server returned HTML instead of JSON");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail || "Failed to submit subjective answer");
    }

    return data;
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
