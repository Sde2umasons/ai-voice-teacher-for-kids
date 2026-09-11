"use client";
import { useEffect, useState } from "react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { TeacherAvatar } from "./TeacherAvatar";
import { useLearning } from "@/components/common/LearningProvider";
import type { ChatMessage } from "@/types";
export function TalkTeacher() {
  const { settings, profile } = useLearning();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState("loading");
  useEffect(() => {
    fetch("/api/talk")
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => setMode("unavailable"));
  }, []);
  const voice = useVoiceAssistant(async (text) => {
    const messages = [
      ...history,
      { role: "user" as const, content: text },
    ].slice(-8);
    const r = await fetch("/api/talk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, age: profile?.age ?? settings.age }),
      signal: AbortSignal.timeout(55000),
    });
    const data = await r.json();
    if (!r.ok)
      throw new Error(data.error ?? "My connection needs a rest. Try again!");
    setMode(data.mode);
    setHistory(
      [...messages, { role: "assistant" as const, content: data.text }].slice(
        -8,
      ),
    );
    return { text: data.text };
  }, settings);
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-center text-sm font-bold uppercase tracking-widest text-[#7b8d73]">
        A LITTLE CURIOSITY GOES A LONG WAY
      </p>
      <h1 className="mt-3 text-center text-4xl font-bold">
        Talk to Teacher 💬
      </h1>
      <p className="my-3 text-center text-sm text-[#778476]">
        {mode === "demo"
          ? "Offline demo · Try asking about the sky, elephants, or plants."
          : mode === "openai"
            ? "AI conversation · Mia can make mistakes. A grown-up can help."
            : "Connecting to your learning buddy…"}
      </p>
      <div className="panel mt-6 text-center">
        <TeacherAvatar state={voice.state} />
        <p className="mt-5 text-xl leading-relaxed" aria-live="polite">
          {voice.response || "Hello! What are you curious about today?"}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[
          "Why is the sky blue?",
          "Tell me about elephants.",
          "How do plants grow?",
        ].map((q) => (
          <button
            key={q}
            className="button secondary text-sm!"
            disabled={
              voice.state === "THINKING" ||
              voice.state === "SPEAKING" ||
              voice.state === "LISTENING"
            }
            onClick={() => void voice.submit(q)}
          >
            {q}
          </button>
        ))}
      </div>
      <VoiceAssistant voice={voice} />
      {history.length > 0 && (
        <section className="panel mt-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Our conversation</h2>
            <button
              className="underline"
              onClick={() => {
                voice.stopSpeaking();
                setHistory([]);
              }}
            >
              Clear conversation
            </button>
          </div>
          {history.map((m, i) => (
            <p
              key={i}
              className={`mt-3 rounded-xl p-3 ${m.role === "user" ? "bg-[#f5eedf]" : "bg-[#edf3e9]"}`}
            >
              <strong>{m.role === "user" ? "You" : "Mia"}: </strong>
              {m.content}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
