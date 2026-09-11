import { factLesson, factStep } from "./factory";
export const shapes = factLesson(
  "shapes",
  "Shapes",
  "🔷",
  "#e4eaf4",
  [
    ["circle", "A circle is round, with no corners."],
    ["square", "A square has four equal sides and four corners."],
    ["triangle", "A triangle has three sides and three corners."],
    [
      "rectangle",
      "A rectangle has four sides and four square corners. Opposite sides are equal.",
    ],
    ["star", "This star has five points."],
    ["oval", "An oval is round and stretched, like an egg."],
  ].map(([name, fact]) => ({
    ...factStep(name, name, "🔷", `${fact} Can you say ${name}?`, [name]),
    visual: { kind: "shape" as const, value: name },
  })),
);
