import type { Metadata } from "next";
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "A Special Surprise For You 🎁",
    description: "Someone created a private animated surprise card for you! Tap to open and play.",
    openGraph: {
      title: "A Special Surprise For You 🎁",
      description: "Someone created a private animated surprise card for you! Tap to open and play.",
      type: "website",
      images: [
        {
          url: "/icon.svg",
          width: 100,
          height: 100,
          alt: "Surprise Card Gift",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: "A Special Surprise For You 🎁",
      description: "Someone created a private animated surprise card for you! Tap to open and play.",
    },
  };
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
