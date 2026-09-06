/* mobiles.js */
/*
    Mobiles page controller – renders phone cards, provides brand & price filters,
    sorting, search, and integrates with the global comparison system via
    localStorage (key: 'compareSelection').
*/

document.addEventListener('DOMContentLoaded', () => {
    initMobilePage();
});

function initMobilePage() {
    // UI refs
    const grid = document.getElementById('mobilesGrid');
    const searchInput = document.getElementById('mobilesSearchInput');
    const clearBtn = document.getElementById('mobilesSearchClearBtn');
    const brandBtns = document.querySelectorAll('.filter-group.brands .brand-btn');
    const priceSelect = document.getElementById('priceFilter');
    const sortSelect = document.getElementById('sortSelect');

    // Read URL search params (e.g. from Home "View All" or direct search)
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilter = urlParams.get('filter') || 'all';
    const initialBrand = urlParams.get('brand') || 'All';
    const initialSearch = urlParams.get('q') || '';

    // State
    const allPhones = typeof window.phonesData !== 'undefined' ? window.phonesData : [];
    let currentCategory = initialFilter;
    let currentBrand = initialBrand;
    let currentPrice = 'all';
    let currentSort = 'price-asc';
    let searchQuery = initialSearch;

    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
        toggleClearBtn(true);
    }

    if (currentBrand !== 'All') {
        brandBtns.forEach(b => b.classList.toggle('active', (b.dataset.brand || '').toLowerCase() === currentBrand.toLowerCase()));
    }

    // Render initially
    renderGrid();

    // ---- Event bindings ---------------------------------------------------
    // Brand filter interaction
    brandBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentBrand = btn.dataset.brand;
            currentCategory = 'all'; // Reset category filter when clicking specific brand
            brandBtns.forEach(b => b.classList.toggle('active', b === btn));
            renderGrid();
        });
    });

    // Price filter
    priceSelect && priceSelect.addEventListener('change', () => {
        currentPrice = priceSelect.value;
        renderGrid();
    });

    // Sort selector
    sortSelect && sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        renderGrid();
    });

    // Search input (debounced)
    let debounceTimer = null;
    const debounce = (fn, ms) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, ms);
    };
    searchInput && searchInput.addEventListener('input', () => {
        debounce(() => {
            searchQuery = searchInput.value.trim().toLowerCase();
            toggleClearBtn(searchQuery.length > 0);
            renderGrid();
        }, 200);
    });
    // Clear button
    clearBtn && clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        toggleClearBtn(false);
        renderGrid();
    });

    // ---- Helper functions -------------------------------------------------
    function toggleClearBtn(show) {
        if (!clearBtn) return;
        clearBtn.style.display = show ? 'flex' : 'none';
    }

    function renderGrid() {
        if (!grid) return;
        const filtered = allPhones.filter(phone => {
            // Category filter (from Home "View All")
            if (currentCategory && currentCategory !== 'all') {
                const cat = (phone.category || '').toLowerCase();
                if (!cat.includes(currentCategory.toLowerCase())) return false;
            }

            // Brand filter
            if (currentBrand !== 'All' && (phone.brand || '').toLowerCase() !== currentBrand.toLowerCase()) return false;

            // Price filter (INR tiers)
            const priceNum = (typeof phone.priceNumericINR === 'number') ? phone.priceNumericINR : parseNumber(phone.price);
            if (currentPrice !== 'all') {
                if (currentPrice.endsWith('+')) {
                    const min = parseFloat(currentPrice);
                    if (priceNum < min) return false;
                } else {
                    const [minStr, maxStr] = currentPrice.split('-');
                    const min = parseFloat(minStr);
                    const max = maxStr ? parseFloat(maxStr) : Infinity;
                    if (priceNum < min || priceNum > max) return false;
                }
            }

            // Robust search query matching
            if (searchQuery) {
                const q = searchQuery.trim().toLowerCase();
                const normQ = q.replace(/[^a-z0-9]/g, '');

                // 1. Check aliases
                if (phone.aliases && phone.aliases.some(alias => {
                    const normA = (alias || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    return normA.includes(normQ) || normQ.includes(normA);
                })) {
                    return true;
                }

                // 2. Check normalized name & brand
                const normName = (phone.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const normBrand = (phone.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normName.includes(normQ) || normBrand.includes(normQ)) return true;

                // 3. Multi-word match against full corpus
                const corpus = `${phone.name} ${phone.brand} ${phone.price} ${phone.processor || ''} ${phone.camera || ''} ${phone.category || ''} ${phone.display || ''}`.toLowerCase();
                const words = q.split(/\s+/).filter(Boolean);
                if (!words.every(w => corpus.includes(w))) return false;
            }
            return true;
        });

        const sorted = filtered.slice().sort((a, b) => {
            switch (currentSort) {
                case 'price-asc':
                    return ((a.priceNumericINR || parseNumber(a.price)) - (b.priceNumericINR || parseNumber(b.price)));
                case 'price-desc':
                    return ((b.priceNumericINR || parseNumber(b.price)) - (a.priceNumericINR || parseNumber(a.price)));
                case 'rating-desc':
                    return (b.rating || 0) - (a.rating || 0);
                case 'newest':
                    return (b.releaseYear || 0) - (a.releaseYear || 0);
                default:
                    return 0;
            }
        });

        grid.innerHTML = sorted.map((phone, idx) => buildCardHtml(phone, idx)).join('');
        // Apply translations to newly injected content
        if (window.techboxLang && typeof window.techboxLang.applyTranslations === 'function') {
            window.techboxLang.applyTranslations(grid);
        }
        wireCardButtons();
    }

    function buildCardHtml(phone, idx) {
        if (!phone) return ''; // Sanity check

        const delay = ((idx + 1) * 0.08).toFixed(2);
        const specs = Array.isArray(phone.specs) ? phone.specs : [];
        const specsHtml = specs.map(spec => `
            <span class="spec-pill"><i class="${spec.icon || 'fa-solid fa-microchip'}"></i> ${spec.text || ''}</span>`).join('');
        return `
            <div class="phone-card anim-fade-up" style="--delay: ${delay}s;">
                <div class="card-top-bar">
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span class="card-brand-badge ${phone.brandClass || ''}">
                            <i class="${phone.brandIcon || 'fa-solid fa-mobile'}"></i> ${phone.brand || 'Unknown'}
                        </span>
                        <span class="verified-specs-pill" title="Verified Phone Specs from Dataset"><i class="fa-solid fa-shield-check"></i> Verified</span>
                    </div>
                    <div class="card-action-group">
                        <button class="card-icon-btn compare-btn" title="Add to Compare" aria-label="Compare ${phone.name || 'Phone'}" data-id="${phone.id || ''}">
                            <i class="fa-solid fa-code-compare"></i>
                        </button>
                        <button class="card-icon-btn fav-btn" title="Add to Favorites" aria-label="Favorite ${phone.name || 'Phone'}" data-id="${phone.id || ''}" data-fav-id="${phone.id || ''}">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>
                <div class="card-img-wrapper">
                    <span class="tech-highlight-tag ${phone.highlightTag?.colorClass || ''}">
                        <i class="${phone.highlightTag?.icon || ''}"></i>
                        ${phone.highlightTag?.text || ''}
                    </span>
                    <div class="card-img-glow${phone.glowClass ? ` ${phone.glowClass}` : ''}"></div>
                    <img src="${phone.image || ''}" alt="${phone.name || 'Phone'}" class="phone-card-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                    <div class="phone-fallback-art" style="display:none;">
                        <i class="fa-solid fa-mobile-screen-button"></i>
                        <span>${phone.fallbackName || phone.name || 'Unknown'}</span>
                    </div>
                </div>
                <div class="card-info">
                    <div class="card-header-meta">
                        <span class="phone-brand">${phone.brand || 'Unknown'}</span>
                        <div class="star-rating" title="${phone.rating || 0} out of 5 stars">
                            <i class="fa-solid fa-star"></i>
                            <span class="rating-num">${phone.rating || 0}</span>
                            <span class="rating-count">${phone.ratingCount || '(0)'}</span>
                        </div>
                    </div>
                    <h3 class="phone-name">${phone.name || 'Unknown'}</h3>
                    <div class="phone-specs-pills">${specsHtml}</div>
                    <div class="card-footer">
                        <div class="price-box">
                            <span class="price-lbl" data-i18n="card.startingAt">Starting at</span>
                            <span class="price-val">${phone.price || 'N/A'}</span>
                        </div>
                        <a href="details.html?id=${phone.id || ''}" class="btn-view-details" aria-label="View Details for ${phone.name || 'Phone'}">
                            <span data-i18n="card.details">Details</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </a>
                    </div>
                </div>
            </div>`;
    }

    function wireCardButtons() {
        const storedCompare = JSON.parse(localStorage.getItem('compareSelection') || '[]');

        // Favorite toggle
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const isActive = btn.classList.toggle('active');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-regular', !isActive);
                    icon.classList.toggle('fa-solid', isActive);
                }
            });
        });

        // Compare toggle + persistence + redirect
        document.querySelectorAll('.compare-btn').forEach(btn => {
            const phoneId = btn.dataset.id;
            if (storedCompare.includes(phoneId)) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const stored = JSON.parse(localStorage.getItem('compareSelection') || '[]');
                if (!stored.includes(phoneId)) {
                    if (stored.length < 3) {
                        stored.push(phoneId);
                    }
                    localStorage.setItem('compareSelection', JSON.stringify(stored));
                }
                window.location.href = `compare.html?ids=${stored.join(',')}`;
            });
        });
    }

    // Utility to parse price strings like "$1,299"
    function parseNumber(str) {
        if (!str || typeof str !== 'string') return 0;
        const cleaned = str.replace(/[^0-9.,]/g, '').replace(/,/g, '');
        return parseFloat(cleaned) || 0;
    }
}
