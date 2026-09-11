import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAnswer } from "@/services/progress/repository";
import { apiError, readBody, sameOrigin } from "@/lib/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiError("Request not allowed.", 403);
  try {
    const id = (await cookies()).get("learner")?.value;
    if (!id) return apiError("Please open the home page first.", 401);
    const body = z
      .object({
        lessonId: z.string().max(30),
        step: z.number().int().min(0).max(99),
        answer: z.string().max(500),
      })
      .parse(await readBody(request));
    return NextResponse.json(
      await recordAnswer(id, body.lessonId, body.step, body.answer),
    );
  } catch {
    return apiError("Your progress could not be saved. Please try again.", 503);
  }
}
