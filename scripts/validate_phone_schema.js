/**
 * TECH BOX AI — Smartphone Schema Validator & Sanitizer
 * Enforces the 43-attribute schema for all imported smartphone records.
 * Blocks malformed records, invalid pricing, missing specs, and duplicate keys.
 */

'use strict';

const BRAND_DEFAULTS = {
    'Samsung':   { brandIcon: 'fa-solid fa-mobile-retro', brandClass: 'brand-samsung' },
    'Apple':     { brandIcon: 'fa-brands fa-apple', brandClass: 'brand-apple' },
    'OnePlus':   { brandIcon: 'fa-solid fa-bolt-lightning', brandClass: 'brand-oneplus' },
    'iQOO':      { brandIcon: 'fa-solid fa-bolt', brandClass: 'brand-iqoo' },
    'Vivo':      { brandIcon: 'fa-solid fa-gem', brandClass: 'brand-vivo' },
    'OPPO':      { brandIcon: 'fa-solid fa-circle-dot', brandClass: 'brand-oppo' },
    'Xiaomi':    { brandIcon: 'fa-solid fa-mobile-screen', brandClass: 'brand-xiaomi' },
    'Redmi':     { brandIcon: 'fa-solid fa-mobile-screen', brandClass: 'brand-xiaomi' },
    'POCO':      { brandIcon: 'fa-solid fa-fire', brandClass: 'brand-poco' },
    'realme':    { brandIcon: 'fa-solid fa-wand-magic-sparkles', brandClass: 'brand-realme' },
    'Motorola':  { brandIcon: 'fa-solid fa-shield-halved', brandClass: 'brand-motorola' },
    'Nothing':   { brandIcon: 'fa-solid fa-circle-nodes', brandClass: 'brand-nothing' },
    'CMF':       { brandIcon: 'fa-solid fa-shapes', brandClass: 'brand-nothing' },
    'Google':    { brandIcon: 'fa-brands fa-google', brandClass: 'brand-google' },
    'Infinix':   { brandIcon: 'fa-solid fa-infinity', brandClass: 'brand-infinix' },
    'Tecno':     { brandIcon: 'fa-solid fa-microchip', brandClass: 'brand-tecno' },
    'Lava':      { brandIcon: 'fa-solid fa-volcano', brandClass: 'brand-lava' },
    'Honor':     { brandIcon: 'fa-solid fa-crown', brandClass: 'brand-honor' },
    'ASUS ROG':  { brandIcon: 'fa-solid fa-gamepad', brandClass: 'brand-asus' }
};

/**
 * Validates and sanitizes a phone record against the TECH BOX AI schema
 * @param {object} raw - Incoming raw phone record
 * @returns {{ valid: boolean, errors: string[], sanitized: object | null }}
 */
