import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TransitOps — Smart Transport Operations Platform",
  description: "Enterprise SaaS platform for transport operations, vehicle tracking, maintenance scheduling, and fuel expense monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <AppShell>
          {children}
        </AppShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}