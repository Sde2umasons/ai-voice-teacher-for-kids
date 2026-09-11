"use client";
import { useMemo, useState } from "react";
import { useLearning } from "@/components/common/LearningProvider";
import { TeacherAvatar } from "@/components/child/TeacherAvatar";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import {
  getQuiz,
  quizTypes,
  scoreQuiz,
  type QuizType,
} from "@/services/lessons/quiz";
import { checkAnswer } from "@/services/lessons/answer-checker";
export function QuizPlayer() {
  const { profile, settings, refresh } = useLearning();
  const [type, setType] = useState<QuizType>("alphabet");
  const [answers, setAnswers] = useState<string[]>([]);
  const [attemptId, setAttemptId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const quiz = useMemo(
    () => getQuiz(type, profile?.age ?? 5),
    [type, profile?.age],
  );
  const index = answers.length;
  const done = index === quiz.questions.length;
  const question = quiz.questions[index];
  const voice = useVoiceAssistant((text) => {
    if (!question)
      return {
        text: "Wonderful practice! Choose another quiz when you are ready.",
      };
    const correct = checkAnswer(text, question.answer);
    return {
      text: correct
        ? question.answer.feedback
        : `Good try! The answer is ${question.answer.accepted[0]}. Let's keep exploring.`,
      afterSpeak: () => setAnswers((a) => [...a, text]),
    };
  }, settings);
  function reset(value: QuizType) {
    voice.stopSpeaking();
    setType(value);
    setAnswers([]);
    setAttemptId(crypto.randomUUID());
    setMessage("");
    setSaved(false);
  }
  async function save() {
    setSaving(true);
    try {
      const id = attemptId || crypto.randomUUID();
      setAttemptId(id);
      const r = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: id, type, answers }),
      });
      if (!r.ok) throw new Error();
      await refresh();
      setSaved(true);
      setMessage("Your quiz stars are saved!");
    } catch {
      setMessage("Could not save yet. Tap Save stars to try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-center text-4xl font-bold">Quiz time 🧠</h1>
      <p className="mt-3 text-center text-[#71806f]">
        Every try is a chance to learn. No stars are ever taken away.
      </p>
      <div className="my-6 flex flex-wrap justify-center gap-2">
        {quizTypes.map((t) => (
          <button
            className={`button ${t === type ? "" : "secondary"} capitalize`}
            key={t}
            onClick={() => reset(t)}
          >
            {t === "alphabet" ? "ABC" : t}
          </button>
        ))}
      </div>
      <section className="panel text-center">
        <TeacherAvatar state={voice.state} celebrating={done} />
        <h2 className="mt-5 text-2xl font-bold">
          {done ? "Wonderful practice!" : quiz.title}
        </h2>
        {done ? (
          <>
            <p className="my-5 text-3xl">
              {"⭐".repeat(scoreQuiz(quiz, answers)) || "🌱"}
            </p>
            <p>
              {scoreQuiz(quiz, answers)} discoveries out of{" "}
              {quiz.questions.length}. You are growing!
            </p>
            <button
              className="button mt-5"
              disabled={saving || saved}
              onClick={() => void save()}
            >
              {saved ? "Stars saved" : "Save stars"}
            </button>
            <button
              className="button secondary ml-2 mt-5"
              onClick={() => reset(type)}
            >
              Play again
            </button>
            <p className="mt-3" role="status">
              {message}
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm">
              Question {index + 1} of {quiz.questions.length}
            </p>
            <p className="mt-4 text-2xl" aria-live="polite">
              {question.prompt}
            </p>
            <button
              className="button secondary mt-4"
              onClick={() => void voice.speak(question.prompt)}
            >
              🔊 Read question
            </button>
            {voice.response && <p className="mt-4">{voice.response}</p>}
          </>
        )}
      </section>
      {!done && <VoiceAssistant voice={voice} />}
    </div>
  );
}
