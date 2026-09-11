"use client";
import Link from "next/link";
import { TeacherAvatar } from "./TeacherAvatar";
import { useLearning } from "@/components/common/LearningProvider";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { useRouter } from "next/navigation";
const cards = [
  ["alphabet", "🔤", "Learn ABC", "Meet your letter friends", "#f4e9d9"],
  ["numbers", "🔢", "Numbers", "Every number counts", "#e4eee3"],
  ["colors", "🎨", "Colors", "A world of wonderful colors", "#f6e3df"],
  ["shapes", "🔷", "Shapes", "Discover shapes around you", "#e4eaf4"],
  ["animals", "🐶", "Animals", "Meet some furry friends", "#f7edd6"],
  ["fruits", "🍎", "Fruits & veggies", "A tasty little adventure", "#ebedde"],
  ["math", "➕", "Mathematics", "Little problems, big smiles", "#e8e3f1"],
  ["rhymes", "🎵", "Rhymes & poems", "Learn a line, sing a smile", "#f5e2e8"],
  ["stories", "📖", "Story time", "Turn a page of imagination", "#e2ecef"],
];
export function ChildHome() {
  const { profile, settings } = useLearning();
  const router = useRouter();
  const voice = useVoiceAssistant((text) => {
    const lower = text.toLowerCase();
    const match = cards.find(
      ([id, , title]) =>
        lower.includes(id) ||
        lower.includes(title.toLowerCase()) ||
        (id === "alphabet" && /abc|letters/.test(lower)),
    );
    if (match)
      return {
        text: `Let's explore ${match[2]}!`,
        afterSpeak: () => router.push("/learn/" + match[0]),
      };
    return {
      text: "Let's talk with Mia!",
      afterSpeak: () => router.push("/talk"),
    };
  }, settings);
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#7b8d73]">
            YOUR LITTLE LEARNING WORLD
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Hello, {profile?.name ?? "Explorer"}! <span>👋</span>
          </h1>
          <p className="mt-2 text-[#708074]">
            A little curiosity. A whole lot of discovery.
          </p>
        </div>
        <span className="rounded-full border border-[#dbe4d4] bg-[#f1f4e9] px-4 py-2 text-sm">
          🌼 A lovely day to learn
        </span>
      </div>
      <section className="relative flex flex-col items-center gap-7 overflow-hidden rounded-[30px] border border-[#dce6d2] bg-[#edf2e3] px-8 py-8 md:flex-row md:px-12">
        <div
          className="absolute right-8 top-3 text-6xl opacity-40"
          aria-hidden="true"
        >
          ☀
        </div>
        <div className="rounded-full bg-[#e0e8cf] px-6 pt-5">
          <TeacherAvatar state={voice.state} />
        </div>
        <div className="relative flex-1 text-center md:text-left">
          <p className="mb-2 text-sm font-bold tracking-widest text-[#5e795b]">
            MEET MIA · YOUR AI LEARNING BUDDY
          </p>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">
            Small steps.
            <br />
            Wonderful discoveries.
          </h2>
          <p className="mt-3 max-w-lg text-lg text-[#60725e]">
            {voice.response ||
              "I'm here to learn, laugh, and explore with you. What would you like to learn today?"}
          </p>
          <button
            className="button mt-5"
            onClick={() => {
              void voice.speak(
                "Hello! I am Mia, your AI learning buddy. What would you like to learn today?",
              );
            }}
          >
            🔊 Say hello to Mia
          </button>
        </div>
        <span className="hidden -rotate-6 rounded-2xl border-2 border-dashed border-[#bacda5] p-5 text-center text-[#647657] lg:block">
          A little practice
          <br />
          <strong className="text-xl">every day 🌱</strong>
        </span>
      </section>
      <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_285px]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">What shall we learn?</h2>
            <span className="text-sm text-[#7b8678]">
              Pick your adventure ↓
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {cards.map(([id, emoji, title, description, color]) => (
              <Link
                href={"/learn/" + id}
                key={id}
                className="group rounded-[22px] border border-black/5 p-5 transition hover:-translate-y-1 hover:shadow-md"
                style={{ background: color }}
              >
                <span className="mb-4 block text-4xl">{emoji}</span>
                <h3 className="text-lg font-bold">
                  {title}
                  <span className="float-right text-[#869185]">↗</span>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#6c776b]">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="panel bg-[#fff9e9]!">
            <span className="text-3xl">🌟</span>
            <h2 className="mt-3 text-xl font-bold">Look at you grow!</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#7d7e69]">
              Every little try is a big step. Your next discovery is waiting.
            </p>
            <Link
              className="mt-5 block font-bold text-[#8b6c35]"
              href="/progress"
            >
              My learning journey →
            </Link>
          </div>
          <Link href="/talk" className="panel block bg-[#e7efeb]!">
            <span className="text-3xl">💬</span>
            <h2 className="mt-3 text-xl font-bold">Talk to Teacher</h2>
            <p className="mt-2 text-sm text-[#667a70]">
              Big questions are welcome here.
            </p>
            <span className="mt-4 block font-bold">Let’s chat →</span>
          </Link>
          <Link href="/quiz" className="panel block bg-[#eee9f5]!">
            <span className="text-3xl">🧠</span>
            <h2 className="mt-3 text-xl font-bold">Quiz time</h2>
            <p className="mt-2 text-sm text-[#756d83]">
              Show what you know. Earn a star!
            </p>
          </Link>
        </aside>
      </div>
      <VoiceAssistant voice={voice} />
    </>
  );
}
