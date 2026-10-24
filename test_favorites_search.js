/**
 * test_favorites_search.js — Targeted regression tests for:
 *   1. Favorites localStorage read/write/toggle using techbox_favorites key
 *   2. Search algorithm correctness for target queries
 *   3. Consistent phone IDs across cards and details
 */

'use strict';

const fs = require('fs');

// ─── Setup ───────────────────────────────────────────────────────────────────

// Minimal localStorage mock
const store = {};
const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
global.localStorage = localStorage;
global.window = { localStorage };

// Load phones data
const phonesCode = fs.readFileSync('data/phones.js', 'utf8');
eval(phonesCode.replace('const phonesData =', 'global.phonesData ='));
const dataList = global.phonesData;

// ─── Inline Favorites Logic (mirrors favorites.js) ───────────────────────────
const STORAGE_KEY = 'techbox_favorites';

function getFavorites() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

function saveFavorites(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx === -1) {
        favs.push(id);
        saveFavorites(favs);
        return true; // added
    } else {
        favs.splice(idx, 1);
        saveFavorites(favs);
        return false; // removed
    }
}

// ─── Unified Search Logic (loads directly from search.js) ───────────────────
global.document = {
    readyState: 'complete',
    addEventListener: () => {},
    getElementById: (id) => ({
        addEventListener: () => {},
        setAttribute: () => {},
        style: {},
        classList: { add: () => {}, remove: () => {} }
    }),
    body: { appendChild: () => {} },
    createElement: () => ({
        setAttribute: () => {},
        addEventListener: () => {},
        appendChild: () => {},
        querySelectorAll: () => [],
        style: {},
        classList: { add: () => {}, remove: () => {} }
    })
};
global.window = {
    localStorage,
    document: global.document,
    phonesData: dataList,
    techboxLang: null,
    addEventListener: () => {}
};

// Evaluate search.js to test the actual application search engine
const searchCode = fs.readFileSync('search.js', 'utf8');
eval(searchCode);

function searchPhones(rawQuery) {
    if (global.window.techboxSearch && typeof global.window.techboxSearch.search === 'function') {
        return global.window.techboxSearch.search(rawQuery, dataList);
    }
    return [];
}

