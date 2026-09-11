import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getProfile, snapshot } from "@/services/progress/repository";
import { apiError, readBody, sameOrigin } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
export async function GET() {
  try {
    const jar = await cookies();
    const profile = await getProfile(jar.get("learner")?.value);
    jar.set("learner", profile.id, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 31536000,
    });
    return NextResponse.json(await snapshot(profile.id));
  } catch {
    return apiError("Progress is resting. Please try again.", 503);
  }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return apiError("Request not allowed.", 403);
  try {
    const id = (await cookies()).get("learner")?.value;
    if (!id) return apiError("Open the home page first.", 401);
    const body = z
      .object({
        name: z.string().trim().min(1).max(30),
        age: z.number().int().min(3).max(8),
      })
      .parse(await readBody(request));
    return NextResponse.json(
      await prisma.childProfile.update({ where: { id }, data: body }),
    );
  } catch {
    return apiError("Please check your nickname and age.");
  }
}
