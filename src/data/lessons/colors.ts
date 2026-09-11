import { factLesson, factStep } from "./factory";
export const colors = factLesson(
  "colors",
  "Colors",
  "🎨",
  "#f6e3df",
  [
    ["red", "#e04343", "An apple can be red."],
    ["blue", "#397bc4", "The sky can look blue."],
    ["yellow", "#f5d64a", "A banana can be yellow."],
    ["green", "#4c9665", "Leaves are often green."],
    ["orange", "#ed8b35", "An orange can be orange."],
    ["purple", "#9555b4", "Grapes can be purple."],
    ["pink", "#ef94b2", "Flowers can be pink."],
    ["brown", "#986445", "Tree trunks can be brown."],
    ["black", "#252525", "A crow can be black."],
    ["white", "#ffffff", "Clouds can be white."],
  ].map(([name, value, fact]) => ({
    ...factStep(
      name,
      name,
      "🎨",
      `This is ${name}. ${fact} Can you find something ${name} around you? Say ${name}.`,
      [name],
    ),
    visual: { kind: "color" as const, value },
  })),
);
