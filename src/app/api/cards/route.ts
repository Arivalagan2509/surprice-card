import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/ratelimit";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

const CreateCardSchema = z.object({
  occasion: z.enum(["birthday", "anniversary", "sorry", "friends"]),
  theme: z.enum(["sunset", "garden", "pink-cloud"]),
  recipientName: z.string().min(1).max(60),
  senderName: z.string().min(1).max(60),
  letter: z.string().max(2000).optional().default(""),
  scenes: z.array(z.string()).min(1).max(10).optional(),
  passcode: z
    .string()
    .regex(/^\d{4,6}$/, "Passcode must be 4–6 digits")
    .optional(),
});

function genericError(status = 500) {
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status },
  );
}

export async function POST(request: NextRequest) {
  // ── F6: Rate limit card creation (10 / hour per IP) ─────────────────────
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const rl = await checkRateLimit(`create:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many cards created from this device. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) } },
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = CreateCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { occasion, theme, recipientName, senderName, letter, scenes, passcode } =
      parsed.data;

    // Hash passcode if provided
    let passcodeHash: string | null = null;
    if (passcode) {
      passcodeHash = await bcrypt.hash(passcode, 12);
    }

    // Generate slug + management token
    const slug = nanoid();
    const rawToken = randomBytes(32).toString("hex");
    const managementTokenHash = await bcrypt.hash(rawToken, 12);

    // Insert card
    const supabase = getSupabaseAdmin();
    const { data: card, error } = await supabase
      .from("cards")
      .insert({
        slug,
        occasion,
        theme,
        recipient_name: recipientName,
        sender_name: senderName,
        letter,
        scenes: scenes ?? [
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
        passcode_hash: passcodeHash,
        management_token_hash: managementTokenHash,
        is_published: true,
      })
      .select("id")
      .single();

    if (error || !card) {
      console.error("[POST /api/cards] DB error:", error?.message);
      return genericError();
    }

    return NextResponse.json(
      { slug, managementToken: rawToken, cardId: card.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/cards] Unexpected:", err instanceof Error ? err.message : "unknown");
    return genericError();
  }
}
