/**
 * TECH BOX AI — Public Access Module (auth.js)
 * 
 * The website is fully public. Visitors do not need to sign in, register,
 * or link a cloud account to browse, compare, search, view specifications,
 * save favorites locally, submit inquiries, or read and write reviews.
 * 
 * All sign-in buttons, account pills, modals, and cloud sync prompts have been
 * removed while preserving a safe, non-breaking window.techboxAuth stub API.
 */

(function () {
    'use strict';

    // Clear any obsolete local sessions so all visitors browse as public guests
    try {
        localStorage.removeItem('techbox_session');
    } catch (e) {
        // Ignore localStorage access restrictions in sandboxed iframes
    }

    /**
     * Safely remove any legacy authentication or cloud-sync DOM elements if they exist
     */
    function purgeLegacyAuthElements() {
        const legacyIds = [
            'navUserContainer',
            'btnNavbarSignIn',
            'userProfilePill',
            'userDropdownMenu',
            'mobileAuthNavItem',
            'mobileDrawerLoginBtn',
            'mobileDrawerLogoutBtn',
            'mobileDrawerSyncBtn',
            'authModalOverlay',
            'cloudSyncModalOverlay',
            'cloudSyncToast'
        ];

        legacyIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }

    // Run DOM purge on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', purgeLegacyAuthElements);
    } else {
        purgeLegacyAuthElements();
    }

    /**
     * Safe Public API compatibility shim
     * Ensures any callers of window.techboxAuth continue to run safely without errors
     */
    window.techboxAuth = {
        isPublic: true,
        getCurrentUser: function () {
            return null;
        },
        signup: function () {
            return { success: false, message: 'TECH BOX AI is fully public; account registration is not required.' };
        },
        login: function () {
            return { success: false, message: 'TECH BOX AI is fully public; sign-in is not required.' };
        },
        logout: function () {
            // No-op in public mode
        },
        openAuthModal: function () {
            // No-op in public mode: no modal shown
        },
        closeAuthModal: function () {
            // No-op
        },
        openCloudSyncModal: function () {
            // No-op in public mode: no cloud sync modal
        },
        closeCloudSyncModal: function () {
            // No-op
        },
        onAuthChange: function (callback) {
            // In public mode, call immediately with null user
            if (typeof callback === 'function') {
                try {
                    callback(null);
                } catch (e) {
                    console.warn('[Auth] Callback exception:', e);
                }
            }
        }
    };

})();
