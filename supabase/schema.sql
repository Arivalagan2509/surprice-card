-- Supabase Schema for Animated Surprise Card
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create 'cards' table
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    occasion TEXT NOT NULL CHECK (occasion IN ('birthday', 'anniversary', 'sorry', 'friends')),
    theme TEXT NOT NULL CHECK (theme IN ('sunset', 'garden', 'pink-cloud')),
    recipient_name VARCHAR(60) NOT NULL,
    sender_name VARCHAR(60) NOT NULL,
    letter VARCHAR(2000) NOT NULL,
    scenes JSONB NOT NULL DEFAULT '["start", "balloons", "candle", "heartCatch", "bouquet", "photoStack", "letter", "gift", "finale"]'::jsonb,
    music_path TEXT DEFAULT NULL,
    passcode_hash TEXT DEFAULT NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    management_token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '180 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create 'card_photos' table
CREATE TABLE IF NOT EXISTS public.card_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption VARCHAR(120) DEFAULT '',
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_cards_slug ON public.cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_expires_at ON public.cards(expires_at);
CREATE INDEX IF NOT EXISTS idx_card_photos_card_id ON public.card_photos(card_id);
CREATE INDEX IF NOT EXISTS idx_card_photos_position ON public.card_photos(card_id, position);

-- 5. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_photos ENABLE ROW LEVEL SECURITY;

-- 6. STRICT SECURITY: DO NOT create any public RLS policies.
-- By default in PostgreSQL/Supabase, enabling RLS with no policies denies all access
-- to the 'anon' and 'authenticated' roles.
-- ONLY backend Route Handlers using the SUPABASE_SERVICE_ROLE_KEY can read/write these tables.

-- 7. (Optional/Informational) Setup private storage bucket 'card-assets'
-- Insert bucket record if storage schema is accessible
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'card-assets',
    'card-assets',
    false, -- MUST BE FALSE: private bucket with signed URLs only
    5242880, -- 5 MB max file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp3'];

-- Disable public access on storage.objects for 'card-assets'
-- Storage RLS ensures files cannot be viewed or enumerated without service-role signed URLs
