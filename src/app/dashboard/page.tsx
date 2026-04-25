"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { testApi, attemptApi, TestAttempt, Test } from "@/lib/testApi";
import { Classroom, User } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

/* ---------- TYPES ---------- */
type ClassRequest = {
  id: number;
  classroom: number;
  status: "pending" | "approved" | "rejected";
  student_details?: {
    name?: string;
    email?: string;
  };
  classroom_details?: {
    id: number;
    class_name: string;
    class_code: string;
  };
};

type TestStats = {
  totalTests: number;
  totalAttempts: number;
  averageScore: number;
  recentAttempts: TestAttempt[];
  recentTests: Test[];
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [testStats, setTestStats] = useState<TestStats>({
    totalTests: 0,
    totalAttempts: 0,
    averageScore: 0,
    recentAttempts: [],
    recentTests: [],
  });

  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- LOAD DASHBOARD ---------- */
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const me: User = await apiFetch("/users/me/").then((r) => r.json());
      setUser(me);

      await Promise.all([
        fetchClasses(me),
        fetchRequests(me),
        fetchTestStats(me),
      ]);
    } catch (err) {
      setError("Failed to load dashboard");
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- TEST STATS ---------- */
  async function fetchTestStats(currentUser: User) {
    try {
      if (currentUser.role === "teacher") {
        const tests = await testApi.getTests();
        setTestStats({
          totalTests: tests.length,
          totalAttempts: 0,
          averageScore: 0,
          recentAttempts: [],
          recentTests: tests.slice(0, 5),
        });
      } else {
        const attempts = await attemptApi.getAttempts();
        const evaluated = attempts.filter((a) => a.evaluated);

        const avg =
          evaluated.length > 0
            ? evaluated.reduce((s, a) => s + (a.percentage || 0), 0) /
              evaluated.length
            : 0;

        setTestStats({
          totalTests: 0,
          totalAttempts: attempts.length,
          averageScore: avg,
          recentAttempts: attempts.slice(0, 5),
          recentTests: [],
        });
      }
    } catch (err) {
      toast.error("Failed to fetch test stats:", err);
    }
  }

  /* ---------- CLASSROOMS ---------- */
  async function fetchClasses(currentUser: User) {
    try {
      const all: Classroom[] = await apiFetch("/classrooms/").then((r) =>
        r.json(),
      );

      if (currentUser.role === "teacher") {
        setClasses(all);
        return;
      }

      const reqs: ClassRequest[] = await apiFetch("/class-requests/").then(
        (r) => r.json(),
      );

      const approvedIds = new Set(
        reqs.filter((r) => r.status === "approved").map((r) => r.classroom),
      );

      setClasses(all.filter((c) => approvedIds.has(c.id)));
    } catch (err) {
      toast.error("Failed to fetch classrooms:", err);
    }
  }

  /* ---------- REQUESTS ---------- */
  async function fetchRequests(currentUser: User) {
    try {
      if (currentUser.role === "teacher") {
        const pending: ClassRequest[] = await apiFetch(
          "/class-requests/pending-requests/",
        ).then((r) => r.json());
        setRequests(pending);
      } else {
        const all: ClassRequest[] = await apiFetch("/class-requests/").then(
          (r) => r.json(),
        );
        setRequests(all);
      }
    } catch (err) {
      toast.error("Failed to fetch requests:", err);
    }
  }

  /* ---------- ACTIONS ---------- */
  async function createClass() {
    if (!className.trim()) {
      toast.error("Class name is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    try {
      await apiFetch("/classrooms/", {
        method: "POST",
        body: JSON.stringify({
          class_name: className,
          description: description,
          subject: subject,
        }),
      });
      setClassName("");
      setDescription("");
      setSubject("");
      toast.success("Classroom created successfully!");
      await fetchClasses(user!);
      await fetchTestStats(user!);
    } catch (err) {
      toast.error("Failed to create classroom");
    }
  }

  async function joinClass() {
    if (!classCode.trim()) return;
    try {
      await apiFetch("/classrooms/join", {
        method: "POST",
        body: JSON.stringify({ class_code: classCode }),
      });

      await apiFetch("/class-requests/", {
        method: "POST",
        body: JSON.stringify({ class_code: classCode }),
      });

      setClassCode("");
      await fetchRequests(user!);
      toast.success("Join request sent successfully!");
    } catch (err) {
      toast.error("Failed to send join request");
    }
  }

  async function approveRequest(id: number) {
    try {
      await apiFetch(`/class-requests/${id}/approve/`, { method: "POST" });
      await loadDashboard();
    } catch (err) {
      toast.error("Failed to approve request");
    }
  }

  async function rejectRequest(id: number) {
    try {
      await apiFetch(`/class-requests/${id}/reject/`, { method: "POST" });
      await fetchRequests(user!);
    } catch (err) {
      toast.error("Failed to reject request");
    }
  }

  function getGradeColor(grade?: string): string {
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
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
        <style jsx>{`
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

  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!user) return null;

  // Filter student requests - MOVED BEFORE RETURN STATEMENT
  const pendingStudentReqs =
    user.role === "student"
      ? requests.filter((r) => r.status === "pending")
      : [];
  const rejectedStudentReqs =
    user.role === "student"
      ? requests.filter((r) => r.status === "rejected")
      : [];

  /* ---------- UI ---------- */
  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{user.role === "teacher" ? "Teacher" : "Student"} Dashboard</h1>
          <p className="user-email">{user.email}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-details">
            <div className="stat-value">{classes.length}</div>
            <div className="stat-label">Classrooms</div>
          </div>
        </div>

        {user.role === "teacher" ? (
          <>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-details">
                <div className="stat-value">{testStats.totalTests}</div>
                <div className="stat-label">Total Tests</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-details">
                <div className="stat-value">{requests.length}</div>
                <div className="stat-label">Pending Requests</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-details">
                <div className="stat-value">{testStats.totalAttempts}</div>
                <div className="stat-label">Tests Taken</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-details">
                <div className="stat-value">
                  {testStats.averageScore.toFixed(1)}%
                </div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Teacher: Create Classroom */}
          {user.role === "teacher" && (
            <div className="card">
              <h2>Create Classroom</h2>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Class name (e.g., Python Programming 101)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Subject (e.g., Computer Science)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                />
                <textarea
                  placeholder="Description (e.g., Introduction to Python for beginners)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea-field"
                  rows={3}
                />
                <button onClick={createClass} className="btn btn-primary">
                  Create Classroom
                </button>
              </div>
            </div>
          )}

          {/* Student: Join Classroom */}
          {user.role === "student" && (
            <div className="card">
              <h2>Join Classroom</h2>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter class code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="input-field"
                  onKeyPress={(e) => e.key === "Enter" && joinClass()}
                />
                <button onClick={joinClass} className="btn btn-primary">
                  Send Join Request
                </button>
              </div>
            </div>
          )}

          {/* My Classrooms */}
          <div className="card">
            <h2>My Classrooms</h2>
            {classes.length === 0 ? (
              <div className="empty-state">
                <p>
                  {user.role === "teacher"
                    ? "Create your first classroom to get started!"
                    : "Join a classroom to see it here."}
                </p>
              </div>
            ) : (
              <div className="classroom-list">
                {classes.map((c) => (
                  <div key={c.id} className="classroom-item">
                    <div className="classroom-info">
                      <h3>{c.class_name}</h3>
                      <span className="class-code">Code: {c.class_code}</span>
                    </div>
                    <div className="classroom-actions">
                      {user.role === "teacher" ? (
                        <>
                          <Link
                            href={`/classroom/${c.id}/create-test`}
                            className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-2 rounded-lg font-medium transition me-2"
                          >
                            Create Test
                          </Link>

                          <Link
                            href={`/classroom/${c.id}/tests`}
                            className="px-3 py-1.5 text-sm border border-gray-400 rounded-md text-gray-900 hover:bg-gray-200 transition"
                          >
                            View Tests
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/classroom/${c.id}/tests`}
                          className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-2 rounded-lg font-medium transition me-2"
                        >
                          View Tests
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teacher: Recent Tests */}
          {user.role === "teacher" && testStats.recentTests.length > 0 && (
            <div className="card">
              <h2>Recent Tests</h2>
              <div className="tests-list">
                {testStats.recentTests.map((test) => (
                  <div key={test.id} className="test-item">
                    <div className="test-info">
                      <h3>{test.title}</h3>
                      <div className="test-meta">
                        <span>{test.duration} min</span>
                        <span>•</span>
                        <span>{test.total_marks} marks</span>
                        <span>•</span>
                        <span className="test-category">{test.category}</span>
                      </div>
                    </div>
                    <div className="test-actions">
                      <Link
                        href={`/test/${test.id}/upload-questions`}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition me-2"
                      >
                        Add Questions
                      </Link>

                      <Link
                        href={`/test/${test.id}/attempts`}
                        className="px-3 py-1.5 text-sm border border-gray-400 rounded-md text-gray-900 hover:bg-gray-200 transition"
                      >
                        View Attempts
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student: Recent Attempts */}
          {user.role === "student" && testStats.recentAttempts.length > 0 && (
            <div className="card">
              <h2>Recent Test Attempts</h2>
              <div className="attempts-list">
                {testStats.recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="attempt-item">
                    <div className="attempt-info">
                      <div className="attempt-title">Test #{attempt.test}</div>
                      <div className="attempt-date">
                        {new Date(attempt.started_at).toLocaleDateString()}
                      </div>
                    </div>
                    {attempt.status === "submitted" && attempt.evaluated ? (
                      <div className="attempt-score">
                        <span
                          className="grade"
                          style={{ color: getGradeColor(attempt.grade) }}
                        >
                          {attempt.grade}
                        </span>
                        <span className="percentage">
                          {attempt.percentage?.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="status-badge in-progress">
                        {attempt.status === "in_progress"
                          ? "In Progress"
                          : "Pending"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Teacher: Pending Requests */}
          {user.role === "teacher" && (
            <div className="card">
              <h2>Pending Join Requests</h2>
              {requests.length === 0 ? (
                <div className="empty-state">
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="requests-list">
                  {requests.map((req) => (
                    <div key={req.id} className="request-item">
                      <div className="request-info">
                        <div className="student-name">
                          {req.student_details?.name ||
                            req.student_details?.email}
                        </div>
                        <div className="classroom-name">
                          → {req.classroom_details?.class_name}
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => approveRequest(req.id)}
                          className="btn btn-success btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectRequest(req.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Student: My Requests */}
          {user.role === "student" &&
            (pendingStudentReqs.length > 0 ||
              rejectedStudentReqs.length > 0) && (
              <div className="card">
                <h2>My Join Requests</h2>

                {pendingStudentReqs.length > 0 && (
                  <>
                    <h3 className="section-title">Pending</h3>
                    <div className="student-requests-list">
                      {pendingStudentReqs.map((req) => (
                        <div
                          key={req.id}
                          className="student-request-item pending"
                        >
                          <span className="classroom-name">
                            {req.classroom_details?.class_name}
                          </span>
                          <span className="status-badge">⏳ Pending</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {rejectedStudentReqs.length > 0 && (
                  <>
                    <h3 className="section-title">Rejected</h3>
                    <div className="student-requests-list">
                      {rejectedStudentReqs.map((req) => (
                        <div
                          key={req.id}
                          className="student-request-item rejected"
                        >
                          <span className="classroom-name">
                            {req.classroom_details?.class_name}
                          </span>
                          <span className="status-badge rejected">
                            ✗ Rejected
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 12px;
        }

        /* Header - Fully Responsive */
        .dashboard-header {
          max-width: 1200px;
          margin: 0 auto 24px;
          padding: 0 8px;
        }

        .header-content h1 {
          color: white;
          font-size: 24px;
          margin: 0 0 6px 0;
          font-weight: 700;
        }

        .user-email {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin: 0;
          word-break: break-all;
        }

        /* Stats Grid - Fully Responsive */
        .stats-grid {
          max-width: 1200px;
          margin: 0 auto 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 0 8px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .stat-details {
          flex: 1;
          min-width: 0;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #666;
          font-weight: 600;
        }

        /* Dashboard Grid - Fully Responsive */
        .dashboard-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 0 8px;
        }

        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Cards - Fully Responsive */
        .card {
          background: white;
          border-radius: 12px;
          padding: 20px 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #1a1a1a;
          font-weight: 700;
        }

        .card h3.section-title {
          margin: 16px 0 10px 0;
          font-size: 14px;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* Form Elements - Fully Responsive */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-field {
          padding: 12px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .input-field:focus {
          outline: none;
          border-color: #4f46e5;
        }

        .textarea-field {
          padding: 12px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
        }

        .textarea-field:focus {
          outline: none;
          border-color: #4f46e5;
        }

        /* Buttons - Fully Responsive */
        .btn {
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          white-space: nowrap;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
        }

        .btn-primary:hover {
          background: #4338ca;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-sm {
          padding: 8px 12px;
          font-size: 12px;
        }

        /* Empty State - Fully Responsive */
        .empty-state {
          text-align: center;
          padding: 30px 16px;
          color: #666;
          font-size: 14px;
        }

        /* Classroom List - Fully Responsive */
        .classroom-list {
          display: grid;
          gap: 12px;
        }

        .classroom-item {
          background: #f9fafb;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }

        .classroom-item:hover {
          background: #f3f4f6;
        }

        .classroom-info h3 {
          margin: 0 0 6px 0;
          font-size: 16px;
          color: #1a1a1a;
          font-weight: 600;
          word-break: break-word;
        }

        .class-code {
          color: #666;
          font-size: 12px;
          font-weight: 500;
          background: #e5e7eb;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }

        .classroom-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Requests List - Fully Responsive */
        .requests-list {
          display: grid;
          gap: 10px;
        }

        .request-item {
          background: #f9fafb;
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .request-info {
          flex: 1;
          min-width: 0;
        }

        .student-name {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
          font-size: 14px;
          word-break: break-word;
        }

        .classroom-name {
          font-size: 13px;
          color: #666;
          word-break: break-word;
        }

        .request-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Student Requests - Fully Responsive */
        .student-requests-list {
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
        }

        .student-request-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          background: #f9fafb;
        }

        .student-request-item.pending {
          border-left: 4px solid #f59e0b;
        }

        .student-request-item.rejected {
          border-left: 4px solid #ef4444;
        }

        .student-request-item .classroom-name {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 14px;
          word-break: break-word;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          background: #fef3c7;
          color: #92400e;
          align-self: flex-start;
        }

        .status-badge.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-badge.in-progress {
          background: #dbeafe;
          color: #1e40af;
        }

        /* Attempts List - Fully Responsive */
        .attempts-list {
          display: grid;
          gap: 10px;
        }

        .attempt-item {
          background: #f9fafb;
          border-radius: 8px;
          padding: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .attempt-info {
          flex: 1;
          min-width: 0;
        }

        .attempt-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .attempt-date {
          font-size: 12px;
          color: #666;
        }

        .attempt-score {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
        }

        .grade {
          font-size: 20px;
          font-weight: 700;
        }

        .percentage {
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }

        /* Tests List - Fully Responsive */
        .tests-list {
          display: grid;
          gap: 12px;
        }

        .test-item {
          background: #f9fafb;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }

        .test-item:hover {
          background: #f3f4f6;
        }

        .test-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #1a1a1a;
          font-weight: 600;
          word-break: break-word;
        }

        .test-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-size: 13px;
          flex-wrap: wrap;
        }

        .test-category {
          text-transform: uppercase;
          font-weight: 600;
          color: #4f46e5;
          font-size: 12px;
        }

        .test-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Tablet Breakpoint (600px and up) */
        @media (min-width: 600px) {
          .dashboard-page {
            padding: 30px 16px;
          }

          .dashboard-header {
            margin-bottom: 28px;
          }

          .header-content h1 {
            font-size: 30px;
            margin-bottom: 8px;
          }

          .user-email {
            font-size: 15px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 28px;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-icon {
            font-size: 36px;
          }

          .stat-value {
            font-size: 30px;
          }

          .stat-label {
            font-size: 14px;
          }

          .dashboard-grid {
            gap: 20px;
          }

          .left-column,
          .right-column {
            gap: 20px;
          }

          .card {
            padding: 24px 20px;
          }

          .card h2 {
            font-size: 22px;
            margin-bottom: 18px;
          }

          .classroom-item,
          .test-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .classroom-info h3,
          .test-info h3 {
            font-size: 17px;
          }

          .student-request-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .request-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        /* Medium Desktop Breakpoint (768px and up) */
        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* Large Desktop Breakpoint (1024px and up) */
        @media (min-width: 1024px) {
          .dashboard-page {
            padding: 40px 20px;
          }

          .dashboard-header {
            margin-bottom: 32px;
          }

          .header-content h1 {
            font-size: 36px;
          }

          .user-email {
            font-size: 16px;
          }

          .stats-grid {
            gap: 20px;
            margin-bottom: 32px;
          }

          .stat-card {
            padding: 24px;
          }

          .stat-icon {
            font-size: 40px;
          }

          .stat-value {
            font-size: 32px;
          }

          .dashboard-grid {
            gap: 24px;
          }

          .left-column,
          .right-column {
            gap: 24px;
          }

          .card {
            padding: 32px;
          }

          .card h2 {
            font-size: 24px;
            margin-bottom: 20px;
          }

          .card h3.section-title {
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 12px;
          }

          .input-field {
            padding: 14px 16px;
          }

          .textarea-field {
            padding: 14px 16px;
            min-height: 90px;
          }

          .btn {
            padding: 12px 24px;
          }

          .btn-sm {
            padding: 8px 16px;
            font-size: 13px;
          }

          .classroom-list,
          .tests-list {
            gap: 16px;
          }

          .classroom-item,
          .test-item {
            padding: 20px;
          }

          .classroom-info h3,
          .test-info h3 {
            font-size: 18px;
          }

          .class-code {
            font-size: 13px;
          }

          .test-meta {
            font-size: 14px;
          }

          .requests-list {
            gap: 12px;
          }

          .request-item {
            padding: 16px;
          }

          .student-name {
            font-size: 15px;
          }

          .classroom-name {
            font-size: 14px;
          }

          .attempts-list {
            gap: 12px;
          }

          .attempt-item {
            padding: 16px;
          }

          .attempt-title {
            font-size: 15px;
          }

          .attempt-date {
            font-size: 13px;
          }

          .grade {
            font-size: 24px;
          }

          .percentage {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}