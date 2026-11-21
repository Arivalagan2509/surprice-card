import { z } from "zod";

export const OccasionEnum = z.enum(["birthday", "anniversary", "sorry", "friends"]);
export type Occasion = z.infer<typeof OccasionEnum>;

export const ThemeEnum = z.enum(["sunset", "garden", "pink-cloud"]);
export type ThemeKey = z.infer<typeof ThemeEnum>;

export const PhotoItemSchema = z.object({
  url: z.string().url(),
  caption: z.string().max(120).default(""),
});
export type PhotoItem = z.infer<typeof PhotoItemSchema>;

export const CardConfigSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  occasion: OccasionEnum,
  theme: ThemeEnum,
  recipientName: z.string().min(1).max(60),
  senderName: z.string().min(1).max(60),
  scenes: z.array(z.string()).default([
    "start",
    "balloons",
    "candle",
    "heartCatch",
    "bouquet",
    "photoStack",
    "letter",
    "gift",
    "finale",
  ]),
  photos: z.array(PhotoItemSchema).max(8).default([]),
  letter: z.string().max(2000),
  music: z.string().nullable().default(null),
  isLocked: z.boolean().optional().default(false),
});

export type CardConfig = z.infer<typeof CardConfigSchema>;
