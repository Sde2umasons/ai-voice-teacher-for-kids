"use client";
import { useState } from "react";
import { rhymes } from "@/data/lessons/rhymes";
import { useLearning } from "@/components/common/LearningProvider";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { TeacherAvatar } from "@/components/child/TeacherAvatar";
import { normalize } from "@/services/lessons/answer-checker";
export function RhymePlayer() {
  const { settings } = useLearning();
  const [rhymeIndex, setRhymeIndex] = useState(0);
  const [line, setLine] = useState(0);
  const [practice, setPractice] = useState(false);
  const [lineMode, setLineMode] = useState(true);
  const [paused, setPaused] = useState(false);
  const rhyme = rhymes[rhymeIndex];
  const voice = useVoiceAssistant((text) => {
    const expected = normalize(rhyme.lines[line]).split(" ");
    const words = new Set(normalize(text).split(" "));
    const matched =
      expected.filter((word) => words.has(word)).length / expected.length >=
      0.65;
    return {
      text: matched
        ? "Lovely practice! Let's try the next line."
        : "Nice try! Listen to the line once more and have another go.",
      afterSpeak: () => {
        if (matched) setLine((i) => Math.min(i + 1, rhyme.lines.length - 1));
      },
    };
  }, settings);
  function restart() {
    voice.stopSpeaking();
    setLine(0);
    setPaused(false);
    void voice.speak(
      lineMode || practice ? rhyme.lines[0] : rhyme.lines.join(" "),
    );
  }
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Rhymes & poems 🎵</h1>
      <p className="mt-2 text-[#768272]">
        Original little poems, made for learning.
      </p>
      <div className="my-5 flex flex-wrap gap-2">
        {rhymes.map((r, i) => (
          <button
            key={r.id}
            className={`button ${i === rhymeIndex ? "" : "secondary"}`}
            onClick={() => {
              voice.stopSpeaking();
              setRhymeIndex(i);
              setLine(0);
              setPaused(false);
            }}
          >
            {r.emoji} {r.title}
          </button>
        ))}
      </div>
      <section className="panel text-center">
        <TeacherAvatar state={voice.state} />
        <h2 className="my-5 text-2xl font-bold">{rhyme.title}</h2>
        {rhyme.lines.map((text, i) => (
          <p
            key={text}
            className={`rounded-xl p-3 text-xl ${i === line ? "bg-[#edf3e9] font-bold" : ""}`}
          >
            {text}
          </p>
        ))}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            className="button"
            onClick={() => {
              setPaused(false);
              void voice.speak(
                lineMode || practice
                  ? rhyme.lines[line]
                  : rhyme.lines.join(" "),
              );
            }}
          >
            ▶ Play
          </button>
          <button
            className="button secondary"
            disabled={voice.state !== "SPEAKING"}
            onClick={() => {
              if (paused) voice.resume();
              else voice.pause();
              setPaused(!paused);
            }}
          >
            {paused ? "▶ Resume" : "Ⅱ Pause"}
          </button>
          <button className="button secondary" onClick={restart}>
            ↺ Restart
          </button>
          <button
            className="button secondary"
            onClick={() => void voice.speak(rhyme.lines[line])}
          >
            Repeat line
          </button>
          <button
            className="button secondary"
            disabled={line === rhyme.lines.length - 1}
            onClick={() => {
              voice.stopSpeaking();
              setLine((i) => i + 1);
            }}
          >
            Next line →
          </button>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-5">
          <label>
            <input
              type="checkbox"
              checked={lineMode}
              onChange={(e) => {
                voice.stopSpeaking();
                setLineMode(e.target.checked);
              }}
            />{" "}
            Line by line
          </label>
          <label>
            <input
              type="checkbox"
              checked={practice}
              onChange={(e) => {
                voice.stopSpeaking();
                setPractice(e.target.checked);
              }}
            />{" "}
            Practice: listen, then repeat
          </label>
        </div>
        {voice.response && (
          <p className="mt-4" aria-live="polite">
            {voice.response}
          </p>
        )}
      </section>
      {practice && <VoiceAssistant voice={voice} />}
    </div>
  );
}
