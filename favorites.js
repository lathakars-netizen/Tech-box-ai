/**
 * TECH BOX AI — Persistent Favorites / Saved Mobiles Module
 * Manages localStorage persistence for saved phone IDs, syncs heart buttons across all pages,
 * injects the navbar favorites trigger button and side drawer modal.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'techbox_favorites';

    /* ======================================================================
       1. LocalStorage Helpers
       ====================================================================== */
    function getFavorites() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to read favorites from localStorage:', e);
            return [];
        }
    }

    function saveFavorites(favArray) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favArray));
        } catch (e) {
            console.error('Failed to save favorites to localStorage:', e);
        }
    }

    function isFavorite(phoneId) {
        if (!phoneId) return false;
        const favs = getFavorites();
        return favs.includes(phoneId);
    }

    function addFavorite(phoneId) {
        if (!phoneId) return false;
        const favs = getFavorites();
        if (!favs.includes(phoneId)) {
            favs.push(phoneId);
            saveFavorites(favs);
            onFavoritesChanged();
            showToast('❤️ Added to Saved Mobiles');
            return true;
        }
        return false;
    }

    function removeFavorite(phoneId) {
        if (!phoneId) return false;
        const favs = getFavorites();
        const updated = favs.filter(id => id !== phoneId);
        if (favs.length !== updated.length) {
            saveFavorites(updated);
            onFavoritesChanged();
            showToast('💔 Removed from Saved Mobiles');
            return true;
        }
        return false;
    }

    function toggleFavorite(phoneId) {
        if (!phoneId) return false;
        if (isFavorite(phoneId)) {
            removeFavorite(phoneId);
            return false;
        } else {
            addFavorite(phoneId);
            return true;
        }
    }

    function getFavoritePhones() {
        const favIds = getFavorites();
        const allPhones = (typeof window !== 'undefined' && window.phonesData) ? window.phonesData : [];
        return favIds.map(id => allPhones.find(p => p.id === id)).filter(Boolean);
    }

    function onFavoritesChanged() {
        updateBadge();
        syncHeartButtons();
        renderDrawerContent();
    }

    /* ======================================================================
       2. UI Syncing & Heart Button Handlers
       ====================================================================== */
    function syncHeartButtons() {
        const favIds = getFavorites();

        // 1. Sync card favorite buttons (.fav-btn, [data-fav-id], [data-id])
        const favButtons = document.querySelectorAll('.fav-btn, [data-fav-id]');
        favButtons.forEach(btn => {
            const phoneId = btn.getAttribute('data-fav-id') || btn.getAttribute('data-id');
            if (!phoneId) return;

            const icon = btn.querySelector('i');
            if (favIds.includes(phoneId)) {
                btn.classList.add('active');
                if (icon) {
                    icon.className = 'fa-solid fa-heart';
                    icon.style.color = '#f43f5e';
                }
            } else {
                btn.classList.remove('active');
                if (icon) {
                    icon.className = 'fa-regular fa-heart';
                    icon.style.color = '';
                }
            }
        });

        // 2. Sync details page hero favorite button (#btnFav)
        const btnFav = document.getElementById('btnFav');
        if (btnFav) {
            const params = new URLSearchParams(window.location.search);
            const currentId = params.get('id');
            if (currentId) {
                const favIcon = document.getElementById('favIcon') || btnFav.querySelector('i');
                if (favIds.includes(currentId)) {
                    btnFav.classList.add('active');
                    if (favIcon) {
                        favIcon.className = 'fa-solid fa-heart';
                        favIcon.style.color = '#f43f5e';
                    }
                } else {
                    btnFav.classList.remove('active');
                    if (favIcon) {
                        favIcon.className = 'fa-regular fa-heart';
                        favIcon.style.color = '';
                    }
                }
            }
        }
    }

    function updateBadge() {
        const badge = document.getElementById('favCountBadge');
        if (!badge) return;

        const count = getFavorites().length;
        badge.textContent = count;
        if (count > 0) {
            badge.style.display = 'flex';
            badge.classList.add('pulse-anim');
            setTimeout(() => badge.classList.remove('pulse-anim'), 400);
        } else {
            badge.style.display = 'none';
        }
    }

    function showToast(message) {
        let toast = document.getElementById('favGlobalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'favGlobalToast';
            toast.className = 'fav-global-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    /* ======================================================================
       3. DOM Injection: Navbar Trigger Button & Side Drawer
       ====================================================================== */
    function injectNavbarFavButton() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        // Prevent duplicate injection
        if (document.getElementById('favoritesBtn')) return;

        // Create trigger button wrapper
        const btn = document.createElement('button');
        btn.className = 'icon-btn favorites-trigger-btn';
        btn.id = 'favoritesBtn';
        btn.setAttribute('aria-label', 'View Saved Mobiles');
        btn.setAttribute('title', 'Saved Mobiles');
        btn.innerHTML = `
            <i class="fa-solid fa-heart"></i>
            <span class="fav-count-badge" id="favCountBadge" style="display:none;">0</span>
        `;

        // Insert before theme toggle or hamburger button
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn && themeBtn.parentNode === navActions) {
            navActions.insertBefore(btn, themeBtn);
        } else {
            navActions.appendChild(btn);
        }

        btn.addEventListener('click', openDrawer);
        updateBadge();
    }

    function injectFavoritesDrawer() {
        if (document.getElementById('favoritesDrawerOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'favoritesDrawerOverlay';
        overlay.className = 'fav-drawer-overlay';
        overlay.setAttribute('aria-hidden', 'true');

        overlay.innerHTML = `
            <div class="fav-drawer-panel" id="favDrawerPanel">
                <div class="fav-drawer-header">
                    <div class="fav-drawer-title">
                        <i class="fa-solid fa-heart" style="color: #f43f5e;"></i>
                        <span>Saved Mobiles</span>
                    </div>
                    <button class="fav-drawer-close" id="favDrawerClose" aria-label="Close saved mobiles">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="fav-drawer-body" id="favDrawerBody">
                    <!-- Saved items rendered dynamically -->
                </div>
                <div class="fav-drawer-footer" id="favDrawerFooter">
                    <button class="btn-clear-all-favs" id="btnClearAllFavs">
                        <i class="fa-solid fa-trash-can"></i> Clear All Saved
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind Close Events
        const closeBtn = document.getElementById('favDrawerClose');
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeDrawer();
        });

        // Clear All
        const clearBtn = document.getElementById('btnClearAllFavs');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (getFavorites().length === 0) return;
                saveFavorites([]);
                onFavoritesChanged();
                showToast('🧹 Saved Mobiles Cleared');
            });
        }
    }

    function openDrawer() {
        const overlay = document.getElementById('favoritesDrawerOverlay');
        if (!overlay) return;

        renderDrawerContent();
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        const overlay = document.getElementById('favoritesDrawerOverlay');
        if (!overlay) return;

        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function renderDrawerContent() {
        const body = document.getElementById('favDrawerBody');
        const footer = document.getElementById('favDrawerFooter');
        if (!body) return;

        const savedPhones = getFavoritePhones();

        if (savedPhones.length === 0) {
            body.innerHTML = `
                <div class="fav-empty-state">
                    <div class="fav-empty-icon">
                        <i class="fa-regular fa-heart"></i>
                    </div>
                    <h3>No Saved Mobiles</h3>
                    <p>Click the heart icon on any smartphone card or detail page to save devices here for quick reference.</p>
                </div>
            `;
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'flex';

        let html = '<div class="fav-items-list">';
        savedPhones.forEach(phone => {
            html += `
                <div class="fav-item-card" data-phone-id="${phone.id}">
                    <img src="${phone.image || 'assets/s25_ultra.jpg'}" alt="${phone.name}" class="fav-item-img" onerror="this.src='assets/s25_ultra.jpg';" />
                    <div class="fav-item-info">
                        <span class="fav-item-brand">${phone.brand}</span>
                        <h4 class="fav-item-name">${phone.name}</h4>
                        <span class="fav-item-price">${phone.price}</span>
                    </div>
                    <div class="fav-item-actions">
                        <a href="details.html?id=${encodeURIComponent(phone.id)}" class="btn-fav-view" title="View Specifications">
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                        <button class="btn-fav-remove" data-remove-id="${phone.id}" title="Remove from Saved">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        body.innerHTML = html;

        // Wire remove buttons inside drawer
        body.querySelectorAll('[data-remove-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-remove-id');
                removeFavorite(id);
            });
        });
    }

    /* ======================================================================
       4. Global Event Delegation
       ====================================================================== */
    function attachGlobalClickDelegation() {
        document.addEventListener('click', function (e) {

            // Handle hero details page favorite button (#btnFav)
            const detailsFavBtn = e.target.closest('#btnFav');
            if (detailsFavBtn) {
                e.preventDefault();
                const params = new URLSearchParams(window.location.search);
                const currentId = params.get('id');
                if (currentId) {
                    toggleFavorite(currentId);
                }
                return;
            }

            // Handle card favorite buttons (.fav-btn, [data-fav-id])
            const cardFavBtn = e.target.closest('.fav-btn, [data-fav-id]');
            if (cardFavBtn) {
                e.preventDefault();
                e.stopPropagation();
                const phoneId = cardFavBtn.getAttribute('data-fav-id') || cardFavBtn.getAttribute('data-id');
                if (phoneId) {
                    toggleFavorite(phoneId);
                }
                return;
            }
        });
    }

    /* ======================================================================
       5. Initialize on DOMContentLoaded
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        injectNavbarFavButton();
        injectFavoritesDrawer();
        syncHeartButtons();
        updateBadge();
        attachGlobalClickDelegation();
    });

    // Expose API Globally
    window.techboxFavorites = {
        get: getFavorites,
        isFavorite: isFavorite,
        add: addFavorite,
        remove: removeFavorite,
        toggle: toggleFavorite,
        getFavoritePhones: getFavoritePhones,
        syncUI: syncHeartButtons,
        updateBadge: updateBadge,
        openDrawer: openDrawer,
        closeDrawer: closeDrawer
    };

})();
