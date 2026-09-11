import { notFound } from "next/navigation";
import { getLesson } from "@/data/lessons";
import { StructuredLesson } from "@/components/lessons/StructuredLesson";
export default async function Page({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const { lesson } = await params;
  if (!getLesson(lesson)) notFound();
  return <StructuredLesson id={lesson} />;
}
