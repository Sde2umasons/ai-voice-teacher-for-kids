import { factLesson, factStep } from "./factory";
export const fruits = factLesson(
  "fruits",
  "Fruits & Vegetables",
  "🍎",
  "#ebedde",
  [
    ["apple", "🍎", "Apples grow on trees."],
    ["banana", "🍌", "We peel a banana before eating it."],
    ["orange", "🍊", "Oranges have juicy segments inside."],
    ["grapes", "🍇", "Grapes grow in bunches."],
    ["strawberry", "🍓", "Strawberries have tiny seeds on the outside."],
    ["carrot", "🥕", "The part of a carrot we eat grows under the ground."],
    ["broccoli", "🥦", "Broccoli looks like a tiny tree."],
    ["corn", "🌽", "Corn has many little kernels."],
  ].map(([name, emoji, fact]) =>
    factStep(
      name,
      name,
      emoji,
      `This is ${name}. ${fact} Can you say ${name}?`,
      [name],
    ),
  ),
);
