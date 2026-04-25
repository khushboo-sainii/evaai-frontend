"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { testApi, Test } from "@/lib/testApi";
import QuestionUpload from "@/components/test/QuestionUpload";
import { toast } from "react-toastify";

export default function UploadQuestionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    try {
      const testData = await testApi.getTest(Number(id));
      setTest(testData);
    } catch (error: any) {
      toast.error(error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadTest();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading test...</p>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <div className="upload-page">
      <div className="page-header">
        <button onClick={() => router.back()} className="back-button">
          ← Back
        </button>
        <div className="header-content">
          <h1>Upload Questions</h1>
          <div className="test-info">
            <h2>{test.title}</h2>
            <div className="test-meta">
              <span>Duration: {test.duration} minutes</span>
              <span>•</span>
              <span>Current Total: {test.total_marks} marks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="instructions">
          <h3>📋 Instructions</h3>
          <ul>
            <li>Upload a PDF or image containing test questions</li>
            <li>
              Our AI will automatically parse MCQ and subjective questions
            </li>
            <li>Questions will be added to this test immediately</li>
            <li>You can upload multiple documents to add more questions</li>
          </ul>
        </div>

        <QuestionUpload testId={Number(id)} onSuccess={handleSuccess} />
      </div>

      <style jsx>{`
        .upload-page {
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
          margin-bottom: 20px;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .header-content h1 {
          color: white;
          font-size: 32px;
          margin: 0 0 16px 0;
          font-weight: 700;
        }

        .test-info h2 {
          color: white;
          font-size: 24px;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .test-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
        }

        .page-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .instructions {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .instructions h3 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .instructions ul {
          margin: 0;
          padding-left: 24px;
        }

        .instructions li {
          color: #374151;
          font-size: 15px;
          line-height: 1.8;
          margin-bottom: 8px;
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
