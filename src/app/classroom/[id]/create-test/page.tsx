"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

type Category = "objective" | "subjective" | "mixed";
type ScheduleType = "instant" | "scheduled";

export default function CreateTest() {
  const { id } = useParams(); // classroom id
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState<Category>("mixed");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("scheduled");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const createTest = async () => {
    // Validation
    if (!title.trim()) {
      toast.warning("Test title is required");
      return;
    }

    if (duration < 1) {
      toast.warning("Duration must be at least 1 minute");
      return;
    }

    if (scheduleType === "scheduled") {
      if (!startTime || !endTime) {
        toast.warning("Please set start and end times for scheduled test");
        return;
      }

      if (new Date(endTime) <= new Date(startTime)) {
        toast.warning("End time must be after start time");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        classroom: Number(id),
        title: title.trim(),
        duration,
        total_marks: 1,
        category,
        schedule_type: scheduleType,
      };

      if (scheduleType === "scheduled") {
        payload.start_time = new Date(startTime).toISOString();
        payload.end_time = new Date(endTime).toISOString();
      }

      const res = await apiFetch("/tests/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create test");
      }

      const test = await res.json();

      // Redirect to upload questions page
      router.push(`/test/${test.id}/upload-questions`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-test-page">
      <div className="page-container">
        <button onClick={() => router.back()} className="back-button">
          ← Back
        </button>

        <div className="form-card">
          <div className="form-header">
            <h1>Create New Test</h1>
            <p>Set up your test and add questions later</p>
          </div>

          <div className="form-body">
            {/* Test Title */}
            <div className="form-group">
              <label htmlFor="title">Test Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Math Quiz Chapter 5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Duration */}
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                id="duration"
                type="number"
                placeholder="60"
                value={duration}
                min={1}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input-field"
              />
              <small className="helper-text">
                Students will have {duration} minute{duration !== 1 ? "s" : ""}{" "}
                to complete
              </small>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Question Type *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="objective"
                    checked={category === "objective"}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Multiple Choice (MCQ)</span>
                    <span className="radio-desc">Only MCQ questions</span>
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="subjective"
                    checked={category === "subjective"}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Subjective</span>
                    <span className="radio-desc">Written answer questions</span>
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="mixed"
                    checked={category === "mixed"}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Mixed</span>
                    <span className="radio-desc">Both MCQ and subjective</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Schedule Type */}
            <div className="form-group">
              <label>Availability *</label>
              <div className="radio-group">
                {/* <label className="radio-option">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="instant"
                    checked={scheduleType === "instant"}
                    onChange={(e) =>
                      setScheduleType(e.target.value as ScheduleType)
                    }
                  />
                  <div className="radio-content">
                    <span className="radio-title">Instant</span>
                    <span className="radio-desc">Available immediately</span>
                  </div>
                </label> */}

                <label className="radio-option">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="scheduled"
                    checked={true}
                    disabled
                    // checked={scheduleType === "scheduled"}
                    onChange={(e) =>
                      setScheduleType(e.target.value as ScheduleType)
                    }
                  />
                  <div className="radio-content">
                    <span className="radio-title">Scheduled</span>
                    <span className="radio-desc">Set specific time window</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Scheduled Times (if scheduled) */}
            {scheduleType === "scheduled" && (
              <div className="scheduled-section">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time *</label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">End Time *</label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="info-box">
                  <span className="info-icon">ℹ️</span>
                  <span>
                    Test will only be available between the start and end times
                  </span>
                </div>
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={createTest}
              type="button"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating Test...
                </>
              ) : (
                "Create Test & Add Questions"
              )}
            </button>

            <p className="footer-note">
              After creating, you'll be able to upload questions via document
              parsing
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .create-test-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }

        .page-container {
          max-width: 600px;
          margin: 0 auto;
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

        .form-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .form-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 32px;
          text-align: center;
        }

        .form-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          color: white;
          font-weight: 700;
        }

        .form-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
        }

        .form-body {
          padding: 32px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .input-field:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .helper-text {
          display: block;
          margin-top: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .radio-group {
          display: grid;
          gap: 12px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .radio-option:hover {
          border-color: #c7d2fe;
          background: #f9fafb;
        }

        .radio-option input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .radio-option input[type="radio"]:checked + .radio-content {
          color: #4f46e5;
        }

        .radio-option:has(input:checked) {
          border-color: #4f46e5;
          background: #eef2ff;
        }

        .radio-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .radio-title {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
        }

        .radio-desc {
          font-size: 13px;
          color: #6b7280;
        }

        .scheduled-section {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-top: 16px;
        }

        .info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
          border-radius: 6px;
          font-size: 14px;
          color: #1e40af;
          margin-top: 16px;
        }

        .info-icon {
          font-size: 18px;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .submit-button:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }

        .submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .footer-note {
          text-align: center;
          margin: 16px 0 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .create-test-page {
            padding: 20px 16px;
          }

          .form-body {
            padding: 24px;
          }

          .form-header {
            padding: 24px;
          }

          .form-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
