import type { AIService } from "./types";
import type { ChatMessage } from "@/types";
export class DemoAI implements AIService {
  async reply(messages: ChatMessage[]) {
    const text = messages.at(-1)?.content.toLowerCase() ?? "";
    if (text.includes("sky"))
      return "Sunlight has many colors. Air scatters blue light in many directions, so the sky looks blue! What color do you see outside?";
    if (text.includes("elephant"))
      return "Elephants are big animals with long trunks. They use their trunks to smell, drink, and pick things up. Can you pretend your arm is a trunk?";
    if (text.includes("hello") || text.includes("hi"))
      return "Hello, little explorer! I am Mia, your AI learning buddy. Shall we learn about letters or animals?";
    if (text.includes("plant"))
      return "Plants need water and sunlight to grow. Their roots take up water from the soil. Can you spot a leaf nearby?";
    return "I am using my little offline lesson book today. I can tell you about the sky, elephants, or plants. Which shall we explore?";
  }
}
