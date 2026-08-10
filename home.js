/**
 * TECH BOX AI - Home Page Controller
 * Navigation Bar & Hero Section Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initCyberCanvas();
    initThemeToggle();
    initMobileNav();
    initNavbarScroll();
    init3DParallax();
    initSearchUI();
    initTrendingUI();
});

/* ==========================================================================
   1. Cyber Canvas Particle Background Animation
   ========================================================================== */
function initCyberCanvas() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 16000), 75);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.8 + 0.6;
            this.alpha = Math.random() * 0.45 + 0.25;
            this.color = Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#a855f7' : '#06b6d4');
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isLightMode = document.body.classList.contains('light-mode');
        const lineColor = isLightMode ? '#0284c7' : '#38bdf8';

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 125) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = lineColor;
                    ctx.globalAlpha = (1 - dist / 125) * (isLightMode ? 0.12 : 0.16);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   2. Dark / Light Mode Toggle
   ========================================================================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeBtn = document.getElementById('mobileThemeBtn');

    // Read stored theme preference or default to dark
    const savedTheme = localStorage.getItem('techbox_theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    function toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('techbox_theme', isLight ? 'light' : 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (mobileThemeBtn) {
        mobileThemeBtn.addEventListener('click', toggleTheme);
    }
}

/* ==========================================================================
   3. Mobile Navigation Drawer Handler
   ========================================================================== */
