"use client";
import { useLearning } from "@/components/common/LearningProvider";
import Link from "next/link";
import { getLesson } from "@/data/lessons";
export default function Page() {
  const { profile } = useLearning();
  return (
    <>
      <h1 className="text-3xl font-bold">My learning garden 🌱</h1>
      <p className="mt-3 text-[#708074]">Every little step helps you grow.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <section className="panel">
          <p className="text-5xl">⭐</p>
          <h2 className="mt-4 text-3xl font-bold">
            {profile?.stars ?? 0} stars
          </h2>
          <p>For your wonderful practice.</p>
        </section>
        <section className="panel md:col-span-2">
          <h2 className="text-xl font-bold">Your discoveries</h2>
          {profile?.progress.length ? (
            profile.progress.map((p) => {
              const completed = JSON.parse(p.completedSteps).length;
              const total =
                getLesson(p.lessonId, profile.age)?.steps.length ?? 1;
              return (
                <div className="mt-4" key={p.lessonId}>
                  <div className="mb-2 flex justify-between">
                    <Link
                      href={"/learn/" + p.lessonId}
                      className="capitalize underline"
                    >
                      {p.lessonId}
                    </Link>
                    <span>
                      {completed}/{total}
                    </span>
                  </div>
                  <progress
                    className="h-4 w-full accent-[#286652]"
                    value={completed}
                    max={total}
                  />
                </div>
              );
            })
          ) : (
            <p className="mt-4">
              Your first adventure is waiting.{" "}
              <Link className="underline" href="/learn/alphabet">
                Start with ABC →
              </Link>
            </p>
          )}
        </section>
      </div>
      <section className="panel mt-5">
        <h2 className="text-xl font-bold">Achievement badges 🏆</h2>
        {profile?.achievements.length ? (
          profile.achievements.map((a) => (
            <p className="mt-3" key={a.name}>
              🏅 {a.name}
            </p>
          ))
        ) : (
          <p className="mt-3">
            Practice all 26 letters to become an ABC Explorer!
          </p>
        )}
      </section>
      <section className="panel mt-5">
        <h2 className="text-xl font-bold">Recent adventures</h2>
        {profile?.activities.map((a) => (
          <p key={a.id} className="mt-3 border-b border-[#edf0e8] pb-3">
            🌼 {a.description}
          </p>
        ))}
      </section>
    </>
  );
}
