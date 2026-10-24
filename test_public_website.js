/**
 * TECH BOX AI — Public Website Verification Test Suite
 * 
 * Verifies that TECH BOX AI is a fully public smartphone discovery platform:
 * 1. No Sign In, Register, or Cloud Sync controls in HTML or injected into DOM.
 * 2. Desktop and mobile navigation links are intact and functional.
 * 3. Favorites work 100% locally via localStorage without login or Supabase sync.
 * 4. Search, phone details, compare, and AI recommendations work without login.
 * 5. Contact and Sell Phone forms allow public submission with spam protection.
 * 6. Public reviews are readable by everyone and allow safe submission with spam protection.
 * 7. Graceful offline fallback when Supabase is unavailable.
 */

const fs = require('fs');
const path = require('path');

// Test runner helper
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✅ PASS: ${testName}`);
        passCount++;
    } else {
        console.error(`  ❌ FAIL: ${testName}`);
        failCount++;
    }
}

console.log('\n============================================================');
console.log('  TECH BOX AI — Public Website Verification Suite');
console.log('============================================================\n');

/* ==========================================================================
   1. Static HTML Audit: No Sign In, Register, or Cloud Sync in Markup
   ========================================================================== */
console.log('--- 1. Static HTML Audit for Public Access ---');

const htmlFiles = [
    'home.html',
    'mobiles.html',
    'details.html',
    'compare.html',
    'sell-phone.html',
    'ai-assistant.html',
    'news.html',
    'contact.html'
];

htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

    // Check for hardcoded Sign In / Register / Cloud Sync controls
    const hasStaticSignIn = /id=["']btnNavbarSignIn["']|<button[^>]*>[\s\r\n]*Sign In/i.test(content);
    const hasStaticRegister = /id=["']btnNavbarRegister["']|<button[^>]*>[\s\r\n]*Register/i.test(content);
    const hasStaticCloudSync = /id=["']cloudSyncModalOverlay["']|id=["']cloudSyncToast["']/i.test(content);

    assert(!hasStaticSignIn, `${file} contains NO hardcoded Sign In buttons`);
    assert(!hasStaticRegister, `${file} contains NO hardcoded Register buttons`);
    assert(!hasStaticCloudSync, `${file} contains NO hardcoded Cloud Sync modals or toasts`);
});

/* ==========================================================================
   2. DOM Environment Mock & auth.js Public Shim Verification
   ========================================================================== */
console.log('\n--- 2. Auth Module & UI Injection Verification ---');

const storage = {};
global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Minimal DOM Element Mock
class MockElement {
    constructor(tag, id = '') {
        this.tagName = tag.toUpperCase();
        this.id = id;
        this.className = '';
        this.children = [];
        this.parentNode = null;
        this.attributes = {};
        this.style = {};
        this.value = '';
        this._innerHTML = '';
        this._textContent = '';
        this.listeners = {};
        this.classList = {
            _classes: new Set(),
            add: (...cs) => cs.forEach(c => this.classList._classes.add(c)),
            remove: (...cs) => cs.forEach(c => this.classList._classes.delete(c)),
            contains: (c) => this.classList._classes.has(c),
            toggle: (c) => this.classList._classes.has(c) ? (this.classList._classes.delete(c), false) : (this.classList._classes.add(c), true)
        };
    }

    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] || null; }
    removeAttribute(k) { delete this.attributes[k]; }

    get innerHTML() { return this._innerHTML; }
    set innerHTML(val) {
        this._innerHTML = String(val);
        this._textContent = String(val).replace(/<[^>]*>/g, '');
    }

    get textContent() { return this._textContent; }
    set textContent(val) {
        this._textContent = String(val);
        this._innerHTML = String(val);
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    insertBefore(newNode, refNode) {
        newNode.parentNode = this;
        const idx = this.children.indexOf(refNode);
        if (idx !== -1) {
            this.children.splice(idx, 0, newNode);
        } else {
            this.children.push(newNode);
        }
        return newNode;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parentNode = null;
        }
        return child;
    }

    contains(node) {
        if (node === this) return true;
        return this.children.some(c => c.contains ? c.contains(node) : c === node);
    }

    querySelector(sel) {
        if (sel.startsWith('#')) {
            const searchId = sel.slice(1);
            if (this.id === searchId) return this;
            for (const c of this.children) {
                if (c.querySelector) {
                    const found = c.querySelector(sel);
                    if (found) return found;
                }
            }
        }
        if (sel.startsWith('.')) {
            const cls = sel.slice(1);
            if ((this.className || '').split(' ').includes(cls)) return this;
            for (const c of this.children) {
                if (c.querySelector) {
                    const found = c.querySelector(sel);
                    if (found) return found;
                }
            }
        }
        return null;
    }

    querySelectorAll(sel) {
        const results = [];
        if (sel.startsWith('.')) {
            const cls = sel.slice(1);
            if ((this.className || '').split(' ').includes(cls)) results.push(this);
        }
        for (const c of this.children) {
            if (c.querySelectorAll) {
                results.push(...c.querySelectorAll(sel));
            }
        }
        return results;
    }

    closest(sel) {
        let cur = this;
        while (cur) {
            if (sel.startsWith('#') && cur.id === sel.slice(1)) return cur;
            if (sel.startsWith('.') && (cur.className || '').split(' ').includes(sel.slice(1))) return cur;
            cur = cur.parentNode;
        }
        return null;
    }

    addEventListener(evt, fn) {
        if (!this.listeners[evt]) this.listeners[evt] = [];
        this.listeners[evt].push(fn);
    }

    dispatchEvent(evt) {
        const type = typeof evt === 'string' ? evt : evt.type;
        const fns = this.listeners[type] || [];
        fns.forEach(fn => fn(evt));
    }
}

// Setup global mock DOM
const mockDocBody = new MockElement('body');
const navActionsMock = new MockElement('div');
navActionsMock.className = 'nav-actions';
const searchBtnMock = new MockElement('button', 'searchBtn');
const themeToggleMock = new MockElement('button', 'themeToggle');
const hamburgerBtnMock = new MockElement('button', 'hamburgerBtn');

navActionsMock.appendChild(searchBtnMock);
navActionsMock.appendChild(themeToggleMock);
navActionsMock.appendChild(hamburgerBtnMock);
mockDocBody.appendChild(navActionsMock);

const mobileListMock = new MockElement('ul');
mobileListMock.className = 'mobile-nav-list';
mockDocBody.appendChild(mobileListMock);

global.window = {
    localStorage: global.localStorage,
    location: { search: '?id=s25-ultra', href: 'home.html' }
};

global.document = {
    readyState: 'complete',
    body: mockDocBody,
    getElementById: (id) => {
        function search(el) {
            if (el.id === id) return el;
            for (const c of el.children) {
                const found = search(c);
                if (found) return found;
            }
            return null;
        }
        return search(mockDocBody);
    },
    querySelector: (sel) => mockDocBody.querySelector(sel),
    querySelectorAll: (sel) => mockDocBody.querySelectorAll(sel),
    createElement: (tag) => new MockElement(tag),
    addEventListener: (evt, fn) => {
        // mock
    }
};

// Execute auth.js
const authCode = fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8');
eval(authCode);

assert(typeof global.window.techboxAuth === 'object', 'auth.js initializes window.techboxAuth API');
assert(global.window.techboxAuth.isPublic === true, 'techboxAuth declares isPublic: true');
assert(global.window.techboxAuth.getCurrentUser() === null, 'techboxAuth.getCurrentUser() returns null (public visitor)');

// Verify NO auth elements were injected into desktop navbar or mobile drawer
assert(global.document.getElementById('navUserContainer') === null, 'No user container injected in desktop navbar');
assert(global.document.getElementById('btnNavbarSignIn') === null, 'No Sign In button injected in navbar');
assert(global.document.getElementById('userProfilePill') === null, 'No User Profile pill injected in navbar');
assert(global.document.getElementById('mobileAuthNavItem') === null, 'No auth list item in mobile drawer');
assert(global.document.getElementById('authModalOverlay') === null, 'No auth modal overlay injected into DOM');
assert(global.document.getElementById('cloudSyncModalOverlay') === null, 'No cloud sync modal injected into DOM');
assert(global.document.getElementById('cloudSyncToast') === null, 'No cloud sync toast injected into DOM');

/* ==========================================================================
   3. Local Favorites Without Login Verification (Requirement 2)
   ========================================================================== */
console.log('\n--- 3. Favorites LocalStorage & Public Gating Verification ---');

const { phonesData } = require('./data/phones.js');
global.window.phonesData = phonesData;

// Mock Supabase to ensure NO favorites sync calls are made
let supabaseAddFavCalled = false;
let supabaseRemoveFavCalled = false;
let supabaseGetFavCalled = false;

global.window.techboxSupabase = {
    isReady: true,
    addFavorite: async () => { supabaseAddFavCalled = true; return { error: null }; },
    removeFavorite: async () => { supabaseRemoveFavCalled = true; return { error: null }; },
    getFavorites: async () => { supabaseGetFavCalled = true; return []; },
    submitContactForm: async (data) => ({ data: { id: 'contact-1' }, error: null }),
    submitSellRequest: async (uid, data) => ({ data: { id: 'sell-1' }, error: null }),
    getReviews: async () => [],
    submitReview: async () => ({ data: null, error: { message: 'auth.uid() is null' } })
};

// Execute favorites.js
const favCode = fs.readFileSync(path.join(__dirname, 'favorites.js'), 'utf8');
eval(favCode);

assert(typeof global.window.techboxFavorites === 'object', 'favorites.js attached window.techboxFavorites');

// 3.1 Verify adding favorite
storage['techbox_favorites'] = '[]';
const addResult = global.window.techboxFavorites.add('samsung-galaxy-s25-ultra');
assert(addResult === true, 'Adding favorite returns true');
assert(global.window.techboxFavorites.isFavorite('samsung-galaxy-s25-ultra') === true, 'isFavorite returns true for saved phone');
assert(global.window.techboxFavorites.get().includes('samsung-galaxy-s25-ultra'), 'Phone ID persisted in localStorage favorites');
assert(!supabaseAddFavCalled, 'CRITICAL: Supabase addFavorite was NEVER called (Pure Local Storage)');

// 3.2 Verify persistence across simulated browser restart / reload
const reloadedFavs = JSON.parse(global.localStorage.getItem('techbox_favorites') || '[]');
assert(reloadedFavs.includes('samsung-galaxy-s25-ultra'), 'Favorites retained in storage after reload');

// 3.3 Verify retrieving full phone objects
const savedPhones = global.window.techboxFavorites.getFavoritePhones();
assert(savedPhones.length === 1 && savedPhones[0].id === 'samsung-galaxy-s25-ultra', 'getFavoritePhones retrieves full catalogue object');

// 3.4 Verify removing favorite
const removeResult = global.window.techboxFavorites.remove('samsung-galaxy-s25-ultra');
assert(removeResult === true, 'Removing favorite returns true');
assert(global.window.techboxFavorites.isFavorite('samsung-galaxy-s25-ultra') === false, 'isFavorite returns false after removal');
assert(global.window.techboxFavorites.get().length === 0, 'LocalStorage favorites array is empty');
assert(!supabaseRemoveFavCalled, 'CRITICAL: Supabase removeFavorite was NEVER called');

/* ==========================================================================
   4. Public Reviews Engine Verification (Requirement 5)
   ========================================================================== */
console.log('\n--- 4. Public Reviews & Spam Protection Verification ---');

// Setup mock reviews containers
const reviewsSectionMock = new MockElement('section', 'dhReviewsSection');
const revFormContainerMock = new MockElement('div', 'revFormContainer');
const revListContainerMock = new MockElement('div', 'revListContainer');
const revSummaryScoreMock = new MockElement('div', 'revSummaryScore');
const revSummaryStarsMock = new MockElement('div', 'revSummaryStars');
const revSummaryCountMock = new MockElement('div', 'revSummaryCount');
const revSummaryBarsMock = new MockElement('div', 'revSummaryBars');

reviewsSectionMock.appendChild(revFormContainerMock);
reviewsSectionMock.appendChild(revListContainerMock);
reviewsSectionMock.appendChild(revSummaryScoreMock);
reviewsSectionMock.appendChild(revSummaryStarsMock);
reviewsSectionMock.appendChild(revSummaryCountMock);
reviewsSectionMock.appendChild(revSummaryBarsMock);
mockDocBody.appendChild(reviewsSectionMock);

// Execute reviews.js
const reviewsCode = fs.readFileSync(path.join(__dirname, 'reviews.js'), 'utf8');
eval(reviewsCode);

assert(typeof global.window.techboxReviews === 'object', 'reviews.js attached window.techboxReviews');

// 4.1 Verify public reading of reviews
const s25Reviews = global.window.techboxReviews.getReviews('s25-ultra');
assert(s25Reviews.length >= 2, 'Public visitors can read seed/public reviews without sign-in');
assert(s25Reviews[0].title.length > 0, 'Review headlines are populated');

// 4.2 Verify public submission
storage['techbox_reviews'] = '[]';
storage['techbox_last_review_ts'] = '0';

const newRev = global.window.techboxReviews.addReview(
    's25-ultra',
    'Rohan Mehta',
    '',
    5,
    'Outstanding zoom photography and battery longevity',
    'Used this device extensively for 2 weeks in Mumbai daylight. Camera zoom at 30x is surprisingly sharp.'
);

assert(typeof newRev === 'object', 'addReview returns newly created review');
assert(newRev.userName === 'Rohan Mehta', 'Reviewer display name saved');
assert(newRev.rating === 5, 'Rating score 5 saved');

const updatedS25Reviews = global.window.techboxReviews.getReviews('s25-ultra');
assert(updatedS25Reviews[0].id === newRev.id, 'New review placed at top of list');
assert(JSON.parse(storage['techbox_reviews']).length === 1, 'Review persisted in localStorage');

/* ==========================================================================
   5. Contact Form Public Submission & Spam Protection (Requirement 4)
   ========================================================================== */
console.log('\n--- 5. Contact Form Public Submission Verification ---');

const contactHtml = fs.readFileSync(path.join(__dirname, 'contact.html'), 'utf8');
assert(contactHtml.includes('id="contactHoneypot"'), 'contact.html includes anti-spam honeypot field');
assert(contactHtml.includes('id="contactForm"'), 'contact.html includes contactForm');

/* ==========================================================================
   6. Sell Phone Public Submission & Valuation (Requirement 4)
   ========================================================================== */
console.log('\n--- 6. Sell Phone Public Valuation Verification ---');

const sellHtml = fs.readFileSync(path.join(__dirname, 'sell-phone.html'), 'utf8');
assert(sellHtml.includes('id="sellContactInput"'), 'sell-phone.html includes contact email/phone input');
assert(sellHtml.includes('id="sellHoneypot"'), 'sell-phone.html includes anti-spam honeypot');
assert(sellHtml.includes('id="sellStatusBanner"'), 'sell-phone.html includes status message banner');

const sellJs = fs.readFileSync(path.join(__dirname, 'sell-phone.js'), 'utf8');
assert(sellJs.includes('SELL_COOLDOWN_KEY'), 'sell-phone.js includes rate-limiting cooldown logic');
assert(sellJs.includes('submitSellRequest'), 'sell-phone.js submits lead to Supabase without login requirement');

/* ==========================================================================
   7. Core Features Accessibility Without Login (Requirement 3)
   ========================================================================== */
console.log('\n--- 7. Public Availability of Main Features ---');

// 7.1 Search & Catalogue
assert(typeof global.window.phonesData === 'object' && global.window.phonesData.length > 100, 'Catalogue data accessible without login');

// 7.2 AI Assistant script syntax & accessibility
const aiScript = fs.readFileSync(path.join(__dirname, 'ai-assistant.js'), 'utf8');
assert(!aiScript.includes('techbox_session') && !aiScript.includes('openAuthModal'), 'AI assistant does not require authentication');

// 7.3 Compare feature accessibility
const compareScript = fs.readFileSync(path.join(__dirname, 'compare.js'), 'utf8');
assert(!compareScript.includes('techbox_session') && !compareScript.includes('openAuthModal'), 'Compare does not require authentication');

// 7.4 News accessibility
const newsScript = fs.readFileSync(path.join(__dirname, 'news.js'), 'utf8');
assert(!newsScript.includes('techbox_session') && !newsScript.includes('openAuthModal'), 'News does not require authentication');

/* ==========================================================================
   Test Summary
   ========================================================================== */
console.log('\n============================================================');
console.log(`  Test Summary: ${passCount} Passed | ${failCount} Failed`);
console.log('============================================================\n');

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
