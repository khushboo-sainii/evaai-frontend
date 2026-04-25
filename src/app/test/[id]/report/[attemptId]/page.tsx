"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { attemptApi } from "@/lib/testApi";
import MCQQuestion from "@/components/test/MCQQuestion";
import SubjectiveQuestion from "@/components/test/SubjectiveQuestion";
import { toast } from "react-toastify";

interface ReportData {
  attempt: {
    id: number;
    test_title: string;
    student_name: string;
    student_email: string;
    submitted_at: string;
    evaluated: boolean;
  };
  summary: {
    total_marks: number;
    marks_obtained: number;
    percentage: number;
    grade: string;
    total_questions: number;
  };
  questions: any[];
}

export default function TestReportPage() {
  const { attemptId } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [attemptId]);

  const loadReport = async () => {
    try {
      const reportData = await attemptApi.getReport(Number(attemptId));
      setReport(reportData);
    } catch (error: any) {
      toast.error(error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: Record<string, string> = {
      "A+": "#10b981",
      A: "#10b981",
      B: "#3b82f6",
      C: "#f59e0b",
      D: "#f59e0b",
      E: "#ef4444",
      F: "#ef4444",
    };
    return gradeColors[grade] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="report-page">
      <div className="page-header">
        <button onClick={() => router.back()} className="back-button">
          ← Back to Dashboard
        </button>

        <div className="report-header">
          <h1>{report.attempt.test_title}</h1>
          <p className="student-info">
            {report.attempt.student_name} ({report.attempt.student_email})
          </p>
          <p className="submitted-at">
            Submitted: {new Date(report.attempt.submitted_at).toLocaleString()}
          </p>
        </div>

        <div className="summary-card">
          <div className="summary-grid">
            <div className="summary-item score-item">
              <div className="score-circle">
                <div className="score-value">
                  {report.summary.marks_obtained}
                </div>
                <div className="score-total">
                  / {report.summary.total_marks}
                </div>
              </div>
              <div className="score-label">Total Score</div>
            </div>

            <div className="summary-stats">
              <div className="stat-row">
                <div className="stat-item">
                  <div className="stat-label">Percentage</div>
                  <div className="stat-value">
                    {report.summary.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Grade</div>
                  <div
                    className="stat-value grade"
                    style={{ color: getGradeColor(report.summary.grade) }}
                  >
                    {report.summary.grade}
                  </div>
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-item">
                  <div className="stat-label">Questions</div>
                  <div className="stat-value">
                    {report.summary.total_questions}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Status</div>
                  <div className="stat-value status">
                    {report.attempt.evaluated ? "✓ Evaluated" : "⏳ Pending"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="report-content">
        <h2>Question-wise Analysis</h2>

        {report.questions.map((q) => {
          if (q.type === "mcq") {
            return (
              <MCQQuestion
                key={q.question_number}
                question={{
                  id: q.question_number,
                  question_number: q.question_number,
                  question_text: q.question_text,
                  type: "mcq",
                  marks: q.marks,
                  test: 0,
                  options: q.options?.map((opt: any) => ({
                    id: opt.option_label,
                    option_label: opt.option_label,
                    option_text: opt.option_text,
                    is_correct: opt.is_correct,
                  })),
                }}
                selectedOption={
                  q.options?.find((o: any) => o.was_selected)?.option_label
                }
                onAnswer={() => {}}
                disabled={true}
                showCorrect={true}
              />
            );
          } else {
            return (
              <SubjectiveQuestion
                key={q.question_number}
                question={{
                  id: q.question_number,
                  question_number: q.question_number,
                  question_text: q.question_text,
                  type: "subjective",
                  marks: q.marks,
                  test: 0,
                  correct_answer: q.correct_answer,
                }}
                initialAnswer={q.student_answer || ""}
                onAnswer={() => {}}
                disabled={true}
                showCorrect={true}
                feedback={q.ai_feedback}
                marksObtained={q.marks_obtained}
              />
            );
          }
        })}
      </div>

      <style jsx>{`
        .report-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }

        .page-header {
          max-width: 1000px;
          margin: 0 auto 32px;
        }

        .back-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .report-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .report-header h1 {
          color: white;
          font-size: 36px;
          margin: 0 0 12px 0;
          font-weight: 700;
        }

        .student-info {
          color: rgba(255, 255, 255, 0.95);
          font-size: 18px;
          margin: 0 0 8px 0;
        }

        .submitted-at {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin: 0;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 48px;
          align-items: center;
        }

        .score-item {
          text-align: center;
        }

        .score-circle {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 16px;
        }

        .score-value {
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
        }

        .score-total {
          font-size: 24px;
          font-weight: 600;
          opacity: 0.9;
        }

        .score-label {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .summary-stats {
          display: grid;
          gap: 24px;
        }

        .stat-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .stat-item {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .stat-value.grade {
          font-size: 36px;
        }

        .stat-value.status {
          font-size: 16px;
          color: #10b981;
        }

        .report-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .report-content h2 {
          color: white;
          font-size: 24px;
          margin: 0 0 24px 0;
          font-weight: 700;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-container p {
          color: white;
          font-size: 16px;
          margin-top: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
