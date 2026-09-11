import { describe, it, expect } from "vitest";
import { numbers, numberWord } from "@/data/lessons/numbers";
import { lessons } from "@/data/lessons";
import { makeMath } from "@/data/lessons/math";
import { getQuiz, scoreQuiz, quizTypes } from "@/services/lessons/quiz";
import { checkAnswer } from "@/services/lessons/answer-checker";
describe("Structured lessons", () => {
  it("has canonical numbers one through one hundred", () => {
    expect(numbers.steps).toHaveLength(100);
    expect(numbers.steps[9].word).toBe("ten");
    expect(numbers.steps[99].word).toBe("one hundred");
  });
  it.each([
    [21, "twenty one"],
    [40, "forty"],
    [99, "ninety nine"],
  ])("spells %i as %s", (n, word) =>
    expect(numberWord(n as number)).toBe(word),
  );
  it("every structured step has usable answers", () => {
    for (const l of lessons)
      for (const step of l.steps) {
        expect(step.question.answer.accepted.length).toBeGreaterThan(0);
        expect(
          checkAnswer(step.question.answer.accepted[0], step.question.answer),
        ).toBe(true);
      }
  });
  it("adapts mathematics to age", () => {
    expect(makeMath(3).steps[1].question.answer.accepted[0]).toBe("2");
    expect(makeMath(7).steps[1].question.answer.accepted[0]).toBe("10");
  });
  it("does not fuzzily match different multi-digit numbers", () =>
    expect(
      checkAnswer("21", { accepted: ["12", "twelve"], feedback: "" }),
    ).toBe(false));
});
describe("Gentle quiz scoring", () => {
  it.each(quizTypes)("scores complete correct %s quizzes", (type) => {
    const q = getQuiz(type);
    expect(
      scoreQuiz(
        q,
        q.questions.map((x) => x.answer.accepted[0]),
      ),
    ).toBe(q.questions.length);
  });
  it("does not assign negative points", () =>
    expect(scoreQuiz(getQuiz("alphabet"), ["wrong", "wrong", "wrong"])).toBe(
      0,
    ));
  it("scores a mix of correct and incorrect answers", () =>
    expect(scoreQuiz(getQuiz("numbers"), ["three", "two", "four"])).toBe(2));
});
