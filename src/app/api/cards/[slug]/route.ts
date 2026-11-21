import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, getSignedAssetUrl } from "@/lib/supabase-server";

function notFoundResponse() {
  // Generic message — never reveal whether the card exists or is locked
  return NextResponse.json(
    { error: "Card not found or no longer available." },
    { status: 404 },
  );
}

type Params = { params: { slug: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = params;
  if (!slug || slug.length > 24) return notFoundResponse();

  try {
    const supabase = getSupabaseAdmin();

    const { data: card, error } = await supabase
      .from("cards")
      .select(
        "id, slug, occasion, theme, recipient_name, sender_name, letter, scenes, music_path, passcode_hash, locked_until, is_published, expires_at",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !card || !card.is_published) return notFoundResponse();

    // Expiry check
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This card has expired.", expired: true },
        { status: 410 },
      );
    }

    // If card has a passcode, return only minimal locked info
    if (card.passcode_hash) {
      return NextResponse.json({
        locked: true,
        recipientName: card.recipient_name,
        theme: card.theme,
      });
    }

    return await buildFullCardResponse(supabase, card);
  } catch (err) {
    console.error("[GET /api/cards/[slug]]", err instanceof Error ? err.message : "unknown");
    return notFoundResponse();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildFullCardResponse(supabase: any, card: any) {
  // Fetch photos
  const { data: photos } = await supabase
    .from("card_photos")
    .select("storage_path, caption, position")
    .eq("card_id", card.id)
    .order("position", { ascending: true });

  const signedPhotos = await Promise.all(
    (photos ?? []).map(async (p: { storage_path: string; caption: string; position: number }) => {
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
}

// buildFullCardResponse is an internal helper — do NOT export it (Next.js route files must only export HTTP methods)

/**
 * DELETE /api/cards/[slug]
 * Requires Authorization: Bearer <managementToken>
 * Deletes the card and all its storage files.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const { slug } = params;
  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Request could not be completed." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: card, error } = await supabase
      .from("cards")
      .select("id, management_token_hash")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !card) {
      return NextResponse.json({ error: "Request could not be completed." }, { status: 404 });
    }

    const tokenValid = await bcrypt.compare(token, card.management_token_hash);
    if (!tokenValid) {
      return NextResponse.json({ error: "Request could not be completed." }, { status: 401 });
    }

    // Delete storage files under {cardId}/
    const { data: files } = await supabase.storage
      .from("card-assets")
      .list(card.id, { limit: 100 });

    if (files && files.length > 0) {
      const paths = files.map((f: { name: string }) => `${card.id}/${f.name}`);
      await supabase.storage.from("card-assets").remove(paths);
    }

    // Delete card row (photos cascade)
    await supabase.from("cards").delete().eq("id", card.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/cards/[slug]]", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Request could not be completed." }, { status: 404 });
  }
}
