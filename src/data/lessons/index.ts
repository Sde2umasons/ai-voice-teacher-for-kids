import { alphabet } from "./alphabet";
import { numbers } from "./numbers";
import { colors } from "./colors";
import { shapes } from "./shapes";
import { animals } from "./animals";
import { fruits } from "./fruits";
import { makeMath } from "./math";
export const lessons = [
  alphabet,
  numbers,
  colors,
  shapes,
  animals,
  fruits,
  makeMath(),
];
export function getLesson(id: string, age = 5) {
  return id === "math"
    ? makeMath(age)
    : lessons.find((lesson) => lesson.id === id);
}
