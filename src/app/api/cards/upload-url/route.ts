import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { createSignedUploadUrl, getSupabaseAdmin } from "@/lib/supabase-server";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB
const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PHOTOS_PER_CARD = 8;

const UploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string(),
  fileSize: z.number().int().positive(),
  cardId: z.string().uuid(),
  photoCount: z.number().int().min(0).max(MAX_PHOTOS_PER_CARD).optional().default(0),
});

function genericError(msg = "Something went wrong.", status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return genericError("Invalid JSON body.");
    }

    const parsed = UploadUrlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { fileName, fileType, fileSize, cardId, photoCount } = parsed.data;

    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
    const isAudio = ALLOWED_AUDIO_TYPES.includes(fileType);

    if (!isImage && !isAudio) {
      return genericError("Only JPEG, PNG, WebP images and MP3 audio files are allowed.");
    }
    if (isImage && fileSize > MAX_IMAGE_BYTES) return genericError("Image files must be under 3 MB.");
    if (isAudio && fileSize > MAX_AUDIO_BYTES) return genericError("Audio files must be under 5 MB.");
    if (isImage && photoCount >= MAX_PHOTOS_PER_CARD) return genericError("Maximum 8 photos per card.");

    // ── F4: Verify cardId exists in DB ───────────────────────────────────────
    try {
      const supabase = getSupabaseAdmin();
      const { data: card, error: cardErr } = await supabase
        .from("cards")
        .select("id")
        .eq("id", cardId)
        .maybeSingle();

      if (cardErr || !card) {
        return genericError("Card not found.", 404);
      }
    } catch {
      // If DB is offline / not configured, safely return 404 (no signed upload URLs issued)
      return genericError("Card not found.", 404);
    }

    // Build storage path — always under the verified cardId folder
    const ext = isImage
      ? fileType === "image/png" ? "png" : fileType === "image/webp" ? "webp" : "jpg"
      : "mp3";
    // Sanitise fileName: strip path traversal, keep only basename
    const safeName = (fileName.split(/[\\/]/).pop() ?? "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    void safeName; // path is generated from nanoid, not user input
    const path = `${cardId}/${nanoid()}.${ext}`;

    const result = await createSignedUploadUrl(path);
    if (!result || !result.signedUrl) {
      return NextResponse.json({ error: "Could not generate upload URL." }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: result.signedUrl, path: result.path }, { status: 200 });
  } catch (err) {
    console.error("[upload-url] Unexpected:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
