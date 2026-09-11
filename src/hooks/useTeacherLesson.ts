"use client";
import { useEffect, useRef, useState } from "react";
import type { TeacherCommand } from "@/types";
import { LocalTeacherTransport } from "@/services/teacher/transport";
export function useTeacherLesson(
  childId: string | undefined,
  lessonId: string,
  step: number,
  stop: () => void,
  repeat: () => void,
) {
  const [paused, setPaused] = useState(false);
  const actions = useRef({ stop, repeat });
  useEffect(() => {
    actions.current = { stop, repeat };
  }, [stop, repeat]);
  useEffect(() => {
    const handle = (event: Event) => {
      const command = (event as CustomEvent<TeacherCommand>).detail;
      if (command.type === "PAUSE_LESSON") {
        actions.current.stop();
        setPaused(true);
      }
      if (command.type === "START_LESSON" && command.lessonId === lessonId) {
        setPaused(false);
        actions.current.repeat();
      }
      if (command.type === "REPEAT") {
        setPaused(false);
        actions.current.repeat();
      }
      if (
        [
          "END_SESSION",
          "CHANGE_LESSON",
          "SPEAK_MESSAGE",
          "ASK_QUESTION",
        ].includes(command.type)
      )
        actions.current.stop();
    };
    window.addEventListener("teacher-command", handle);
    return () => window.removeEventListener("teacher-command", handle);
  }, [lessonId]);
  useEffect(() => {
    if (!childId) return;
    const t = new LocalTeacherTransport();
    t.send({
      kind: "state",
      state: { childId, path: "/learn/" + lessonId, lessonId, step, paused },
    });
    const timer = setInterval(
      () =>
        t.send({
          kind: "state",
          state: {
            childId,
            path: "/learn/" + lessonId,
            lessonId,
            step,
            paused,
          },
        }),
      3000,
    );
    return () => {
      clearInterval(timer);
      t.close();
    };
  }, [childId, lessonId, step, paused]);
  return paused;
}
