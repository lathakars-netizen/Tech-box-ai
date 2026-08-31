/**
 * TECH BOX AI — Zero-Dependency Integration & Unit Test Suite for Auth & Review Submission
 * Runs cleanly on standard Node.js without requiring third-party npm packages.
 */

const fs = require('fs');

// Minimal DOM & LocalStorage Mocks
const storageStore = {};
const elementsById = {};
const domLoadedCallbacks = [];

class ElementMock {
    constructor(tag = 'div', id = '') {
        this.tagName = tag.toUpperCase();
        this.id = id;
        this.children = [];
        this.parentNode = null;
        this.classList = {
            _classes: new Set(),
            add: (...cs) => cs.forEach(c => this.classList._classes.add(c)),
            remove: (...cs) => cs.forEach(c => this.classList._classes.delete(c)),
            contains: (c) => this.classList._classes.has(c),
            toggle: (c) => this.classList.contains(c) ? (this.classList.remove(c), false) : (this.classList.add(c), true)
        };
        this.style = {};
        this.attributes = {};
        this.listeners = {};
        this._innerHTML = '';
        this._textContent = '';
        this.value = '';
        if (id) elementsById[id] = this;
    }

    get innerHTML() { return this._innerHTML; }
    set innerHTML(val) {
        this._innerHTML = String(val);
        this._textContent = String(val).replace(/<[^>]*>/g, '');
        // Extract IDs from the new innerHTML for getElementById lookups (non-recursive)
        const idRe = /id=["']([^"']+)["']/g;
        let m;
        while ((m = idRe.exec(this._innerHTML)) !== null) {
            const foundId = m[1];
            if (!elementsById[foundId]) {
                const el = new ElementMock('div', foundId);
                // Don't recursively set innerHTML to avoid stack overflow
                el._innerHTML = '';
                el._textContent = '';
            }
        }
    }

    get textContent() { return this._textContent; }
    set textContent(val) {
        this._textContent = String(val);
        this._innerHTML = String(val);
    }

    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
    
    addEventListener(evt, fn) {
        if (!this.listeners[evt]) this.listeners[evt] = [];
        this.listeners[evt].push(fn);
    }

    dispatchEvent(evt) {
        const type = typeof evt === 'string' ? evt : (evt.type || 'click');
        const eObj = typeof evt === 'string' ? { type: evt, target: this, preventDefault: () => {} } : evt;
        (this.listeners[type] || []).forEach(fn => fn(eObj));
    }

    click() { this.dispatchEvent('click'); }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    insertBefore(newChild, refChild) {
        newChild.parentNode = this;
        const idx = this.children.indexOf(refChild);
        if (idx >= 0) this.children.splice(idx, 0, newChild);
        else this.children.push(newChild);
        return newChild;
    }

    contains(el) {
        if (el === this) return true;
        return this.children.some(c => c.contains ? c.contains(el) : c === el);
    }

    querySelector(sel) {
        if (sel.startsWith('#')) return elementsById[sel.substring(1)] || null;
        if (sel.startsWith('.')) {
            const cls = sel.substring(1);
            if (this.classList.contains(cls)) return this;
            for (let child of this.children) {
                const found = child.querySelector(sel);
                if (found) return found;
            }
        }
        return null;
    }

    querySelectorAll(sel) {
        const results = [];
        if (sel.startsWith('.')) {
            const cls = sel.substring(1);
            if (this.classList.contains(cls)) results.push(this);
            for (let child of this.children) {
                results.push(...child.querySelectorAll(sel));
            }
        }
        return results;
    }
}

// Create default UI container mocks
const navActionsMock = new ElementMock('div');
navActionsMock.classList.add('nav-actions');
const themeToggleMock = new ElementMock('button', 'themeToggle');
themeToggleMock.parentNode = navActionsMock;
navActionsMock.children.push(themeToggleMock);

const mobileNavListMock = new ElementMock('ul');
mobileNavListMock.classList.add('mobile-nav-list');

// Setup Global Browser Mocks
global.window = {
    location: { search: '?id=s25-ultra', hostname: 'localhost' },
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: (evt, fn) => {
        if (evt === 'DOMContentLoaded') domLoadedCallbacks.push(fn);
    },
    localStorage: {
        getItem: (k) => storageStore[k] || null,
        setItem: (k, v) => { storageStore[k] = String(v); },
        removeItem: (k) => { delete storageStore[k]; },
        clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
    }
};

global.localStorage = global.window.localStorage;

