import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: { slug: string } };

const AssetsSchema = z.object({
  photos: z.array(z.object({
    path: z.string().min(1).max(500),
    caption: z.string().max(120).default(""),
  })).max(8).optional().default([]),
  musicPath: z.string().max(500).optional(),
});

const GENERIC_ERROR = { error: "Request could not be completed." };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { slug } = params;

  // ── F5: Require management token ─────────────────────────────────────────
  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json(GENERIC_ERROR, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const parsed = AssetsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed." }, { status: 422 });
  }

  const { photos, musicPath } = parsed.data;

  try {
    const supabase = getSupabaseAdmin();

    // Verify management token
    const { data: card, error: cardErr } = await supabase
      .from("cards")
      .select("id, management_token_hash")
      .eq("slug", slug)
      .maybeSingle();

    if (cardErr || !card) return NextResponse.json(GENERIC_ERROR, { status: 404 });

    const tokenValid = await bcrypt.compare(token, card.management_token_hash);
    if (!tokenValid) return NextResponse.json(GENERIC_ERROR, { status: 401 });

    // Validate storage paths: must start with the card's own id (prevent path injection)
    const ownPrefix = `${card.id}/`;
    const safePhotos = photos.filter(p => p.path.startsWith(ownPrefix));
    const safeMusicPath = musicPath?.startsWith(ownPrefix) ? musicPath : undefined;

    if (safePhotos.length > 0) {
      const rows = safePhotos.map((p, i) => ({
        card_id: card.id,
        storage_path: p.path,
        caption: p.caption,
        position: i,
      }));
      await supabase.from("card_photos").insert(rows);
    }

    if (safeMusicPath) {
      await supabase.from("cards").update({ music_path: safeMusicPath }).eq("id", card.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/cards/[slug]/assets]", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
