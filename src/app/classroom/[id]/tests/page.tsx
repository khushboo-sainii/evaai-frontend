"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { testApi, Test, attemptApi } from "@/lib/testApi";
import TestCard from "@/components/test/TestCard";
import { apiFetch } from "@/lib/api";
import { User } from "@/types";

export default function ClassroomTestsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"teacher" | "student">("student");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get current user to determine role
      const me: User = await apiFetch("/users/me/").then((r) => r.json());
      const role = me.role as "teacher" | "student";
      setUserRole(role);

      // Load tests for this classroom
      const testsData = await testApi.getTests(Number(id));

      setTests(testsData);
    } catch (error: any) {
      console.error("Failed to load tests:", error);
      setError(error.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tests...</p>

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

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => router.back()} className="back-button">
            ← Go Back
          </button>
        </div>

        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .error-content {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
          }
          .error-content h2 {
            margin: 0 0 16px 0;
            font-size: 24px;
            color: #ef4444;
          }
          .error-content p {
            margin: 0 0 24px 0;
            color: #666;
            font-size: 16px;
          }
          .back-button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tests-page">
      <div className="page-header">
        <button onClick={() => router.back()} className="back-button">
          ← Back to Dashboard
        </button>

        <div className="header-content">
          <h1>Tests</h1>
          {userRole === "teacher" && (
            <button
              onClick={() => router.push(`/classroom/${id}/create-test`)}
              className="create-button"
            >
              + Create New Test
            </button>
          )}
        </div>
      </div>

      <div className="tests-grid">
        {tests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No tests yet</h2>
            <p>
              {userRole === "teacher"
                ? "Create your first test to get started!"
                : "Your teacher hasn't created any tests yet."}
            </p>
            {userRole === "teacher" && (
              <button
                onClick={() => router.push(`/classroom/${id}/create-test`)}
                className="create-button-large"
              >
                Create Test
              </button>
            )}
          </div>
        ) : (
          tests.map((test) => (
            <TestCard key={test.id} test={test} role={userRole} />
          ))
        )}
      </div>

      <style jsx>{`
        .tests-page {
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

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-content h1 {
          color: white;
          font-size: 36px;
          margin: 0;
          font-weight: 700;
        }

        .create-button {
          background: white;
          color: #4f46e5;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .create-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .tests-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 80px 40px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
        }

        .empty-state h2 {
          font-size: 28px;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          font-weight: 700;
        }

        .empty-state p {
          font-size: 16px;
          color: #666;
          margin: 0 0 32px 0;
        }

        .create-button-large {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .create-button-large:hover {
          background: #4338ca;
        }

        @media (max-width: 768px) {
          .tests-page {
            padding: 20px 16px;
          }

          .header-content h1 {
            font-size: 28px;
          }

          .tests-grid {
            grid-template-columns: 1fr;
          }

          .empty-state {
            padding: 60px 24px;
          }
        }
      `}</style>
    </div>
  );
}
