/**
 * TECH BOX AI — Zero-Dependency Verification for Public Access & Public Review Engine
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
            toggle: (c) => this.classList._classes.has(c) ? (this.classList.remove(c), false) : (this.classList.add(c), true)
        };
        this.style = {};
        this.attributes = {};
        this.listeners = {};
        this._innerHTML = '';
        this._textContent = '';
        this.value = '';
        if (id) elementsById[id] = this;
    }

    get firstElementChild() { return this.children[0] || this; }
    get innerHTML() { return this._innerHTML; }
    set innerHTML(val) {
        this._innerHTML = String(val);
        this._textContent = String(val).replace(/<[^>]*>/g, '');
        // Extract IDs from the new innerHTML for getElementById lookups
        const idRe = /id=["']([^"']+)["']/g;
        let m;
        while ((m = idRe.exec(this._innerHTML)) !== null) {
            const foundId = m[1];
            if (!elementsById[foundId]) {
                const el = new ElementMock('div', foundId);
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
    getAttribute(k) { return this.attributes[k] || null; }
    removeAttribute(k) { delete this.attributes[k]; }

    appendChild(child) {
        if (!child) return child;
        child.parentNode = this;
        this.children.push(child);
        if (child.id) elementsById[child.id] = child;
        return child;
    }

    insertBefore(newNode, refNode) {
        if (!newNode) return newNode;
        newNode.parentNode = this;
        const idx = this.children.indexOf(refNode);
        if (idx !== -1) {
            this.children.splice(idx, 0, newNode);
        } else {
            this.children.push(newNode);
        }
        if (newNode.id) elementsById[newNode.id] = newNode;
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

    addEventListener(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
    }

    dispatchEvent(event) {
        const type = typeof event === 'string' ? event : event.type;
        const handlers = this.listeners[type] || [];
        handlers.forEach(h => h(event));
    }

    querySelector(selector) {
        if (selector.startsWith('#')) {
            const targetId = selector.substring(1);
            return elementsById[targetId] || null;
        }
        if (selector.startsWith('.')) {
            const cls = selector.substring(1);
            if (this.classList.contains(cls)) return this;
            for (const child of this.children) {
                if (child.querySelector) {
                    const found = child.querySelector(selector);
                    if (found) return found;
                }
            }
        }
        return null;
    }

    querySelectorAll(selector) {
        const results = [];
        if (selector.startsWith('.')) {
            const cls = selector.substring(1);
            if (this.classList.contains(cls)) results.push(this);
        }
        for (const child of this.children) {
            if (child.querySelectorAll) {
                results.push(...child.querySelectorAll(selector));
            }
        }
        return results;
    }
}

// Setup Global Browser Environment
function setupEnvironment() {
    // Clear mocks
    Object.keys(storageStore).forEach(k => delete storageStore[k]);
    Object.keys(elementsById).forEach(k => delete elementsById[k]);
    domLoadedCallbacks.length = 0;

    const mockBody = new ElementMock('body', 'mockBody');

    // Setup base DOM elements needed by auth & reviews
    const navActions = new ElementMock('div', 'navActions');
    navActions.className = 'nav-actions';
    const themeBtn = new ElementMock('button', 'themeToggle');
    navActions.appendChild(themeBtn);
    mockBody.appendChild(navActions);

    const mobileList = new ElementMock('ul', 'mobileNavList');
    mobileList.className = 'mobile-nav-list';
    mockBody.appendChild(mobileList);

    // Reviews containers
    const reviewsSection = new ElementMock('section', 'dhReviewsSection');
    const formContainer = new ElementMock('div', 'revFormContainer');
    const listContainer = new ElementMock('div', 'revListContainer');
    const scoreEl = new ElementMock('div', 'revSummaryScore');
    const starsEl = new ElementMock('div', 'revSummaryStars');
    const countEl = new ElementMock('div', 'revSummaryCount');
    const barsEl = new ElementMock('div', 'revSummaryBars');

    reviewsSection.appendChild(formContainer);
    reviewsSection.appendChild(listContainer);
    reviewsSection.appendChild(scoreEl);
    reviewsSection.appendChild(starsEl);
    reviewsSection.appendChild(countEl);
    reviewsSection.appendChild(barsEl);
    mockBody.appendChild(reviewsSection);

    // Global document mock
    global.document = {
        readyState: 'complete',
        body: mockBody,
        getElementById: (id) => elementsById[id] || null,
        querySelector: (sel) => {
            if (sel === '.nav-actions') return navActions;
            if (sel === '.mobile-nav-list') return mobileList;
            if (sel.startsWith('#')) return elementsById[sel.substring(1)] || null;
            return mockBody.querySelector(sel);
        },
        querySelectorAll: (sel) => mockBody.querySelectorAll(sel),
        createElement: (tag) => new ElementMock(tag),
        addEventListener: (event, handler) => {
            if (event === 'DOMContentLoaded') {
                domLoadedCallbacks.push(handler);
            }
        }
    };

    // Global localStorage mock
    global.localStorage = {
        getItem: (k) => storageStore[k] || null,
        setItem: (k, v) => { storageStore[k] = String(v); },
        removeItem: (k) => { delete storageStore[k]; },
        clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
    };

    // Global window mock
    global.window = {
        localStorage: global.localStorage,
        location: {
            search: '?id=s25-ultra',
            pathname: '/details.html'
        }
    };
}

function triggerDOMContentLoaded() {
    domLoadedCallbacks.forEach(cb => {
        try { cb(); } catch (e) { console.error('DOMContentLoaded callback error:', e); }
    });
}

// --------------------------------------------------------------------------
// TEST EXECUTION
// --------------------------------------------------------------------------
function runTestSuite() {
    console.log('\n============================================================');
    console.log('  TECH BOX AI — Public Access & Reviews Verification Suite');
    console.log('============================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    setupEnvironment();

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
    // Test Case 1: Initial Public State — No Sign In Buttons Injected
    // --------------------------------------------------------------------------
    console.log('\n--- 1. Testing Public Access State (No Sign In Controls) ---');

    const currUser = global.window.techboxAuth.getCurrentUser();
    assert(currUser === null, 'No active user session in localStorage (Public visitor)');
    assert(global.window.techboxAuth.isPublic === true, 'techboxAuth reports isPublic: true');

    // In public mode, there must be NO "Sign In to Review" prompt
    const promptBtn = elementsById['btnPromptSignIn'];
    assert(promptBtn === undefined || promptBtn === null, 'No "Sign In to Review" prompt rendered for public visitors');

    // In public mode, there must be NO Sign In button injected in navbar
    const signInNav = elementsById['btnNavbarSignIn'];
    assert(signInNav === undefined || signInNav === null, 'Navbar contains NO "Sign In" button');

    // In public mode, the review write card must be rendered directly for visitors
    const writeForm = elementsById['revSubmitForm'];
    assert(writeForm !== undefined && writeForm !== null, 'Public review submission form rendered directly for visitors');

    // Honeypot spam field must be present
    const honeypot = elementsById['revHoneypot'];
    assert(honeypot !== undefined && honeypot !== null, 'Review form contains hidden honeypot spam protection');

    // --------------------------------------------------------------------------
    // Test Case 2: Public Review Submission & Local Storage Persistence
    // --------------------------------------------------------------------------
    console.log('\n--- 2. Testing Review Submission & Storage ---');

    const initialRevs = global.window.techboxReviews.getReviews('s25-ultra');
    const seedCount = initialRevs.length;
    assert(seedCount >= 2, 'Pre-populated seed reviews loaded for Galaxy S25 Ultra');

    const submittedRev = global.window.techboxReviews.addReview(
        's25-ultra',
        'Priya Sharma',
        '',
        5,
        'Spectacular flagship experience!',
        'The Galaxy S25 Ultra screen clarity and battery efficiency are top tier. Best phone of 2026.'
    );

    assert(submittedRev && submittedRev.id.startsWith('rev_'), 'Generates unique review ID');
    assert(submittedRev.userName === 'Priya Sharma', 'Stores visitor display name');
    assert(submittedRev.rating === 5, 'Stores correct star rating');

    const updatedRevs = global.window.techboxReviews.getReviews('s25-ultra');
    assert(updatedRevs.length === seedCount + 1, 'Increments total reviews count for phone');
    assert(updatedRevs[0].title === 'Spectacular flagship experience!', 'Newest review placed at top of list');

    // Reviews for other phones should be unaffected
    const pixelRevs = global.window.techboxReviews.getReviews('pixel-9-pro-xl');
    assert(pixelRevs.length >= 1, 'Seed reviews for other phones remain intact');

    // --------------------------------------------------------------------------
    // Test Case 3: Refresh Persistence Simulation
    // --------------------------------------------------------------------------
    console.log('\n--- 3. Testing Refresh Persistence ---');

    const savedReviews = storageStore['techbox_reviews'];
    assert(Boolean(savedReviews), 'Reviews data exists in localStorage after operations');

    const parsedReviews = JSON.parse(savedReviews);
    assert(Array.isArray(parsedReviews) && parsedReviews.length === 1, 'Reviews array contains exactly 1 user-submitted review');

    // Simulate reload by re-evaluating auth module
    eval(authCode);

    const reloadedSession = global.window.techboxAuth.getCurrentUser();
    assert(reloadedSession === null, 'User remains public guest upon page reload');

    const reloadedRevs = global.window.techboxReviews.getReviews('s25-ultra');
    assert(reloadedRevs.some(r => r.title.includes('Spectacular flagship')), 'User review persisted across page reloads');

    // --------------------------------------------------------------------------
    // Test Case 4: Auth Shim Safety
    // --------------------------------------------------------------------------
    console.log('\n--- 4. Testing Auth Shim Safety ---');

    const signupRes = global.window.techboxAuth.signup('John Doe', 'john@example.com', 'pass123');
    assert(signupRes.success === false, 'Signup returns graceful public notice');

    const loginRes = global.window.techboxAuth.login('john@example.com', 'pass123');
    assert(loginRes.success === false, 'Login returns graceful public notice');

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
