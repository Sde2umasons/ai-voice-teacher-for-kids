import "server-only";
import { prisma } from "@/lib/prisma";
import { getLesson } from "@/data/lessons";
import { checkAnswer } from "@/services/lessons/answer-checker";
export async function getProfile(id?: string) {
  if (id) {
    const existing = await prisma.childProfile.findUnique({ where: { id } });
    if (existing) return existing;
  }
  return prisma.childProfile.create({ data: {} });
}
export async function snapshot(id: string) {
  return prisma.childProfile.findUnique({
    where: { id },
    include: {
      progress: true,
      achievements: true,
      quizzes: { orderBy: { createdAt: "desc" }, take: 20 },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
      sessions: { orderBy: { startedAt: "desc" }, take: 10 },
    },
  });
}
export async function recordAnswer(
  childId: string,
  lessonId: string,
  stepIndex: number,
  answer: string,
) {
  const child = await prisma.childProfile.findUniqueOrThrow({
    where: { id: childId },
  });
  const lesson = getLesson(lessonId, child.age);
  if (!lesson || !lesson.steps[stepIndex])
    throw new Error("Unknown lesson step");
  const correct = checkAnswer(answer, lesson.steps[stepIndex].question.answer);
  return prisma.$transaction(async (tx) => {
    await tx.lesson.upsert({
      where: { id: lessonId },
      create: { id: lessonId, title: lesson.title },
      update: {},
    });
    const prior = await tx.lessonProgress.findUnique({
      where: { childId_lessonId: { childId, lessonId } },
    });
    const completed = JSON.parse(prior?.completedSteps ?? "[]") as number[];
    const earned = correct && !completed.includes(stepIndex);
    if (earned) completed.push(stepIndex);
    const progress = await tx.lessonProgress.upsert({
      where: { childId_lessonId: { childId, lessonId } },
      create: {
        childId,
        lessonId,
        currentStep: correct
          ? Math.min(stepIndex + 1, lesson.steps.length - 1)
          : stepIndex,
        completedSteps: JSON.stringify(completed),
      },
      update: {
        currentStep: correct
          ? Math.min(stepIndex + 1, lesson.steps.length - 1)
          : stepIndex,
        completedSteps: JSON.stringify(completed),
        completed: completed.length === lesson.steps.length,
      },
    });
    if (earned) {
      await tx.childProfile.update({
        where: { id: childId },
        data: { stars: { increment: 1 } },
      });
      await tx.activity.create({
        data: {
          childId,
          description: `Practiced ${lesson.title}: ${lesson.steps[stepIndex].title}`,
        },
      });
    }
    const badge: Record<string, string> = {
      alphabet: "ABC Explorer",
      numbers: "Number Star",
      colors: "Color Champion",
      animals: "Animal Expert",
      math: "Math Beginner",
      shapes: "Shape Spotter",
      fruits: "Garden Explorer",
    };
    if (completed.length === lesson.steps.length)
      await tx.achievement.upsert({
        where: {
          childId_name: {
            childId,
            name: badge[lessonId] ?? "Learning Explorer",
          },
        },
        create: { childId, name: badge[lessonId] ?? "Learning Explorer" },
        update: {},
      });
    return { correct, earned, progress };
  });
}
