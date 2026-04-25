import Link from "next/link";
import { Test } from "@/lib/testApi";

interface TestCardProps {
  test: Test;
  role: "teacher" | "student";
  onAction?: () => void;
}

export default function TestCard({ test, role, onAction }: TestCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="test-card">
      <div className="test-header">
        <h3>{test.title}</h3>
        <span className="test-category">
          {test.category?.toUpperCase() ?? "UNCATEGORIZED"}
        </span>
      </div>

      <div className="test-details">
        <div className="detail-item">
          <span className="label">Duration:</span>
          <span className="value">{test.duration} minutes</span>
        </div>
        <div className="detail-item">
          <span className="label">Total Marks:</span>
          <span className="value">{test.total_marks}</span>
        </div>
        <div className="detail-item">
          <span className="label">Schedule:</span>
          <span className="value">{test.schedule_type}</span>
        </div>
        {test.schedule_type === "scheduled" && (
          <>
            <div className="detail-item">
              <span className="label">Start:</span>
              <span className="value">{formatDate(test.start_time)}</span>
            </div>
            <div className="detail-item">
              <span className="label">End:</span>
              <span className="value">{formatDate(test.end_time)}</span>
            </div>
          </>
        )}
      </div>

      <div className="test-actions">
        {role === "teacher" ? (
          <>
            <Link href={`/test/${test.id}/preview`} className="btn btn-preview">
              📋 Preview
            </Link>
            <Link
              href={`/test/${test.id}/upload-questions`}
              className="btn btn-secondary"
            >
              Upload Questions
            </Link>
            <Link
              href={`/test/${test.id}/attempts`}
              className="btn btn-primary"
            >
              View Attempts
            </Link>
          </>
        ) : (
          <Link href={`/test/${test.id}/attempt`} className="btn btn-primary">
            Start Test
          </Link>
        )}
      </div>

      <style jsx>{`
        .test-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .test-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .test-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .test-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .test-category {
          background: #4f46e5;
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .test-details {
          display: grid;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-item .label {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        .detail-item .value {
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 600;
        }

        .test-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .btn {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
        }

        .btn-primary:hover {
          background: #4338ca;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #1a1a1a;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-preview {
          background: #10b981;
          color: white;
        }

        .btn-preview:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}
