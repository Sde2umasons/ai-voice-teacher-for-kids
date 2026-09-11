export interface Rhyme {
  id: string;
  title: string;
  emoji: string;
  lines: string[];
}
export const rhymes: Rhyme[] = [
  {
    id: "little-seed",
    title: "Little Seed",
    emoji: "🌱",
    lines: [
      "Little seed beneath the ground,",
      "Sun and water all around.",
      "Up a tiny leaf will peep,",
      "Growing softly while we sleep.",
    ],
  },
  {
    id: "counting-feet",
    title: "Counting Feet",
    emoji: "👣",
    lines: [
      "One small step and then comes two,",
      "Three and four, a wave to you.",
      "Five bright fingers greet the day,",
      "Count and smile along the way.",
    ],
  },
  {
    id: "color-day",
    title: "A Colorful Day",
    emoji: "🌈",
    lines: [
      "Red is an apple, green is a tree,",
      "Blue is the sky smiling at me.",
      "Yellow is sunshine warming my play,",
      "Colors bring joy to my wonderful day.",
    ],
  },
];
