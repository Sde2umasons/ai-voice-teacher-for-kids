"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TeacherBridge } from "@/components/teacher/TeacherBridge";
import { useLearningSession } from "@/hooks/useLearningSession";
import { useLearning } from "./LearningProvider";
export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, error } = useLearning();
  const path = usePathname();
  useLearningSession(profile?.id);
  return (
    <div className="min-h-screen">
      <TeacherBridge />
      <header className="border-b border-[#e0e6dc] bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5">
          <Link href="/child" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e5eee2] text-2xl">
              🌱
            </span>
            <span>
              <strong className="block text-xl tracking-tight">
                little wonder<span className="text-[#d88943]">.</span>
              </strong>
              <span className="text-xs tracking-widest text-[#768175]">
                BIG DREAMS START SMALL
              </span>
            </span>
          </Link>
          <nav
            className="flex items-center gap-5 text-sm font-bold"
            aria-label="Main navigation"
          >
            {[
              ["/child", "My classroom"],
              ["/progress", "My progress"],
              ["/teacher", "Grown-ups"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={
                  path === href
                    ? "text-[#287457] underline decoration-2 underline-offset-8"
                    : "text-[#758076]"
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-[#fff3ca] px-4 py-2 font-bold">
              ⭐ {profile?.stars ?? 0}
            </span>
            <Link
              href="/settings"
              aria-label="Profile and settings"
              className="flex items-center gap-2"
            >
              <span className="rounded-full bg-[#eee4d6] p-2">🦊</span>
              <span className="text-sm font-bold">
                {profile?.name ?? "Explorer"} ⌄
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-amber-100 p-3">
            {error}
          </p>
        )}
        {children}
      </main>
      <footer className="mx-auto max-w-7xl px-8 pb-7 text-center text-sm text-[#758076]">
        Made for little minds with big imaginations.{" "}
        <span aria-hidden="true">☀️</span>
      </footer>
    </div>
  );
}
