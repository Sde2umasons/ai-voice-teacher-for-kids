"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ChildProfile, LearningProgress, Settings } from "@/types";
export interface Profile extends ChildProfile {
  progress: LearningProgress[];
  achievements: { name: string }[];
  quizzes: {
    id: string;
    quizType: string;
    correctAnswers: number;
    totalQuestions: number;
  }[];
  activities: { id: string; description: string; createdAt: string }[];
  sessions: { id: string; learningSeconds: number; startedAt: string }[];
}
const defaults: Settings = {
  voice: true,
  speed: 0.85,
  language: "en",
  age: 5,
  autoNext: true,
  soundEffects: true,
  largeText: false,
};
const Context = createContext<{
  profile: Profile | null;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  refresh: () => Promise<void>;
  error: string;
}>({
  profile: null,
  settings: defaults,
  setSettings: () => {},
  refresh: async () => {},
  error: "",
});
let inFlight: Promise<Profile> | null = null;
function fetchProfile() {
  if (!inFlight)
    inFlight = fetch("/api/profile")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<Profile>;
      })
      .finally(() => {
        inFlight = null;
      });
  return inFlight;
}
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, updateSettings] = useState(defaults);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      setProfile(await fetchProfile());
      setError("");
    } catch {
      setError("Progress could not connect. You can still practice.");
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
      try {
        const stored = localStorage.getItem("learning-settings");
        if (stored) updateSettings({ ...defaults, ...JSON.parse(stored) });
      } catch {}
    });
  }, [refresh]);
  const setSettings = (value: Settings) => {
    updateSettings(value);
    try {
      localStorage.setItem("learning-settings", JSON.stringify(value));
    } catch {}
  };
  return (
    <Context.Provider
      value={{ profile, settings, setSettings, refresh, error }}
    >
      <div className={settings.largeText ? "large-text" : ""}>{children}</div>
    </Context.Provider>
  );
}
export const useLearning = () => useContext(Context);
