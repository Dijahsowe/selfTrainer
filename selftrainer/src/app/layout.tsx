import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import SessionProvider from "@/components/providers/SessionProvider";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SelfTrainer",
  description: "Study workflow and learning dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-100 text-slate-900">
        <SessionProvider>
          <ErrorBoundary>
            <div className="min-h-screen">
              <AppHeader />
              {children}
              <FeedbackModal />
            </div>
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
