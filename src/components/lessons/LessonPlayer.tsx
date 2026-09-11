"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Lesson } from "@/types";
import { ShapeVisual } from "./ShapeVisual";
import { useTeacherLesson } from "@/hooks/useTeacherLesson";
import { playCelebration } from "@/services/speech/celebration";
import { useLearning } from "@/components/common/LearningProvider";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { TeacherAvatar } from "@/components/child/TeacherAvatar";
import { checkAnswer } from "@/services/lessons/answer-checker";
export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { settings, profile, refresh } = useLearning();
  const [index, setIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [started, setStarted] = useState(false);
  const step = lesson.steps[index];
  const pendingIntro = useRef(false);
  const voice = useVoiceAssistant(async (text) => {
    setStarted(true);
    const correct = checkAnswer(text, step.question.answer);
    if (correct) {
      setCelebrating(true);
      if (settings.soundEffects) playCelebration();
    }
    let saved = true;
    setSaveError("");
    try {
      if (!profile) await refresh();
      const r = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          step: index,
          answer: text,
        }),
      });
      if (!r.ok) throw new Error();
      await refresh();
    } catch {
      saved = false;
      setSaveError(
        "Your star could not be saved. Stay here and send your answer again to retry.",
      );
    }
    return {
      text: correct ? step.question.answer.feedback : step.encouragement,
      afterSpeak: () => {
        setCelebrating(false);
        if (
          correct &&
          saved &&
          settings.autoNext &&
          index < lesson.steps.length - 1
        ) {
          pendingIntro.current = true;
          setIndex((i) => i + 1);
        }
      },
    };
  }, settings);
  const paused = useTeacherLesson(
    profile?.id,
    lesson.id,
    index,
    voice.stopSpeaking,
    () => {
      setStarted(true);
      void voice.speak(step.introduction);
    },
  );
  const speakRef = useRef(voice.speak);
  useEffect(() => {
    speakRef.current = voice.speak;
  }, [voice.speak]);
  useEffect(() => {
    if (pendingIntro.current) {
      pendingIntro.current = false;
      void speakRef.current(step.introduction);
    }
  }, [step]);
  function navigate(next: number) {
    voice.stopSpeaking();
    setCelebrating(false);
    setSaveError("");
    setStarted(true);
    pendingIntro.current = true;
    setIndex(next);
  }
  return (
    <>
      <Link href="/child" className="font-bold text-[#62816d]">
        ← My classroom
      </Link>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-[#7a8873]">
            LET’S EXPLORE TOGETHER
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {lesson.emoji} {lesson.title}
          </h1>
        </div>
        <span className="rounded-full bg-white px-5 py-2">
          Step {index + 1} of {lesson.steps.length}
        </span>
      </div>
      <div className="mt-7 grid gap-6 md:grid-cols-[1fr_1fr]">
        <section
          className="panel flex min-h-80 flex-col items-center justify-center"
          style={{ background: lesson.color }}
        >
          <div className="text-8xl font-bold" data-testid="lesson-title">
            {step.title}
          </div>
          <div className="my-6 text-8xl" aria-label={step.word}>
            {step.emoji}
          </div>
          {step.visual?.kind === "shape" && (
            <ShapeVisual shape={step.visual.value} />
          )}{" "}
          {step.word && <h2 className="text-3xl font-bold">{step.word}</h2>}
          {step.visual?.kind === "count" && (
            <p className="max-w-sm text-center text-3xl tracking-widest">
              {"● ".repeat(Number(step.visual.value))}
            </p>
          )}
          {step.visual?.kind === "color" && (
            <div
              aria-label={step.title}
              className="h-24 w-40 rounded-xl border-2 border-black/20"
              style={{ background: step.visual.value }}
            />
          )}
        </section>
        <section className="panel text-center">
          <TeacherAvatar state={voice.state} celebrating={celebrating} />
          <p className="mt-5 text-xl leading-relaxed" aria-live="polite">
            {voice.response || step.introduction}
          </p>
          {celebrating && (
            <p className="celebrate mt-3 text-3xl" role="status">
              ⭐ Wonderful!
            </p>
          )}
          {!started &&
            profile?.progress.find(
              (p) => p.lessonId === lesson.id && p.currentStep > 0,
            ) && (
              <button
                className="button secondary mt-5 mr-2"
                onClick={() =>
                  navigate(
                    profile.progress.find((p) => p.lessonId === lesson.id)!
                      .currentStep,
                  )
                }
              >
                Resume saved step
              </button>
            )}
          {!started && (
            <button
              disabled={paused}
              className="button mt-5"
              onClick={() => {
                setStarted(true);
                void voice.speak(step.introduction);
              }}
            >
              🔊 Start lesson
            </button>
          )}
          {saveError && (
            <p role="alert" className="mt-4 text-[#994622]">
              {saveError}
            </p>
          )}
        </section>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          className="button secondary"
          disabled={paused || index === 0}
          onClick={() => navigate(index - 1)}
        >
          ← Previous
        </button>
        <button
          className="button secondary"
          disabled={paused}
          onClick={() => {
            setStarted(true);
            void voice.speak(step.introduction);
          }}
        >
          🔊 Repeat
        </button>
        <button
          className="button"
          disabled={paused || index === lesson.steps.length - 1}
          onClick={() => navigate(index + 1)}
        >
          Next →
        </button>
      </div>
      {paused ? (
        <p role="status" className="panel mt-5 text-center text-xl">
          Your teacher paused this lesson. Take a little breath. 🌼
        </p>
      ) : (
        <VoiceAssistant voice={voice} />
      )}
      <div
        className="mt-6 flex flex-wrap justify-center gap-2"
        aria-label="Lesson steps"
      >
        {lesson.steps.map((s, i) => (
          <button
            disabled={paused}
            key={s.id}
            onClick={() => navigate(i)}
            aria-current={index === i ? "step" : undefined}
            className={`flex h-11 min-w-11 items-center justify-center rounded-xl px-2 font-bold ${index === i ? "bg-[#286652] text-white" : "border border-[#d7dfd1] bg-white"}`}
          >
            {s.title}
          </button>
        ))}
      </div>
      <p className="mt-5 text-center text-sm text-[#7b8678]">
        Say the word or letter. Trying is how we learn!{" "}
        {profile ? "Your progress is saved on this device." : ""}
      </p>
    </>
  );
}
