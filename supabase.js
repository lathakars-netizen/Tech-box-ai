/**
 * TECH BOX AI — Supabase Integration Layer (supabase.js)
 *
 * Architecture: Thin adapter pattern — wraps Supabase JS client and exposes
 * a stable window.techboxSupabase API. Never modifies existing localStorage
 * behavior. All Supabase calls are fire-and-forget with silent error handling.
 *
 * SETUP REQUIRED:
 *   1. Create a free Supabase project at https://supabase.com
 *   2. Replace SUPABASE_URL and SUPABASE_ANON_KEY below with your project values
 *   3. Run the SQL in the Supabase SQL Editor to create required tables
 *
 * SQL SETUP (run once in Supabase SQL Editor):
 * ─────────────────────────────────────────────────────────────────
 *  -- Favorites table
 *  CREATE TABLE IF NOT EXISTS public.favorites (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *    phone_id TEXT NOT NULL,
 *    created_at TIMESTAMPTZ DEFAULT now(),
 *    UNIQUE(user_id, phone_id)
 *  );
 *  ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Users manage own favorites"
 *    ON public.favorites FOR ALL USING (auth.uid() = user_id);
 *
 *  -- Reviews table
 *  CREATE TABLE IF NOT EXISTS public.reviews (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
 *    phone_id TEXT NOT NULL,
 *    user_name TEXT NOT NULL,
 *    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
 *    title TEXT DEFAULT '',
 *    comment TEXT NOT NULL,
 *    created_at TIMESTAMPTZ DEFAULT now()
 *  );
 *  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Reviews are publicly readable"
 *    ON public.reviews FOR SELECT USING (true);
 *  CREATE POLICY "Anyone can submit public reviews"
 *    ON public.reviews FOR INSERT
 *    WITH CHECK (
 *      rating BETWEEN 1 AND 5
 *      AND char_length(comment) >= 10
 *      AND char_length(comment) <= 2000
 *      AND char_length(user_name) <= 100
 *      AND char_length(title) <= 200
 *      AND phone_id IS NOT NULL
 *      AND char_length(phone_id) >= 2
 *    );
 *
 *  -- Contact submissions table
 *  CREATE TABLE IF NOT EXISTS public.contact_submissions (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    name TEXT,
 *    email TEXT,
 *    subject TEXT,
 *    message TEXT,
 *    submitted_at TIMESTAMPTZ DEFAULT now()
 *  );
 *  ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Anyone can submit contact form"
 *    ON public.contact_submissions FOR INSERT WITH CHECK (true);
 *
 *  -- Sell phone requests table
 *  CREATE TABLE IF NOT EXISTS public.sell_requests (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
 *    phone_id TEXT,
 *    phone_name TEXT,
 *    condition TEXT,
 *    quoted_price INTEGER,
 *    contact_email TEXT,
 *    submitted_at TIMESTAMPTZ DEFAULT now()
 *  );
 *  ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Anyone can submit sell requests"
 *    ON public.sell_requests FOR INSERT WITH CHECK (true);
 *  CREATE POLICY "Users can view own sell requests"
 *    ON public.sell_requests FOR SELECT USING (auth.uid() = user_id);
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
    'use strict';

    /* ══════════════════════════════════════════════════════════════════════════
       CONFIGURATION — Replace these with your Supabase project credentials
       ══════════════════════════════════════════════════════════════════════════ */
    const SUPABASE_URL = 'https://udgrrpiiodfzyqopwtph.supabase.co';       // e.g. https://xyzabc.supabase.co
    const SUPABASE_ANON_KEY = 'sb_publishable_se1u7QkMEHfpGpU7QdLGiQ_d1FjhGkt';  // your project's anon/public key

    /* ══════════════════════════════════════════════════════════════════════════
       INITIALIZATION — Load Supabase client from CDN and initialize
       ══════════════════════════════════════════════════════════════════════════ */
    const isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

    let supabase = null;
    function initSupabaseClient() {
        if (!isConfigured) {
            console.info('[Supabase] Not configured or using placeholder credentials. Running in localStorage fallback mode.');
            window.techboxSupabase = buildFallbackAPI();
            return;
        }

        // Check if @supabase/supabase-js is already loaded
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                window.techboxSupabase = buildAPI(supabase);
                console.info('[Supabase] Client initialized successfully.');

                // Non-blocking background catalogue hydration from Supabase
                if (typeof window.techboxSupabase.getPhones === 'function') {
                    window.techboxSupabase.getPhones().then(livePhones => {
                        if (Array.isArray(livePhones) && livePhones.length > 0) {
                            window.phonesData = livePhones;
                            window.dispatchEvent(new CustomEvent('techbox:catalogue-updated', { detail: livePhones }));
                        }
                    }).catch(() => {
                        // Silently retain data/phones.js offline fallback
                    });
                }
            } catch (err) {
                console.warn('[Supabase] Initialization error:', err);
                window.techboxSupabase = buildFallbackAPI();
            }
        } else {
            console.warn('[Supabase] Client library (@supabase/supabase-js) not loaded yet.');
            window.techboxSupabase = buildFallbackAPI();
        }
    }

    /* ══════════════════════════════════════════════════════════════════════════
       FALLBACK API — Returns localStorage-compatible no-op stubs when
       Supabase is not configured or unreachable. All existing code continues
       to work without any changes.
       ══════════════════════════════════════════════════════════════════════════ */
    function buildFallbackAPI() {
        return {
            isReady: false,
            signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            signIn: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            signOut: async () => ({ error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthChange: (cb) => { cb && cb(null, null); return { data: { subscription: { unsubscribe: () => { } } } }; },
            getPhones: async () => null,
            getFavorites: async () => [],
            addFavorite: async () => ({ error: null }),
            removeFavorite: async () => ({ error: null }),
            getReviews: async () => [],
            submitReview: async () => ({ data: null, error: null }),
            submitContactForm: async () => ({ data: null, error: null }),
            submitSellRequest: async () => ({ data: null, error: null }),
        };
    }

    /* ══════════════════════════════════════════════════════════════════════════
       LIVE API — Full Supabase-backed methods
       ══════════════════════════════════════════════════════════════════════════ */
    function buildAPI(client) {
        return {
            isReady: true,

            /* ── Auth ─────────────────────────────────────────────────────── */

            async signUp(email, password, name) {
                try {
                    const { data, error } = await client.auth.signUp({
                        email,
                        password,
                        options: { data: { full_name: name || '' } }
                    });
                    if (error) console.warn('[Supabase] signUp error:', error.message);
                    return { data, error };
                } catch (e) {
                    console.warn('[Supabase] signUp exception:', e);
                    return { data: null, error: { message: e.message } };
                }
            },

            async signIn(email, password) {
                try {
                    const { data, error } = await client.auth.signInWithPassword({ email, password });
                    if (error) console.warn('[Supabase] signIn error:', error.message);
                    return { data, error };
                } catch (e) {
                    console.warn('[Supabase] signIn exception:', e);
                    return { data: null, error: { message: e.message } };
                }
            },

            async signOut() {
                try {
                    const { error } = await client.auth.signOut();
                    if (error) console.warn('[Supabase] signOut error:', error.message);
                    return { error };
                } catch (e) {
                    console.warn('[Supabase] signOut exception:', e);
                    return { error: { message: e.message } };
                }
            },

            async getSession() {
                try {
                    return await client.auth.getSession();
                } catch (e) {
                    return { data: { session: null }, error: { message: e.message } };
                }
            },

            async getUser() {
                try {
                    return await client.auth.getUser();
                } catch (e) {
                    return { data: { user: null }, error: { message: e.message } };
                }
            },

            onAuthChange(callback) {
                return client.auth.onAuthStateChange(callback);
            },

            /* ── Phones Catalogue ────────────────────────────────────────── */

            async getPhones() {
                try {
                    const { data, error } = await client
                        .from('phones')
                        .select('*')
                        .order('name');
                    if (error) {
                        console.info('[Supabase] getPhones note:', error.message);
                        return null;
                    }
                    if (Array.isArray(data) && data.length > 0) {
                        return data;
                    }
                    return null;
                } catch (e) {
                    console.info('[Supabase] getPhones exception:', e.message);
                    return null;
                }
            },

            /* ── Favorites ────────────────────────────────────────────────── */

            async getFavorites(userId) {
                if (!userId) return [];
                try {
                    const { data, error } = await client
                        .from('favorites')
                        .select('phone_id')
                        .eq('user_id', userId);
                    if (error) {
                        console.warn('[Supabase] getFavorites error:', error.message);
                        return [];
                    }
                    return (data || []).map(row => row.phone_id);
                } catch (e) {
                    console.warn('[Supabase] getFavorites exception:', e);
                    return [];
                }
            },

            async addFavorite(userId, phoneId) {
                if (!userId || !phoneId) return { error: { message: 'Missing userId or phoneId' } };
                try {
                    const { error } = await client
                        .from('favorites')
                        .upsert({ user_id: userId, phone_id: phoneId }, { onConflict: 'user_id,phone_id' });
                    if (error) console.warn('[Supabase] addFavorite error:', error.message);
                    return { error };
                } catch (e) {
                    console.warn('[Supabase] addFavorite exception:', e);
                    return { error: { message: e.message } };
                }
            },

            async removeFavorite(userId, phoneId) {
                if (!userId || !phoneId) return { error: { message: 'Missing userId or phoneId' } };
                try {
                    const { error } = await client
                        .from('favorites')
                        .delete()
                        .eq('user_id', userId)
                        .eq('phone_id', phoneId);
                    if (error) console.warn('[Supabase] removeFavorite error:', error.message);
                    return { error };
                } catch (e) {
                    console.warn('[Supabase] removeFavorite exception:', e);
                    return { error: { message: e.message } };
                }
            },

            /* ── Reviews ──────────────────────────────────────────────────── */

            async getReviews(phoneId) {
                if (!phoneId) return [];
                try {
                    const { data, error } = await client
                        .from('reviews')
                        .select('*')
                        .eq('phone_id', phoneId)
                        .order('created_at', { ascending: false });
                    if (error) {
                        console.warn('[Supabase] getReviews error:', error.message);
                        return [];
                    }
                    return data || [];
                } catch (e) {
                    console.warn('[Supabase] getReviews exception:', e);
                    return [];
                }
            },

            async submitReview(userId, phoneId, reviewData) {
                if (!phoneId || !reviewData) return { data: null, error: { message: 'Missing required fields' } };
                try {
                    const row = {
                        user_id: userId || null,
                        phone_id: phoneId,
                        user_name: reviewData.user_name || 'Anonymous',
                        rating: Math.min(5, Math.max(1, parseInt(reviewData.rating) || 1)),
                        title: reviewData.title || '',
                        comment: reviewData.comment || ''
                    };
                    const { data, error } = await client.from('reviews').insert([row]).select();
                    if (error) console.warn('[Supabase] submitReview error:', error.message);
                    return { data, error };
                } catch (e) {
                    console.warn('[Supabase] submitReview exception:', e);
                    return { data: null, error: { message: e.message } };
                }
            },

            /* ── Contact Form ─────────────────────────────────────────────── */

            async submitContactForm(formData) {
                if (!formData) return { data: null, error: { message: 'No form data' } };
                try {
                    const row = {
                        name: formData.name || '',
                        email: formData.email || '',
                        subject: formData.subject || '',
                        message: formData.message || ''
                    };
                    const { data, error } = await client.from('contact_submissions').insert([row]);
                    if (error) console.warn('[Supabase] submitContactForm error:', error.message);
                    return { data, error };
                } catch (e) {
                    console.warn('[Supabase] submitContactForm exception:', e);
                    return { data: null, error: { message: e.message } };
                }
            },

            /* ── Sell Phone ───────────────────────────────────────────────── */

            async submitSellRequest(userId, requestData) {
                if (!requestData) return { data: null, error: { message: 'No request data' } };
                try {
                    const row = {
                        user_id: userId || null,
                        phone_id: requestData.phone_id || null,
                        phone_name: requestData.phone_name || '',
                        condition: requestData.condition || '',
                        quoted_price: requestData.quoted_price || null,
                        contact_email: requestData.contact_email || ''
                    };
                    const { data, error } = await client.from('sell_requests').insert([row]);
                    if (error) console.warn('[Supabase] submitSellRequest error:', error.message);
                    return { data, error };
                } catch (e) {
                    console.warn('[Supabase] submitSellRequest exception:', e);
                    return { data: null, error: { message: e.message } };
                }
            }
        };
    }

    /* ══════════════════════════════════════════════════════════════════════════
       BOOT — Initialize after DOM is parsed
       ══════════════════════════════════════════════════════════════════════════ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabaseClient);
    } else {
        initSupabaseClient();
    }

})();
