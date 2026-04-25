import { AuthProvider } from "@/context/AuthContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from "next/font/google";
import { Inria_Serif } from "next/font/google";
import "@/lib/firebase";
import { ToastContainer } from "react-toastify";

const inriaSerif = Inria_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inria-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EvaAI - Smart Testing & Classroom Management",
  description:
    "EvaAI is an intelligent testing and classroom management platform built with Next.js. Create tests, manage classrooms, and track student performance with AI-powered evaluation.",
  keywords: [
    "EvaAI",
    "AI Testing Platform",
    "Classroom Management",
    "Online Testing",
    "Student Assessment",
    "Teacher Dashboard",
    "Next.js",
    "PWA",
    "Educational Technology",
    "Test Evaluation",
    "React",
    "Web App",
    "Progressive Web App",
  ],
  authors: [
    { name: "EvaAI Team", url: "https://evaai-frontend-eight.vercel.app/" },
  ],
  themeColor: "#667eea",
  backgroundColor: "#764ba2",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: "/icons/icons-192.png",
    shortcut: "/icons/icons-512.png",
    apple: "/icons/icons-180.png",
  },
  manifest: "/manifest.json",
  generator: "Next.js",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EvaAI",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-navbutton-color" content="#667eea" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icons-192.png" />
        <link rel="shortcut icon" href="/icons/icons-512.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} ${inriaSerif.variable} font-inria antialiased min-h-screen`}
      >
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}

// ----------------------------------must change url in metadata --------------
