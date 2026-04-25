"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  testApi,
  attemptApi,
  answerApi,
  Test,
  Question,
  TestAttempt,
} from "@/lib/testApi";
import MCQQuestion from "@/components/test/MCQQuestion";
import SubjectiveQuestion from "@/components/test/SubjectiveQuestion";
import { toast } from "react-toastify";

export default function TakeTestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<Map<number, any>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!id) return;
    initTest();
  }, [id]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const initTest = async () => {
    try {
      setLoading(true);

      const testId = Number(id);
      if (isNaN(testId)) throw new Error("Invalid test id");

      const testData = await testApi.getTest(testId);
      const questionData = await testApi.getQuestions(testId, false);
      const attemptData = await attemptApi.startAttempt(testId);

      setTest(testData);
      console.log("test data", testData);
      console.log("test id ", testId);
      setQuestions(questionData);
      setAttempt(attemptData);
      setTimeRemaining(testData.duration * 60);
    } catch (err: any) {
      toast.error(err.message || "Backend error");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  // Save answer only when clicking Next
  const saveAnswer = async () => {
    if (!attempt || !currentQuestion) return;

    const ans = answers.get(currentQuestion.id);
    if (!ans) return;
    console.log("att id", attempt);
    try {
      if (currentQuestion.type === "mcq") {
        await answerApi.submitMCQAnswer(
          attempt.id,
          currentQuestion.id,
          ans.value,
        );
      } else {
        await answerApi.submitSubjectiveAnswer(
          attempt.id,
          currentQuestion.id,
          ans.value,
        );
      }
    } catch {
      toast.error("Failed to save answer");
    }
  };

  const nextQuestion = async () => {
    await saveAnswer();
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const prevQuestion = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const autoSubmit = async () => {
    toast.warning("Time over. Auto submitting test.");
    submitTest(true);
  };

  const submitTest = async (auto = false) => {
    if (!attempt) return;

    if (!auto) {
      const ok = confirm("Submit test? You cannot change answers later.");
      if (!ok) return;
    }

    setSubmitting(true);
    await saveAnswer();

    try {
      const res = await attemptApi.submitAttempt(attempt.id);

      toast.success(
        `Test submitted!\nScore: ${res.marks_obtained}/${res.total_marks} (${res.percentage}%)`,
      );

      router.push(`/test/${id}/report/${attempt.id}`);
    } catch {
      toast.error("Submit failed (backend/auth issue)");
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading test…</p>;
  }

  if (!test || !attempt || !currentQuestion) return null;

  return (
    <div className="test-page">
      <h2>{test.title}</h2>

      {/* <p>
        ⏱️ Time left: <b>{formatTime(timeRemaining)}</b>
      </p> */}

      <p>
        Question {currentIndex + 1} / {questions.length}
      </p>

      {currentQuestion.type === "mcq" ? (
        <MCQQuestion
          question={currentQuestion}
          selectedOption={answers.get(currentQuestion.id)?.value}
          onAnswer={(oid) => {
            const next = new Map(answers);
            next.set(currentQuestion.id, { type: "mcq", value: oid });
            setAnswers(next);
          }}
        />
      ) : (
        <SubjectiveQuestion
          question={currentQuestion}
          initialAnswer={answers.get(currentQuestion.id)?.value || ""}
          onAnswer={(txt) => {
            const next = new Map(answers);
            next.set(currentQuestion.id, { type: "subjective", value: txt });
            setAnswers(next);
          }}
        />
      )}

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        {/* <button disabled={currentIndex === 0} onClick={prevQuestion}>
          Previous
        </button> */}

        {currentIndex < questions.length - 1 ? (
          <button onClick={nextQuestion}>Next</button>
        ) : (
          <button disabled={submitting} onClick={() => submitTest()}>
            {submitting ? "Submitting…" : "Submit Test"}
          </button>
        )}
      </div>
    </div>
  );
}
