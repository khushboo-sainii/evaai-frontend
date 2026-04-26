# 🎓 EvaAI — EVI Edtech Platform

> **AI-powered classrooms that make teaching smarter and learning easier.**

> ⚠️ **This repository contains the frontend only.** Backend is maintained separately.

EVI is an edtech platform where teachers can create classrooms, auto-generate tests from documents using AI, and track student performance — all in one place. Students can join classrooms, attempt tests, and get instant AI-evaluated feedback.

---

## 🚀 Key Features

### 👩‍🏫 For Teachers
- 🏫 **Create Classrooms** — System auto-generates a unique shareable classroom code
- ✅ **Manage Join Requests** — Accept or reject student requests
- 📄 **Upload & Auto-Generate Tests** — Upload any document and AI generates MCQ or theoretical questions automatically
- 👀 **Preview Tests** before publishing to students
- 📝 **Manual Review** — Give personalized feedback on student submissions

### 👨‍🎓 For Students
- 🔗 **Join Classrooms** using a classroom code
- 📝 **Attempt Tests** — MCQ (select options) or Theoretical (write answers)
- ⚡ **Instant Results** — AI evaluates submissions, calculates scores & generates feedback automatically

---

## 🛠️ Tech Stack

| | |
|---|---|
| ⚛️ **Framework** | Next.js 15 + React 19 |
| 🟦 **Language** | TypeScript |
| 🔥 **Auth** | Firebase |
| 🎨 **Styling** | Tailwind CSS |
| 🐻 **State** | Zustand |
| 📋 **Forms** | React Hook Form + Zod |

---

## 💻 Running Locally

### Prerequisites
- Node.js >= 18
- pnpm &nbsp;→&nbsp; `npm install -g pnpm`

### Setup

```bash
# 📥 Clone the repo
git clone https://github.com/khushboo-sainii/evaai-frontend.git
cd evaai-frontend

# 📦 Install dependencies
pnpm install

# ▶️ Start the dev server
pnpm dev
```

🌐 Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 🔑 Environment Variables

Create a `.env.local` file in the root directory and add your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

<p align="center">
  <em>
    This project was developed as part of my internship experience, where I worked collaboratively within a team environment to design, develop, and deliver the application.
  </em>
</p>