global.document = {
    body: new ElementMock('body', 'body'),
    createElement: (tag) => new ElementMock(tag),
    getElementById: (id) => elementsById[id] || null,
    querySelector: (sel) => {
        if (sel.startsWith('#')) return elementsById[sel.substring(1)] || null;
        if (sel === '.nav-actions') return navActionsMock;
        if (sel === '.mobile-nav-list') return mobileNavListMock;
        return null;
    },
    querySelectorAll: () => [],
    addEventListener: (evt, fn) => {
        if (evt === 'DOMContentLoaded') domLoadedCallbacks.push(fn);
    }
};

// Setup mock details elements
new ElementMock('div', 'dhRatingNum');
new ElementMock('div', 'dhRatingCount');
new ElementMock('div', 'dhStars');
new ElementMock('section', 'dhReviewsSection');
new ElementMock('div', 'revSummaryScore');
new ElementMock('div', 'revSummaryStars');
new ElementMock('div', 'revSummaryCount');
new ElementMock('div', 'revSummaryBars');
new ElementMock('div', 'revFormContainer');
new ElementMock('div', 'revListContainer');

function triggerDOMContentLoaded() {
    for (const cb of domLoadedCallbacks) {
        try { cb(); } catch (e) { /* swallow DOM mock errors */ }
    }
}

