import { NextResponse } from "next/server";
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return (
      new URL(origin).host ===
      (request.headers.get("host") ?? new URL(request.url).host)
    );
  } catch {
    return false;
  }
}
export async function readBody(request: Request) {
  const text = await request.text();
  if (text.length > 12000) throw new Error("Body too large");
  return JSON.parse(text) as unknown;
}
export function apiError(
  message = "Something went quiet. Please try again!",
  status = 400,
) {
  return NextResponse.json({ error: message }, { status });
}
