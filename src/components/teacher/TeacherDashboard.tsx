"use client";
import { useEffect, useRef, useState } from "react";
import { useLearning } from "@/components/common/LearningProvider";
import {
  LocalTeacherTransport,
  type ClassroomState,
} from "@/services/teacher/transport";
import type { TeacherCommand } from "@/types";
import { lessons } from "@/data/lessons";
export function TeacherDashboard() {
  const { profile, refresh } = useLearning();
  const [lesson, setLesson] = useState("alphabet");
  const [message, setMessage] = useState(
    "You are doing wonderfully. Keep trying!",
  );
  const [status, setStatus] = useState<ClassroomState | null>(null);
  const [notice, setNotice] = useState("");
  const transport = useRef<LocalTeacherTransport | null>(null);
  const [lastSeen, setLastSeen] = useState(0);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const t = new LocalTeacherTransport();
    transport.current = t;
    const off = t.subscribe((m) => {
      if (m.kind === "state") {
        setStatus((s) => ({ ...s, ...m.state }));
        setLastSeen(Date.now());
        if (m.state.lastCommandId)
          setNotice("The child classroom received your command.");
      }
    });
    const timer = setInterval(() => {
      setNow(Date.now());
      void refresh();
    }, 4000);
    return () => {
      off();
      clearInterval(timer);
      t.close();
    };
  }, [refresh]);
  const connected = lastSeen > 0 && now - lastSeen < 10000;
  function send(type: TeacherCommand["type"]) {
    if (!profile) return;
    transport.current?.send({
      kind: "command",
      command: {
        id: crypto.randomUUID(),
        childId: profile.id,
        type,
        lessonId: lesson,
        message,
      },
    });
    setNotice("Command sent. Waiting for the child classroom…");
  }
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-widest text-[#788973]">
        GROWN-UP CORNER
      </p>
      <h1 className="mt-2 text-3xl font-bold">Teacher classroom</h1>
      <p className="mt-3 rounded-xl bg-[#fff3d4] p-4">
        Local simulation: open{" "}
        <a
          href="/child"
          target="_blank"
          rel="noreferrer"
          className="font-bold underline"
        >
          the child classroom in another tab
        </a>{" "}
        of this browser. Roles here are demo views; remote access and
        authenticated teacher accounts are future work.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="panel">
          <h2 className="text-xl font-bold">Students</h2>
          <div className="mt-4 rounded-xl bg-[#edf3e9] p-4">
            <p className="text-lg font-bold">
              🦊 {profile?.name ?? "Loading…"}
            </p>
            <p className="mt-2 text-sm">
              Age {profile?.age} · ⭐ {profile?.stars ?? 0}
            </p>
            <p className="mt-2 text-sm">
              {connected ? "🟢 Classroom connected" : "○ Waiting for child tab"}
            </p>
          </div>
          <h3 className="mt-6 font-bold">Learning areas</h3>
          {profile?.progress.map((p) => (
            <p className="mt-2 capitalize" key={p.lessonId}>
              {p.lessonId}: {JSON.parse(p.completedSteps).length} steps
            </p>
          ))}
        </aside>
        <div className="space-y-5">
          <section className="panel">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-xl font-bold">Live lesson controls</h2>
              <span className="rounded-full bg-[#eef3e9] px-4 py-1">
                {status?.lessonId ?? status?.path ?? "No active lesson"}{" "}
                {status?.step !== undefined ? `· Step ${status.step + 1}` : ""}{" "}
                {status?.paused ? "· Paused" : ""}
              </span>
            </div>
            <label className="mt-5 block font-bold">
              Choose lesson
              <select
                className="mt-2 block w-full rounded-xl border p-3"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["START_LESSON", "▶ Start / resume"],
                  ["PAUSE_LESSON", "Ⅱ Pause lesson"],
                  ["CHANGE_LESSON", "↔ Change lesson"],
                  ["REPEAT", "↺ Repeat"],
                  ["GIVE_STAR", "⭐ Give star"],
                  ["END_SESSION", "End session"],
                ] as const
              ).map(([type, label]) => (
                <button
                  disabled={!connected}
                  className="button secondary"
                  key={type}
                  onClick={() => send(type)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-5 block font-bold">
              Question or encouragement
              <input
                className="mt-2 block w-full rounded-xl border p-3"
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                disabled={!connected || !message.trim()}
                className="button"
                onClick={() => send("ASK_QUESTION")}
              >
                Send question
              </button>
              <button
                disabled={!connected || !message.trim()}
                className="button secondary"
                onClick={() => send("SPEAK_MESSAGE")}
              >
                Send encouragement
              </button>
            </div>
            <p className="mt-4 text-sm" role="status">
              {notice}
            </p>
            {status?.lastAnswer && (
              <p className="mt-4 rounded-xl bg-[#edf3e9] p-4">
                <strong>Child answered: </strong>
                {status.lastAnswer}
              </p>
            )}
          </section>
          <section className="panel">
            <h2 className="text-xl font-bold">Quiz results</h2>
            {profile?.quizzes.length ? (
              profile.quizzes.map((q) => (
                <p key={q.id} className="mt-3">
                  {q.quizType}: {q.correctAnswers}/{q.totalQuestions} ⭐
                </p>
              ))
            ) : (
              <p className="mt-3">No quizzes yet.</p>
            )}
          </section>
          <section className="panel">
            <h2 className="text-xl font-bold">Session history</h2>
            {profile?.sessions.map((s) => (
              <p className="mt-3" key={s.id}>
                {new Date(s.startedAt).toLocaleDateString()} ·{" "}
                {Math.round(s.learningSeconds / 60)} minutes
              </p>
            ))}
          </section>
          <section className="panel">
            <h2 className="text-xl font-bold">Recent activity</h2>
            {profile?.activities.map((a) => (
              <p className="mt-3" key={a.id}>
                {a.description}
              </p>
            ))}
          </section>
          <section className="panel">
            <button className="button secondary" disabled>
              📹 Start video session
            </button>
            <p className="mt-3 text-sm text-[#74806f]">
              Future feature · WebRTC video and a WebSocket classroom server.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
