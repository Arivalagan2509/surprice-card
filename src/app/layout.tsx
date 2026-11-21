import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://surprise-card.vercel.app"),
  title: {
    default: "SurpriseCard | Animated Digital Cards",
    template: "%s | SurpriseCard",
  },
  description: "Create and unwrap magical, interactive scene-by-scene surprise cards on your phone.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "SurpriseCard — Turn Feelings Into Animated Magic",
    description: "Send a private link that unwraps games, balloon pops, polaroids, and handwritten letters.",
    url: "https://surprise-card.vercel.app",
    siteName: "SurpriseCard",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 100,
        height: 100,
        alt: "SurpriseCard Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SurpriseCard — Turn Feelings Into Animated Magic",
    description: "Send a private link that unwraps games, balloon pops, polaroids, and handwritten letters.",
    images: ["/icon.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-slate-100 text-slate-900 overscroll-none min-h-[100dvh]">
        {children}
      </body>
    </html>
  );
}
