/**
 * TECH BOX AI — Client-Side User Authentication & Session Engine
 * Manages localStorage user accounts, active login sessions, navbar status pills,
 * and Auth modal overlays for static deployment.
 */

(function () {
    'use strict';

    const USERS_KEY = 'techbox_users';
    const SESSION_KEY = 'techbox_session';

    let currentCallback = null;
    const authListeners = [];

    /* ======================================================================
       1. LocalStorage Helpers & State Management
       ====================================================================== */
    function getUsers() {
        try {
            const data = localStorage.getItem(USERS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[Auth] Failed to load users:', e);
            return [];
        }
    }

    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch (e) {
            console.error('[Auth] Failed to save users:', e);
        }
    }

    function getCurrentUser() {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('[Auth] Failed to load session:', e);
            return null;
        }
    }

    function saveSession(user) {
        try {
            if (user) {
                const sessionObj = {
                    name: user.name,
                    email: user.email.toLowerCase(),
                    loggedInAt: new Date().toISOString()
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj));
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
            notifyAuthListeners();
            updateNavbarUI();
        } catch (e) {
            console.error('[Auth] Failed to save session:', e);
        }
    }

    function subscribeAuthChange(fn) {
        if (typeof fn === 'function') {
            authListeners.push(fn);
        }
    }

    function notifyAuthListeners() {
        const user = getCurrentUser();
        authListeners.forEach(fn => {
            try { fn(user); } catch (e) { console.error('[Auth] Listener error:', e); }
        });
    }

    /* ======================================================================
       2. Validation & Authentication Logic
       ====================================================================== */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function signup(name, email, password) {
        const trimmedName = (name || '').trim();
        const trimmedEmail = (email || '').trim().toLowerCase();
        const trimmedPassword = (password || '').trim();

        if (!trimmedName || trimmedName.length < 2) {
            return { success: false, message: 'Please enter a valid name (at least 2 characters).' };
        }
        if (!trimmedEmail || !validateEmail(trimmedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }
        if (!trimmedPassword || trimmedPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters long.' };
        }

        const users = getUsers();
        const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
        if (existing) {
            return { success: false, message: 'An account with this email address already exists.' };
        }

        const newUser = {
            id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword, // Stored in localStorage for client-side demo
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);
        saveSession(newUser);

        return { success: true, user: newUser };
    }

    function login(email, password) {
        const trimmedEmail = (email || '').trim().toLowerCase();
        const trimmedPassword = (password || '').trim();

        if (!trimmedEmail || !validateEmail(trimmedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }
        if (!trimmedPassword) {
            return { success: false, message: 'Please enter your password.' };
        }

        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === trimmedEmail);

        if (!user || user.password !== trimmedPassword) {
            return { success: false, message: 'Invalid email or password. Please check your credentials.' };
        }

        saveSession(user);
        return { success: true, user: user };
    }

    function logout() {
        saveSession(null);
    }

    /* ======================================================================
       3. Dynamic Auth Modal Injection & Handlers
       ====================================================================== */
    function injectAuthModal() {
        if (document.getElementById('authModalOverlay')) return;

        const modalHtml = `
        <div class="auth-modal-overlay" id="authModalOverlay" aria-hidden="true">
            <div class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="authBrandTitle">
                <button class="auth-modal-close" id="authModalClose" aria-label="Close modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <div class="auth-modal-header">
                    <div class="auth-brand-logo" id="authBrandTitle">
                        <i class="fa-solid fa-cube"></i>
                        <span>TECH BOX <span style="color:#38bdf8;">AI</span></span>
                    </div>
                    <p class="auth-subtitle">Sign in to leave reviews and save preferences</p>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab-btn active" id="tabBtnLogin" data-tab="login">Sign In</button>
                    <button class="auth-tab-btn" id="tabBtnSignup" data-tab="signup">Create Account</button>
                </div>

                <!-- Alert Message Banner -->
                <div class="auth-alert" id="authAlert"></div>

                <!-- LOGIN FORM -->
                <form class="auth-form active" id="authLoginForm" novalidate>
                    <div class="auth-input-group">
                        <label class="auth-label" for="loginEmail">Email Address</label>
                        <div class="auth-input-wrapper">
                            <i class="fa-solid fa-envelope auth-input-icon"></i>
                            <input type="email" id="loginEmail" class="auth-input" placeholder="name@example.com" required>
                        </div>
                    </div>

                    <div class="auth-input-group">
                        <label class="auth-label" for="loginPassword">Password</label>
                        <div class="auth-input-wrapper">
                            <i class="fa-solid fa-lock auth-input-icon"></i>
                            <input type="password" id="loginPassword" class="auth-input" placeholder="••••••••" required>
                        </div>
                    </div>

                    <button type="submit" class="auth-btn-submit" id="loginSubmitBtn">
                        <i class="fa-solid fa-right-to-bracket"></i> Sign In
                    </button>
                </form>

                <!-- SIGNUP FORM -->
                <form class="auth-form" id="authSignupForm" novalidate>
                    <div class="auth-input-group">
                        <label class="auth-label" for="signupName">Full Name</label>
                        <div class="auth-input-wrapper">
                            <i class="fa-solid fa-user auth-input-icon"></i>
                            <input type="text" id="signupName" class="auth-input" placeholder="Alex Mercer" required>
                        </div>
                    </div>

                    <div class="auth-input-group">
                        <label class="auth-label" for="signupEmail">Email Address</label>
                        <div class="auth-input-wrapper">
                            <i class="fa-solid fa-envelope auth-input-icon"></i>
                            <input type="email" id="signupEmail" class="auth-input" placeholder="alex@techbox.ai" required>
                        </div>
                    </div>

                    <div class="auth-input-group">
                        <label class="auth-label" for="signupPassword">Password</label>
                        <div class="auth-input-wrapper">
                            <i class="fa-solid fa-lock auth-input-icon"></i>
                            <input type="password" id="signupPassword" class="auth-input" placeholder="Min. 6 characters" required>
                        </div>
                    </div>

                    <button type="submit" class="auth-btn-submit" id="signupSubmitBtn">
                        <i class="fa-solid fa-user-plus"></i> Create Account
                    </button>
                </form>

                <div class="auth-disclaimer">
                    <i class="fa-solid fa-shield-halved"></i> Client-side session saved locally in your browser storage.
                </div>
            </div>
        </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        document.body.appendChild(wrapper.firstElementChild);

        bindModalEvents();
    }

    function bindModalEvents() {
        const overlay = document.getElementById('authModalOverlay');
        const closeBtn = document.getElementById('authModalClose');
        const tabLogin = document.getElementById('tabBtnLogin');
        const tabSignup = document.getElementById('tabBtnSignup');
        const loginForm = document.getElementById('authLoginForm');
        const signupForm = document.getElementById('authSignupForm');
        const alertEl = document.getElementById('authAlert');

        if (!overlay) return;

        // Close handlers
        closeBtn.addEventListener('click', closeAuthModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAuthModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
                closeAuthModal();
            }
        });

        // Tab switching
        function switchTab(tab) {
            hideAlert();
            if (tab === 'login') {
                tabLogin.classList.add('active');
                tabSignup.classList.remove('active');
                loginForm.classList.add('active');
                signupForm.classList.remove('active');
            } else {
                tabSignup.classList.add('active');
                tabLogin.classList.remove('active');
                signupForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        }

        tabLogin.addEventListener('click', () => switchTab('login'));
        tabSignup.addEventListener('click', () => switchTab('signup'));

        // Alert display helper
        function showAlert(msg, isError = true) {
            alertEl.textContent = msg;
            alertEl.className = `auth-alert show ${isError ? 'error' : 'success'}`;
        }
        function hideAlert() {
            alertEl.className = 'auth-alert';
            alertEl.textContent = '';
        }

        // Login submit
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const res = login(email, password);
            if (res.success) {
                showAlert(`Welcome back, ${res.user.name}!`, false);
                setTimeout(() => {
                    closeAuthModal();
                    if (typeof currentCallback === 'function') {
                        currentCallback(res.user);
                        currentCallback = null;
                    }
                }, 600);
            } else {
                showAlert(res.message, true);
            }
        });

        // Signup submit
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            const res = signup(name, email, password);
            if (res.success) {
                showAlert(`Account created successfully! Logged in as ${res.user.name}.`, false);
                setTimeout(() => {
                    closeAuthModal();
                    if (typeof currentCallback === 'function') {
                        currentCallback(res.user);
                        currentCallback = null;
                    }
                }, 750);
            } else {
                showAlert(res.message, true);
            }
        });
    }

    function openAuthModal(tab = 'login', callback = null) {
        injectAuthModal();
        const overlay = document.getElementById('authModalOverlay');
        const tabLogin = document.getElementById('tabBtnLogin');
        const tabSignup = document.getElementById('tabBtnSignup');
        const alertEl = document.getElementById('authAlert');

        currentCallback = callback;

        if (alertEl) {
            alertEl.className = 'auth-alert';
            alertEl.textContent = '';
        }

        if (tab === 'signup' && tabSignup) {
            tabSignup.click();
        } else if (tabLogin) {
            tabLogin.click();
        }

        if (overlay) {
            overlay.classList.add('is-active');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeAuthModal() {
        const overlay = document.getElementById('authModalOverlay');
        if (!overlay) return;

        overlay.classList.remove('is-active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentCallback = null;
    }

    /* ======================================================================
       4. Navbar & Mobile Drawer UI Injection
       ====================================================================== */
    function updateNavbarUI() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        const currentUser = getCurrentUser();

        // Check or create container
        let userMenuContainer = document.getElementById('navUserContainer');
        if (!userMenuContainer) {
            userMenuContainer = document.createElement('div');
            userMenuContainer.id = 'navUserContainer';
            userMenuContainer.className = 'nav-user-container';

            // Insert before theme toggle or hamburger button
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn && themeBtn.parentNode === navActions) {
                navActions.insertBefore(userMenuContainer, themeBtn);
            } else {
                navActions.appendChild(userMenuContainer);
            }
        }

        if (currentUser) {
            const initial = (currentUser.name || 'U').charAt(0).toUpperCase();
            userMenuContainer.innerHTML = `
                <div class="user-menu-wrapper">
                    <button class="user-profile-pill" id="userProfilePill" aria-label="User menu">
                        <div class="user-avatar-circle">${initial}</div>
                        <span class="user-name-text">${currentUser.name}</span>
                        <i class="fa-solid fa-chevron-down" style="font-size:0.7rem; color:#94a3b8;"></i>
                    </button>

                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <div class="user-dropdown-header">
                            <div class="user-dropdown-name">${currentUser.name}</div>
                            <div class="user-dropdown-email">${currentUser.email}</div>
                        </div>
                        <button class="user-dropdown-item logout-item" id="btnLogoutAction">
                            <i class="fa-solid fa-right-from-bracket"></i>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            `;

            const pill = document.getElementById('userProfilePill');
            const dropdown = document.getElementById('userDropdownMenu');
            const logoutBtn = document.getElementById('btnLogoutAction');

            if (pill && dropdown) {
                pill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('is-open');
                });

                document.addEventListener('click', (e) => {
                    if (!userMenuContainer.contains(e.target)) {
                        dropdown.classList.remove('is-open');
                    }
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    logout();
                    if (dropdown) dropdown.classList.remove('is-open');
                });
            }
        } else {
            userMenuContainer.innerHTML = `
                <button class="auth-trigger-btn" id="btnNavbarSignIn">
                    <i class="fa-regular fa-user"></i>
                    <span>Sign In</span>
                </button>
            `;

            const signInBtn = document.getElementById('btnNavbarSignIn');
            if (signInBtn) {
                signInBtn.addEventListener('click', () => openAuthModal('login'));
            }
        }

        // Also update mobile drawer if present
        updateMobileDrawerUI(currentUser);
    }

    function updateMobileDrawerUI(currentUser) {
        const mobileDrawerList = document.querySelector('.mobile-nav-list');
        if (!mobileDrawerList) return;

        let mobileAuthItem = document.getElementById('mobileAuthNavItem');
        if (!mobileAuthItem) {
            mobileAuthItem = document.createElement('li');
            mobileAuthItem.id = 'mobileAuthNavItem';
            mobileDrawerList.appendChild(mobileAuthItem);
        }

        if (currentUser) {
            mobileAuthItem.innerHTML = `
                <div style="padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 8px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                        <div class="user-avatar-circle">${(currentUser.name || 'U').charAt(0).toUpperCase()}</div>
                        <div>
                            <div style="font-weight:700; color:#f8fafc; font-size:0.9rem;">${currentUser.name}</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">${currentUser.email}</div>
                        </div>
                    </div>
                    <button class="auth-trigger-btn" id="mobileDrawerLogoutBtn" style="width:100%; justify-content:center; border-color:rgba(244,63,94,0.4); color:#f43f5e; background:rgba(244,63,94,0.1);">
                        <i class="fa-solid fa-right-from-bracket"></i> Sign Out
                    </button>
                </div>
            `;
            const mLogout = document.getElementById('mobileDrawerLogoutBtn');
            if (mLogout) mLogout.addEventListener('click', logout);
        } else {
            mobileAuthItem.innerHTML = `
                <div style="padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 8px;">
                    <button class="auth-trigger-btn" id="mobileDrawerLoginBtn" style="width:100%; justify-content:center;">
                        <i class="fa-solid fa-right-to-bracket"></i> Sign In / Register
                    </button>
                </div>
            `;
            const mLogin = document.getElementById('mobileDrawerLoginBtn');
            if (mLogin) mLogin.addEventListener('click', () => openAuthModal('login'));
        }
    }

    /* ======================================================================
       5. Initialize on DOM Load
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        injectAuthModal();
        updateNavbarUI();
    });

    // Global Public API
    window.techboxAuth = {
        getCurrentUser: getCurrentUser,
        signup: signup,
        login: login,
        logout: logout,
        openAuthModal: openAuthModal,
        closeAuthModal: closeAuthModal,
        onAuthChange: subscribeAuthChange
    };

})();
