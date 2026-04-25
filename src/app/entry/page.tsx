"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RolePage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleSelection = (type) => {
    if (type === "login") {
      router.push("/login");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">
            Choose an option to continue
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Login Card */}
          <div
            onClick={() => handleSelection("login")}
            onMouseEnter={() => setHoveredCard("login")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`
              relative bg-white rounded-2xl p-8 shadow-lg cursor-pointer
              transform transition-all duration-300 ease-out
              ${hoveredCard === "login" ? "scale-105 shadow-2xl" : "hover:scale-102"}
              border-2 border-transparent hover:border-blue-500
            `}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Login
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Already have an account? Sign in to continue your journey
              </p>

              {/* Button */}
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelection("login");
                }}
              >
                Sign In
              </button>
            </div>

            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full opacity-20"></div>
          </div>

          {/* Register Card */}
          <div
            onClick={() => handleSelection("register")}
            onMouseEnter={() => setHoveredCard("register")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`
              relative bg-white rounded-2xl p-8 shadow-lg cursor-pointer
              transform transition-all duration-300 ease-out
              ${hoveredCard === "register" ? "scale-105 shadow-2xl" : "hover:scale-102"}
              border-2 border-transparent hover:border-purple-500
            `}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Register
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                New here? Create an account to get started today
              </p>

              {/* Button */}
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelection("register");
                }}
              >
                Create Account
              </button>
            </div>

            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-full opacity-20"></div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8 text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}