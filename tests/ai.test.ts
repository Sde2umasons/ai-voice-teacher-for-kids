import { describe, it, expect, vi, afterEach } from "vitest";
import { DemoAI } from "@/services/ai/demo";
import { converse } from "@/services/ai/conversation";
import { OpenAIService } from "@/services/ai/openai";
import { POST } from "@/app/api/talk/route";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("AI safety and failures", () => {
  it("keeps private data away from the provider", async () => {
    const reply = vi.fn();
    const result = await converse(
      { reply },
      [{ role: "user", content: "My email is kid@example.com" }],
      5,
    );
    expect(result).toContain("private");
    expect(reply).not.toHaveBeenCalled();
  });
  it("provides a useful labeled-demo answer", async () =>
    expect(
      await new DemoAI().reply([
        { role: "user", content: "Why is the sky blue?" },
      ]),
    ).toContain("blue light"));
  it("surfaces upstream failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 500 })),
    );
    await expect(
      new OpenAIService("test", "test").reply(
        [{ role: "user", content: "Hello" }],
        5,
      ),
    ).rejects.toThrow("unavailable");
  });
  it("rejects invalid API input", async () => {
    const r = await POST(
      new Request("http://localhost/api/talk", {
        method: "POST",
        body: JSON.stringify({ messages: [] }),
      }),
    );
    expect(r.status).toBe(400);
  });
  it("rejects cross-origin mutations", async () => {
    const r = await POST(
      new Request("http://localhost/api/talk", {
        method: "POST",
        headers: { origin: "https://other.example" },
        body: "{}",
      }),
    );
    expect(r.status).toBe(403);
  });
  it("reports missing OpenAI configuration honestly", async () => {
    vi.stubEnv("AI_PROVIDER", "openai");
    vi.stubEnv("OPENAI_API_KEY", "");
    const r = await POST(
      new Request("http://localhost/api/talk", {
        method: "POST",
        body: JSON.stringify({
          age: 5,
          messages: [{ role: "user", content: "Hello" }],
        }),
      }),
    );
    expect(r.status).toBe(503);
    expect((await r.json()).error).toContain("key");
  });
});
