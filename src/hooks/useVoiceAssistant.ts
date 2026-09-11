"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceState } from "@/types";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
export interface VoiceReply {
  text: string;
  afterSpeak?: () => void;
}
export function useVoiceAssistant(
  onAnswer: (text: string) => Promise<VoiceReply> | VoiceReply,
  options: { voice: boolean; speed: number },
) {
  const [state, setState] = useState<VoiceState>("IDLE");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const recognition = useSpeechRecognition();
  const synthesis = useSpeechSynthesis();
  const generation = useRef(0);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const stopSpeaking = useCallback(() => {
    generation.current++;
    busy.current = false;
    recognition.abort();
    synthesis.stop();
    setState("IDLE");
  }, [recognition, synthesis]);
  useEffect(() => {
    const handler = () => stopSpeaking();
    window.addEventListener("teacher-command", handler);
    return () => window.removeEventListener("teacher-command", handler);
  }, [stopSpeaking]);
  const speak = useCallback(
    async (text: string) => {
      recognition.abort();
      synthesis.stop();
      const token = ++generation.current;
      busy.current = true;
      setResponse(text);
      setError("");
      setState("SPEAKING");
      try {
        if (options.voice)
          await synthesis.speak(text, {
            rate: options.speed,
            language: "en-US",
          });
        if (mounted.current && token === generation.current) {
          setState("IDLE");
          busy.current = false;
          return true;
        }
      } catch (e) {
        if (mounted.current && token === generation.current) {
          setError(e instanceof Error ? e.message : "My voice needs a rest.");
          setState("ERROR");
          busy.current = false;
        }
      }
      return false;
    },
    [recognition, synthesis, options.voice, options.speed],
  );
  const submit = useCallback(
    async (text: string) => {
      if (busy.current || !text.trim()) return;
      recognition.abort();
      const token = ++generation.current;
      busy.current = true;
      setTranscript(text.trim());
      setError("");
      setState("THINKING");
      try {
        const reply = await onAnswer(text.trim());
        if (!mounted.current || token !== generation.current) return;
        const completed = await speak(reply.text);
        if (completed) reply.afterSpeak?.();
      } catch (e) {
        if (mounted.current && token === generation.current) {
          busy.current = false;
          setState("ERROR");
          setError(
            e instanceof Error
              ? e.message
              : "Something went quiet. Please try again!",
          );
        }
      }
    },
    [onAnswer, recognition, speak],
  );
  const startListening = useCallback(() => {
    if (busy.current) return;
    synthesis.stop();
    setError("");
    setTranscript("");
    setState("LISTENING");
    recognition.start(
      {
        onResult: (text) => {
          void submit(text);
        },
        onError: (message) => {
          setError(message);
          setState("ERROR");
        },
        onEnd: () => setState((s) => (s === "LISTENING" ? "IDLE" : s)),
      },
      "en-US",
    );
  }, [recognition, synthesis, submit]);
  const stopListening = useCallback(() => recognition.stop(), [recognition]);
  return {
    state,
    transcript,
    response,
    error,
    submit,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    pause: () => synthesis.pause(),
    resume: () => synthesis.resume(),
  };
}
