import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, readBody, sameOrigin } from "@/lib/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiError("Request not allowed.", 403);
  try {
    const childId = (await cookies()).get("learner")?.value;
    if (!childId) return apiError("Open classroom first.", 401);
    const body = z
      .object({
        id: z.string().uuid(),
        action: z.enum(["start", "tick", "end"]),
      })
      .parse(await readBody(request));
    const result = await prisma.$transaction(async (tx) => {
      let session = await tx.learningSession.findUnique({
        where: { id: body.id },
      });
      if (!session) {
        if (body.action !== "start") throw new Error();
        session = await tx.learningSession.create({
          data: { id: body.id, childId },
        });
      }
      if (session.childId !== childId) throw new Error();
      if (session.endedAt) return session;
      const elapsed = Math.floor(
        (Date.now() - session.startedAt.getTime()) / 1000,
      );
      if (body.action === "tick")
        return tx.learningSession.update({
          where: { id: body.id },
          data: {
            learningSeconds: Math.min(elapsed, session.learningSeconds + 15),
          },
        });
      if (body.action === "end")
        return tx.learningSession.update({
          where: { id: body.id },
          data: { endedAt: new Date() },
        });
      return session;
    });
    return NextResponse.json(result);
  } catch {
    return apiError("Session tracking is resting.", 503);
  }
}
