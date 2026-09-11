import { factLesson, factStep } from "./factory";
export const animalFacts = [
  {
    name: "dog",
    emoji: "🐶",
    sound: "woof",
    fact: "Dogs have a strong sense of smell.",
  },
  {
    name: "cat",
    emoji: "🐱",
    sound: "meow",
    fact: "Cats use whiskers to sense things nearby.",
  },
  { name: "cow", emoji: "🐮", sound: "moo", fact: "Cows eat grass." },
  {
    name: "duck",
    emoji: "🦆",
    sound: "quack",
    fact: "Ducks have webbed feet for swimming.",
  },
  {
    name: "lion",
    emoji: "🦁",
    sound: "roar",
    fact: "Lions live in groups called prides.",
  },
  {
    name: "elephant",
    emoji: "🐘",
    sound: "trumpet",
    fact: "Elephants use their trunks to pick up food.",
  },
  {
    name: "sheep",
    emoji: "🐑",
    sound: "baa",
    fact: "Sheep have woolly coats.",
  },
  {
    name: "pig",
    emoji: "🐷",
    sound: "oink",
    fact: "Pigs use mud to help cool down.",
  },
];
export const animals = factLesson(
  "animals",
  "Animals",
  "🐶",
  "#f7edd6",
  animalFacts.map((a) =>
    factStep(
      a.name,
      a.name,
      a.emoji,
      `This is a ${a.name}. A ${a.name} can ${a.sound}! ${a.fact} What animal is this?`,
      [a.name],
    ),
  ),
);
