import { Question } from "@/lib/testApi";
import { useState } from "react";

interface SubjectiveQuestionProps {
  question: Question;
  initialAnswer?: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  feedback?: string;
  marksObtained?: number;
}

export default function SubjectiveQuestion({
  question,
  initialAnswer = "",
  onAnswer,
  disabled = false,
  showCorrect = false,
  feedback,
  marksObtained,
}: SubjectiveQuestionProps) {
  const [answer, setAnswer] = useState(initialAnswer);

  const handleChange = (value: string) => {
    setAnswer(value);
    onAnswer(value);
  };

  return (
    <div className="subjective-question">
      <div className="question-header">
        <span className="question-number">Q{question.question_number}</span>
        <span className="question-marks">{question.marks} marks</span>
      </div>

      <p className="question-text">{question.question_text}</p>

      <textarea
        className="answer-input"
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        rows={8}
      />

      {showCorrect && (
        <div className="evaluation-section">
          {marksObtained !== undefined && (
            <div className="marks-feedback">
              <span className="marks-label">Marks Obtained:</span>
              <span className="marks-value">
                {marksObtained} / {question.marks}
              </span>
            </div>
          )}

          {feedback && (
            <div className="ai-feedback">
              <div className="feedback-header">
                <span className="feedback-icon">🤖</span>
                <span className="feedback-title">AI Feedback</span>
              </div>
              <p className="feedback-text">{feedback}</p>
            </div>
          )}

          {question.correct_answer && (
            <div className="model-answer">
              <div className="model-header">Model Answer:</div>
              <p className="model-text">{question.correct_answer}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .subjective-question {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .question-number {
          background: #4f46e5;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .question-marks {
          color: #666;
          font-size: 14px;
          font-weight: 600;
        }

        .question-text {
          font-size: 16px;
          line-height: 1.6;
          color: #1a1a1a;
          margin: 0 0 20px 0;
        }

        .answer-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .answer-input:focus {
          outline: none;
          border-color: #4f46e5;
        }

        .answer-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .evaluation-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
        }

        .marks-feedback {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f0f9ff;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .marks-label {
          font-size: 14px;
          font-weight: 600;
          color: #0c4a6e;
        }

        .marks-value {
          font-size: 18px;
          font-weight: 700;
          color: #0369a1;
        }

        .ai-feedback {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .feedback-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .feedback-icon {
          font-size: 20px;
        }

        .feedback-title {
          font-size: 14px;
          font-weight: 600;
          color: #92400e;
        }

        .feedback-text {
          font-size: 14px;
          line-height: 1.6;
          color: #78350f;
          margin: 0;
        }

        .model-answer {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          border-radius: 8px;
          padding: 16px;
        }

        .model-header {
          font-size: 14px;
          font-weight: 600;
          color: #065f46;
          margin-bottom: 8px;
        }

        .model-text {
          font-size: 14px;
          line-height: 1.6;
          color: #047857;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
