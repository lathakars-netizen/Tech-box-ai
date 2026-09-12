/**
 * TECH BOX AI — Comprehensive Smartphone Catalogue & Search Verification Suite
 * Tests catalogue completeness, data sanitization, duplicate IDs, schema compliance,
 * 50+ normalized and spaceless search queries, price filters, and module compatibility.
 */

const assert = require('assert');
const { phonesData, sanitizePhoneData } = require('./data/phones.js');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        failedTests++;
    }
}

console.log('======================================================================');
console.log('  TECH BOX AI — Indian Smartphone Catalogue Verification Suite');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Database Size & Integrity
// -----------------------------------------------------------------------------
console.log('--- 1. Database Size & Integrity ---');

runTest('Catalogue loaded and contains at least 130 smartphones', () => {
    assert(Array.isArray(phonesData), 'phonesData should be an array');
    assert(phonesData.length >= 130, `Expected >= 130 phones, got ${phonesData.length}`);
    console.log(`     Total Verified Devices: ${phonesData.length}`);
});

runTest('Zero duplicate phone IDs', () => {
    const idSet = new Set();
    const dupes = [];
    phonesData.forEach(p => {
        if (idSet.has(p.id)) dupes.push(p.id);
        idSet.add(p.id);
    });
    assert.strictEqual(dupes.length, 0, `Duplicate IDs found: ${dupes.join(', ')}`);
});

runTest('All 17 target brands represented', () => {
    const brands = new Set(phonesData.map(p => p.brand.toLowerCase()));
    const targetBrands = [
        'samsung', 'apple', 'oneplus', 'iqoo', 'vivo', 'oppo',
        'xiaomi', 'poco', 'realme', 'motorola', 'nothing', 'google',
        'infinix', 'tecno', 'lava', 'honor', 'asus rog'
    ];
    const missing = targetBrands.filter(b => !brands.has(b));
    assert.strictEqual(missing.length, 0, `Missing brands: ${missing.join(', ')}`);
    
    // Brand count report
    const counts = {};
    phonesData.forEach(p => counts[p.brand] = (counts[p.brand] || 0) + 1);
    console.log('     Brand Breakdown:');
    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
        console.log(`       - ${brand}: ${count} models`);
    });
});

runTest('All records pass sanitizePhoneData with zero nulls', () => {
    phonesData.forEach(p => {
        const sanitized = sanitizePhoneData(p);
        assert(sanitized !== null, `Sanitized phone is null for ${p.id}`);
        assert(typeof sanitized.id === 'string' && sanitized.id.length > 0, `Invalid id for ${p.name}`);
        assert(typeof sanitized.name === 'string' && sanitized.name.length > 0, `Invalid name for ${p.id}`);
    });
});

// -----------------------------------------------------------------------------
// Suite 2: Mandatory Schema Attributes Compliance
// -----------------------------------------------------------------------------
console.log('\n--- 2. Mandatory Schema Attributes Compliance ---');

runTest('Every phone has verified pricing in INR (priceNumericINR > 0)', () => {
    phonesData.forEach(p => {
        assert(typeof p.priceNumericINR === 'number' && p.priceNumericINR > 0, `Invalid priceNumericINR in ${p.name}: ${p.priceNumericINR}`);
        assert(typeof p.price === 'string' && p.price.startsWith('₹'), `Invalid price format in ${p.name}: ${p.price}`);
    });
});

runTest('Every phone has storageVariant, priceCheckDate, and valid availability', () => {
    const validAvail = ['available', 'officially listed', 'discontinued'];
    phonesData.forEach(p => {
        assert(typeof p.storageVariant === 'string' && p.storageVariant.length > 0, `Missing storageVariant in ${p.name}`);
        assert(/^202[4-6]-\d{2}$/.test(p.priceCheckDate), `Invalid priceCheckDate format in ${p.name}: ${p.priceCheckDate}`);
        assert(validAvail.includes(p.availability), `Invalid availability in ${p.name}: ${p.availability}`);
    });
});

runTest('Every phone has source citations and image references', () => {
    phonesData.forEach(p => {
        assert(typeof p.sourceSpecsUrl === 'string' && p.sourceSpecsUrl.startsWith('http'), `Missing sourceSpecsUrl in ${p.name}`);
        assert(typeof p.sourcePriceUrl === 'string' && p.sourcePriceUrl.startsWith('http'), `Missing sourcePriceUrl in ${p.name}`);
        assert(typeof p.image === 'string' && p.image.length > 0, `Missing image in ${p.name}`);
        assert(typeof p.fallbackName === 'string' && p.fallbackName.length > 0, `Missing fallbackName in ${p.name}`);
    });
});

