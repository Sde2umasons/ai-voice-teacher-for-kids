"use client";
import { useState } from "react";
import { useLearning } from "@/components/common/LearningProvider";
export default function Page() {
  const { settings, setSettings, profile, refresh } = useLearning();
  const [message, setMessage] = useState("");
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Make yourself at home ⚙️</h1>
      <p className="mt-3 text-[#708074]">
        A grown-up can help choose what feels right.
      </p>
      <section className="panel mt-6 space-y-6">
        {(["voice", "autoNext", "soundEffects", "largeText"] as const).map(
          (key) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4 text-lg"
            >
              <span>
                {
                  {
                    voice: "Teacher voice",
                    autoNext: "Move to the next step automatically",
                    soundEffects: "Celebration sounds",
                    largeText: "Larger text",
                  }[key]
                }
              </span>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.checked })
                }
                className="h-6 w-6 accent-[#286652]"
              />
            </label>
          ),
        )}
        <label className="block text-lg">
          Speech speed: {settings.speed.toFixed(2)}
          <input
            className="mt-3 block w-full accent-[#286652]"
            type="range"
            min=".6"
            max="1.2"
            step=".05"
            value={settings.speed}
            onChange={(e) =>
              setSettings({ ...settings, speed: Number(e.target.value) })
            }
          />
        </label>
        <label className="block text-lg">
          Language
          <select
            value={settings.language}
            onChange={() => {}}
            className="mt-2 block w-full rounded-xl border p-3"
          >
            <option value="en">English</option>
            <option disabled value="hi">
              Hindi — coming later
            </option>
          </select>
        </label>
      </section>
      <form
        className="panel mt-5 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          try {
            const r = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: data.get("name"),
                age: Number(data.get("age")),
              }),
            });
            if (!r.ok) throw new Error();
            await refresh();
            setMessage("Your profile is saved!");
          } catch {
            setMessage("Could not save. Please try again.");
          }
        }}
      >
        <h2 className="text-xl font-bold">Little explorer profile</h2>
        <label className="block">
          Nickname (no full name needed)
          <input
            key={profile?.name}
            name="name"
            defaultValue={profile?.name ?? "Explorer"}
            maxLength={30}
            required
            className="mt-2 block w-full rounded-xl border p-3"
          />
        </label>
        <label className="block">
          Age group
          <select
            key={profile?.age}
            name="age"
            defaultValue={profile?.age ?? 5}
            className="mt-2 block w-full rounded-xl border p-3"
          >
            <option value={3}>3–4</option>
            <option value={5}>5–6</option>
            <option value={7}>7–8</option>
          </select>
        </label>
        <button className="button">Save profile</button>
        <p role="status">{message}</p>
      </form>
    </div>
  );
}
