import { factLesson, factStep } from "./factory";
import { numberWord } from "./numbers";
export function makeMath(age = 5) {
  const a = age <= 4 ? 1 : age <= 6 ? 2 : 7,
    b = age <= 4 ? 1 : age <= 6 ? 1 : 3;
  return factLesson(
    "math",
    "Mathematics",
    "➕",
    "#e8e3f1",
    [
      {
        ...factStep(
          "count",
          "Count",
          "🍎",
          `Let's count ${a + b} apples. How many apples are here?`,
          [String(a + b), numberWord(a + b)],
          `Great counting! There are ${a + b} apples.`,
        ),
        visual: { kind: "count" as const, value: String(a + b) },
      },
      factStep(
        "addition",
        `${a} + ${b}`,
        "🍎",
        `You have ${a} apples. I give you ${b} more. How many apples do you have now?`,
        [String(a + b), numberWord(a + b)],
        `You got it! ${a} plus ${b} is ${a + b}.`,
      ),
      factStep(
        "subtraction",
        `${a + b} − ${b}`,
        "🍎",
        `You have ${a + b} apples. You eat ${b}. How many are left?`,
        [String(a), numberWord(a)],
        `Wonderful! ${a + b} minus ${b} is ${a}.`,
      ),
      factStep(
        "greater",
        "Which is greater?",
        "⚖️",
        `Which number is greater: ${a} or ${a + b}?`,
        [String(a + b), numberWord(a + b)],
        `Yes! ${a + b} is greater than ${a}.`,
      ),
      factStep(
        "smaller",
        "Which is smaller?",
        "⚖️",
        `Which number is smaller: ${a} or ${a + b}?`,
        [String(a), numberWord(a)],
        `Yes! ${a} is smaller than ${a + b}.`,
      ),
      factStep(
        "recognition",
        String(a + b),
        "🔢",
        `What number do you see?`,
        [String(a + b), numberWord(a + b)],
        `Wonderful! This is ${a + b}.`,
      ),
    ].map((step) => ({
      ...step,
      encouragement: `Almost! Let's try once more. The answer is ${step.question.answer.accepted[0]}. Can you say it?`,
    })),
  );
}
export const math = makeMath();
