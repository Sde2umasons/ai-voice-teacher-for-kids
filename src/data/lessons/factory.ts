import type { Lesson, LessonStep } from "@/types";
export function factStep(
  id: string,
  title: string,
  emoji: string,
  introduction: string,
  accepted: string[],
  feedback?: string,
): LessonStep {
  return {
    id,
    title,
    word: title,
    emoji,
    introduction,
    question: {
      prompt: `Can you say ${title}?`,
      answer: {
        accepted,
        feedback: feedback ?? `Excellent! You said ${title}!`,
      },
    },
    encouragement: `Almost! Let's try once more. Say ${title}.`,
  };
}
export function factLesson(
  id: string,
  title: string,
  emoji: string,
  color: string,
  steps: LessonStep[],
): Lesson {
  return { id, title, emoji, color, description: title, steps };
}
