"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { DEMO_CARD } from "@/lib/demoCard";
import { CardConfig } from "@/lib/schema";
import { SceneRunner } from "@/components/SceneRunner";
import { PasscodeGate } from "@/components/scenes/PasscodeGate";
import { getThemeStyles } from "@/lib/themes";

type FetchState =
  | { status: "loading" }
  | { status: "locked"; recipientName: string; theme: string }
  | { status: "ready"; card: CardConfig }
  | { status: "not-found" }
  | { status: "expired" }
  | { status: "error"; message: string };

export default function CardViewerPage() {
  const params = useParams() as { slug: string };
  const { slug } = params;

  const [state, setState] = useState<FetchState>({ status: "loading" });

  const fetchCard = useCallback(async () => {
    // Demo shortcut — no API call needed
    if (slug === "demo") {
      setState({ status: "ready", card: DEMO_CARD });
      return;
    }

    try {
      const res = await fetch(`/api/cards/${slug}`);
      if (res.status === 404) { setState({ status: "not-found" }); return; }
      if (res.status === 410) { setState({ status: "expired" }); return; }
      if (!res.ok) { setState({ status: "error", message: "Could not load card." }); return; }

      const data = await res.json();
      if (data.locked) {
        setState({ status: "locked", recipientName: data.recipientName, theme: data.theme });
      } else {
        setState({ status: "ready", card: apiToCardConfig(data) });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }, [slug]);

  useEffect(() => { fetchCard(); }, [fetchCard]);

  const handleUnlock = async (passcode: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/cards/${slug}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (res.status === 429) return data.error ?? "Too many attempts. Try later.";
      if (!res.ok) return data.error ?? "Invalid passcode.";
      setState({ status: "ready", card: apiToCardConfig(data) });
      return null; // success
    } catch {
      return "Network error. Please try again.";
    }
  };

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gradient-to-br from-pink-100 to-purple-200">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🎀</div>
          <p className="text-purple-700 font-semibold">Loading your surprise…</p>
        </div>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <FullPageMessage
        emoji="🔍"
        title="Card Not Found"
        subtitle="This link doesn't exist or the card was deleted."
        bg="from-gray-100 to-slate-200"
      />
    );
  }

  if (state.status === "expired") {
    return (
      <FullPageMessage
        emoji="⏳"
        title="Card Expired"
        subtitle="This card is no longer available. Cards expire after 180 days."
        bg="from-amber-50 to-orange-100"
      />
    );
  }

  if (state.status === "error") {
    return (
      <FullPageMessage
        emoji="💔"
        title="Oops!"
        subtitle={state.message}
        bg="from-red-50 to-pink-100"
      />
    );
  }

  if (state.status === "locked") {
    const themeStyles = getThemeStyles(
      (state.theme as "sunset" | "garden" | "pink-cloud") ?? "pink-cloud",
    );
    return (
      <div className="min-h-dvh" style={themeStyles}>
        <PasscodeGate
          recipientName={state.recipientName}
          onUnlock={handleUnlock}
        />
      </div>
    );
  }

  // Ready — render the scene runner
  return <SceneRunner card={state.card} />;
}

// ---- Helpers ----

function apiToCardConfig(data: Record<string, unknown>): CardConfig {
  return {
    occasion: (data.occasion as CardConfig["occasion"]) ?? "birthday",
    theme: (data.theme as CardConfig["theme"]) ?? "pink-cloud",
    recipientName: String(data.recipientName ?? "Friend"),
    senderName: String(data.senderName ?? "Someone Special"),
    scenes: (data.scenes as string[]) ?? [
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
    photos: (data.photos as CardConfig["photos"]) ?? [],
    letter: String(data.letter ?? ""),
    music: (data.musicUrl as string | null) ?? null,
    isLocked: false,
  };
}

function FullPageMessage({
  emoji,
  title,
  subtitle,
  bg,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-dvh bg-gradient-to-br ${bg} px-6 text-center`}
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600 max-w-xs">{subtitle}</p>
      <a
        href="/"
        className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-full font-bold shadow hover:bg-purple-700 transition"
      >
        Go Home
      </a>
    </div>
  );
}
