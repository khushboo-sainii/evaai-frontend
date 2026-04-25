import { useState } from "react";
import { attemptApi, testApi } from "@/lib/testApi";
import { toast } from "react-toastify";

interface QuestionUploadProps {
  testId: number;
  onSuccess: () => void;
}

export default function QuestionUpload({
  testId,
  onSuccess,
}: QuestionUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF, PNG, or JPEG file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("test id :", testId);
      const result = await testApi.uploadDocument(testId, file);
      setPreview(result);
      toast.success(
        `Success! Added ${result.questions_added} questions (${result.total_marks} marks)`,
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-upload">
      <div className="upload-section">
        <div className="upload-area">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            id="file-input"
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              {file ? (
                <>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </>
              ) : (
                <>
                  <span className="upload-title">
                    Click to upload or drag and drop
                  </span>
                  <span className="upload-subtitle">
                    PDF, PNG, JPG (MAX. 10MB)
                  </span>
                </>
              )}
            </div>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="upload-button"
        >
          {loading ? "Parsing Document..." : "Upload & Parse Questions"}
        </button>
      </div>

      {preview && (
        <div className="preview-section">
          <h3>Parsed Questions Preview</h3>
          <div className="preview-stats">
            <div className="stat">
              <span className="stat-label">Questions Added:</span>
              <span className="stat-value">{preview.questions_added}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Marks:</span>
              <span className="stat-value">{preview.total_marks}</span>
            </div>
          </div>

          <div className="questions-list">
            {preview.questions?.slice(0, 3).map((q: any, idx: number) => (
              <div key={idx} className="question-preview">
                <div className="preview-header">
                  <span className="preview-number">Q{q.question_number}</span>
                  <span className="preview-type">{q.type.toUpperCase()}</span>
                  <span className="preview-marks">{q.marks} marks</span>
                </div>
                <p className="preview-text">{q.question_text}</p>
              </div>
            ))}
            {preview.questions?.length > 3 && (
              <p className="more-indicator">
                +{preview.questions.length - 3} more questions...
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .question-upload {
          max-width: 800px;
          margin: 0 auto;
        }

        .upload-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .upload-area {
          margin-bottom: 20px;
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 48px;
          border: 3px dashed #d1d5db;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          background: #f9fafb;
        }

        .file-label:hover {
          border-color: #4f46e5;
          background: #eef2ff;
        }

        .upload-icon {
          font-size: 48px;
        }

        .upload-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .upload-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .upload-subtitle {
          font-size: 14px;
          color: #666;
        }

        .file-name {
          font-size: 16px;
          font-weight: 600;
          color: #4f46e5;
        }

        .file-size {
          font-size: 14px;
          color: #666;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .upload-button {
          width: 100%;
          padding: 16px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .upload-button:hover:not(:disabled) {
          background: #4338ca;
        }

        .upload-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .preview-section {
          margin-top: 32px;
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .preview-section h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .preview-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 14px;
          color: #0c4a6e;
          font-weight: 600;
        }

        .stat-value {
          font-size: 20px;
          color: #0369a1;
          font-weight: 700;
        }

        .questions-list {
          display: grid;
          gap: 16px;
        }

        .question-preview {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          border-left: 4px solid #4f46e5;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .preview-number {
          background: #4f46e5;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .preview-type {
          background: #e5e7eb;
          color: #374151;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .preview-marks {
          color: #666;
          font-size: 12px;
          font-weight: 600;
        }

        .preview-text {
          font-size: 14px;
          color: #374151;
          margin: 0;
          line-height: 1.6;
        }

        .more-indicator {
          text-align: center;
          color: #666;
          font-size: 14px;
          font-style: italic;
          margin: 16px 0 0 0;
        }
      `}</style>
    </div>
  );
}
