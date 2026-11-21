import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, getSignedAssetUrl } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/ratelimit";

type Params = { params: { slug: string } };

const GENERIC_ERROR = "Invalid passcode or card not found.";

function genericFail(status = 401) {
  return NextResponse.json({ error: GENERIC_ERROR }, { status });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { slug } = params;

  // Extract IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const rateLimitKey = `unlock:${slug}:${ip}`;

  // Rate limit: 5 attempts per 15 minutes
  const rl = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
      },
    );
  }

  let passcode: string;
  try {
    const body = await request.json();
    passcode = String(body?.passcode ?? "");
  } catch {
    return genericFail(400);
  }

  if (!passcode || !/^\d{4,6}$/.test(passcode)) return genericFail(400);

  try {
    const supabase = getSupabaseAdmin();

    const { data: card, error } = await supabase
      .from("cards")
      .select(
        "id, slug, occasion, theme, recipient_name, sender_name, letter, scenes, music_path, passcode_hash, failed_attempts, locked_until, is_published, expires_at",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !card || !card.is_published) return genericFail();

    // Expiry
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      return genericFail(410);
    }

    // Check if card is locked out (too many failures)
    if (card.locked_until && new Date(card.locked_until) > new Date()) {
      return NextResponse.json(
        { error: "This card is temporarily locked. Please try again later." },
        { status: 429 },
      );
    }

    if (!card.passcode_hash) {
      // No passcode set — card is public, shouldn't be unlocking
      return genericFail(400);
    }

    const match = await bcrypt.compare(passcode, card.passcode_hash);

    if (!match) {
      const newAttempts = (card.failed_attempts ?? 0) + 1;
      const updateData: Record<string, unknown> = { failed_attempts: newAttempts };
      if (newAttempts >= 10) {
        // Lock for 15 minutes
        updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
      await supabase.from("cards").update(updateData).eq("id", card.id);
      return genericFail();
    }

    // Reset failed attempts on success
    await supabase
      .from("cards")
      .update({ failed_attempts: 0, locked_until: null })
      .eq("id", card.id);

    // Build signed response (same as the GET handler for unlocked cards)
    const { data: photos } = await supabase
      .from("card_photos")
      .select("storage_path, caption, position")
      .eq("card_id", card.id)
      .order("position", { ascending: true });

    const signedPhotos = await Promise.all(
      (photos ?? []).map(async (p: { storage_path: string; caption: string }) => {
        const url = await getSignedAssetUrl(p.storage_path, 3600);
        return { url, caption: p.caption };
      }),
    );

    let musicUrl: string | null = null;
    if (card.music_path) {
      musicUrl = await getSignedAssetUrl(card.music_path, 3600);
    }

    return NextResponse.json({
      locked: false,
      id: card.id,
      slug: card.slug,
      occasion: card.occasion,
      theme: card.theme,
      recipientName: card.recipient_name,
      senderName: card.sender_name,
      letter: card.letter,
      scenes: card.scenes,
      photos: signedPhotos,
      musicUrl,
    });
  } catch (err) {
    console.error("[POST /api/cards/[slug]/unlock]", err instanceof Error ? err.message : "unknown");
    return genericFail();
  }
}
