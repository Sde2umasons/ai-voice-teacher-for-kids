import "server-only";
import type { AIService } from "./types";
import type { ChatMessage } from "@/types";
import {
  cleanResponse,
  SAFE_REDIRECT,
  TEACHER_PROMPT,
  containsPrivateInformation,
} from "./safety";
export class OpenAIService implements AIService {
  constructor(
    private key: string,
    private model: string,
  ) {}
  private async request(path: string, body: unknown): Promise<unknown> {
    const response = await fetch(`https://api.openai.com/v1/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("AI provider is unavailable");
    return response.json();
  }
  private async flagged(text: string) {
    const data = (await this.request("moderations", {
      model: "omni-moderation-latest",
      input: text,
    })) as { results?: { flagged: boolean }[] };
    if (!data.results?.length) throw new Error("Safety check unavailable");
    return data.results.some((r) => r.flagged);
  }
  async reply(messages: ChatMessage[], age: number) {
    if (await this.flagged(messages.map((m) => m.content).join("\n")))
      return SAFE_REDIRECT;
    const data = (await this.request("responses", {
      model: this.model,
      instructions: `${TEACHER_PROMPT}\nThe learner is age ${age}.`,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      max_output_tokens: 220,
      store: false,
    })) as { output?: { content?: { type: string; text?: string }[] }[] };
    const text = cleanResponse(
      data.output
        ?.flatMap((o) => o.content ?? [])
        .filter((c) => c.type === "output_text")
        .map((c) => c.text ?? "")
        .join(" ") ?? "",
    );
    if (!text) throw new Error("No response");
    if (containsPrivateInformation(text) || (await this.flagged(text)))
      return SAFE_REDIRECT;
    return text;
  }
}
