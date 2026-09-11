import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, readBody, sameOrigin } from "@/lib/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiError("Request not allowed.", 403);
  try {
    const childId = (await cookies()).get("learner")?.value;
    if (!childId) return apiError("Open your classroom first.", 401);
    const { commandId } = z
      .object({ commandId: z.string().uuid() })
      .parse(await readBody(request));
    await prisma.$transaction(async (tx) => {
      const existing = await tx.activity.findUnique({
        where: { id: commandId },
      });
      if (existing) return;
      await tx.activity.create({
        data: {
          id: commandId,
          childId,
          description: "A teacher gave an encouragement star",
        },
      });
      await tx.childProfile.update({
        where: { id: childId },
        data: { stars: { increment: 1 } },
      });
    });
    return NextResponse.json({ ok: true });
  } catch {
    return apiError("Could not save the star.", 503);
  }
}