function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!hamburgerBtn || !mobileDrawer) return;

    function openMobileNav() {
        hamburgerBtn.classList.add('is-active');
        mobileDrawer.classList.add('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        hamburgerBtn.classList.remove('is-active');
        mobileDrawer.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('is-open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileNav);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
}

/* ==========================================================================
   4. Navbar Scroll Glass Effect
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   5. Interactive 3D Parallax Tilt Effect for Smartphone Visual
   ========================================================================== */
function init3DParallax() {
    const stage = document.getElementById('phoneStage');
    const card = document.getElementById('phoneCard');
    const badges = document.querySelectorAll('.stage-holo-badge');

    if (!stage || !card) return;

    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -16;
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 16;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        badges.forEach(badge => {
            const speed = parseFloat(badge.getAttribute('data-speed')) || 1;
            const moveX = ((e.clientX - centerX) / (rect.width / 2)) * speed * 15;
            const moveY = ((e.clientY - centerY) / (rect.height / 2)) * speed * 15;
            badge.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    stage.addEventListener('mouseleave', () => {
        card.style.transform = `rotateX(0deg) rotateY(0deg)`;
        badges.forEach(badge => {
            badge.style.transform = `translate(0px, 0px)`;
        });
    });
}

/* ==========================================================================
   6. Live Search Engine
   ========================================================================== */
function initSearchUI() {
    // ── DOM refs ─────────────────────────────────────────────────────────────
    const input         = document.getElementById('heroSearchInput');
    const searchBtn     = document.getElementById('heroSearchBtn');
    const clearBtn      = document.getElementById('searchClearBtn');
    const kbdBadge      = document.getElementById('kbdBadge');
    const resultsSection= document.getElementById('searchResultsSection');
    const resultsGrid   = document.getElementById('searchResultsGrid');
    const resultsCount  = document.getElementById('searchResultsCount');
    const queryDisplay  = document.getElementById('searchQueryDisplay');
    const noResults     = document.getElementById('searchNoResults');
    const noResultsQ    = document.getElementById('noResultsQuery');
    const dismissBtn    = document.getElementById('searchDismissBtn');
    const trendingSection = document.getElementById('mobiles');
    const heroTags      = document.querySelectorAll('.hero-tag');
    const nrSuggestions = document.querySelectorAll('.nr-suggestion-tag');

    if (!input) return;

    // ── Data source ───────────────────────────────────────────────────────────
    const dataList = (typeof phonesData !== 'undefined' ? phonesData : null)
                   || (window.phonesData || []);

    // ── Debounce helper ───────────────────────────────────────────────────────
    let debounceTimer = null;
    function debounce(fn, ms) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, ms);
    }

    // ── Build a flat searchable string for a phone ────────────────────────────
    function buildSearchCorpus(phone) {
        const parts = [
            phone.name,
            phone.brand,
            phone.category,
            phone.highlightTag && phone.highlightTag.text,
            phone.price,
        ];
        // Add all spec text values
        if (phone.specs) {
            phone.specs.forEach(s => parts.push(s.text));
        }
        return parts.filter(Boolean).join(' ').toLowerCase();
    }

    // Pre-build corpora once
    const corpora = dataList.map(buildSearchCorpus);

    // ── Core search function ──────────────────────────────────────────────────
    function searchPhones(rawQuery) {
        const q = rawQuery.trim().toLowerCase();
        if (!q) return dataList; // empty → all

        // Support multi-word: every word must appear somewhere in corpus
        const words = q.split(/\s+/).filter(Boolean);
        return dataList.filter((_, i) =>
            words.every(word => corpora[i].includes(word))
        );
    }

    // ── Escape HTML (for safe injection) ─────────────────────────────────────
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Wrap matched term in a highlight span ─────────────────────────────────
    function highlight(text, query) {
        if (!query || !query.trim()) return escapeHtml(text);
        const words = query.trim().split(/\s+/).filter(Boolean);
        const pattern = new RegExp(`(${words.map(w =>
            w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ).join('|')})`, 'gi');
        return escapeHtml(text).replace(pattern,
            '<mark class="search-match-highlight">$1</mark>'
        );
    }

    // ── Build a single phone card HTML (identical to trending, + highlight) ───
    function buildCardHtml(phone, query, index) {
        const delay = ((index + 1) * 0.08).toFixed(2);
        const glowHtml = phone.glowClass ? ` ${phone.glowClass}` : '';
        const specsHtml = (phone.specs || []).map(spec => `
            <span class="spec-pill"><i class="${escapeHtml(spec.icon)}"></i> ${highlight(spec.text, query)}</span>
        `).join('');

        return `
            <div class="phone-card" style="--delay: ${delay}s;">
                <div class="card-top-bar">
                    <span class="card-brand-badge ${escapeHtml(phone.brandClass)}">
                        <i class="${escapeHtml(phone.brandIcon)}"></i>
                        ${highlight(phone.brand, query)}
                    </span>
                    <div class="card-action-group">
                        <button class="card-icon-btn compare-btn"
                            title="Add to Compare"
                            data-id="${escapeHtml(phone.id)}"
                            aria-label="Compare ${escapeHtml(phone.name)}">
                            <i class="fa-solid fa-code-compare"></i>
                        </button>
                        <button class="card-icon-btn fav-btn"
                            title="Add to Favorites"
                            aria-label="Favorite ${escapeHtml(phone.name)}">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>

                <div class="card-img-wrapper">
                    <span class="tech-highlight-tag ${escapeHtml(phone.highlightTag.colorClass)}">
                        <i class="${escapeHtml(phone.highlightTag.icon)}"></i>
                        ${escapeHtml(phone.highlightTag.text)}
                    </span>
                    <div class="card-img-glow${glowHtml}"></div>
                    <img src="${escapeHtml(phone.image)}"
                        alt="${escapeHtml(phone.name)}"
                        class="phone-card-img"
                        loading="lazy"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="phone-fallback-art" style="display:none;">
                        <i class="fa-solid fa-mobile-screen-button"></i>
                        <span>${escapeHtml(phone.fallbackName || phone.name)}</span>
                    </div>
                </div>

                <div class="card-info">
                    <div class="card-header-meta">
                        <span class="phone-brand">${highlight(phone.brand, query)}</span>
                        <div class="star-rating" title="${escapeHtml(String(phone.rating))} out of 5 stars">
                            <i class="fa-solid fa-star"></i>
                            <span class="rating-num">${escapeHtml(String(phone.rating))}</span>
                            <span class="rating-count">${escapeHtml(phone.ratingCount)}</span>
                        </div>
                    </div>

                    <h3 class="phone-name">${highlight(phone.name, query)}</h3>

                    <div class="phone-specs-pills">${specsHtml}</div>

                    <div class="card-footer">
                        <div class="price-box">
                            <span class="price-lbl">Starting at</span>
                            <span class="price-val">${escapeHtml(phone.price)}</span>
                        </div>
                        <a href="details.html?id=${escapeHtml(phone.id)}"
                            class="btn-view-details"
                            aria-label="View Details for ${escapeHtml(phone.name)}">
                            <span>Details</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // ── Attach interactive handlers to newly rendered search cards ────────────
    function wireSearchCardHandlers() {
        resultsGrid.querySelectorAll('.fav-btn').forEach(btn => {
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

        resultsGrid.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const phoneId = btn.dataset.id;
                if (!phoneId) return;
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

    // ── Show / hide results UI ────────────────────────────────────────────────
    function showResults(matches, query) {
        const hasMatches = matches.length > 0;

        // Section visibility
        resultsSection.style.display = 'block';
        // Force CSS animation replay on re-search
        resultsSection.style.animation = 'none';
        void resultsSection.offsetHeight; // reflow
        resultsSection.style.animation = '';

        // Update header
        if (queryDisplay) queryDisplay.textContent = `"${query}"`;
        if (resultsCount) {
            resultsCount.innerHTML = hasMatches
                ? `Found <strong>${matches.length}</strong> phone${matches.length !== 1 ? 's' : ''} matching your search`
                : '';
        }

        // Render cards or no-results
        if (hasMatches) {
            resultsGrid.style.display = '';
            noResults.style.display = 'none';
            resultsGrid.innerHTML = matches.map((p, i) => buildCardHtml(p, query, i)).join('');
            wireSearchCardHandlers();
        } else {
            resultsGrid.style.display = 'none';
            noResults.style.display = 'flex';
            if (noResultsQ) noResultsQ.textContent = `"${query}"`;
        }

        // Dim trending
        if (trendingSection) trendingSection.classList.add('search-dimmed');

        // Scroll results into view smoothly
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    }

    function hideResults() {
        resultsSection.style.display = 'none';
        resultsGrid.innerHTML = '';
        noResults.style.display = 'none';
        if (trendingSection) trendingSection.classList.remove('search-dimmed');
    }

    // ── Toggle clear button & kbd badge visibility ────────────────────────────
    function syncClearButton(hasValue) {
        if (clearBtn) clearBtn.style.display = hasValue ? 'flex' : 'none';
        if (kbdBadge) kbdBadge.classList.toggle('search-active', hasValue);
    }

    // ── Execute a search ──────────────────────────────────────────────────────
    function executeSearch(query) {
        const q = query.trim();
        syncClearButton(q.length > 0);

        if (!q) {
            hideResults();
            input.setAttribute('aria-expanded', 'false');
            return;
        }

        const matches = searchPhones(q);
        showResults(matches, q);
        input.setAttribute('aria-expanded', 'true');
    }

    // ── Clear / dismiss ───────────────────────────────────────────────────────
    function clearSearch() {
        input.value = '';
        syncClearButton(false);
        hideResults();
        input.setAttribute('aria-expanded', 'false');
        input.focus();
    }

    // ── Event bindings ────────────────────────────────────────────────────────

    // Live search while typing (debounced 180ms for responsiveness)
    input.addEventListener('input', () => {
        debounce(() => executeSearch(input.value), 180);
    });

    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => executeSearch(input.value));
    }

    // Enter key
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            clearTimeout(debounceTimer);
            executeSearch(input.value);
        }
        if (e.key === 'Escape') {
            clearSearch();
        }
    });

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }

    // Dismiss / close results
    if (dismissBtn) {
        dismissBtn.addEventListener('click', clearSearch);
    }

    // Popular tag buttons → fill input + trigger search
    heroTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.textContent.trim();
            input.value = query;
            syncClearButton(true);
            executeSearch(query);
            input.focus();
        });
    });

    // No-results suggestion tags → fill input + trigger search
    nrSuggestions.forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.dataset.query || tag.textContent.trim();
            input.value = query;
            syncClearButton(true);
            executeSearch(query);
        });
    });

    // Ctrl + K global shortcut → focus search input
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            input.focus();
            input.select();
        }
    });
}

/* ==========================================================================
   7. Trending Mobiles Section UI & Dynamic Rendering
   ========================================================================== */
function initTrendingUI() {
    // 1. Dynamically render phone cards from phonesData array
    renderTrendingCards();

    // 2. Favorite Heart Toggle Handler
    const favButtons = document.querySelectorAll('.fav-btn');
    favButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (icon) {
                if (isActive) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }
            }
        });
    });

    // 3. Compare Button Toggle Handler
    const compareButtons = document.querySelectorAll('.compare-btn');
    compareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const phoneId = btn.dataset.id;
            if (!phoneId) return;
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

    // 4. Filter Tabs Toggle Handler
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

/**
 * Render phone cards into .trending-grid from centralized phonesData array
 */
function renderTrendingCards() {
    const grid = document.getElementById('trendingGrid') || document.querySelector('.trending-grid');
    if (!grid) return;

    const dataList = (typeof phonesData !== 'undefined') ? phonesData : (window.phonesData || []);
    if (!dataList || !dataList.length) return;

    grid.innerHTML = dataList.map((phone, index) => {
        const delay = ((index + 1) * 0.1).toFixed(1);
        const glowHtml = phone.glowClass ? ` ${phone.glowClass}` : '';
        const specsHtml = phone.specs.map(spec => `
            <span class="spec-pill"><i class="${spec.icon}"></i> ${spec.text}</span>
        `).join('');

        return `
            <div class="phone-card anim-fade-up" style="--delay: ${delay}s;">
                <div class="card-top-bar">
                    <span class="card-brand-badge ${phone.brandClass}">
                        <i class="${phone.brandIcon}"></i> ${phone.brand}
                    </span>
                    <div class="card-action-group">
                        <button class="card-icon-btn compare-btn" title="Add to Compare" data-id="${phone.id}" aria-label="Compare ${phone.name}">
                            <i class="fa-solid fa-code-compare"></i>
                        </button>
                        <button class="card-icon-btn fav-btn" title="Add to Favorites" aria-label="Favorite ${phone.name}">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>

                <div class="card-img-wrapper">
                    <span class="tech-highlight-tag ${phone.highlightTag.colorClass}">
                        <i class="${phone.highlightTag.icon}"></i> ${phone.highlightTag.text}
                    </span>
                    <div class="card-img-glow${glowHtml}"></div>
                    <img src="${phone.image}" alt="${phone.name}" class="phone-card-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="phone-fallback-art" style="display:none;">
                        <i class="fa-solid fa-mobile-screen-button"></i>
                        <span>${phone.fallbackName}</span>
                    </div>
                </div>

                <div class="card-info">
                    <div class="card-header-meta">
                        <span class="phone-brand">${phone.brand}</span>
                        <div class="star-rating" title="${phone.rating} out of 5 stars">
                            <i class="fa-solid fa-star"></i>
                            <span class="rating-num">${phone.rating}</span>
                            <span class="rating-count">${phone.ratingCount}</span>
                        </div>
                    </div>

                    <h3 class="phone-name">${phone.name}</h3>

                    <div class="phone-specs-pills">
                        ${specsHtml}
                    </div>

                    <div class="card-footer">
                        <div class="price-box">
                            <span class="price-lbl">Starting at</span>
                            <span class="price-val">${phone.price}</span>
                        </div>
                        <a href="details.html?id=${phone.id}" class="btn-view-details" aria-label="View Details for ${phone.name}">
                            <span>Details</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

