import { alphabet } from "@/data/lessons/alphabet";
import { LessonPlayer } from "@/components/lessons/LessonPlayer";
export default function Page() {
  return <LessonPlayer lesson={alphabet} />;
}
