"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LocalTeacherTransport,
  emitLessonCommand,
} from "@/services/teacher/transport";
import { useLearning } from "@/components/common/LearningProvider";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { TeacherAvatar } from "@/components/child/TeacherAvatar";
import { getLesson } from "@/data/lessons";
export function TeacherBridge() {
  const { profile, settings, refresh } = useLearning();
  const path = usePathname();
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState("");
  const voice = useVoiceAssistant((text) => {
    if (profile) {
      const t = new LocalTeacherTransport();
      t.send({
        kind: "state",
        state: { childId: profile.id, path, lastAnswer: text },
      });
      t.close();
    }
    return { text: "Thank you! I sent your answer to your teacher." };
  }, settings);
  const speak = voice.speak,
    stopSpeaking = voice.stopSpeaking;
  useEffect(() => {
    if (!profile || path === "/teacher") return;
    const transport = new LocalTeacherTransport();
    const publish = () =>
      transport.send({ kind: "state", state: { childId: profile.id, path } });
    publish();
    const heartbeat = setInterval(publish, 3000);
    const off = transport.subscribe((message) => {
      if (message.kind !== "command" || message.command.childId !== profile.id)
        return;
      const command = message.command;
      emitLessonCommand(command);
      if (
        (command.type === "START_LESSON" || command.type === "CHANGE_LESSON") &&
        command.lessonId &&
        getLesson(command.lessonId)
      ) {
        stopSpeaking();
        setQuestion("");
        router.push("/learn/" + command.lessonId);
      }
      if (command.type === "SPEAK_MESSAGE" || command.type === "ASK_QUESTION") {
        setQuestion(command.message ?? "Hello, little explorer!");
        void speak(command.message ?? "Hello, little explorer!");
      }
      if (command.type === "END_SESSION") {
        stopSpeaking();
        setQuestion("");
        router.push("/child");
        setNotice("Your teacher session has ended. Wonderful learning today!");
      }
      if (command.type === "GIVE_STAR") {
        void fetch("/api/teacher/star", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commandId: command.id }),
        })
          .then(async (r) => {
            if (!r.ok) throw new Error();
            await refresh();
            setNotice("Your teacher gave you a star! ⭐");
          })
          .catch(() =>
            setNotice(
              "The teacher star could not be saved. Please ask your teacher to retry.",
            ),
          );
      }
      transport.send({
        kind: "state",
        state: { childId: profile.id, path, lastCommandId: command.id },
      });
    });
    return () => {
      clearInterval(heartbeat);
      off();
      transport.close();
    };
  }, [profile, path, router, refresh, speak, stopSpeaking]);
  return (
    <>
      {notice && (
        <div
          className="fixed bottom-4 left-4 z-40 max-w-sm rounded-2xl border bg-white p-5 shadow-lg"
          role="status"
        >
          {notice}
          <button
            aria-label="Dismiss notification"
            className="ml-3"
            onClick={() => setNotice("")}
          >
            ✕
          </button>
        </div>
      )}
      {question && (
        <section
          className="fixed inset-0 z-50 overflow-auto bg-[#f7f8f0]/95 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Your human teacher"
        >
          <div className="mx-auto max-w-2xl">
            <button
              className="button secondary float-right"
              onClick={() => {
                stopSpeaking();
                setQuestion("");
              }}
            >
              Back to lesson
            </button>
            <TeacherAvatar state={voice.state} />
            <h2 className="mt-5 text-center text-2xl font-bold">
              Your teacher says
            </h2>
            <p className="mt-4 text-center text-2xl">{question}</p>
            <VoiceAssistant voice={voice} />
          </div>
        </section>
      )}
    </>
  );
}
