-- =====================================================================
-- TECH BOX AI / Mobile_Verse — Complete Supabase Database Schema
-- Includes RLS security policies, existing tables, and new phones table.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Phones Catalogue Table (NEW)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phones (
    "id" TEXT PRIMARY KEY,                             -- Unique slug, e.g. 'samsung-galaxy-s25-ultra'
    "name" TEXT NOT NULL,                              -- Model name, e.g. 'Galaxy S25 Ultra'
    "brand" TEXT NOT NULL,                             -- Brand name, e.g. 'Samsung'
    "brandIcon" TEXT DEFAULT 'fa-solid fa-mobile-screen-button',
    "brandClass" TEXT DEFAULT '',
    "fallbackName" TEXT DEFAULT '',

    -- Indian Pricing & Variants
    "price" TEXT NOT NULL,                             -- Formatted price: '₹1,29,999'
    "priceNumericINR" INTEGER NOT NULL,                -- Numerical price: 129999 for sorting/filtering
    "storageVariant" TEXT DEFAULT '',                  -- e.g. '12GB/256GB'
    "priceCheckDate" TEXT DEFAULT '',                  -- e.g. '2026-10'
    "priceNote" TEXT DEFAULT '',                       -- e.g. 'Starting from ₹1,29,999 (256GB)'

    -- Ratings & Availability
    "rating" NUMERIC(2,1) DEFAULT 4.5,
    "ratingCount" TEXT DEFAULT '(0)',
    "category" TEXT DEFAULT 'flagship 5g',
    "availability" TEXT DEFAULT 'available',           -- 'available', 'upcoming', 'discontinued'
    "glowClass" TEXT DEFAULT '',
    "highlightTag" JSONB DEFAULT '{"text": "FLAGSHIP", "icon": "fa-solid fa-star", "colorClass": "cyan"}'::jsonb,

    -- Specs Summary Pills: Array of 3 objects [{ icon, text }]
    "specs" JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- 9 Paired Detailed Specs
    "processor" TEXT NOT NULL,
    "processorSub" TEXT DEFAULT '',
    "camera" TEXT NOT NULL,
    "cameraSub" TEXT DEFAULT '',
    "battery" TEXT NOT NULL,
    "batterySub" TEXT DEFAULT '',
    "charging" TEXT DEFAULT '',
    "chargingSub" TEXT DEFAULT '',
    "display" TEXT NOT NULL,
    "displaySub" TEXT DEFAULT '',
    "ram" TEXT DEFAULT '',
    "ramSub" TEXT DEFAULT '',
    "storage" TEXT DEFAULT '',
    "storageSub" TEXT DEFAULT '',
    "connectivity" TEXT DEFAULT '',
    "connectivitySub" TEXT DEFAULT '',
    "build" TEXT DEFAULT '',
    "buildSub" TEXT DEFAULT '',
    "os" TEXT DEFAULT '',
    "osSub" TEXT DEFAULT '',

    -- Search Tokens & Media
    "aliases" JSONB NOT NULL DEFAULT '[]'::jsonb,      -- Array of search tokens
    "image" TEXT NOT NULL,                             -- HTTPS URL or assets path
    "imageLicense" TEXT DEFAULT 'Manufacturer Press Kit (Editorial Reference)',

    -- Source Citations, Metadata & Verification Timestamps
    "sourceSpecsUrl" TEXT DEFAULT '',                  -- Verified source for specs
    "sourcePriceUrl" TEXT DEFAULT '',                  -- Verified source for Indian pricing
    "isManuallyVerified" BOOLEAN DEFAULT false,        -- Protects manual overrides during auto-sync
    "lastVerifiedAt" TIMESTAMPTZ DEFAULT now(),
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on phones
ALTER TABLE public.phones ENABLE ROW LEVEL SECURITY;

-- Public Read Policy: All visitors can read phones without authentication
DROP POLICY IF EXISTS "Allow public read access to phones" ON public.phones;
CREATE POLICY "Allow public read access to phones"
    ON public.phones
    FOR SELECT
    USING (true);

-- Note on write operations:
-- With RLS enabled and NO public INSERT/UPDATE/DELETE policies,
-- anonymous and authenticated visitors CANNOT modify the catalogue.
-- Only backend workers using SUPABASE_SERVICE_ROLE_KEY can insert or update.


-- ---------------------------------------------------------------------
-- 2. Contact Submissions Table (Existing — Preserved)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
    ON public.contact_submissions FOR INSERT WITH CHECK (true);


-- ---------------------------------------------------------------------
-- 3. Sell Phone Requests Table (Existing — Preserved)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sell_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone_id TEXT,
    phone_name TEXT,
    condition TEXT,
    quoted_price INTEGER,
    contact_email TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit sell requests" ON public.sell_requests;
CREATE POLICY "Anyone can submit sell requests"
    ON public.sell_requests FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own sell requests" ON public.sell_requests;
CREATE POLICY "Users can view own sell requests"
    ON public.sell_requests FOR SELECT USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 4. Reviews Table (Existing — Preserved)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    title TEXT DEFAULT '',
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;
CREATE POLICY "Reviews are publicly readable"
    ON public.reviews FOR SELECT USING (true);

-- Allow public review submission without authentication, with anti-spam content validation.
-- Note: With NO UPDATE or DELETE policies defined, anonymous users CANNOT alter or delete any reviews.
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can submit public reviews" ON public.reviews;
CREATE POLICY "Anyone can submit public reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (
        rating BETWEEN 1 AND 5
        AND char_length(comment) >= 10
        AND char_length(comment) <= 2000
        AND char_length(user_name) <= 100
        AND char_length(title) <= 200
        AND phone_id IS NOT NULL
        AND char_length(phone_id) >= 2
    );


-- ---------------------------------------------------------------------
-- 5. Favorites Table (Existing — Preserved)
-- Note: Favorites are managed client-side in localStorage ('techbox_favorites')
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    phone_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, phone_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
CREATE POLICY "Users manage own favorites"
    ON public.favorites FOR ALL USING (auth.uid() = user_id);
