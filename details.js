/**
 * TECH BOX AI — Phone Details Page Controller
 * Reads ?id=<phone-id> from URL, loads matching phone from data/phones.js
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileNav();
    initNavbarScroll();
    initCyberCanvas();
    loadPhoneDetails();
    initScrollReveal();
});

/* ==========================================================================
   1. Read Phone ID from URL → Load Phone Data
   ========================================================================== */
function loadPhoneDetails() {
    const params = new URLSearchParams(window.location.search);
    const phoneId = params.get('id');

    const loader    = document.getElementById('detailsLoader');
    const errorEl   = document.getElementById('detailsError');
    const container = document.getElementById('detailsContainer');

    // Resolve data source (phones.js attaches to window.phonesData)
    const dataList =
        (typeof phonesData !== 'undefined' ? phonesData : null) ||
        (window.phonesData || []);

    if (!phoneId || !dataList.length) {
        showError(loader, errorEl);
        return;
    }

    const phone = dataList.find(p => p.id === phoneId);

    if (!phone) {
        showError(loader, errorEl);
        return;
    }

    // Hide loader, reveal container
    loader.style.display = 'none';
    container.style.display = 'block';

    // Update page title & meta description
    document.title = `${phone.name} — TECH BOX AI`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content',
            `View full specifications, camera details, and performance metrics for ${phone.name} on TECH BOX AI.`
        );
    }

    renderHero(phone);
    renderSpecsGrid(phone);
    renderFeatureBadges(phone);
    initActionButtons(phone);
    initGalleryModal(phone);
};

function showError(loader, errorEl) {
    loader.style.display = 'none';
    errorEl.style.display = 'flex';
}

/* ==========================================================================
   2. Render Hero Section
   ========================================================================== */
function renderHero(phone) {

    // Breadcrumb
    const bcCurrent = document.getElementById('bcCurrent');
    if (bcCurrent) bcCurrent.textContent = phone.name;

    // Image
    const imgEl = document.getElementById('dhPhoneImg');
    if (imgEl) {
        imgEl.src = phone.image;
        imgEl.alt = phone.name;
    }

    // Fallback name
    const fallbackName = document.getElementById('dhFallbackName');
    if (fallbackName) fallbackName.textContent = phone.fallbackName || phone.name;

    // Image glow class
    const imgGlow = document.getElementById('dhImgGlow');
    if (imgGlow && phone.glowClass) {
        if (phone.glowClass === 'purple') {
            imgGlow.style.background = 'radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)';
        } else if (phone.glowClass === 'pink') {
            imgGlow.style.background = 'radial-gradient(circle, rgba(217,70,239,0.35) 0%, transparent 70%)';
        }
    }

    // Highlight tag
    const tagEl = document.getElementById('dhHighlightTag');
    if (tagEl && phone.highlightTag) {
        tagEl.className = `dh-highlight-tag ${phone.highlightTag.colorClass}`;
        tagEl.innerHTML = `<i class="${phone.highlightTag.icon}"></i> ${phone.highlightTag.text}`;
    }

    // Floating badges (use specs array)
    if (phone.specs && phone.specs.length) {
        ['dhBadge0Text', 'dhBadge1Text', 'dhBadge2Text'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (el && phone.specs[i]) {
                el.textContent = phone.specs[i].text;
                // Update icon
                const badge = el.closest('.dh-float-badge');
                if (badge) {
                    const icon = badge.querySelector('i');
                    if (icon) icon.className = phone.specs[i].icon;
                }
            }
        });
    }

    // Brand badge
    const brandBadge = document.getElementById('dhBrandBadge');
    if (brandBadge) {
        const brandIcon = document.getElementById('dhBrandIcon');
        const brandName = document.getElementById('dhBrandName');
        if (brandIcon) brandIcon.className = phone.brandIcon;
        if (brandName) brandName.textContent = phone.brand;
    }

    // Phone name
    const nameEl = document.getElementById('dhPhoneName');
    if (nameEl) nameEl.textContent = phone.name;

    // Stars
    renderStars(phone.rating);

    // Rating count
    const ratingNum = document.getElementById('dhRatingNum');
    const ratingCount = document.getElementById('dhRatingCount');
    if (ratingNum) ratingNum.textContent = phone.rating;
    if (ratingCount) ratingCount.textContent = phone.ratingCount;

    // Category pill
    const catEl = document.getElementById('dhCategory');
    if (catEl) catEl.textContent = phone.category || 'smartphone';

    // Price
    const priceEl = document.getElementById('dhPrice');
    if (priceEl) priceEl.textContent = phone.price;

    // Quick spec pills
    renderSpecPills(phone.specs);

    // Feature phone name in section
    const featName = document.getElementById('dhFeatPhoneName');
    if (featName) featName.textContent = phone.name;
}

