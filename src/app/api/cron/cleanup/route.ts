import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Scheduled cleanup endpoint for expired cards and their storage assets.
 * Calls can be triggered by Vercel Cron or GitHub Actions.
 * Secured with Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  // Validate authorization
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    // 1. Fetch expired cards
    const { data: expiredCards, error: fetchErr } = await supabase
      .from("cards")
      .select("id")
      .lt("expires_at", nowIso)
      .limit(100);

    if (fetchErr) {
      console.error("[CRON cleanup] Fetch error:", fetchErr.message);
      return NextResponse.json({ error: "Failed to query expired cards" }, { status: 500 });
    }

    if (!expiredCards || expiredCards.length === 0) {
      return NextResponse.json({ message: "No expired cards to clean up.", deletedCount: 0 });
    }

    let deletedCount = 0;

    for (const card of expiredCards) {
      try {
        // Delete storage files under card folder
        const { data: files } = await supabase.storage
          .from("card-assets")
          .list(card.id, { limit: 100 });

        if (files && files.length > 0) {
          const filePaths = files.map((f: { name: string }) => `${card.id}/${f.name}`);
          await supabase.storage.from("card-assets").remove(filePaths);
        }

        // Delete card row (card_photos cascades automatically)
        await supabase.from("cards").delete().eq("id", card.id);
        deletedCount++;
      } catch (err) {
        console.error(`[CRON cleanup] Error cleaning card ${card.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired cards and their assets.`,
      deletedCount,
    });
  } catch (err) {
    console.error("[CRON cleanup] Unexpected error:", err);
    return NextResponse.json(
      { error: "Cleanup process encountered an internal error." },
      { status: 500 }
    );
  }
}
