import type { Quiz } from "@/types";
import { getLesson } from "@/data/lessons";
import { checkAnswer } from "./answer-checker";
export const quizTypes = [
  "alphabet",
  "numbers",
  "colors",
  "shapes",
  "animals",
  "math",
  "mixed",
] as const;
export type QuizType = (typeof quizTypes)[number];
export function getQuiz(type: QuizType, age = 5): Quiz {
  const subjects =
    type === "mixed"
      ? ["alphabet", "numbers", "colors", "shapes", "animals", "math"]
      : [type];
  const questions = subjects.flatMap((id) => {
    const lesson = getLesson(id, age)!;
    if (id === "alphabet")
      return [
        {
          prompt: "What letter comes after B?",
          answer: {
            accepted: ["c", "see", "sea"],
            feedback: "You got it! C comes after B.",
          },
        },
        {
          prompt: "What letter does Apple start with?",
          answer: {
            accepted: ["a", "ay", "aye"],
            feedback: "Excellent! Apple starts with A.",
          },
        },
        {
          prompt: "What letter comes after D?",
          answer: {
            accepted: ["e", "ee"],
            feedback: "Wonderful! E comes after D.",
          },
        },
      ];
    if (id === "numbers")
      return [
        {
          prompt: "What number comes after two?",
          answer: {
            accepted: ["3", "three"],
            feedback: "Yes! Three comes after two.",
          },
        },
        {
          prompt: "How many fingers are on one hand?",
          answer: {
            accepted: ["5", "five"],
            feedback: "Great counting! Five fingers.",
          },
        },
        {
          prompt: "What number comes before five?",
          answer: {
            accepted: ["4", "four", "for"],
            feedback: "Yes! Four comes before five.",
          },
        },
      ];
    if (id === "colors")
      return [
        {
          prompt: "What color is a ripe banana usually?",
          answer: {
            accepted: ["yellow"],
            feedback: "Yes! A ripe banana is usually yellow.",
          },
        },
        {
          prompt: "What color are leaves often?",
          answer: {
            accepted: ["green"],
            feedback: "Wonderful! Leaves are often green.",
          },
        },
      ];
    if (id === "shapes")
      return [
        {
          prompt: "Which shape has three sides?",
          answer: {
            accepted: ["triangle"],
            feedback: "A triangle has three sides. Excellent!",
          },
        },
        {
          prompt: "Which shape is round with no corners?",
          answer: { accepted: ["circle"], feedback: "Yes! A circle is round." },
        },
      ];
    if (id === "animals")
      return [
        {
          prompt: "Which animal says woof?",
          answer: { accepted: ["dog"], feedback: "Yes! A dog says woof." },
        },
        {
          prompt: "Which animal has a long trunk?",
          answer: {
            accepted: ["elephant"],
            feedback: "Excellent! An elephant has a trunk.",
          },
        },
      ];
    return lesson.steps
      .slice(1, 4)
      .map((s) => ({ prompt: s.introduction, answer: s.question.answer }));
  });
  return {
    id: type,
    title:
      type === "mixed"
        ? "Mixed discoveries"
        : type === "alphabet"
          ? "ABC quiz"
          : type[0].toUpperCase() + type.slice(1) + " quiz",
    questions: questions.slice(0, 6),
  };
}
export function scoreQuiz(quiz: Quiz, answers: string[]) {
  return quiz.questions.reduce(
    (total, q, i) => total + (checkAnswer(answers[i] ?? "", q.answer) ? 1 : 0),
    0,
  );
}
