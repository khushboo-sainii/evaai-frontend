"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { testApi, attemptApi, Test, TestAttempt } from "@/lib/testApi";
import Link from "next/link";
import { toast } from "react-toastify";

export default function TestAttemptsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [testData, attemptsData] = await Promise.all([
        testApi.getTest(Number(id)),
        attemptApi.getAttempts({ test: Number(id) }),
      ]);

      setTest(testData);
      setAttempts(attemptsData);
    } catch (error: any) {
      toast.error(error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (attemptId: number) => {
    const confirmed = confirm(
      "Are you sure you want to re-evaluate this test attempt?",
    );
    if (!confirmed) return;

    setEvaluating(attemptId);

    try {
      await attemptApi.evaluateAttempt(attemptId);
      toast.success("Test re-evaluated successfully!");
      loadData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEvaluating(null);
    }
  };

  const getStatusBadge = (attempt: TestAttempt) => {
    if (attempt.status === "in_progress") {
      return <span className="badge badge-warning">In Progress</span>;
    }
    if (attempt.evaluated) {
      return <span className="badge badge-success">Evaluated</span>;
    }
    return <span className="badge badge-info">Submitted</span>;
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return "#6b7280";
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

  const calculateStats = () => {
    const submitted = attempts.filter((a) => a.status === "submitted");
    const avgScore =
      submitted.reduce((sum, a) => sum + (a.marks_obtained || 0), 0) /
        submitted.length || 0;
    const avgPercentage =
      submitted.reduce((sum, a) => sum + (a.percentage || 0), 0) /
        submitted.length || 0;

    return {
      total: attempts.length,
      submitted: submitted.length,
      inProgress: attempts.filter((a) => a.status === "in_progress").length,
      evaluated: attempts.filter((a) => a.evaluated).length,
      avgScore: avgScore.toFixed(1),
      avgPercentage: avgPercentage.toFixed(1),
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading attempts...</p>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  const stats = calculateStats();

  return (
    <div className="attempts-page">
      <div className="page-header">
        <button onClick={() => router.back()} className="back-button">
          ← Back
        </button>

        <div className="header-content">
          <h1>{test.title}</h1>
          <p className="test-meta">
            {test.duration} minutes • {test.total_marks} marks
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Attempts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.submitted}</div>
            <div className="stat-label">Submitted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avgPercentage}%</div>
            <div className="stat-label">Avg Score</div>
          </div>
        </div>
      </div>

      <div className="attempts-content">
        {attempts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h2>No attempts yet</h2>
            <p>Students haven't taken this test yet.</p>
          </div>
        ) : (
          <div className="attempts-table">
            <div className="table-header">
              <div className="col-student">Student</div>
              <div className="col-status">Status</div>
              <div className="col-score">Score</div>
              <div className="col-grade">Grade</div>
              <div className="col-submitted">Submitted</div>
              <div className="col-actions">Actions</div>
            </div>

            {attempts.map((attempt) => (
              <div key={attempt.id} className="table-row">
                <div className="col-student">
                  <div className="student-name">Student #{attempt.student}</div>
                </div>
                <div className="col-status">{getStatusBadge(attempt)}</div>
                <div className="col-score">
                  {attempt.marks_obtained !== undefined
                    ? `${attempt.marks_obtained} / ${test.total_marks}`
                    : "-"}
                </div>
                <div className="col-grade">
                  {attempt.grade ? (
                    <span
                      className="grade-badge"
                      style={{ color: getGradeColor(attempt.grade) }}
                    >
                      {attempt.grade}
                    </span>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="col-submitted">
                  {attempt.submitted_at
                    ? new Date(attempt.submitted_at).toLocaleString()
                    : "-"}
                </div>
                <div className="col-actions">
                  {attempt.status === "submitted" && (
                    <>
                      <Link
                        href={`/test/${id}/report/${attempt.id}`}
                        className="action-btn view"
                      >
                        View Report
                      </Link>
                      <button
                        onClick={() => handleEvaluate(attempt.id)}
                        disabled={evaluating === attempt.id}
                        className="action-btn evaluate"
                      >
                        {evaluating === attempt.id
                          ? "Evaluating..."
                          : "Re-evaluate"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .attempts-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }

        .page-header {
          max-width: 1200px;
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

        .header-content h1 {
          color: white;
          font-size: 32px;
          margin: 0 0 8px 0;
          font-weight: 700;
        }

        .test-meta {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin: 0 0 24px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #4f46e5;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        .attempts-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 80px 40px;
          text-align: center;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
        }

        .empty-state h2 {
          font-size: 28px;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          font-size: 16px;
          color: #666;
          margin: 0;
        }

        .attempts-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 0.8fr 1.5fr 2fr;
          gap: 16px;
          padding: 16px 24px;
          align-items: center;
        }

        .table-header {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .table-row {
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s;
        }

        .table-row:hover {
          background: #f9fafb;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .student-name {
          font-weight: 600;
          color: #1a1a1a;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .grade-badge {
          font-size: 20px;
          font-weight: 700;
        }

        .col-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
          border: none;
        }

        .action-btn.view {
          background: #4f46e5;
          color: white;
        }

        .action-btn.view:hover {
          background: #4338ca;
        }

        .action-btn.evaluate {
          background: #f0f0f0;
          color: #374151;
        }

        .action-btn.evaluate:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
