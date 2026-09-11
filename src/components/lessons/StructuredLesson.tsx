"use client";
import { useLearning } from "@/components/common/LearningProvider";
import { getLesson } from "@/data/lessons";
import { LessonPlayer } from "./LessonPlayer";
export function StructuredLesson({ id }: { id: string }) {
  const { profile } = useLearning();
  const lesson = getLesson(id, profile?.age ?? 5);
  return lesson ? <LessonPlayer key={id} lesson={lesson} /> : null;
}
