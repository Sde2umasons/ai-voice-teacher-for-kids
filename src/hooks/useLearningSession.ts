"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export function useLearningSession(childId?: string) {
  const path = usePathname();
  useEffect(() => {
    if (
      !childId ||
      !(path.startsWith("/learn") || path === "/quiz" || path === "/talk")
    )
      return;
    const id = crypto.randomUUID();
    let active = true;
    const send = (action: "start" | "tick" | "end") =>
      fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
        keepalive: action === "end",
      }).catch(() => {});
    void send("start");
    const interval = setInterval(() => {
      if (active && document.visibilityState === "visible") void send("tick");
    }, 15000);
    const end = () => {
      if (active) {
        active = false;
        void send("end");
      }
    };
    window.addEventListener("pagehide", end);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", end);
      end();
    };
  }, [childId, path]);
}