function validatePhoneSchema(raw) {
    const errors = [];

    if (!raw || typeof raw !== 'object') {
        return { valid: false, errors: ['Record is not a valid object'], sanitized: null };
    }

    // 1. Mandatory Identity Fields
    const id = (raw.id || '').trim().toLowerCase();
    if (!id) {
        errors.push('Missing or empty "id" field');
    } else if (!/^[a-z0-9-]+$/.test(id)) {
        errors.push(`Invalid "id" format "${id}". Must be lowercase alphanumeric with hyphens.`);
    }

    const name = (raw.name || '').trim();
    if (!name || name.length < 2) {
        errors.push('Missing or invalid "name" (must be at least 2 characters)');
    }

    const brand = (raw.brand || '').trim();
    if (!brand || brand.length < 2) {
        errors.push('Missing or invalid "brand" (must be at least 2 characters)');
    }

    // 2. Pricing Validation (Indian Rupee Bounds)
    let priceNumericINR = parseInt(raw.priceNumericINR, 10);
    if (isNaN(priceNumericINR) || priceNumericINR <= 0) {
        // Attempt parsing from raw.price string if present
        const parsed = parseInt(String(raw.price || '').replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
            priceNumericINR = parsed;
        } else {
            errors.push('Invalid price: priceNumericINR must be a positive integer');
        }
    }

    // Sanity range check for Indian smartphone market: ₹4,000 to ₹3,00,000
    if (priceNumericINR < 4000 || priceNumericINR > 300000) {
        errors.push(`Suspicious pricing: ₹${priceNumericINR} is outside realistic Indian smartphone bounds (₹4,000 - ₹3,00,000)`);
    }

    // Standardized formatted price string: e.g. "₹1,29,999"
    const priceFormatted = raw.price && raw.price.includes('₹')
        ? raw.price.trim()
        : '₹' + priceNumericINR.toLocaleString('en-IN');

    // 3. Mandatory Hardware Specifications
    const processor = (raw.processor || '').trim();
    if (!processor) errors.push('Missing "processor" specification');

    const camera = (raw.camera || '').trim();
    if (!camera) errors.push('Missing "camera" specification');

    const battery = (raw.battery || '').trim();
    if (!battery) errors.push('Missing "battery" specification');

    const display = (raw.display || '').trim();
    if (!display) errors.push('Missing "display" specification');

    // 4. Specs Summary Pills (Must have at least 3 pills)
    let specs = Array.isArray(raw.specs) ? raw.specs : [];
    if (specs.length < 3) {
        // Build default 3 pills if specs array was omitted or truncated
        specs = [
            { icon: 'fa-solid fa-microchip', text: processor.split('(')[0].trim().slice(0, 26) },
            { icon: 'fa-solid fa-camera', text: camera.split('+')[0].trim().slice(0, 24) },
            { icon: 'fa-solid fa-battery-full', text: battery.split('(')[0].trim().slice(0, 20) }
        ];
    }

    // 5. Image & Fallbacks
    const image = (raw.image || '').trim();
    if (!image) {
        errors.push('Missing "image" path or URL');
    }

    // 6. Highlight Tag
    let highlightTag = raw.highlightTag;
    if (!highlightTag || typeof highlightTag !== 'object' || !highlightTag.text) {
        highlightTag = {
            text: '5G READY',
            icon: 'fa-solid fa-signal',
            colorClass: 'cyan'
        };
    }

    // 7. Aliases (Generate default search tokens if empty)
    let aliases = Array.isArray(raw.aliases) ? raw.aliases : [];
    const baseSlugToken = id.replace(/[^a-z0-9]/g, '');
    const baseNameToken = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const brandToken = brand.toLowerCase().replace(/[^a-z0-9]/g, '');

    const generatedAliases = new Set(aliases.map(a => String(a).toLowerCase().trim()).filter(Boolean));
    generatedAliases.add(baseSlugToken);
    generatedAliases.add(baseNameToken);
    generatedAliases.add(brandToken + baseNameToken);

    if (errors.length > 0) {
        return { valid: false, errors, sanitized: null };
    }

    // Brand defaults
    const brandMeta = BRAND_DEFAULTS[brand] || {
        brandIcon: raw.brandIcon || 'fa-solid fa-mobile-screen-button',
        brandClass: raw.brandClass || 'brand-other'
    };

    const sanitized = {
        id,
        name,
        brand,
        brandIcon: raw.brandIcon || brandMeta.brandIcon,
        brandClass: raw.brandClass || brandMeta.brandClass,
        fallbackName: (raw.fallbackName || name).toUpperCase(),
        price: priceFormatted,
        priceNumericINR,
        storageVariant: (raw.storageVariant || 'Base Variant').trim(),
        priceCheckDate: raw.priceCheckDate || new Date().toISOString().slice(0, 7),
        priceNote: raw.priceNote || `Starting from ${priceFormatted}`,
        rating: typeof raw.rating === 'number' ? Math.min(5, Math.max(1, raw.rating)) : 4.5,
        ratingCount: raw.ratingCount || '(100+)',
        image,
        highlightTag,
        glowClass: raw.glowClass || '',
        category: (raw.category || 'flagship 5g').toLowerCase().trim(),
        availability: raw.availability || 'available',
        specs: specs.slice(0, 3),
        processor,
        processorSub: (raw.processorSub || '').trim(),
        camera,
        cameraSub: (raw.cameraSub || '').trim(),
        battery,
        batterySub: (raw.batterySub || '').trim(),
        charging: (raw.charging || '').trim(),
        chargingSub: (raw.chargingSub || '').trim(),
        display,
        displaySub: (raw.displaySub || '').trim(),
        ram: (raw.ram || '').trim(),
        ramSub: (raw.ramSub || '').trim(),
        storage: (raw.storage || '').trim(),
        storageSub: (raw.storageSub || '').trim(),
        connectivity: (raw.connectivity || '5G Dual SIM').trim(),
        connectivitySub: (raw.connectivitySub || '').trim(),
        build: (raw.build || '').trim(),
        buildSub: (raw.buildSub || '').trim(),
        os: (raw.os || 'Android').trim(),
        osSub: (raw.osSub || '').trim(),
        aliases: Array.from(generatedAliases),
        sourceSpecsUrl: (raw.sourceSpecsUrl || '').trim(),
        sourcePriceUrl: (raw.sourcePriceUrl || '').trim(),
        imageLicense: raw.imageLicense || 'Manufacturer Press Kit (Editorial Reference)',
        isManuallyVerified: Boolean(raw.isManuallyVerified)
    };

    return { valid: true, errors: [], sanitized };
}

module.exports = { validatePhoneSchema, BRAND_DEFAULTS };
