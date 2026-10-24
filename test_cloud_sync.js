/**
 * TECH BOX AI — Cloud Sync Decommission & Public Access Verification Suite
 * Verifies that the Cloud Sync button, modal, registration prompts,
 * account-linking UI, and auto-upload behavior have been completely removed.
 */

const fs = require('fs');
const assert = require('assert');

// Mock localStorage & DOM
const storage = {};
const lsMock = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.localStorage = lsMock;
global.window = {
    localStorage: lsMock
};

const elements = {};
function createMockEl(tag = 'div', id = '') {
    const el = {
        tagName: tag.toUpperCase(),
        id: id,
        style: {},
        classList: {
            _c: new Set(),
            add: (c) => el.classList._c.add(c),
            remove: (c) => el.classList._c.delete(c),
            contains: (c) => el.classList._c.has(c),
            toggle: (c) => el.classList._c.has(c) ? (el.classList._c.delete(c), false) : (el.classList._c.add(c), true)
        },
        attributes: {},
        setAttribute: (k, v) => { el.attributes[k] = v; },
        removeAttribute: (k) => { delete el.attributes[k]; },
        value: '',
        _textContent: '',
        _innerHTML: '',
        children: [],
        addEventListener: (evt, fn) => { el['on' + evt] = fn; },
        appendChild: (child) => { el.children.push(child); if (child.id) elements[child.id] = child; return child; },
        remove: () => { if (el.id) delete elements[el.id]; }
    };

    Object.defineProperty(el, 'firstElementChild', {
        get: () => el.children[0] || el
    });

    Object.defineProperty(el, 'textContent', {
        get: () => el._textContent,
        set: (v) => { el._textContent = String(v); el._innerHTML = String(v); }
    });

    Object.defineProperty(el, 'innerHTML', {
        get: () => el._innerHTML,
        set: (v) => {
            el._innerHTML = String(v);
            el._textContent = String(v).replace(/<[^>]*>/g, '');
        }
    });

    if (id) elements[id] = el;
    return el;
}

const mockBody = createMockEl('body');
global.document = {
    body: mockBody,
    readyState: 'complete',
    getElementById: (id) => elements[id] || null,
    querySelector: (sel) => {
        if (sel.startsWith('#')) return elements[sel.slice(1)] || null;
        return null;
    },
    querySelectorAll: () => [],
    createElement: (tag) => createMockEl(tag),
    addEventListener: () => {}
};

console.log('\n============================================================');
console.log('  TECH BOX AI — Cloud Sync Removal Verification Suite');
console.log('============================================================\n');

// 1. Load auth.js and favorites.js
const authCode = fs.readFileSync('./auth.js', 'utf8');
const favCode = fs.readFileSync('./favorites.js', 'utf8');
eval(authCode);
eval(favCode);

console.log('--- 1. Testing Removal of Cloud Sync Controls ---');

// Check that no cloud sync elements exist in DOM
assert.strictEqual(global.document.getElementById('cloudSyncToast'), null, 'cloudSyncToast is not injected into DOM');
assert.strictEqual(global.document.getElementById('cloudSyncModalOverlay'), null, 'cloudSyncModalOverlay is not injected into DOM');
assert.strictEqual(global.document.getElementById('btnToastEnableSync'), null, 'btnToastEnableSync is not in DOM');
assert.strictEqual(global.document.getElementById('btnToastDismissSync'), null, 'btnToastDismissSync is not in DOM');
assert.strictEqual(global.document.getElementById('btnSubmitCloudSync'), null, 'btnSubmitCloudSync is not in DOM');
console.log('  ✅ PASS: All Cloud Sync DOM elements are absent');

console.log('\n--- 2. Testing Safe API Stub Behavior ---');
// openCloudSyncModal should be a safe no-op that does not crash or inject anything
assert.doesNotThrow(() => {
    global.window.techboxAuth.openCloudSyncModal();
}, 'Calling openCloudSyncModal does not throw');

assert.strictEqual(global.document.getElementById('cloudSyncModalOverlay'), null, 'Calling openCloudSyncModal does NOT create a modal in public mode');
console.log('  ✅ PASS: openCloudSyncModal is a safe no-op in public mode');

console.log('\n--- 3. Testing Zero Auto-Upload to Supabase ---');
let supabaseUploadAttempted = false;
global.window.techboxSupabase = {
    isReady: true,
    addFavorite: async () => { supabaseUploadAttempted = true; return { error: null }; },
    removeFavorite: async () => { supabaseUploadAttempted = true; return { error: null }; },
    getFavorites: async () => { supabaseUploadAttempted = true; return []; }
};

// Add and remove favorite
global.window.techboxFavorites.add('test-phone-1');
assert.strictEqual(supabaseUploadAttempted, false, 'Adding favorite does NOT trigger Supabase upload');

global.window.techboxFavorites.remove('test-phone-1');
assert.strictEqual(supabaseUploadAttempted, false, 'Removing favorite does NOT trigger Supabase removal');
console.log('  ✅ PASS: Favorites are purely local without any remote cloud upload');

console.log('\n============================================================');
console.log('  Test Summary: All Cloud Sync Removal Tests Passed!');
console.log('============================================================\n');
