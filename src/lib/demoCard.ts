import { CardConfig } from "./schema";

export const DEMO_CARD: CardConfig = {
  id: "demo-card-id",
  slug: "demo",
  occasion: "birthday",
  theme: "pink-cloud",
  recipientName: "Sophia",
  senderName: "Liam",
  scenes: [
    "start",
    "balloons",
    "candle",
    "heartCatch",
    "bouquet",
    "photoStack",
    "letter",
    "gift",
    "finale",
  ],
  photos: [
    {
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
      caption: "A golden memory together ✨",
    },
    {
      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
      caption: "The spontaneous sunset road trip 🌅",
    },
    {
      url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80",
      caption: "Celebrating another milestone year with you 🎂",
    },
    {
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
      caption: "Here is to endless joy and sweet moments ahead 💖",
    },
  ],
  letter: `Dear Sophia,

Happy Birthday to someone truly special! 💖

You are my rock, my confidante, and the most radiant soul I know. Every memory with you brings warmth and laughter to my life.

On your special day, I wish you all the happiness, love, peace, and dreams fulfilled. May this year be your most extraordinary chapter yet!

With all my love and best wishes,
Liam`,
  music: null,
  isLocked: false,
};