function renderStars(rating) {
    const starsEl = document.getElementById('dhStars');
    if (!starsEl) return;

    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    let html = '';
    for (let i = 0; i < full;  i++) html += `<i class="fa-solid fa-star"></i>`;
    if (half)                       html += `<i class="fa-solid fa-star-half-stroke"></i>`;
    for (let i = 0; i < empty; i++) html += `<i class="fa-regular fa-star empty"></i>`;
    starsEl.innerHTML = html;
}

function renderSpecPills(specs) {
    const pillsEl = document.getElementById('dhSpecPills');
    if (!pillsEl || !specs) return;
    pillsEl.innerHTML = specs.map(spec => `
        <span class="dh-spec-pill">
            <i class="${spec.icon}"></i>
            ${spec.text}
        </span>
    `).join('');
}

/* ==========================================================================
   3. Render Full Specs Grid
   ========================================================================== */
function renderSpecsGrid(phone) {
    const grid = document.getElementById('dhSpecsGrid');
    if (!grid) return;

    // Build a rich spec sheet from available phone data + enriched defaults
    const specCards = buildSpecCards(phone);

    grid.innerHTML = specCards.map(card => `
        <div class="dh-spec-card anim-reveal">
            <div class="dh-spec-icon">
                <i class="${card.icon}"></i>
            </div>
            <div class="dh-spec-content">
                <span class="dh-spec-label">${card.label}</span>
                <span class="dh-spec-value">${card.value}</span>
                ${card.sub ? `<span class="dh-spec-sub">${card.sub}</span>` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Build rich spec cards. Uses data from phones.js specs array and adds
 * realistic additional specs based on the phone's brand/model data.
 */
function buildSpecCards(phone) {
    // Extract base specs from the phone's specs array
    const specMap = {};
    if (phone.specs) {
        phone.specs.forEach(s => {
            const iconClass = s.icon;
            if (iconClass.includes('microchip'))    specMap.processor = s.text;
            if (iconClass.includes('camera'))       specMap.camera = s.text;
            if (iconClass.includes('battery'))      specMap.battery = s.text;
            if (iconClass.includes('tv') || iconClass.includes('display')) specMap.display = s.text;
            if (iconClass.includes('gauge'))        specMap.display = s.text;
        });
    }

    // Brand-specific enriched data
    const enriched = getEnrichedSpecs(phone);

    return [
        {
            icon: 'fa-solid fa-microchip',
            label: 'Processor',
            value: enriched.processor || specMap.processor || 'Latest Flagship Chip',
            sub: enriched.processorSub || 'AI-Optimised Neural Engine'
        },
        {
            icon: 'fa-solid fa-camera',
            label: 'Main Camera',
            value: enriched.camera || specMap.camera || 'Multi-Camera System',
            sub: enriched.cameraSub || 'AI-enhanced computational photography'
        },
        {
            icon: 'fa-solid fa-battery-full',
            label: 'Battery',
            value: enriched.battery || specMap.battery || 'Large Capacity',
            sub: enriched.batterySub || 'Fast charging supported'
        },
        {
            icon: 'fa-solid fa-tv',
            label: 'Display',
            value: enriched.display || specMap.display || 'AMOLED / OLED',
            sub: enriched.displaySub || 'High refresh rate, HDR support'
        },
        {
            icon: 'fa-solid fa-memory',
            label: 'RAM',
            value: enriched.ram || '12 GB RAM',
            sub: enriched.ramSub || 'LPDDR5X high-bandwidth memory'
        },
        {
            icon: 'fa-solid fa-hard-drive',
            label: 'Storage',
            value: enriched.storage || '256 GB / 512 GB',
            sub: enriched.storageSub || 'UFS 4.0 ultra-fast flash'
        },
        {
            icon: 'fa-solid fa-wifi',
            label: 'Connectivity',
            value: enriched.connectivity || '5G + Wi-Fi 7',
            sub: enriched.connectivitySub || 'Bluetooth 5.4, NFC, USB-C'
        },
        {
            icon: 'fa-solid fa-shield-halved',
            label: 'Build & Security',
            value: enriched.build || 'Gorilla Glass Victus 2',
            sub: enriched.buildSub || 'IP68 dust & water resistance'
        },
        {
            icon: 'fa-solid fa-mobile-screen',
            label: 'Operating System',
            value: enriched.os || 'Latest Android / iOS',
            sub: enriched.osSub || 'Multi-year OS update guarantee'
        }
    ];
}

/**
 * Per-phone enriched spec details based on known product data
 */
function getEnrichedSpecs(phone) {
    if (phone && phone.processor) {
        return phone;
    }
    return phone || {};
}

/* ==========================================================================
   4. Render Feature Badges
   ========================================================================== */
function renderFeatureBadges(phone) {
    const badgesEl = document.getElementById('dhFeatureBadges');
    if (!badgesEl) return;

    const features = buildFeatures(phone);
    badgesEl.innerHTML = features.map(f => `
        <div class="dh-feature-badge">
            <div class="dh-feature-badge-icon ${f.color}">
                <i class="${f.icon}"></i>
            </div>
            <div class="dh-feature-badge-text">
                <span class="dh-feature-badge-name">${f.name}</span>
                <span class="dh-feature-badge-desc">${f.desc}</span>
            </div>
        </div>
    `).join('');
}

function buildFeatures(phone) {
    // Common flagship features + phone-specific highlights
    const base = [
        { icon: 'fa-solid fa-signal', color: 'cyan',   name: '5G Ultra Ready',      desc: 'Next-gen connectivity' },
        { icon: 'fa-solid fa-brain',  color: 'purple',  name: 'On-Device AI',         desc: 'Neural engine processing' },
        { icon: 'fa-solid fa-shield-halved', color: 'cyan', name: 'IP68 Rated',      desc: 'Dust & water resistant' },
        { icon: 'fa-solid fa-wifi',   color: 'purple',  name: 'Wi-Fi 7 Support',      desc: '802.11be ultra-fast' },
        { icon: 'fa-solid fa-nfc-symbol', color: 'cyan', name: 'NFC Payments',        desc: 'Tap to pay anywhere' },
        { icon: 'fa-solid fa-satellite-dish', color: 'pink', name: 'Satellite SOS',   desc: 'Emergency connectivity' }
    ];

    // Phone-specific features
    const extras = getPhoneFeatures(phone);
    return [...extras, ...base].slice(0, 9);
}

function getPhoneFeatures(phone) {
    const featMap = {
        's25-ultra': [
            { icon: 'fa-solid fa-pen-nib',         color: 'cyan',   name: 'S Pen Built-in',    desc: '4096 pressure levels' },
            { icon: 'fa-solid fa-wand-magic-sparkles', color: 'purple', name: 'Galaxy AI',     desc: 'Live Translate & Circle to Search' },
            { icon: 'fa-solid fa-camera',          color: 'pink',   name: '200MP Camera',      desc: 'AI zoom up to 100x Space Zoom' }
        ],
        'iphone-16-pro-max': [
            { icon: 'fa-solid fa-apple',           color: 'purple', name: 'Apple Intelligence', desc: 'On-device generative AI' },
            { icon: 'fa-solid fa-video',           color: 'cyan',   name: '4K 120fps ProRes',  desc: 'Cinema-grade video recording' },
            { icon: 'fa-solid fa-gem',             color: 'pink',   name: 'Titanium Build',    desc: 'Grade 5 aerospace titanium' }
        ],
        'pixel-9-pro-xl': [
            { icon: 'fa-solid fa-robot',           color: 'cyan',   name: 'Gemini Pro Built-in', desc: 'Advanced conversational AI' },
            { icon: 'fa-solid fa-moon',            color: 'purple', name: 'Best Shot & Magic Eraser', desc: 'AI-powered photo editing' },
            { icon: 'fa-solid fa-temperature-half', color: 'pink',  name: 'Satellite Messaging', desc: 'Emergency SOS via satellite' }
        ],
        'oneplus-13-pro': [
            { icon: 'fa-solid fa-bolt',            color: 'pink',   name: '100W Fast Charging', desc: '0-100% in 26 minutes' },
            { icon: 'fa-solid fa-binoculars',      color: 'cyan',   name: 'Hasselblad Cameras', desc: 'Master Edition color science' },
            { icon: 'fa-solid fa-droplet',         color: 'purple', name: 'IP69 Rated',         desc: 'High-pressure water jet proof' }
        ],
        'nothing-phone-3-pro': [
            { icon: 'fa-solid fa-lightbulb',       color: 'cyan',   name: 'Glyph Interface 2.0', desc: '900-LED programmable light strips' },
            { icon: 'fa-solid fa-leaf',            color: 'purple', name: 'Recycled Materials', desc: 'Eco-conscious design philosophy' },
            { icon: 'fa-solid fa-eye',             color: 'pink',   name: 'Transparent Design',  desc: 'Iconic see-through back panel' }
        ],
        'xiaomi-15-ultra': [
            { icon: 'fa-solid fa-camera-retro',    color: 'cyan',   name: 'Leica 1-inch Sensor', desc: 'Large sensor for professional shots' },
            { icon: 'fa-solid fa-bolt',            color: 'purple', name: '90W HyperCharge',      desc: 'Fastest Xiaomi charging ever' },
            { icon: 'fa-solid fa-expand',          color: 'pink',   name: '10x Periscope Zoom',   desc: 'Optical telephoto masterpiece' }
        ],
        'rog-phone-9-ultimate': [
            { icon: 'fa-solid fa-gauge-high',      color: 'cyan',   name: '185Hz Display',        desc: 'World\'s fastest gaming screen' },
            { icon: 'fa-solid fa-snowflake',       color: 'purple', name: 'AeroCooler 9',         desc: 'Clip-on active cooling fan' },
            { icon: 'fa-solid fa-gamepad',         color: 'pink',   name: 'Ultrasonic Triggers',  desc: 'Physical shoulder gaming buttons' }
        ],
        'vivo-x100-ultra': [
            { icon: 'fa-solid fa-crosshairs',      color: 'cyan',   name: 'ZEISS APO Optics',     desc: 'German precision lens engineering' },
            { icon: 'fa-solid fa-bullseye',        color: 'purple', name: '200MP Telephoto',      desc: 'Highest-resolution zoom camera' },
            { icon: 'fa-solid fa-microchip',       color: 'pink',   name: 'V3+ Imaging Chip',     desc: 'Dedicated photography co-processor' }
        ]
    };
    return featMap[phone.id] || [];
}

/* ==========================================================================
   5. Action Buttons: Favorite, Compare, Buy, Back
   ========================================================================== */
function initActionButtons(phone) {
    // Back button
    // id='btnBack'
const btnBack = document.getElementById("btnBack");
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (document.referrer && document.referrer.includes(location.hostname)) {
                history.back();
            } else {
                window.location.href = 'home.html#mobiles';
            }
        });
    }

    // Favorite button
    const btnFav = document.getElementById('btnFav');
    const favIcon = document.getElementById('favIcon');
    if (btnFav) {
        // Restore saved state
        const favKey = `fav_${phone.id}`;
        if (localStorage.getItem(favKey) === 'true') {
            btnFav.classList.add('active');
            if (favIcon) { favIcon.className = 'fa-solid fa-heart'; }
        }

        btnFav.addEventListener('click', () => {
            const isActive = btnFav.classList.toggle('active');
            if (favIcon) {
                favIcon.className = isActive ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
            localStorage.setItem(favKey, isActive ? 'true' : 'false');
            showToast(isActive ? `❤️ Added ${phone.name} to Favorites` : `💔 Removed from Favorites`);
        });
    }

    // Compare button
    const btnCompare = document.getElementById('btnCompare');
    if (btnCompare) {
        let stored = JSON.parse(localStorage.getItem('compareSelection') || '[]');
        if (stored.includes(phone.id)) {
            btnCompare.classList.add('active');
        }
        btnCompare.addEventListener('click', () => {
            stored = JSON.parse(localStorage.getItem('compareSelection') || '[]');
            if (!stored.includes(phone.id)) {
                if (stored.length >= 3) {
                    showToast(`⚠️ Max 3 phones reached! Opening Compare…`, 'cyan');
                } else {
                    stored.push(phone.id);
                    localStorage.setItem('compareSelection', JSON.stringify(stored));
                    showToast(`✅ Added ${phone.name} to Compare!`, 'cyan');
                }
            } else {
                showToast(`✅ Opening Compare page…`, 'cyan');
            }
            setTimeout(() => {
                window.location.href = `compare.html?ids=${stored.join(',')}`;
            }, 500);
        });
    }

    // Buy button (UI only – shows an info toast)
    const btnBuy = document.getElementById('btnBuy');
    if (btnBuy) {
        btnBuy.addEventListener('click', () => {
            showToast(`🚀 Redirecting to buy ${phone.name}…`, 'cyan');
        });
    }
}

function showToast(message, _type = 'cyan') {
    const toast = document.getElementById('dhToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

/* ==========================================================================
   5b. Lightbox / Gallery Modal
   ========================================================================== */
function initGalleryModal(phone) {
    const modal = document.getElementById('galleryModal');
    const overlay = document.getElementById('galleryOverlay');
    const galleryImg = document.getElementById('galleryImg');
    const closeBtn = document.getElementById('galleryClose');
    const phoneImg = document.getElementById('dhPhoneImg');
    const imgWrapper = document.querySelector('.dh-img-wrapper');

    if (!modal || !phoneImg) return;

    if (imgWrapper) {
        imgWrapper.style.cursor = 'pointer';
        imgWrapper.title = 'Click to enlarge image';
    }

    function openModal() {
        if (!galleryImg || !phone.image) return;
        galleryImg.src = phone.image;
        galleryImg.alt = phone.name;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }

    if (phoneImg) phoneImg.addEventListener('click', openModal);

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   6. Scroll Reveal (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // stagger by index
                const delay = (entry.target.dataset.revealDelay || 0);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    // Observe all .anim-reveal elements (including those added later by renderSpecsGrid)
    const mutObs = new MutationObserver(() => {
        document.querySelectorAll('.anim-reveal:not(.observed)').forEach((el, i) => {
            el.dataset.revealDelay = i * 80;
            el.classList.add('observed');
            observer.observe(el);
        });
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    // Also catch already-present elements
    document.querySelectorAll('.anim-reveal').forEach((el, i) => {
        el.dataset.revealDelay = i * 80;
        el.classList.add('observed');
        observer.observe(el);
    });
}

/* ==========================================================================
   7. Cyber Canvas Particle Background
   ========================================================================== */
function initCyberCanvas() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particleCount = Math.min(Math.floor((width * height) / 18000), 60);
    const particles = [];

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.6 + 0.5;
            this.alpha = Math.random() * 0.4 + 0.2;
            this.color = Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#a855f7' : '#06b6d4');
        }
        update() {
            this.x += this.vx; this.y += this.vy;
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

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const isLight = document.body.classList.contains('light-mode');
        const lineColor = isLight ? '#0284c7' : '#38bdf8';
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(); particles[i].draw();
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = lineColor;
                    ctx.globalAlpha = (1 - dist / 120) * (isLight ? 0.1 : 0.14);
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
   8. Theme Toggle
   ========================================================================== */
function initThemeToggle() {
    const themeToggle  = document.getElementById('themeToggle');
    const mobileTheme  = document.getElementById('mobileThemeBtn');
    const saved = localStorage.getItem('techbox_theme') || 'dark';

    if (saved === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');

    function toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('techbox_theme', isLight ? 'light' : 'dark');
    }

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileTheme) mobileTheme.addEventListener('click', toggleTheme);
}

/* ==========================================================================
   9. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
    const hamburgerBtn  = document.getElementById('hamburgerBtn');
    const mobileDrawer  = document.getElementById('mobileDrawer');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');

    if (!hamburgerBtn || !mobileDrawer) return;

    function openNav() {
        hamburgerBtn.classList.add('is-active');
        mobileDrawer.classList.add('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeNav() {
        hamburgerBtn.classList.remove('is-active');
        mobileDrawer.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () =>
        mobileDrawer.classList.contains('is-open') ? closeNav() : openNav()
    );
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeNav);
    document.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', closeNav));
}

/* ==========================================================================
   10. Navbar Scroll Glass Effect
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });
}
