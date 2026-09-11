export type VoiceState =
  "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "ERROR";
export interface Answer {
  accepted: string[];
  feedback: string;
}
export interface Question {
  prompt: string;
  answer: Answer;
}
export interface LessonStep {
  id: string;
  title: string;
  word?: string;
  emoji: string;
  introduction: string;
  explanation?: string;
  example?: string;
  pronunciation?: string;
  question: Question;
  encouragement: string;
  visual?: { kind: "color" | "shape" | "count"; value: string };
}
export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  steps: LessonStep[];
}
export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}
export interface LearningProgress {
  lessonId: string;
  currentStep: number;
  completedSteps: string;
  completed: boolean;
}
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  preferredLanguage: string;
  avatar: string;
  stars: number;
  createdAt: string;
}
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
export interface Settings {
  voice: boolean;
  speed: number;
  language: "en" | "hi";
  age: number;
  autoNext: boolean;
  soundEffects: boolean;
  largeText: boolean;
}
export interface TeacherCommand {
  id: string;
  childId: string;
  type:
    | "START_LESSON"
    | "PAUSE_LESSON"
    | "CHANGE_LESSON"
    | "REPEAT"
    | "SPEAK_MESSAGE"
    | "ASK_QUESTION"
    | "GIVE_STAR"
    | "END_SESSION";
  lessonId?: string;
  message?: string;
}