function runTestSuite() {
    console.log('\n============================================================');
    console.log('  TECH BOX AI — Auth & Reviews Test Suite (Zero-Dependency)');
    console.log('============================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(cond, desc) {
        if (cond) {
            console.log(`  ✅ PASS: ${desc}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${desc}`);
            failed++;
        }
    }

    // Load source code
    const phonesCode = fs.readFileSync('./data/phones.js', 'utf8');
    const authCode = fs.readFileSync('./auth.js', 'utf8');
    const reviewsCode = fs.readFileSync('./reviews.js', 'utf8');

    // Ensure localStorage is completely clear before anything loads
    global.window.localStorage.clear();

    // 1. Evaluate phones dataset
    eval(phonesCode);
    assert(Array.isArray(global.window.phonesData) && global.window.phonesData.length > 0, 'Catalog dataset (phones.js) loaded');

    // 2. Evaluate auth.js
    eval(authCode);
    assert(typeof global.window.techboxAuth === 'object', 'Auth module (auth.js) attached to window.techboxAuth');

    // 3. Evaluate reviews.js
    eval(reviewsCode);
    assert(typeof global.window.techboxReviews === 'object', 'Reviews module (reviews.js) attached to window.techboxReviews');

    // Trigger DOMContentLoaded to simulate page load
    triggerDOMContentLoaded();

    // --------------------------------------------------------------------------
    // Test Case 1: Initial Unauthenticated State
    // --------------------------------------------------------------------------
    console.log('\n--- 1. Testing Unauthenticated State ---');

    const currUser = global.window.techboxAuth.getCurrentUser();
    assert(currUser === null, 'No active user session initially in localStorage');

    // After DOMContentLoaded, the reviews section should have rendered the
    // "Sign In to Review" prompt since no session exists.
    const promptBtn = elementsById['btnPromptSignIn'];
    assert(promptBtn !== undefined && promptBtn !== null, '"Sign In to Review" prompt rendered for unauthenticated users');

    // Auth.js should have injected a Sign In button in the navbar
    const signInNav = elementsById['btnNavbarSignIn'];
    console.log("btnNavbarSignIn element:", signInNav);
    console.log("All elements:", Object.keys(elementsById));
    assert(signInNav !== undefined && signInNav !== null, 'Navbar displays "Sign In" button for guest users');

    // --------------------------------------------------------------------------
    // Test Case 2: Signup Validation & Registration
    // --------------------------------------------------------------------------
    console.log('\n--- 2. Testing Signup Validation & Registration ---');

    const invalidShortPass = global.window.techboxAuth.signup('John Doe', 'john@techbox.ai', '123');
    assert(invalidShortPass.success === false, 'Rejects password under 6 characters');

    const invalidShortName = global.window.techboxAuth.signup('J', 'john@techbox.ai', 'password123');
    assert(invalidShortName.success === false, 'Rejects name under 2 characters');

    const invalidEmailFormat = global.window.techboxAuth.signup('John Doe', 'invalid-email', 'password123');
    assert(invalidEmailFormat.success === false, 'Rejects invalid email format');

    const emptyEmail = global.window.techboxAuth.signup('John Doe', '', 'password123');
    assert(emptyEmail.success === false, 'Rejects empty email');

    const validSignup = global.window.techboxAuth.signup('John Doe', 'john@techbox.ai', 'secret123');
    assert(validSignup.success === true, 'Successfully creates user account for valid inputs');
    assert(validSignup.user.name === 'John Doe', 'User name stored accurately');

    const dupSignup = global.window.techboxAuth.signup('John Clone', 'JOHN@TECHBOX.AI', 'password999');
    assert(dupSignup.success === false, 'Prevents duplicate email registration (case-insensitive)');

    // --------------------------------------------------------------------------
    // Test Case 3: Session State & Logout
    // --------------------------------------------------------------------------
    console.log('\n--- 3. Testing Session State & Logout ---');

    const sessionUser = global.window.techboxAuth.getCurrentUser();
    assert(sessionUser !== null && sessionUser.email === 'john@techbox.ai', 'Active session persisted in localStorage after signup');

    const userPill = elementsById['userProfilePill'];
    assert(userPill !== undefined && userPill !== null, 'Navbar displays user profile pill after signup');

    global.window.techboxAuth.logout();
    assert(global.window.techboxAuth.getCurrentUser() === null, 'Logout clears user session');
    assert(elementsById['btnNavbarSignIn'] !== undefined, 'Navbar reverts to "Sign In" button after logout');

    // --------------------------------------------------------------------------
    // Test Case 4: Login Credentials & Failure Handling
    // --------------------------------------------------------------------------
    console.log('\n--- 4. Testing Login Validation ---');

    const wrongPass = global.window.techboxAuth.login('john@techbox.ai', 'wrongpassword');
    assert(wrongPass.success === false, 'Rejects incorrect password');

    const nonExistent = global.window.techboxAuth.login('unknown@techbox.ai', 'password123');
    assert(nonExistent.success === false, 'Rejects non-existent email address');

    const emptyPass = global.window.techboxAuth.login('john@techbox.ai', '');
    assert(emptyPass.success === false, 'Rejects empty password');

    const loginSuccess = global.window.techboxAuth.login('john@techbox.ai', 'secret123');
    assert(loginSuccess.success === true, 'Successfully logs in with registered credentials');
    assert(global.window.techboxAuth.getCurrentUser().name === 'John Doe', 'Session restored after login');

    // --------------------------------------------------------------------------
    // Test Case 5: Review Submission & Local Storage Persistence
    // --------------------------------------------------------------------------
    console.log('\n--- 5. Testing Review Submission & Storage ---');

    const initialRevs = global.window.techboxReviews.getReviews('s25-ultra');
    const seedCount = initialRevs.length;
    assert(seedCount >= 2, 'Pre-populated seed reviews loaded for Galaxy S25 Ultra');

    const submittedRev = global.window.techboxReviews.addReview(
        's25-ultra',
        'John Doe',
        'john@techbox.ai',
        5,
        'Spectacular flagship experience!',
        'The Galaxy S25 Ultra screen clarity and battery efficiency are top tier. Best phone of 2026.'
    );

    assert(submittedRev && submittedRev.id.startsWith('rev_'), 'Generates unique review ID');
    assert(submittedRev.rating === 5, 'Stores correct star rating');

    const updatedRevs = global.window.techboxReviews.getReviews('s25-ultra');
    assert(updatedRevs.length === seedCount + 1, 'Increments total reviews count for phone');
    assert(updatedRevs[0].title === 'Spectacular flagship experience!', 'Newest review placed at top of list');

    // Reviews for other phones should be unaffected
    const pixelRevs = global.window.techboxReviews.getReviews('pixel-9-pro-xl');
    assert(pixelRevs.length >= 1, 'Seed reviews for other phones remain intact');

    // --------------------------------------------------------------------------
    // Test Case 6: Refresh Persistence Simulation
    // --------------------------------------------------------------------------
    console.log('\n--- 6. Testing Refresh Persistence ---');

    const savedUsers = storageStore['techbox_users'];
    const savedSession = storageStore['techbox_session'];
    const savedReviews = storageStore['techbox_reviews'];

    assert(Boolean(savedUsers && savedSession && savedReviews), 'All data exists in localStorage after operations');

    const parsedUsers = JSON.parse(savedUsers);
    assert(Array.isArray(parsedUsers) && parsedUsers.length === 1, 'Users array contains exactly 1 registered account');

    const parsedReviews = JSON.parse(savedReviews);
    assert(Array.isArray(parsedReviews) && parsedReviews.length === 1, 'Reviews array contains exactly 1 user-submitted review');

    // Simulate reload by re-evaluating auth module
    eval(authCode);

    const reloadedSession = global.window.techboxAuth.getCurrentUser();
    assert(reloadedSession !== null && reloadedSession.name === 'John Doe', 'Session restored upon page reload');

    const reloadedRevs = global.window.techboxReviews.getReviews('s25-ultra');
    assert(reloadedRevs.some(r => r.title.includes('Spectacular flagship')), 'User review persisted across page reloads');

    // --------------------------------------------------------------------------
    // Final Summary
    // --------------------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`  Test Results: ${passed} Passed | ${failed} Failed`);
    console.log('============================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTestSuite();
