import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { AppProvider } from "@/components/layout/AppProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const themeScript = `
try {
  var raw = localStorage.getItem("sudoku-master:settings:v1");
  if (raw) {
    var settings = JSON.parse(raw);
    if (settings && settings.version === 1) {
      var root = document.documentElement;
      root.dataset.theme = settings.theme;
      root.dataset.board = settings.boardTheme;
      root.dataset.accent = settings.accent;
      root.dataset.boardSize = settings.boardSize;
      root.dataset.motion = settings.motion ? "on" : "off";
    }
  }
} catch (_) {}
`;

export const metadata: Metadata = {
  title: { default: "Sudoku Master", template: "%s · Sudoku Master" },
  description: "A quiet Sudoku game with logical hints, a daily puzzle, and a record of your play.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <TooltipProvider delayDuration={280}>
          <AppProvider>
            <Suspense fallback={<div className="min-h-full flex-1" />}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </AppProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
