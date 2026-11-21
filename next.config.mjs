/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(self), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    // - default-src 'self'
    // - script-src: Next.js needs 'unsafe-inline' + 'unsafe-eval' in dev; in prod inline scripts
    //   are injected by Next.js framework. We allow 'unsafe-inline' only for scripts (required by Next.js).
    // - style-src: Google Fonts + inline styles needed for Tailwind CSS variables
    // - img-src: data URIs (canvas blobs), Unsplash, picsum, Supabase storage
    // - connect-src: Supabase API + storage
    // - font-src: Google Fonts
    // - media-src: Supabase storage (audio)
    // - frame-ancestors: 'none' (prevents clickjacking)
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://*.supabase.co https://*.supabase.in",
      "media-src 'self' blob: https://*.supabase.co https://*.supabase.in",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://upstash.io https://*.upstash.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  optimizeFonts: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
    ],
  },
};

export default nextConfig;
