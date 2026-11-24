"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CalendarDays, Grid3x3, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Play", icon: Grid3x3, match: (path: string) => path === "/" || path.startsWith("/game") },
  { href: "/daily", label: "Daily", icon: CalendarDays, match: (path: string) => path.startsWith("/daily") },
  { href: "/learn", label: "Learn", icon: BookOpen, match: (path: string) => path.startsWith("/learn") },
  { href: "/statistics", label: "Progress", icon: BarChart3, match: (path: string) => path.startsWith("/statistics") || path.startsWith("/achievements") },
  { href: "/settings", label: "Settings", icon: Settings, match: (path: string) => path.startsWith("/settings") },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Link href="/" className="font-display text-[1.65rem] leading-none tracking-tight">
            Sudoku Master
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.match(pathname) ? "page" : undefined}
                className={cn("text-muted hover:text-ink", item.match(pathname) && "text-ink")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-8 md:pb-16">{children}</main>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted",
                    active && "text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
