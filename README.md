# 🎁 SurpriseCard — Animated Digital Surprise Cards

> A production-quality mobile-first web app where creators create heartfelt surprise cards, and recipients unwrap an interactive, scene-by-scene animated journey on their phones.

---

## ✨ Features & Scene Flow

1. **Tap to Start**: Warm greeting with celebration emojis, unlocking high-quality Web Audio on mobile devices. Includes the runaway "NO" button when asked *"Are you excited for what's next?"*.
2. **Balloon Pop Game**: 4 floating balloons with celebration sounds and confetti; words reveal behind the popped balloons and animate to the center.
3. **Blow the Candle Game**: 2-tier birthday cake with a flickering candle that can be extinguished either by blowing into the phone's microphone (via Web Audio AnalyserNode) or by tapping.
4. **Huge Floral Bouquet**: 3-tier lush bouquet with floating flower petals, celebration emojis, and uplifting love-note badges.
5. **Polaroid Photo Stack**: Smooth swipeable polaroid cards with handwritten captions and lazy-loaded image optimization.
6. **Handwritten Letter**: Sealed envelope with a wax seal that opens with realistic paper sounds to reveal a typewriter text effect in Caveat handwriting font.
7. **Gift Box Unbox**: Bouncing gift box that pops open with fanfare sound and confetti rain.
8. **Celebration Finale**: Confetti explosion, celebration emojis, and a single **Replay Surprise ↺** button.
9. **Creator Wizard (`/create`)**: 9-step responsive mobile wizard with in-browser image resizing (stripping EXIF metadata), music upload, passcode setup, and WhatsApp sharing.
10. **Passcode Protection**: 4–6 digit passcode. Locked cards reveal **zero** photos, letters, or music until verified on the server.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables & Animations
- **Motion & Effects**: Framer Motion + canvas-confetti
- **Audio**: Web Audio API (synthesized melodies, sound effects, mic detection)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **File Storage**: Supabase Storage (Private `card-assets` bucket with signed 1-hour URLs)
- **Rate Limiting**: `@upstash/ratelimit` + Upstash Redis (with in-memory dev fallback)
- **Validation & Security**: Zod schemas, bcryptjs passcode hashing, nanoid slugs, strict Content-Security-Policy

---

## 🚀 Step-by-Step Vercel Deployment Guide

### Step 1: Set Up Supabase Database & Storage

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
   - This creates the `cards` and `card_photos` tables.
   - It enables **Row Level Security (RLS)** with **zero public policies** (strictly server-role access).
   - It inserts the configuration for the private `card-assets` storage bucket.
4. Go to **Storage** -> **Buckets** in your Supabase dashboard:
   - Ensure the bucket `card-assets` exists.
   - Verify that **Public Bucket** is set to **OFF** (Private).
5. Go to **Project Settings** -> **API**:
   - Copy `Project URL`
   - Copy `Project API keys` -> `anon public` key
   - Copy `Project API keys` -> `service_role` secret key (keep this strictly private!)

---

### Step 2: Set Up Upstash Redis (Rate Limiting)

1. Create a free Redis database at [upstash.com](https://upstash.com).
2. Choose **Global** or your nearest region.
3. In the database dashboard, find **REST API** section and copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

### Step 3: Deploy to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **Add New** -> **Project**.
3. Import your repository.
4. In **Environment Variables**, add the following:

| Variable | Description | Client/Server |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (NEVER prefix with NEXT_PUBLIC) | **Server Only** |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Server Only |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Server Only |
| `CRON_SECRET` | A random 32+ character string for securing cleanup cron jobs | Server Only |
| `NEXT_PUBLIC_APP_URL` | Your public domain (e.g. `https://your-app.vercel.app`) | Client & Server |

5. Click **Deploy**. Vercel will build and deploy the production bundle in under 2 minutes.

---

### Step 4: Verify Scheduled Cleanup (Vercel Cron)

The repository includes a [`vercel.json`](./vercel.json) file:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```
This automatically runs daily at 3:00 AM UTC to permanently delete expired cards (>180 days) and their storage files. Vercel automatically attaches the `CRON_SECRET` authorization header.

---

## 🧪 Local Development & Testing

### 1. Run Locally
```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Automated API Tests
```bash
npm test
```
The test suite covers schema validation, locked card privacy assertions, rate limiting, and security headers.

### 3. Manual Testing Checklist
Refer to [`manual-test-checklist.md`](./manual-test-checklist.md) for full testing across iPhone Safari, Android Chrome, in-app browsers, and edge cases.

---

## 🔒 Security Principles Enforced

- **Zero Information Leak**: Locked cards return strictly `{locked: true, recipientName, theme}` until the passcode is verified on the server.
- **Service Role Isolation**: Enforced by `import "server-only"` in `lib/supabase-server.ts`.
- **Strict Headers**: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` on all responses.
- **Client-Side EXIF Stripping**: Photos are redrawn on an HTML5 canvas prior to upload, stripping camera metadata and location tags.
