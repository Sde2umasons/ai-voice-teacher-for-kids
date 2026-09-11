import type { ChatMessage } from "@/types";
export interface AIService {
  reply(messages: ChatMessage[], age: number): Promise<string>;
}
