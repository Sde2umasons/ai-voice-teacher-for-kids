export interface StoryPage {
  narration: string;
  emoji: string;
  question: string;
  accepted: string[];
}
export interface Story {
  id: string;
  title: string;
  characters: string[];
  pages: StoryPage[];
}
export const stories: Story[] = [
  {
    id: "blue-ball",
    title: "The Blue Ball",
    characters: ["Pip the rabbit", "Lulu the duck"],
    pages: [
      {
        narration:
          "Pip the rabbit found a blue ball beside a tree. He bounced it gently and smiled.",
        emoji: "🐰",
        question: "What color was the ball?",
        accepted: ["blue"],
      },
      {
        narration:
          "Lulu the duck wanted to play too. Pip rolled the ball to Lulu. They took turns and laughed together.",
        emoji: "🦆",
        question: "Who played with Pip? A duck or a cat?",
        accepted: ["duck", "lulu"],
      },
      {
        narration:
          "When the sun grew low, they put the ball away together. Sharing had made their day brighter.",
        emoji: "🌅",
        question: "What do you think they will play tomorrow?",
        accepted: [],
      },
    ],
  },
  {
    id: "seed-friends",
    title: "The Patient Little Garden",
    characters: ["Mina", "Bo"],
    pages: [
      {
        narration:
          "Mina and Bo planted a seed in soft soil. Mina gave it a little water. Bo found a sunny place for the pot.",
        emoji: "🪴",
        question: "What did Mina give the seed?",
        accepted: ["water"],
      },
      {
        narration:
          "Each day they checked the soil. At first they saw nothing. Then a tiny green leaf appeared!",
        emoji: "🌱",
        question: "What color was the leaf?",
        accepted: ["green"],
      },
      {
        narration:
          "The friends smiled. Good things can take time, said Mina. They kept caring for their little plant.",
        emoji: "🌻",
        question: "What do you think the plant might grow next?",
        accepted: [],
      },
    ],
  },
];
