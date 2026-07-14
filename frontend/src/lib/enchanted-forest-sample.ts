import type { StoryResponse } from "@/lib/auth-types";

export const ENCHANTED_FOREST_SAMPLE: StoryResponse = {
  title: "The Enchanted Forest",
  pages: [
    {
      pageNumber: 1,
      text: "Once upon a time, in a forest where the trees sang lullabies and the rivers whispered secrets, a tiny fox named Ember discovered a glowing door hidden beneath the oldest oak tree.",
      imagePrompt: "",
    },
    {
      pageNumber: 2,
      text: "\"What could be behind this door?\" Ember wondered, her bushy tail wagging with excitement. She pressed her tiny paw against the warm wood, and with a soft creak, the door swung open.",
      imagePrompt: "",
    },
    {
      pageNumber: 3,
      text: "Beyond the door was a world made entirely of starlight. Crystal trees sparkled like diamonds, and tiny fireflies danced in patterns that told ancient stories of the forest.",
      imagePrompt: "",
    },
    {
      pageNumber: 4,
      text: "A wise old owl greeted Ember with a warm smile. \"Welcome, little one. You've been chosen to hear the oldest story of all – the story of how the stars first learned to shine.\"",
      imagePrompt: "",
    },
    {
      pageNumber: 5,
      text: "As the owl told his tale, the night sky filled with dancing lights. Ember listened with wide eyes and an even wider heart, knowing she would carry this story home to share with all her forest friends.",
      imagePrompt: "",
    },
  ],
  quiz: [
    {
      question: "What did Ember find beneath the oldest oak tree?",
      options: ["A treasure chest", "A glowing door", "A sleeping bear", "A magic wand"],
      answer: "A glowing door",
    },
    {
      question: "Who greeted Ember in the starlight world?",
      options: ["A fox", "A deer", "A wise old owl", "A rabbit"],
      answer: "A wise old owl",
    },
    {
      question: "What did Ember decide to do with the story she heard?",
      options: [
        "Keep it a secret",
        "Write it in a book",
        "Share it with her forest friends",
        "Forget it",
      ],
      answer: "Share it with her forest friends",
    },
  ],
  vocabulary: [
    { word: "Lullaby",   meaning: "A soft, gentle song to help someone fall asleep." },
    { word: "Whispered", meaning: "Spoke very quietly, almost like a secret." },
    { word: "Starlight", meaning: "The bright light that comes from the stars at night." },
    { word: "Ancient",   meaning: "Very, very old — from a long, long time ago." },
  ],
};
