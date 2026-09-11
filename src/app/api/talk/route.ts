import { NextResponse } from "next/server";
import { z } from "zod";
import { DemoAI } from "@/services/ai/demo";
import { OpenAIService } from "@/services/ai/openai";
import { converse } from "@/services/ai/conversation";
import { apiError, readBody, sameOrigin } from "@/lib/http";
const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(500),
      }),
    )
    .min(1)
    .max(8),
  age: z.number().int().min(3).max(8),
});
const requests = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiError("Request not allowed.", 403);
  try {
    const body = schema.safeParse(await readBody(request));
    if (!body.success || body.data.messages.at(-1)?.role !== "user")
      return apiError("Please send a short question.");
    const id = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
    const now = Date.now();
    for (const [key, value] of requests)
      if (value.until < now) requests.delete(key);
    const rate = requests.get(id) ?? { count: 0, until: now + 60000 };
    if (rate.count >= 15)
      return apiError(
        "Let's take a little breath. Try again in a minute.",
        429,
      );
    rate.count++;
    requests.set(id, rate);
    const provider = process.env.AI_PROVIDER ?? "demo";
    if (provider !== "demo" && provider !== "openai")
      return apiError(
        "The teacher needs a grown-up to check the AI settings.",
        503,
      );
    if (provider === "openai" && !process.env.OPENAI_API_KEY)
      return apiError(
        "The teacher needs a grown-up to connect the AI key. Your lessons still work!",
        503,
      );
    const service =
      provider === "openai"
        ? new OpenAIService(
            process.env.OPENAI_API_KEY!,
            process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
          )
        : new DemoAI();
    return NextResponse.json({
      text: await converse(service, body.data.messages, body.data.age),
      mode: provider,
    });
  } catch {
    return apiError(
      "My thinking connection is resting. Please try again soon!",
      503,
    );
  }
}
export async function GET() {
  return NextResponse.json({
    mode: process.env.AI_PROVIDER ?? "demo",
    configured:
      process.env.AI_PROVIDER === "openai"
        ? !!process.env.OPENAI_API_KEY
        : true,
  });
}
