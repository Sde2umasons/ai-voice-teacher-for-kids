import type { Lesson } from "@/types";
const small = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const tens = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];
export function numberWord(n: number): string {
  if (n === 100) return "one hundred";
  if (n < 20) return small[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + small[n % 10] : "");
}
export function makeNumbers(limit = 10): Lesson {
  return {
    id: "numbers",
    title: "Learn Numbers",
    emoji: "🔢",
    description: "Every number counts",
    color: "#e4eee3",
    steps: Array.from({ length: limit }, (_, i) => {
      const n = i + 1,
        word = numberWord(n);
      return {
        id: String(n),
        title: String(n),
        word,
        emoji: "🔢",
        visual:
          n <= 10 ? { kind: "count" as const, value: String(n) } : undefined,
        introduction: `This is number ${word}: ${n}. ${n <= 10 ? "Let's count together. " + Array.from({ length: n }, (_, j) => numberWord(j + 1)).join(", ") + "." : ""} Can you say ${word}?`,
        question: {
          prompt:
            n <= 10 ? "How many circles do you see?" : `What is this number?`,
          answer: {
            accepted: [
              String(n),
              word,
              ...(n === 2
                ? ["to", "too"]
                : n === 4
                  ? ["for"]
                  : n === 8
                    ? ["ate"]
                    : []),
            ],
            feedback: `Wonderful! This is number ${word}.`,
          },
        },
        encouragement: `Almost! Let's count again. This is ${word}. Can you say ${word}?`,
      };
    }),
  };
}
export const numbers = makeNumbers(100);
