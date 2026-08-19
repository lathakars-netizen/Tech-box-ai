/**
 * TECH BOX AI - Global Search System
 * Single Source of Truth: data/phones.js (window.phonesData)
 * Provides glassmorphism search modal, multi-field matching, keyboard shortcut (Ctrl+K),
 * live results, spec pills, keyboard navigation, and seamless cross-page routing.
 */

(function () {
    'use strict';

    let activeIndex = -1;
    let currentResults = [];

    // Ensure DOM is ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalSearch);
    } else {
        initGlobalSearch();
    }

    function initGlobalSearch() {
        injectSearchModalDOM();
        bindGlobalTriggers();
    }

    // ── Inject Modal HTML into Document Body if not already present ──────────
    function injectSearchModalDOM() {
        if (document.getElementById('globalSearchModalOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'globalSearchModalOverlay';
        overlay.className = 'global-search-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Global Smartphone Search');

        overlay.innerHTML = `
            <div class="global-search-modal" id="globalSearchModal">
                <div class="search-modal-header">
                    <i class="fa-solid fa-magnifying-glass search-modal-search-icon"></i>
                    <input type="text" id="globalSearchInput" class="search-modal-input" placeholder="Search phone name, brand, processor, camera, RAM, battery or price..." autocomplete="off" spellcheck="false" />
                    <div class="search-modal-actions">
                        <span class="search-modal-kbd">Ctrl + K</span>
                        <button type="button" id="globalSearchClearBtn" class="search-modal-btn-clear" style="display:none;" aria-label="Clear search">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <button type="button" id="globalSearchCloseBtn" class="search-modal-btn-close" aria-label="Close search modal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div class="search-modal-results" id="globalSearchResults"></div>
                <div class="search-modal-footer">
                    <div class="search-modal-hints">
                        <span class="search-hint-item"><kbd>ESC</kbd> Close</span>
                        <span class="search-hint-item"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span class="search-hint-item"><kbd>↵</kbd> Select</span>
                    </div>
                    <div class="search-modal-branding">
                        TECH BOX <span style="color: var(--color-cyan-bright, #38bdf8); font-weight: 700;">AI</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind inner modal event handlers
        const input = document.getElementById('globalSearchInput');
        const clearBtn = document.getElementById('globalSearchClearBtn');
        const closeBtn = document.getElementById('globalSearchCloseBtn');

        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
            debounceTimer = setTimeout(() => {
                performSearch(input.value);
            }, 120);
        });

        input.addEventListener('keydown', handleInputKeydown);

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            performSearch('');
            input.focus();
        });

        closeBtn.addEventListener('click', closeGlobalSearch);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeGlobalSearch();
            }
        });
    }

    // ── Bind Nav Bar Buttons and Keyboard Shortcuts ─────────────────────────
    function bindGlobalTriggers() {
        // Event delegation for search trigger buttons
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('#searchBtn, .search-trigger-btn');
            if (trigger) {
                e.preventDefault();
                openGlobalSearch();
            }
        });

        // Keyboard Shortcut: Ctrl+K or Cmd+K & Escape
        window.addEventListener('keydown', (e) => {
            const isK = e.key && e.key.toLowerCase() === 'k';
            if ((e.ctrlKey || e.metaKey) && isK) {
                e.preventDefault();
                const overlay = document.getElementById('globalSearchModalOverlay');
                if (overlay && overlay.classList.contains('active')) {
                    const input = document.getElementById('globalSearchInput');
                    if (input) input.focus();
                } else {
                    openGlobalSearch();
                }
            } else if (e.key === 'Escape') {
                const overlay = document.getElementById('globalSearchModalOverlay');
                if (overlay && overlay.classList.contains('active')) {
                    e.preventDefault();
                    closeGlobalSearch();
                }
            }
        });
    }

    // ── Open & Close Modal Functions ─────────────────────────────────────────
    function openGlobalSearch() {
        const overlay = document.getElementById('globalSearchModalOverlay');
        const input = document.getElementById('globalSearchInput');
        if (!overlay || !input) return;

        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            input.focus();
            input.select();
        }, 50);

        performSearch(input.value);
    }

    function closeGlobalSearch() {
        const overlay = document.getElementById('globalSearchModalOverlay');
        if (!overlay) return;

        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeIndex = -1;
    }

    // ── Search Algorithm across window.phonesData ─────────────────────────────
    function performSearch(query) {
        const resultsContainer = document.getElementById('globalSearchResults');
        if (!resultsContainer) return;

        const q = query.trim().toLowerCase();
        const phones = (typeof window.phonesData !== 'undefined' && Array.isArray(window.phonesData))
            ? window.phonesData
            : [];

        activeIndex = -1;

        if (!q) {
            renderInitialSuggestions(resultsContainer, phones);
            return;
        }

        // Search & rank matching smartphones
        const matched = [];

        phones.forEach(phone => {
            let score = 0;
            let matchedSpecSnippet = '';

            const name = (phone.name || '').toLowerCase();
            const brand = (phone.brand || '').toLowerCase();
            const processor = ((phone.processor || '') + ' ' + (phone.processorSub || '')).toLowerCase();
            const camera = ((phone.camera || '') + ' ' + (phone.cameraSub || '')).toLowerCase();
            const ram = ((phone.ram || '') + ' ' + (phone.ramSub || '')).toLowerCase();
            const battery = ((phone.battery || '') + ' ' + (phone.batterySub || '')).toLowerCase();
            const price = (phone.price || '').toLowerCase().replace(/[^0-9.]/g, '');
            const category = (phone.category || '').toLowerCase();

            // Name match (highest weight)
            if (name.includes(q)) {
                score += name.startsWith(q) ? 30 : 20;
            }

            // Brand match
            if (brand.includes(q)) {
                score += 15;
            }

            // Processor match
            if (processor.includes(q)) {
                score += 12;
                matchedSpecSnippet = `⚡ ${phone.processor}`;
            }

            // Camera match
            if (camera.includes(q)) {
                score += 12;
                if (!matchedSpecSnippet) matchedSpecSnippet = `📸 ${phone.camera.split('+')[0].trim()}`;
            }

            // RAM match
            if (ram.includes(q)) {
                score += 10;
                if (!matchedSpecSnippet) matchedSpecSnippet = `💾 ${phone.ram} RAM`;
            }

            // Battery match
            if (battery.includes(q)) {
                score += 10;
                if (!matchedSpecSnippet) matchedSpecSnippet = `🔋 ${phone.battery}`;
            }

            // Price match
            const rawQPrice = q.replace(/[^0-9]/g, '');
            if (rawQPrice && (price.includes(rawQPrice) || (phone.price || '').toLowerCase().includes(q))) {
                score += 8;
                if (!matchedSpecSnippet) matchedSpecSnippet = `🏷️ ${phone.price}`;
            }

            // Category match
            if (category.includes(q)) {
                score += 6;
            }

            // Additional specs array match
            if (Array.isArray(phone.specs)) {
                phone.specs.forEach(s => {
                    if ((s.text || '').toLowerCase().includes(q)) {
                        score += 5;
                        if (!matchedSpecSnippet) matchedSpecSnippet = `✨ ${s.text}`;
                    }
                });
            }

            if (score > 0) {
                matched.push({ phone, score, matchedSpecSnippet });
            }
        });

        // Sort by score descending
        matched.sort((a, b) => b.score - a.score);
        currentResults = matched.map(m => m.phone);

        if (matched.length > 0) {
            renderSearchResults(resultsContainer, matched, q);
        } else {
            renderNoResults(resultsContainer, query);
        }
    }

    // ── Render Search Results ────────────────────────────────────────────────
    function renderSearchResults(container, matches, query) {
        let html = `<div class="search-results-meta">MATCHING SMARTPHONES (${matches.length})</div>`;

        matches.forEach(({ phone, matchedSpecSnippet }, index) => {
            const brandIcon = phone.brandIcon || 'fa-solid fa-mobile-screen-button';
            const defaultSpecPill = matchedSpecSnippet || `⚡ ${phone.processor || 'High Performance'}`;

            // Highlight query text in phone name
            const highlightedName = highlightMatch(phone.name, query);

            html += `
                <a href="details.html?id=${encodeURIComponent(phone.id)}" 
                   class="search-result-item" 
                   data-index="${index}" 
                   data-id="${phone.id}">
                    <img src="${phone.image}" alt="${phone.name}" class="search-result-thumb" onerror="this.src='assets/s25_ultra.jpg';" />
                    <div class="search-result-info">
                        <div class="search-result-header">
                            <span class="search-result-brand-pill">
                                <i class="${brandIcon}"></i> ${phone.brand}
                            </span>
                            <span class="search-result-title">${highlightedName}</span>
                        </div>
                        <div class="search-result-specs">
                            <span class="search-spec-tag highlight">${escapeHtml(defaultSpecPill)}</span>
                            <span class="search-spec-tag">📸 ${escapeHtml(phone.camera ? phone.camera.split('+')[0].trim() : 'AI Camera')}</span>
                        </div>
                    </div>
                    <div class="search-result-price-box">
                        <span class="search-result-price">${phone.price}</span>
                        <i class="fa-solid fa-chevron-right search-result-arrow"></i>
                    </div>
                </a>
            `;
        });

        container.innerHTML = html;

        // Mouse hover interactions
        const items = container.querySelectorAll('.search-result-item');
        items.forEach((item, idx) => {
            item.addEventListener('mouseenter', () => {
                setActiveIndex(idx);
            });
        });
    }

    // ── Render Initial Suggestions when input is empty ────────────────────────
    function renderInitialSuggestions(container, phones) {
        currentResults = phones.slice(0, 5);
        let html = `<div class="search-results-meta">POPULAR FLAGSHIPS</div>`;

        phones.slice(0, 5).forEach((phone, index) => {
            const brandIcon = phone.brandIcon || 'fa-solid fa-mobile-screen-button';
            html += `
                <a href="details.html?id=${encodeURIComponent(phone.id)}" 
                   class="search-result-item" 
                   data-index="${index}" 
                   data-id="${phone.id}">
                    <img src="${phone.image}" alt="${phone.name}" class="search-result-thumb" onerror="this.src='assets/s25_ultra.jpg';" />
                    <div class="search-result-info">
                        <div class="search-result-header">
                            <span class="search-result-brand-pill">
                                <i class="${brandIcon}"></i> ${phone.brand}
                            </span>
                            <span class="search-result-title">${escapeHtml(phone.name)}</span>
                        </div>
                        <div class="search-result-specs">
                            <span class="search-spec-tag">⚡ ${escapeHtml(phone.processor || 'Flagship Chip')}</span>
                            <span class="search-spec-tag">🔋 ${escapeHtml(phone.battery || '5000 mAh')}</span>
                        </div>
                    </div>
                    <div class="search-result-price-box">
                        <span class="search-result-price">${phone.price}</span>
                        <i class="fa-solid fa-chevron-right search-result-arrow"></i>
                    </div>
                </a>
            `;
        });

        container.innerHTML = html;

        const items = container.querySelectorAll('.search-result-item');
        items.forEach((item, idx) => {
            item.addEventListener('mouseenter', () => {
                setActiveIndex(idx);
            });
        });
    }

    // ── Render Clean "No Results Found" State ────────────────────────────────
    function renderNoResults(container, rawQuery) {
        currentResults = [];
        container.innerHTML = `
            <div class="search-no-results">
                <i class="fa-solid fa-magnifying-glass-minus search-no-results-icon"></i>
                <div class="search-no-results-title">No Smartphones Found</div>
                <div class="search-no-results-sub">
                    We couldn't find any results matching "<strong>${escapeHtml(rawQuery)}</strong>".
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted, #64748b); margin-top: 4px;">Try searching for:</div>
                <div class="search-suggestions-wrapper">
                    <span class="search-suggestion-pill" data-query="Apple">Apple</span>
                    <span class="search-suggestion-pill" data-query="Samsung">Samsung</span>
                    <span class="search-suggestion-pill" data-query="Snapdragon">Snapdragon</span>
                    <span class="search-suggestion-pill" data-query="200MP">200MP</span>
                    <span class="search-suggestion-pill" data-query="16 GB">16 GB RAM</span>
                </div>
            </div>
        `;

        // Click handler for suggestion pills
        const pills = container.querySelectorAll('.search-suggestion-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                const input = document.getElementById('globalSearchInput');
                const clearBtn = document.getElementById('globalSearchClearBtn');
                if (input) {
                    input.value = pill.dataset.query;
                    if (clearBtn) clearBtn.style.display = 'flex';
                    performSearch(input.value);
                    input.focus();
                }
            });
        });
    }

    // ── Handle Keyboard Navigation (Arrow Keys & Enter) ──────────────────────
    function handleInputKeydown(e) {
        const container = document.getElementById('globalSearchResults');
        if (!container) return;

        const items = container.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            let nextIndex = activeIndex + 1;
            if (nextIndex >= items.length) nextIndex = 0;
            setActiveIndex(nextIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            let prevIndex = activeIndex - 1;
            if (prevIndex < 0) prevIndex = items.length - 1;
            setActiveIndex(prevIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && items[activeIndex]) {
                items[activeIndex].click();
            } else if (items[0]) {
                items[0].click();
            }
        }
    }

    function setActiveIndex(index) {
        const container = document.getElementById('globalSearchResults');
        if (!container) return;

        const items = container.querySelectorAll('.search-result-item');
        items.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('active');
            }
        });

        activeIndex = index;
    }

    // ── Helper Utilities ─────────────────────────────────────────────────────
    function highlightMatch(text, query) {
        if (!text) return '';
        if (!query) return escapeHtml(text);

        const escapedQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQ})`, 'gi');
        return escapeHtml(text).replace(regex, '<span class="search-highlight-text">$1</span>');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
