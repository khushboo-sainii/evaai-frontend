"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Role = "teacher" | "student";

export default function RolePage() {
  const router = useRouter();

  function select(role: Role) {
    localStorage.setItem("role", role);

    // Redirect to login flow 
    router.push("/entry");
  }

  return (
    <div className="role-page">
      <div className="role-container">
        <div className="role-card">
          <div className="avatar-circle" />

          <h1 className="role-title">What describes you?</h1>

          <div className="role-buttons">
            <button onClick={() => select("student")} className="role-button">
              <Image
                src="/Dashboard/StudentRole.png"
                alt="student"
                width={28}
                height={28}
                className="role-icon"
              />
              <span className="role-label">Student</span>
            </button>

            <button onClick={() => select("teacher")} className="role-button">
              <Image
                src="/Dashboard/TeacherRole.png"
                alt="teacher"
                width={28}
                height={28}
                className="role-icon"
              />
              <span className="role-label">Teacher</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .role-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .role-container {
          width: 100%;
          max-width: 420px;
        }

        .role-card {
          background: white;
          border-radius: 16px;
          padding: 48px 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .avatar-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: #f3f4f6;
          margin-bottom: 24px;
        }

        .role-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          text-align: center;
          margin-bottom: 32px;
        }

        .role-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .role-button {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #4f46e5;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .role-button:hover {
          background: #f9fafb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }

        .role-label {
          font-size: 16px;
          font-weight: 600;
          color: #4f46e5;
        }
      `}</style>
    </div>
  );
}
