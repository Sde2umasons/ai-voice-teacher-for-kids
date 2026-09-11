"use client";
import { useId, useState } from "react";
import type { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
export type VoiceController = ReturnType<typeof useVoiceAssistant>;
export function VoiceAssistant({ voice }: { voice: VoiceController }) {
  const [text, setText] = useState("");
  const inputId = useId();
  const busy = voice.state === "THINKING" || voice.state === "SPEAKING";
  const listening = voice.state === "LISTENING";
  return (
    <section className="panel mt-6 text-center" aria-label="Voice assistant">
      <p className="mb-4 text-lg font-bold" aria-live="polite">
        {listening
          ? "I'm listening…"
          : voice.state === "THINKING"
            ? "Let me think…"
            : voice.state === "SPEAKING"
              ? "Listen to Mia…"
              : "Your turn, little explorer!"}
      </p>
      <button
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#286652] text-4xl text-white shadow-lg ${listening ? "mic-listening" : ""}`}
        disabled={busy}
        aria-label={listening ? "Stop listening" : "Tap to speak"}
        onClick={listening ? voice.stopListening : voice.startListening}
      >
        {listening ? "◼" : "🎤"}
      </button>
      <p className="mt-3 font-bold">
        {listening ? "Tap to finish" : "Tap to speak"}
      </p>
      {busy && (
        <button className="mt-3 underline" onClick={voice.stopSpeaking}>
          Stop / cancel
        </button>
      )}
      {voice.transcript && (
        <p className="mt-4 rounded-xl bg-[#f4f5ee] p-3">
          You said: “{voice.transcript}”
        </p>
      )}
      {voice.error && (
        <div role="alert" className="mt-4 text-[#994622]">
          <p>{voice.error}</p>
          <button
            className="button secondary mt-2"
            onClick={voice.startListening}
          >
            Try microphone again
          </button>
        </div>
      )}
      <form
        className="mx-auto mt-5 flex max-w-lg flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void voice.submit(text);
          setText("");
        }}
      >
        <label className="w-full text-sm text-[#64756d]" htmlFor={inputId}>
          Or type your words — you can always learn without a microphone.
        </label>
        <input
          id={inputId}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy || listening}
          placeholder="Type your answer here…"
          className="min-w-0 flex-1 rounded-xl border border-[#ccd9ce] bg-white px-4 py-3"
        />
        <button
          className="button"
          disabled={busy || listening || !text.trim()}
          type="submit"
        >
          Send ↗
        </button>
      </form>
    </section>
  );
}
