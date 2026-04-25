import { Question, QuestionOption } from "@/lib/testApi";
import { useState } from "react";

interface MCQQuestionProps {
  question: Question;
  selectedOption?: number;
  onAnswer: (optionId: number) => void;
  disabled?: boolean;
  showCorrect?: boolean;
}

export default function MCQQuestion({
  question,
  selectedOption,
  onAnswer,
  disabled = false,
  showCorrect = false,
}: MCQQuestionProps) {
  const [localSelection, setLocalSelection] = useState<number | undefined>(
    selectedOption,
  );

  const handleSelect = (optionId: number) => {
    if (disabled) return;
    setLocalSelection(optionId);
    onAnswer(optionId);
  };

  const getOptionClass = (option: QuestionOption) => {
    const classes = ["option"];

    if (showCorrect) {
      if (option.is_correct) {
        classes.push("correct");
      } else if (localSelection === option.id) {
        classes.push("incorrect");
      }
    } else if (localSelection === option.id) {
      classes.push("selected");
    }

    return classes.join(" ");
  };

  return (
    <div className="mcq-question">
      <div className="question-header">
        <span className="question-number">Q{question.question_number}</span>
        <span className="question-marks">{question.marks} marks</span>
      </div>

      <p className="question-text">{question.question_text}</p>

      <div className="options-list">
        {question.options?.map((option) => (
          <div
            key={option.id}
            className={getOptionClass(option)}
            onClick={() => handleSelect(option.id)}
          >
            <div className="option-label">{option.option_label}</div>
            <div className="option-text">{option.option_text}</div>
            {showCorrect && option.is_correct && (
              <div className="correct-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .mcq-question {
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

        .options-list {
          display: grid;
          gap: 12px;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .option:hover:not(.correct):not(.incorrect) {
          border-color: #4f46e5;
          background: #f9fafb;
        }

        .option.selected {
          border-color: #4f46e5;
          background: #eef2ff;
        }

        .option.correct {
          border-color: #10b981;
          background: #d1fae5;
          cursor: default;
        }

        .option.incorrect {
          border-color: #ef4444;
          background: #fee2e2;
          cursor: default;
        }

        .option-label {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #374151;
          flex-shrink: 0;
        }

        .option.selected .option-label {
          background: #4f46e5;
          color: white;
        }

        .option.correct .option-label {
          background: #10b981;
          color: white;
        }

        .option.incorrect .option-label {
          background: #ef4444;
          color: white;
        }

        .option-text {
          flex: 1;
          font-size: 15px;
          color: #374151;
        }

        .correct-indicator {
          position: absolute;
          right: 16px;
          font-size: 20px;
          color: #10b981;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
