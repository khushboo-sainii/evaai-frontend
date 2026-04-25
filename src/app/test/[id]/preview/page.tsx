"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { testApi, Test, Question } from "@/lib/testApi";

export default function PreviewTestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadTestPreview();
  }, [id]);

  const loadTestPreview = async () => {
    try {
      setLoading(true);

      const testId = Number(id);
      if (isNaN(testId)) throw new Error("Invalid test ID");
console.log(testId)
      // Load test details and questions WITH correct answers (teacher view)
      const [testData, questionData] = await Promise.all([
        
        testApi.getTest(testId),
        testApi.getQuestions(testId, false), // true = include correct answers
      ]);
console.log("test", testData)
      setTest(testData);
      console.log("Question id :", questionData)
      setQuestions(questionData);
    } catch (err: any) {
      alert(err.message || "Failed to load test");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading test preview...</p>

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
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!test || !currentQuestion) {
    return (
      <div className="error-container">
        <p>Test not found or has no questions</p>
        <button onClick={() => router.back()}>Go Back</button>
        
        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            gap: 20px;
          }
          .error-container p {
            color: white;
            font-size: 18px;
          }
          button {
            padding: 12px 24px;
            background: white;
            color: #4f46e5;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="preview-page">
      {/* Header */}
      <div className="preview-header">
        <button onClick={() => router.back()} className="back-button">
          ← Back
        </button>
        
        <div className="preview-badge">
          📋 PREVIEW MODE - Teacher View (Read Only)
        </div>
      </div>

      {/* Test Info Card */}
      <div className="test-info-card">
        <h1>{test.title}</h1>
        
        <div className="test-metadata">
          <div className="meta-item">
            <span className="meta-label">Duration</span>
            <span className="meta-value">{formatTime(test.duration)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Total Marks</span>
            <span className="meta-value">{test.total_marks}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Category</span>
            <span className="meta-value">{test.category?.toUpperCase() || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Questions</span>
            <span className="meta-value">{questions.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Question Navigator Sidebar */}
        <div className="question-navigator">
          <h3>Questions</h3>
          <div className="question-grid">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => jumpToQuestion(idx)}
                className={`question-number-btn ${idx === currentIndex ? 'active' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Display */}
        <div className="question-container">
          <div className="question-header">
            <div className="question-title">
              <h2>Question {currentIndex + 1}</h2>
              <span className="question-type-badge">
                {currentQuestion.type === 'mcq' ? '🔘 MCQ' : '✍️ Subjective'}
              </span>
            </div>
            <span className="marks-badge">{currentQuestion.marks} marks</span>
          </div>

          <div className="question-body">
            <p className="question-text">{currentQuestion.question_text}</p>

            {/* MCQ Question */}
            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <div className="mcq-options">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className={`option ${option.is_correct ? 'correct-option' : ''}`}
                  >
                    <div className="option-label">{option.option_label}</div>
                    <div className="option-text">{option.option_text}</div>
                    {option.is_correct && (
                      <div className="correct-indicator">✓ Correct</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Subjective Question */}
            {currentQuestion.type === "subjective" && (
              <div className="subjective-section">
                <div className="answer-area-preview">
                  <p className="preview-note">
                    Students will write their answers here (text area)
                  </p>
                </div>
                
                {currentQuestion.correct_answer && (
                  <div className="model-answer">
                    <div className="model-answer-header">
                      📝 Expected Answer / Model Answer
                    </div>
                    <div className="model-answer-text">
                      {currentQuestion.correct_answer}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="navigation-controls">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="nav-btn prev-btn"
            >
              ← Previous
            </button>

            <div className="progress-indicator">
              <span className="current">{currentIndex + 1}</span>
              <span className="separator">/</span>
              <span className="total">{questions.length}</span>
            </div>

            <button
              onClick={nextQuestion}
              disabled={currentIndex === questions.length - 1}
              className="nav-btn next-btn"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .preview-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px 80px;
        }

        .preview-header {
          max-width: 1400px;
          margin: 0 auto 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .back-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .preview-badge {
          background: #fbbf24;
          color: #78350f;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .test-info-card {
          max-width: 1400px;
          margin: 0 auto 32px;
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .test-info-card h1 {
          margin: 0 0 24px 0;
          font-size: 32px;
          color: #1a1a1a;
          font-weight: 700;
        }

        .test-metadata {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .meta-item {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-label {
          font-size: 12px;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meta-value {
          font-size: 24px;
          color: #1a1a1a;
          font-weight: 700;
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 24px;
        }

        .question-navigator {
          background: white;
          border-radius: 16px;
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .question-navigator h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #1a1a1a;
          font-weight: 700;
        }

        .question-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .question-number-btn {
          aspect-ratio: 1;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .question-number-btn:hover {
          border-color: #4f46e5;
          background: #eef2ff;
        }

        .question-number-btn.active {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .question-container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
        }

        .question-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .question-title h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a1a;
          font-weight: 700;
        }

        .question-type-badge {
          background: #e0e7ff;
          color: #4338ca;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
        }

        .marks-badge {
          background: #4f46e5;
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 700;
        }

        .question-body {
          margin-bottom: 40px;
        }

        .question-text {
          font-size: 18px;
          line-height: 1.8;
          color: #1a1a1a;
          margin: 0 0 32px 0;
          font-weight: 500;
        }

        .mcq-options {
          display: grid;
          gap: 16px;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #fafafa;
          position: relative;
        }

        .option.correct-option {
          border-color: #10b981;
          background: #d1fae5;
        }

        .option-label {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: #374151;
          flex-shrink: 0;
        }

        .correct-option .option-label {
          background: #10b981;
          color: white;
        }

        .option-text {
          flex: 1;
          font-size: 16px;
          color: #374151;
          line-height: 1.6;
        }

        .correct-indicator {
          position: absolute;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
        }

        .subjective-section {
          display: grid;
          gap: 24px;
        }

        .answer-area-preview {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 60px 20px;
          background: #fafafa;
          text-align: center;
        }

        .preview-note {
          color: #6b7280;
          font-size: 15px;
          margin: 0;
          font-style: italic;
        }

        .model-answer {
          background: #f0fdf4;
          border: 2px solid #86efac;
          border-radius: 12px;
          padding: 24px;
        }

        .model-answer-header {
          font-size: 15px;
          font-weight: 700;
          color: #166534;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .model-answer-text {
          font-size: 16px;
          color: #166534;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .navigation-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding-top: 32px;
          border-top: 2px solid #e5e7eb;
        }

        .nav-btn {
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .prev-btn {
          background: #e5e7eb;
          color: #374151;
        }

        .prev-btn:hover:not(:disabled) {
          background: #d1d5db;
        }

        .next-btn {
          background: #4f46e5;
          color: white;
        }

        .next-btn:hover:not(:disabled) {
          background: #4338ca;
        }

        .nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .progress-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #666;
        }

        .progress-indicator .current {
          color: #4f46e5;
          font-size: 24px;
        }

        .progress-indicator .separator {
          color: #d1d5db;
        }

        @media (max-width: 1024px) {
          .content-wrapper {
            grid-template-columns: 1fr;
          }

          .question-navigator {
            position: static;
          }

          .question-grid {
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .preview-page {
            padding: 20px 16px 60px;
          }

          .test-info-card,
          .question-container {
            padding: 24px;
          }

          .test-metadata {
            grid-template-columns: repeat(2, 1fr);
          }

          .question-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .navigation-controls {
            flex-direction: column;
          }

          .nav-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}