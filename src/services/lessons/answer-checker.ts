import type { Answer } from "@/types";
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = old;
    }
  }
  return row[b.length];
}
export function checkAnswer(transcript: string, answer: Answer): boolean {
  const text = normalize(transcript);
  if (!text || /\b(not|no|dont)\b/.test(text)) return false;
  const trimmed = text.replace(
    /^(it is|its|this is|the answer is|i think it is|i think|letter|number|a letter) /,
    "",
  );
  return answer.accepted.some((value) => {
    const expected = normalize(value);
    if (text === expected || trimmed === expected) return true;
    if (
      expected.length >= 3 &&
      !/\d/.test(expected) &&
      ` ${trimmed} `.includes(` ${expected} `) &&
      trimmed.split(" ").every(word => expected.split(" ").includes(word) || ["a","an","the","is","it","its","this","letter","number","answer","i","say","said","think"].includes(word))
    )
      return true;
    return (
      expected.length >= 5 &&
      !expected.includes(" ") &&
      trimmed.split(" ").length === 1 &&
      distance(trimmed, expected) <= 1
    );
  });
}
