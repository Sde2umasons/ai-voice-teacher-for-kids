import type { AIService } from "./types";
import type { ChatMessage } from "@/types";
import { containsPrivateInformation, SAFE_REDIRECT } from "./safety";
export async function converse(
  service: AIService,
  messages: ChatMessage[],
  age: number,
) {
  if (messages.some((m) => containsPrivateInformation(m.content)))
    return "Keep personal details private, little explorer. Let's learn about colors or animals instead!";
  if (
    messages.some((m) => /\b(sex|porn|kill|weapon|suicide)\b/i.test(m.content))
  )
    return SAFE_REDIRECT;
  return service.reply(messages.slice(-8), age);
}
