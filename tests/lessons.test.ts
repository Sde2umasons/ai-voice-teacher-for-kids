import { describe, it, expect } from "vitest";
import { alphabet } from "@/data/lessons/alphabet";
import { checkAnswer } from "@/services/lessons/answer-checker";
describe("Alphabet lesson", () => {
  it("has every letter in canonical order", () =>
    expect(alphabet.steps.map((s) => s.title).join("")).toBe(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ));
  it.each(["Apple", "apple!", "It is Apple", "aple", "ay", "A"])(
    "accepts a reasonable first answer: %s",
    (answer) =>
      expect(checkAnswer(answer, alphabet.steps[0].question.answer)).toBe(true),
  );
  it.each(["", "ball", "not apple", "banana", "pineapple"])(
    "does not accept %s for Apple",
    (answer) =>
      expect(checkAnswer(answer, alphabet.steps[0].question.answer)).toBe(
        false,
      ),
  );
  it("accepts letter homophones", () =>
    expect(checkAnswer("bee", alphabet.steps[1].question.answer)).toBe(true));
  it("does not confuse short letters", () =>
    expect(checkAnswer("B", alphabet.steps[0].question.answer)).toBe(false));
});