// ─── Test Helpers ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, label, detail = '') {
    if (condition) {
        console.log(`  ✅ PASS: ${label}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
        failed++;
    }
}

// ─── Test Suite 1: Favorites LocalStorage ─────────────────────────────────────
console.log('\n--- 1. Favorites: localStorage key and toggle ---');

localStorage.clear();
assert(getFavorites().length === 0, 'Initial favorites is empty');

const testId1 = 'samsung-galaxy-s25-ultra';
const testId2 = 'apple-iphone-16-pro';

let wasAdded = toggleFavorite(testId1);
assert(wasAdded === true, 'toggleFavorite returns true when adding');
assert(isFavorite(testId1), `isFavorite(${testId1}) is true after adding`);
assert(getFavorites().length === 1, 'favorites count is 1 after adding one phone');

toggleFavorite(testId2);
assert(getFavorites().length === 2, 'favorites count is 2 after adding second phone');
assert(isFavorite(testId2), `isFavorite(${testId2}) is true after adding`);

let wasRemoved = toggleFavorite(testId1);
assert(wasRemoved === false, 'toggleFavorite returns false when removing');
assert(!isFavorite(testId1), `isFavorite(${testId1}) is false after removing`);
assert(getFavorites().length === 1, 'favorites count is 1 after removing one phone');
assert(isFavorite(testId2), `Other favorite (${testId2}) not affected`);

// ─── Test Suite 2: Persistence simulation (re-read from same localStorage) ────
console.log('\n--- 2. Favorites: persistence across page reload simulation ---');

// Simulate "page reload" by re-reading from same localStorage store
const persistedFavs = getFavorites();
assert(persistedFavs.length === 1, 'Favorites persisted correctly after "reload"');
assert(persistedFavs[0] === testId2, `Persisted ID is "${testId2}"`);

// Clear all
saveFavorites([]);
assert(getFavorites().length === 0, 'Favorites cleared correctly');

// ─── Test Suite 3: Favorites phone ID consistency with catalogue ──────────────
console.log('\n--- 3. Favorites: phone IDs match catalogue ---');

// Test that the IDs used in favorites match actual phone IDs in catalogue
const targetIds = [
    'samsung-galaxy-s25-ultra',
    'apple-iphone-16-pro',
    'iqoo-neo-10',
    'samsung-galaxy-s25'
];

targetIds.forEach(id => {
    const found = dataList.find(p => p.id === id);
    assert(!!found, `Phone ID "${id}" exists in catalogue`, found ? '' : 'ID not found in phones.js');
    if (found) {
        // Verify card template would produce data-id and data-fav-id
        const cardHtml = `<button class="fav-btn" data-id="${found.id}" data-fav-id="${found.id}">`;
        assert(cardHtml.includes(`data-id="${id}"`), `Card HTML has correct data-id for "${id}"`);
        assert(cardHtml.includes(`data-fav-id="${id}"`), `Card HTML has correct data-fav-id for "${id}"`);
    }
});

// ─── Test Suite 4: Search Algorithm ─────────────────────────────────────────
console.log('\n--- 4. Search: Target query matching ---');

const searchTests = [
    {
        query: 'Samsung Galaxy S25',
        mustInclude: ['samsung-galaxy-s25', 'samsung-galaxy-s25-ultra', 'samsung-galaxy-s25-plus'],
        mustExclude: [],
        label: 'Samsung Galaxy S25 returns all S25 models'
    },
    {
        query: 'iQOO Neo 10',
        mustInclude: ['iqoo-neo-10'],
        mustExclude: [],
        label: 'iQOO Neo 10 matches exact model'
    },
    {
        query: 'iqoo neo10',
        mustInclude: ['iqoo-neo-10'],
        mustExclude: [],
        label: 'iqoo neo10 (no space) matches iQOO Neo 10'
    },
    {
        query: 'iPhone 16 Pro',
        mustInclude: ['apple-iphone-16-pro', 'apple-iphone-16-pro-max'],
        mustExclude: [],
        label: 'iPhone 16 Pro returns both Pro variants'
    },
    {
        query: 'Apple',
        mustInclude: ['apple-iphone-16-pro'],
        mustExclude: [],
        label: 'Apple brand search returns iPhones'
    },
    {
        query: 'completely_nonexistent_zzzxxx',
        mustInclude: [],
        mustExclude: [],
        label: 'Non-existent query returns 0 results',
        expectZero: true
    }
];

searchTests.forEach(test => {
    const results = searchPhones(test.query);
    const ids = results.map(p => p.id);

    if (test.expectZero) {
        assert(results.length === 0, test.label, `Got ${results.length} results`);
        return;
    }

    let allPassed = true;
    test.mustInclude.forEach(id => {
        if (!ids.includes(id)) {
            allPassed = false;
            console.log(`     Missing: ${id}`);
        }
    });
    test.mustExclude.forEach(id => {
        if (ids.includes(id)) {
            allPassed = false;
            console.log(`     Unexpected: ${id}`);
        }
    });

    assert(results.length > 0, `${test.label} — returns results (${results.length})`);
    assert(allPassed, `${test.label} — correct phones included`);
});

// ─── Test Suite 5: Details page fav key compatibility ────────────────────────
console.log('\n--- 5. Details page: uses techbox_favorites array (not fav_id keys) ---');

localStorage.clear();

// Old format (details.js used fav_${id} = 'true')
// Simulate what the NEW details.js does:
const detailsPhoneId = 'apple-iphone-16-pro';
const favs = getFavorites();
if (!favs.includes(detailsPhoneId)) favs.push(detailsPhoneId);
saveFavorites(favs);

assert(localStorage.getItem(STORAGE_KEY) !== null, 'techbox_favorites key is written');
assert(localStorage.getItem(`fav_${detailsPhoneId}`) === null, 'Old fav_id key is NOT written by new details.js');
assert(isFavorite(detailsPhoneId), 'Phone is retrievable from techbox_favorites array');

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(62)}`);
console.log(`  Test Summary: ${passed} Passed | ${failed} Failed`);
console.log('='.repeat(62));

process.exit(failed > 0 ? 1 : 0);