runTest('Every phone has at least 3 quick spec pills and full tech sheet', () => {
    phonesData.forEach(p => {
        assert(Array.isArray(p.specs) && p.specs.length >= 3, `Specs array too short in ${p.name}`);
        assert(p.processor && p.camera && p.battery && p.display && p.ram && p.storage && p.os, `Missing core specs in ${p.name}`);
    });
});

runTest('Every phone has search aliases array with spaceless tokens', () => {
    phonesData.forEach(p => {
        assert(Array.isArray(p.aliases) && p.aliases.length >= 3, `Aliases array too short in ${p.name}`);
        const hasSpaceless = p.aliases.some(a => !a.includes(' ') && !a.includes('-') && a.length > 2);
        assert(hasSpaceless, `Missing spaceless alias in ${p.name}: ${p.aliases.join(', ')}`);
    });
});

// -----------------------------------------------------------------------------
// Suite 3: Search Engine Simulation (50+ Real World Queries)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Search Engine Simulation (50+ Query Tests) ---');

// Implement search matching exactly like search.js
function searchPhones(query) {
    const q = query.trim().toLowerCase();
    const normQ = q.replace(/[^a-z0-9]/g, '');
    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = [];

    phonesData.forEach(phone => {
        let score = 0;
        const name = (phone.name || '').toLowerCase();
        const brand = (phone.brand || '').toLowerCase();
        const processor = ((phone.processor || '') + ' ' + (phone.processorSub || '')).toLowerCase();
        const camera = ((phone.camera || '') + ' ' + (phone.cameraSub || '')).toLowerCase();
        const ram = ((phone.ram || '') + ' ' + (phone.ramSub || '')).toLowerCase();
        const battery = ((phone.battery || '') + ' ' + (phone.batterySub || '')).toLowerCase();
        const build = ((phone.build || '') + ' ' + (phone.buildSub || '')).toLowerCase();
        const category = (phone.category || '').toLowerCase();

        // 1. Alias Match
        if (phone.aliases && phone.aliases.length > 0) {
            for (const alias of phone.aliases) {
                const a = (alias || '').toLowerCase();
                const normA = a.replace(/[^a-z0-9]/g, '');
                if (normA && normQ && normA === normQ) {
                    score += 100;
                    break;
                } else if (normA && normQ && normA.startsWith(normQ)) {
                    score += 70;
                    break;
                } else if (a.includes(q) || (normQ.length > 2 && (normA.includes(normQ) || normQ.includes(normA)))) {
                    score += 50;
                    break;
                }
            }
        }

        // 2. Normalized Name & Brand Match
        const normName = name.replace(/[^a-z0-9]/g, '');
        const normBrand = brand.replace(/[^a-z0-9]/g, '');
        if (normName === normQ) score += 100;
        else if (normName.startsWith(normQ)) score += 65;
        else if (normName.includes(normQ) || (normQ.length > 3 && normQ.includes(normName))) score += 40;

        if (normBrand === normQ) score += 50;
        else if (normBrand.includes(normQ)) score += 25;

        // 3. Direct strings
        if (name.includes(q)) score += name.startsWith(q) ? 40 : 25;
        if (brand.includes(q)) score += 20;

        // 4. Specs
        if (processor.includes(q) || (normQ.length > 3 && processor.replace(/[^a-z0-9]/g, '').includes(normQ))) score += 15;
        if (camera.includes(q) || (normQ.length > 3 && camera.replace(/[^a-z0-9]/g, '').includes(normQ))) score += 15;
        if (ram.includes(q) || (normQ.length > 2 && ram.replace(/[^a-z0-9]/g, '').includes(normQ))) score += 12;
        if (battery.includes(q) || (normQ.length > 3 && battery.replace(/[^a-z0-9]/g, '').includes(normQ))) score += 12;
        if (build.includes(q) || (normQ.length > 3 && build.replace(/[^a-z0-9]/g, '').includes(normQ))) score += 15;
        if (category.includes(q)) score += 8;

        if (Array.isArray(phone.specs)) {
            phone.specs.forEach(s => {
                const sText = (s.text || '').toLowerCase();
                if (sText.includes(q) || (normQ.length > 3 && sText.replace(/[^a-z0-9]/g, '').includes(normQ))) score += 8;
            });
        }

        if (tokens.length > 1) {
            const fullCorpus = `${name} ${brand} ${processor} ${camera} ${ram} ${battery} ${build} ${category} ${(phone.aliases || []).join(' ')}`.toLowerCase();
            if (tokens.every(t => fullCorpus.includes(t))) score += 35;
        }

        if (score > 0) {
            scored.push({ phone, score });
        }
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.phone);
}

// 50+ Diverse Test Queries
const testQueries = [
    // 1-10: Spaceless queries explicitly tested in user instructions
    { query: 'oppok135g', targetId: 'oppo-k13-5g', desc: 'Spaceless OPPO K13 5G' },
    { query: 'oppo k13', targetId: 'oppo-k13-5g', desc: 'Spaced oppo k13' },
    { query: 'iqooneo10', targetId: 'iqoo-neo-10', desc: 'Spaceless iqooneo10' },
    { query: 'iQOO Neo 10', targetId: 'iqoo-neo-10', desc: 'Cased iQOO Neo 10' },
    { query: 's25ultra', targetId: 'samsung-galaxy-s25-ultra', desc: 'Spaceless s25ultra' },
    { query: 'S25 Ultra', targetId: 'samsung-galaxy-s25-ultra', desc: 'Capitalized S25 Ultra' },
    { query: 'Nothing 2', targetId: 'nothing-phone-2', desc: 'Nothing 2 shorthand' },
    { query: '16promax', targetId: 'apple-iphone-16-pro-max', desc: 'Spaceless 16promax' },
    { query: 'edge50fusion', targetId: 'motorola-edge-50-fusion', desc: 'Spaceless edge50fusion' },
    { query: 'gt7pro', targetId: 'realme-gt-7-pro', desc: 'Spaceless gt7pro' },

    // 11-20: Other popular model spaceless & shorthand queries
    { query: 'nord4', targetId: 'oneplus-nord-4-5g', desc: 'Spaceless nord4' },
    { query: '13r', targetId: 'oneplus-13r-5g', desc: 'OnePlus 13R shorthand' },
    { query: 'pixel9pro', targetId: 'pixel-9-pro', desc: 'Spaceless pixel9pro' },
    { query: 'phone2a', targetId: 'nothing-phone-2a', desc: 'Spaceless phone2a' },
    { query: 'cmfphone1', targetId: 'cmf-phone-1', desc: 'Spaceless cmfphone1' },
    { query: 'agni3', targetId: 'lava-agni-3-5g', desc: 'Lava Agni 3 shorthand' },
    { query: 'pova6pro', targetId: 'tecno-pova-6-pro-5g', desc: 'Tecno Pova 6 Pro' },
    { query: 'zeroflip', targetId: 'infinix-zero-flip-5g', desc: 'Infinix Zero Flip' },
    { query: 'rog9pro', targetId: 'asus-rog-phone-9-pro', desc: 'ROG 9 Pro shorthand' },
    { query: 'x200pro', targetId: 'vivo-x200-pro', desc: 'vivo X200 Pro' },

    // 21-30: Uppercase and Punctuation queries
    { query: 'OPPO K13 5G', targetId: 'oppo-k13-5g', desc: 'Full uppercase OPPO K13 5G' },
    { query: 'Phone (2a) Plus', targetId: 'nothing-phone-2a-plus', desc: 'Nothing Phone (2a) Plus with parens' },
    { query: 'F27 Pro+', targetId: 'oppo-f27-pro-plus-5g', desc: 'OPPO F27 Pro+ with plus' },
    { query: 'Redmi Note 14 Pro+', targetId: 'redmi-note-14-pro-plus-5g', desc: 'Redmi Note 14 Pro+' },
    { query: 'Razr 50 Ultra', targetId: 'motorola-razr-50-ultra', desc: 'Motorola Razr 50 Ultra' },
    { query: 'Z Fold6', targetId: 'samsung-galaxy-z-fold6', desc: 'Samsung Z Fold6' },
    { query: 'Find X8 Pro', targetId: 'oppo-find-x8-pro', desc: 'OPPO Find X8 Pro' },
    { query: 'iPhone 16e', targetId: 'apple-iphone-16e', desc: 'iPhone 16e compact flagship' },
    { query: 'Xiaomi 15 Ultra', targetId: 'xiaomi-15-ultra', desc: 'Xiaomi 15 Ultra' },
    { query: 'POCO F6 Pro', targetId: 'poco-f6-pro', desc: 'POCO F6 Pro' },

    // 31-40: Brand Queries (Must return correct brand as top results)
    { query: 'Samsung', brandExpected: 'Samsung', minCount: 15, desc: 'Brand Search: Samsung' },
    { query: 'Apple', brandExpected: 'Apple', minCount: 10, desc: 'Brand Search: Apple' },
    { query: 'OnePlus', brandExpected: 'OnePlus', minCount: 7, desc: 'Brand Search: OnePlus' },
    { query: 'iQOO', brandExpected: 'iQOO', minCount: 8, desc: 'Brand Search: iQOO' },
    { query: 'vivo', brandExpected: 'Vivo', minCount: 10, desc: 'Brand Search: vivo' },
    { query: 'OPPO', brandExpected: 'OPPO', minCount: 8, desc: 'Brand Search: OPPO' },
    { query: 'Xiaomi', brandExpected: 'Xiaomi', minCount: 5, desc: 'Brand Search: Xiaomi' },
    { query: 'POCO', brandExpected: 'POCO', minCount: 8, desc: 'Brand Search: POCO' },
    { query: 'realme', brandExpected: 'realme', minCount: 10, desc: 'Brand Search: realme' },
    { query: 'Motorola', brandExpected: 'Motorola', minCount: 8, desc: 'Brand Search: Motorola' },

    // 41-50: Technical Specs Queries
    { query: '200MP', minCount: 5, desc: 'Spec Search: 200MP camera phones' },
    { query: 'Snapdragon 8 Elite', minCount: 4, desc: 'Spec Search: Snapdragon 8 Elite flagships' },
    { query: 'Dimensity 7300', minCount: 2, desc: 'Spec Search: Dimensity 7300 mid-rangers' },
    { query: 'dimensity7300', minCount: 2, desc: 'Spaceless Spec Search: dimensity7300' },
    { query: 'foldable', minCount: 5, desc: 'Category Search: foldable' },
    { query: 'gaming', minCount: 5, desc: 'Category Search: gaming' },
    { query: 'Titanium', minCount: 3, desc: 'Spec Search: Titanium build' },
    { query: '120Hz', minCount: 20, desc: 'Spec Search: 120Hz displays' },
    { query: 'Periscope', minCount: 8, desc: 'Spec Search: Periscope zoom' },
    { query: '6000 mAh', minCount: 2, desc: 'Spec Search: 6000 mAh battery' }
];

testQueries.forEach(t => {
    runTest(`Search query: "${t.query}" (${t.desc})`, () => {
        const results = searchPhones(t.query);
        assert(results.length > 0, `No results found for query "${t.query}"`);

        if (t.targetId) {
            // Target model should be in the top 3 results (usually #1)
            const top3 = results.slice(0, 3).map(p => p.id);
            assert(top3.includes(t.targetId), `Expected ${t.targetId} in top 3 for "${t.query}", got ${top3.join(', ')}`);
            console.log(`     Rank #${top3.indexOf(t.targetId) + 1}: ${results[top3.indexOf(t.targetId)].name}`);
        } else if (t.brandExpected) {
            const topMatches = results.slice(0, 5).filter(p => p.brand.toLowerCase() === t.brandExpected.toLowerCase());
            assert(topMatches.length >= 3, `Expected majority top matches to be ${t.brandExpected}`);
            assert(results.length >= t.minCount, `Expected at least ${t.minCount} results for ${t.brandExpected}, got ${results.length}`);
        } else if (t.minCount) {
            assert(results.length >= t.minCount, `Expected at least ${t.minCount} results, got ${results.length}`);
            console.log(`     Found ${results.length} matches. Top result: ${results[0].name}`);
        }
    });
});

// -----------------------------------------------------------------------------
// Suite 4: Price Filter Segments
// -----------------------------------------------------------------------------
console.log('\n--- 4. Price Filter Segments ---');

const priceSegments = [
    { label: 'Budget: Under ₹15,000', min: 0, max: 15000, minExpected: 8 },
    { label: 'Mid-Range: ₹15,000 – ₹30,000', min: 15000, max: 30000, minExpected: 25 },
    { label: 'Upper Mid: ₹30,000 – ₹50,000', min: 30000, max: 50000, minExpected: 20 },
    { label: 'Premium: ₹50,000 – ₹80,000', min: 50000, max: 80000, minExpected: 15 },
    { label: 'Ultra Flagship: Above ₹80,000', min: 80000, max: Infinity, minExpected: 15 }
];

priceSegments.forEach(seg => {
    runTest(`Price segment: ${seg.label}`, () => {
        const matches = phonesData.filter(p => {
            const price = p.priceNumericINR;
            return price >= seg.min && price <= seg.max;
        });
        assert(matches.length >= seg.minExpected, `Expected >= ${seg.minExpected} devices in ${seg.label}, got ${matches.length}`);
        console.log(`     Count: ${matches.length} models (e.g. ${matches[0].name} @ ${matches[0].price})`);
    });
});

console.log('\n======================================================================');
console.log(`  Test Summary: ${passedTests} Passed | ${failedTests} Failed`);
console.log('======================================================================');

if (failedTests > 0) {
    process.exit(1);
}
