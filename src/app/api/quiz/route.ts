import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, readBody, sameOrigin } from "@/lib/http";
import { getQuiz, quizTypes, scoreQuiz } from "@/services/lessons/quiz";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiError("Request not allowed.", 403);
  try {
    const childId = (await cookies()).get("learner")?.value;
    if (!childId) return apiError("Open your classroom first.", 401);
    const child = await prisma.childProfile.findUniqueOrThrow({
      where: { id: childId },
    });
    const body = z
      .object({
        attemptId: z.string().uuid(),
        type: z.enum(quizTypes),
        answers: z.array(z.string().max(500)).max(6),
      })
      .parse(await readBody(request));
    const quiz = getQuiz(body.type, child.age);
    if (body.answers.length !== quiz.questions.length)
      return apiError("Finish your quiz first.");
    const score = scoreQuiz(quiz, body.answers);
    const attempt = await prisma.$transaction(async (tx) => {
      const existing = await tx.quizAttempt.findUnique({
        where: { id: body.attemptId },
      });
      if (existing) {
        if (existing.childId !== childId) throw new Error();
        return existing;
      }
      const result = await tx.quizAttempt.create({
        data: {
          id: body.attemptId,
          childId,
          quizType: body.type,
          correctAnswers: score,
          totalQuestions: quiz.questions.length,
        },
      });
      await tx.childProfile.update({
        where: { id: childId },
        data: { stars: { increment: score } },
      });
      await tx.activity.create({
        data: {
          childId,
          description: `Finished ${quiz.title}: ${score} stars`,
        },
      });
      return result;
    });
    return NextResponse.json(attempt);
  } catch {
    return apiError("Your quiz could not be saved. Try saving again.", 503);
  }
}
