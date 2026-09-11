"use client";
import { useState } from "react";
import { stories } from "@/data/lessons/stories";
import { useLearning } from "@/components/common/LearningProvider";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { TeacherAvatar } from "@/components/child/TeacherAvatar";
import { checkAnswer } from "@/services/lessons/answer-checker";
export function StoryPlayer() {
  const { settings } = useLearning();
  const [storyIndex, setStoryIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const story = stories[storyIndex],
    page = story.pages[pageIndex];
  const voice = useVoiceAssistant((text) => {
    const correct =
      !page.accepted.length ||
      checkAnswer(text, { accepted: page.accepted, feedback: "" });
    return {
      text: correct
        ? page.accepted.length
          ? "Wonderful listening!"
          : "Thank you for sharing your idea! Stories help our imaginations grow."
        : `Good try! Let's remember: ${page.accepted[0]}. Listen once more if you like.`,
    };
  }, settings);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">A little story time 📖</h1>
      <div className="my-5 flex flex-wrap gap-3">
        {stories.map((s, i) => (
          <button
            key={s.id}
            className={`button ${i === storyIndex ? "" : "secondary"}`}
            onClick={() => {
              voice.stopSpeaking();
              setStoryIndex(i);
              setPageIndex(0);
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <section className="panel text-center">
        <p className="text-sm text-[#778476]">
          With {story.characters.join(" and ")} · Page {pageIndex + 1} of{" "}
          {story.pages.length}
        </p>
        <h2 className="mt-4 text-2xl font-bold">{story.title}</h2>
        <p className="my-6 text-8xl">{page.emoji}</p>
        <p className="text-2xl leading-relaxed">{page.narration}</p>
        <p className="mt-5 rounded-xl bg-[#edf3e9] p-4 text-xl font-bold">
          {page.question}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            className="button secondary"
            disabled={pageIndex === 0}
            onClick={() => {
              voice.stopSpeaking();
              setPageIndex((i) => i - 1);
            }}
          >
            ← Previous
          </button>
          <button
            className="button"
            onClick={() =>
              void voice.speak(page.narration + " " + page.question)
            }
          >
            🔊 Read to me
          </button>
          <button
            className="button secondary"
            disabled={pageIndex === story.pages.length - 1}
            onClick={() => {
              voice.stopSpeaking();
              setPageIndex((i) => i + 1);
            }}
          >
            Next page →
          </button>
        </div>
      </section>
      <div className="mt-6 flex items-center gap-4">
        <div className="scale-75">
          <TeacherAvatar state={voice.state} />
        </div>
        <p className="flex-1 text-xl" aria-live="polite">
          {voice.response || "What do you think, little storyteller?"}
        </p>
      </div>
      <VoiceAssistant voice={voice} />
    </div>
  );
}
