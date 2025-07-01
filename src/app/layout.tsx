//src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import AIChatbot from "@/components/ai/ai-chatbot";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "UDSM Hub Management System",
    template: "%s | UDSM HMS",
  },
  description:
    "University of Dar es Salaam Hub Management System - Connect, Collaborate, and Grow",
  keywords: [
    "university",
    "hub",
    "management",
    "collaboration",
    "students",
    "projects",
  ],
  authors: [{ name: "UDSM HMS Team" }],
  creator: "UDSM HMS Team",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "UDSM Hub Management System",
    description:
      "University of Dar es Salaam Hub Management System - Connect, Collaborate, and Grow",
    siteName: "UDSM HMS",
  },
  twitter: {
    card: "summary_large_image",
    title: "UDSM Hub Management System",
    description:
      "University of Dar es Salaam Hub Management System - Connect, Collaborate, and Grow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <QueryProvider>
                <NotificationProvider>
                  <AppNavigation>
                    {children}
                    <AIChatbot />
                  </AppNavigation>
                </NotificationProvider>
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
