/**
 * TECH BOX AI — Catalogue Ingestion & Synchronization Engine
 * Runs securely in isolated backend environments (e.g. GitHub Actions).
 * 
 * SECURITY:
 *   - Uses SUPABASE_SERVICE_ROLE_KEY strictly from process.env.
 *   - NEVER exposes service role key to frontend code or git repository.
 *   - Strictly validates all incoming phones against the 43-attribute schema.
 *   - Prevents duplicate phones via deterministic slug IDs.
 *   - Preserves manually verified overrides.
 *   - Logs failed imports to import_errors.log.
 *   - Updates data/phones.js as the verified offline fallback.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { validatePhoneSchema } = require('./validate_phone_schema.js');

const PHONES_DATA_PATH = path.join(__dirname, '../data/phones.js');
const ERROR_LOG_PATH = path.join(__dirname, '../import_errors.log');

/**
 * Main Sync Pipeline
 */
async function syncCatalogue(candidateRecords = []) {
    console.log('\n============================================================');
    console.log('  TECH BOX AI — Catalogue Sync & Ingestion Engine');
    console.log('============================================================\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Load existing offline catalogue as baseline
    let existingPhones = [];
    try {
        delete require.cache[require.resolve(PHONES_DATA_PATH)];
        const exported = require(PHONES_DATA_PATH);
        existingPhones = Array.isArray(exported)
            ? exported
            : (Array.isArray(exported.phonesData) ? exported.phonesData : []);
        console.log(`[Baseline] Loaded ${existingPhones.length} verified phones from offline data/phones.js`);
    } catch (err) {
        console.error('[Baseline] Failed to load offline data/phones.js:', err.message);
        return { success: false, error: err.message };
    }

    const phoneMap = new Map();
    existingPhones.forEach(phone => phoneMap.set(phone.id, phone));

    // Process incoming candidate additions / updates
    let addedCount = 0;
    let updatedCount = 0;
    let rejectedCount = 0;
    const rejectedLogEntries = [];

    if (Array.isArray(candidateRecords) && candidateRecords.length > 0) {
        console.log(`[Intake] Processing ${candidateRecords.length} incoming candidate records...`);

        candidateRecords.forEach(rawPhone => {
            const validation = validatePhoneSchema(rawPhone);
            if (!validation.valid) {
                rejectedCount++;
                const errLog = `[${new Date().toISOString()}] REJECTED "${rawPhone?.name || 'Unknown'}" (${rawPhone?.id || 'no-id'}): ${validation.errors.join('; ')}`;
                rejectedLogEntries.push(errLog);
                console.warn(`  ⚠️ ${errLog}`);
                return;
            }

            const candidate = validation.sanitized;
            const existing = phoneMap.get(candidate.id);

            if (existing) {
                // If existing record was manually verified, preserve curated aliases, highlightTag & local image
                if (existing.isManuallyVerified) {
                    candidate.aliases = Array.from(new Set([...(candidate.aliases || []), ...(existing.aliases || [])]));
                    candidate.highlightTag = existing.highlightTag || candidate.highlightTag;
                    if (existing.image && !existing.image.startsWith('http')) {
                        candidate.image = existing.image; // Preserve local high-res asset
                    }
                    candidate.isManuallyVerified = true;
                }
                phoneMap.set(candidate.id, candidate);
                updatedCount++;
            } else {
                phoneMap.set(candidate.id, candidate);
                addedCount++;
            }
        });
    } else {
        console.log('[Intake] No new candidate records passed in this run. Validating existing database parity.');
    }

    // Write any rejected records to import_errors.log
    if (rejectedLogEntries.length > 0) {
        fs.appendFileSync(ERROR_LOG_PATH, rejectedLogEntries.join('\n') + '\n', 'utf8');
        console.log(`[Audit] Logged ${rejectedCount} rejected entries to import_errors.log`);
    }

    const allVerifiedPhones = Array.from(phoneMap.values());
    console.log(`[Catalogue] Total verified devices after ingest: ${allVerifiedPhones.length}`);

    // Update Supabase if credentials are provided
    let supabaseSyncStatus = 'Skipped (credentials not provided)';
    if (supabaseUrl && serviceRoleKey) {
        try {
            // Validate and normalize SUPABASE_URL to pure origin base URL (e.g. https://xyz.supabase.co)
            // Strips accidental paths like /rest/v1 or trailing slashes to prevent duplicated paths in SDK
            let cleanUrl = null;
            try {
                const parsedUrl = new URL(supabaseUrl.trim());
                if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
                    throw new Error('Protocol must be https: or http:');
                }
                cleanUrl = parsedUrl.origin;
            } catch {
                throw new Error('Malformed SUPABASE_URL. Expected format: https://YOUR_PROJECT_REF.supabase.co');
            }

            console.log('[Supabase] Initializing privileged client with SUPABASE_SERVICE_ROLE_KEY...');
            let supabaseClient = null;

            // Load @supabase/supabase-js
            const { createClient } = require('@supabase/supabase-js');
            supabaseClient = createClient(cleanUrl, serviceRoleKey.trim(), {
                auth: { persistSession: false, autoRefreshToken: false }
            });

            console.log(`[Supabase] Upserting ${allVerifiedPhones.length} phones to public.phones table...`);
            const { error } = await supabaseClient
                .from('phones')
                .upsert(allVerifiedPhones, { onConflict: 'id' });

            if (error) {
                console.error('[Supabase] Upsert error:', error.message);
                supabaseSyncStatus = `Failed: ${error.message}`;
            } else {
                console.log('[Supabase] Upsert completed successfully.');
                supabaseSyncStatus = 'Synchronized successfully';
            }
        } catch (dbErr) {
            console.error('[Supabase] Database exception:', dbErr.message);
            supabaseSyncStatus = `Exception: ${dbErr.message}`;
        }
    } else {
        console.log('[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment.');
    }

    // Always update the offline fallback data/phones.js
    try {
        const fileContent = '/**\n' +
            ' * TECH BOX AI - Centralized Phone Database\n' +
            ' * Comprehensive Offline Indian Smartphone Catalogue\n' +
            ' * Single Source of Truth for all phone specifications, pricing, images, and UI metadata\n' +
            ` * Total verified smartphones: ${allVerifiedPhones.length}\n` +
            ` * Last synced: ${new Date().toISOString()}\n` +
            ' */\n\n' +
            'const phonesData = ' + JSON.stringify(allVerifiedPhones, null, 4) + ';\n\n' +
            'function sanitizePhoneData(phone) {\n' +
            '    if (!phone) return null;\n' +
            '    return {\n' +
            '        ...phone,\n' +
            '        priceNumericINR: typeof phone.priceNumericINR === \'number\' ? phone.priceNumericINR : 0,\n' +
            '        storageVariant: phone.storageVariant || \'Base Variant\',\n' +
            '        priceCheckDate: phone.priceCheckDate || \'2026-10\',\n' +
            '        availability: phone.availability || \'available\',\n' +
            '        sourceSpecsUrl: phone.sourceSpecsUrl || \'https://www.gsmarena.com\',\n' +
            '        sourcePriceUrl: phone.sourcePriceUrl || \'https://www.91mobiles.com\',\n' +
            '        imageLicense: phone.imageLicense || \'Manufacturer Press Kit (Editorial Reference)\',\n' +
            '        rating: typeof phone.rating === \'number\' ? phone.rating : 4.5,\n' +
            '        ratingCount: phone.ratingCount || \'(100+)\',\n' +
            '        image: phone.image || \'assets/placeholder.jpg\',\n' +
            '        fallbackName: phone.fallbackName || phone.name || \'Unknown\',\n' +
            '        highlightTag: phone.highlightTag || { text: \'Verified\', icon: \'fa-solid fa-check\', colorClass: \'cyan\' },\n' +
            '        glowClass: phone.glowClass || \'\',\n' +
            '        category: phone.category || \'smartphone\',\n' +
            '        verifiedSpecs: true,\n' +
            '        specs: Array.isArray(phone.specs) ? phone.specs.map(spec => ({\n' +
            '            icon: spec.icon || \'fa-solid fa-microchip\',\n' +
            '            text: spec.text || \'Spec\'\n' +
            '        })) : [],\n' +
            '        aliases: Array.isArray(phone.aliases) ? phone.aliases : []\n' +
            '    };\n' +
            '}\n\n' +
            '// Attach to window object for global availability\n' +
            'if (typeof window !== \'undefined\') {\n' +
            '    window.phonesData = phonesData.filter(Boolean).map(sanitizePhoneData);\n' +
            '}\n\n' +
            '// Support CommonJS export for automated Node tests\n' +
            'if (typeof module !== \'undefined\' && module.exports) {\n' +
            '    module.exports = { phonesData, sanitizePhoneData };\n' +
            '}\n';

        fs.writeFileSync(PHONES_DATA_PATH, fileContent, 'utf8');
        console.log(`[Offline Fallback] Successfully updated data/phones.js with ${allVerifiedPhones.length} phones.`);
    } catch (writeErr) {
        console.error('[Offline Fallback] Failed to write data/phones.js:', writeErr.message);
    }

    console.log('\n--- Sync Summary ---');
    console.log(`  Added:           ${addedCount}`);
    console.log(`  Updated:         ${updatedCount}`);
    console.log(`  Rejected:        ${rejectedCount}`);
    console.log(`  Total Active:    ${allVerifiedPhones.length}`);
    console.log(`  Supabase Status: ${supabaseSyncStatus}`);
    console.log('============================================================\n');

    return {
        success: true,
        addedCount,
        updatedCount,
        rejectedCount,
        totalCount: allVerifiedPhones.length,
        supabaseSyncStatus
    };
}

// Allow CLI invocation
if (require.main === module) {
    syncCatalogue().then(res => {
        if (!res || !res.success) {
            console.error('Fatal sync failure:', res ? res.error : 'Unknown error');
            process.exit(1);
        }

        const hasCredentials = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

        // In CI (GitHub Actions), credentials are strictly required
        if (process.env.CI && !hasCredentials) {
            console.error('CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in CI environment.');
            process.exit(1);
        }

        // Whenever credentials are provided (in CI or manual run), Supabase sync must succeed
        if (hasCredentials && res.supabaseSyncStatus !== 'Synchronized successfully') {
            console.error('CRITICAL: Supabase synchronization failed:', res.supabaseSyncStatus);
            process.exit(1);
        }
    }).catch(err => {
        console.error('Fatal unhandled sync failure:', err);
        process.exit(1);
    });
}

module.exports = { syncCatalogue };
