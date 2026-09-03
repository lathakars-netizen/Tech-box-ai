/**
 * TECH BOX AI — Compare Phones Page Controller
 * Handles device selection modal, side-by-side spec comparison,
 * winner spec highlights, localStorage persistence, and responsive UI.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCyberCanvas();
    initThemeToggle();
    initMobileNav();
    initNavbarScroll();
    initComparePage();
});

// ------------ State & Data ------------ //
const MAX_PHONES = 3;
let selectedPhones = [];

function getPhonesDatabase() {
    return (typeof window.phonesData !== 'undefined' ? window.phonesData : []) || [];
}

// ------------ 1. Initialization ------------ //
function initComparePage() {
    loadInitialSelection();
    bindUIEvents();
    renderAll();
}

function loadInitialSelection() {
    const allPhones = getPhonesDatabase();
    if (!allPhones.length) return;

    // 1. Check URL parameters e.g., ?ids=s25-ultra,iphone-16-pro-max
    const params = new URLSearchParams(window.location.search);
    const urlIds = params.get('ids') || params.get('id');

    let idsToLoad = [];
    if (urlIds) {
        idsToLoad = urlIds.split(',').map(s => s.trim()).filter(Boolean);
    } else {
        // 2. Check localStorage
        try {
            const stored = JSON.parse(localStorage.getItem('compareSelection') || '[]');
            if (Array.isArray(stored) && stored.length > 0) {
                idsToLoad = stored;
            }
        } catch (e) {
            console.error('Failed to parse compareSelection from localStorage', e);
        }
    }

    // 3. Fallback to default 2 flagship devices if empty
    if (!idsToLoad.length) {
        idsToLoad = ['s25-ultra', 'iphone-16-pro-max'];
    }

    // Resolve phone objects from database
    selectedPhones = [];
    idsToLoad.forEach(id => {
        const found = allPhones.find(p => p.id === id);
        if (found && selectedPhones.length < MAX_PHONES && !selectedPhones.some(p => p.id === found.id)) {
            selectedPhones.push(found);
        }
    });

    saveState();
}

function saveState() {
    const ids = selectedPhones.map(p => p.id);
    localStorage.setItem('compareSelection', JSON.stringify(ids));

    // Update URL query parameters silently
    if (window.history && window.history.replaceState) {
        const newUrl = ids.length > 0
            ? `${window.location.pathname}?ids=${ids.join(',')}`
            : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    }
}

// ------------ 2. UI Bindings ------------ //
function bindUIEvents() {
    const addBtn = document.getElementById('addPhoneBtn');
    const clearBtn = document.getElementById('clearAllBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const modal = document.getElementById('phoneModal');
    const modalSearch = document.getElementById('modalSearchInput');

    if (addBtn) addBtn.addEventListener('click', openModal);
    if (clearBtn) clearBtn.addEventListener('click', clearAllPhones);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (modalSearch) {
        modalSearch.addEventListener('input', filterPhoneList);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ------------ 3. Modal Handlers ------------ //
function openModal() {
    if (selectedPhones.length >= MAX_PHONES) {
        showToast(`⚠️ Maximum ${MAX_PHONES} devices can be compared at once.`);
        return;
    }

    const modal = document.getElementById('phoneModal');
    const searchInput = document.getElementById('modalSearchInput');
    if (!modal) return;

    populateModalList();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
}

function closeModal() {
    const modal = document.getElementById('phoneModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function populateModalList() {
    const list = document.getElementById('phoneList');
    if (!list) return;

    const allPhones = getPhonesDatabase();
    list.innerHTML = '';

    allPhones.forEach(phone => {
        const isSelected = selectedPhones.some(p => p.id === phone.id);
        const li = document.createElement('li');
        li.className = `phone-select-item${isSelected ? ' disabled' : ''}`;
        
        li.innerHTML = `
            <div class="phone-item-main">
                <img src="${phone.image}" alt="${phone.name}" class="phone-item-img" onerror="this.style.display='none'" />
                <div>
                    <div class="phone-item-name">${phone.name}</div>
                    <div class="phone-item-sub">${phone.brand} • ${phone.price}</div>
                </div>
            </div>
            <div class="phone-item-action ${isSelected ? 'selected-action' : 'add-action'}">
                <i class="${isSelected ? 'fa-solid fa-check' : 'fa-solid fa-plus'}"></i>
                <span>${isSelected ? 'Selected' : 'Select'}</span>
            </div>
        `;

        if (!isSelected) {
            li.addEventListener('click', () => {
                addPhone(phone);
                closeModal();
            });
        }

        list.appendChild(li);
    });
}

function filterPhoneList() {
    const query = (document.getElementById('modalSearchInput')?.value || '').trim().toLowerCase();
    const items = document.querySelectorAll('#phoneList .phone-select-item');

    items.forEach(item => {
        const name = item.querySelector('.phone-item-name')?.textContent.toLowerCase() || '';
        const sub = item.querySelector('.phone-item-sub')?.textContent.toLowerCase() || '';
        const match = name.includes(query) || sub.includes(query);
        item.style.display = match ? 'flex' : 'none';
    });
}

// ------------ 4. Add / Remove Actions ------------ //
function addPhone(phone) {
    if (selectedPhones.some(p => p.id === phone.id)) {
        showToast(`⚠️ ${phone.name} is already selected.`);
        return;
    }
    if (selectedPhones.length >= MAX_PHONES) {
        showToast(`⚠️ Maximum ${MAX_PHONES} devices allowed.`);
        return;
    }

    selectedPhones.push(phone);
    saveState();
    renderAll();
    showToast(`✅ Added ${phone.name} to comparison.`);
}

function removePhone(index) {
    if (index >= 0 && index < selectedPhones.length) {
        const removed = selectedPhones.splice(index, 1)[0];
        saveState();
        renderAll();
        showToast(`🗑️ Removed ${removed.name}.`);
    }
}

function clearAllPhones() {
    if (!selectedPhones.length) return;
    selectedPhones = [];
    saveState();
    renderAll();
    showToast(`🧹 Comparison cleared.`);
}

// ------------ 5. Render Selected Chips & Table ------------ //
function renderAll() {
    renderChips();
    renderTable();
    updateCounter();
}

function updateCounter() {
    const counter = document.getElementById('selectionCounter');
    const clearBtn = document.getElementById('clearAllBtn');
    if (counter) counter.textContent = `${selectedPhones.length} of ${MAX_PHONES} Selected`;
    if (clearBtn) clearBtn.style.display = selectedPhones.length > 0 ? 'inline-flex' : 'none';
}

function renderChips() {
    const container = document.getElementById('selectedPhones');
    if (!container) return;

    container.innerHTML = '';

    // Render chips for selected devices
    selectedPhones.forEach((phone, idx) => {
        const chip = document.createElement('div');
        chip.className = 'phone-chip';
        chip.innerHTML = `
            <img src="${phone.image}" alt="${phone.name}" class="phone-chip-img" onerror="this.style.display='none'" />
            <div class="phone-chip-info">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <span class="phone-chip-brand">${phone.brand}</span>
                    <span class="verified-specs-pill" style="font-size:0.62rem; padding:2px 6px;" title="Verified Dataset Specs"><i class="fa-solid fa-shield-check"></i> Verified</span>
                </div>
                <h4 class="phone-chip-name">${phone.name}</h4>
                <span class="phone-chip-price">${phone.price}</span>
            </div>
            <button class="remove-btn" title="Remove ${phone.name}" aria-label="Remove ${phone.name}">&times;</button>
        `;

        chip.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removePhone(idx);
        });

        container.appendChild(chip);
    });

    // Render "+ Add Device" slot card if < MAX_PHONES
    if (selectedPhones.length < MAX_PHONES) {
        const slotCard = document.createElement('div');
        slotCard.className = 'add-slot-card';
        slotCard.innerHTML = `
            <div class="add-slot-icon"><i class="fa-solid fa-plus"></i></div>
            <div class="add-slot-text" data-i18n="compare.clickToAdd">Add Device to Compare</div>
        `;
        slotCard.addEventListener('click', openModal);
        container.appendChild(slotCard);
    }

    if (window.techboxLang) {
        window.techboxLang.applyTranslations(container);
    }
}

// ------------ 6. Side-by-Side Comparison Table Rendering ------------ //
function renderTable() {
    const table = document.getElementById('compareTable');
    if (!table) return;

    table.innerHTML = '';
    table.className = `compare-table cols-${Math.max(selectedPhones.length, 1)}`;

    if (selectedPhones.length === 0) {
        table.innerHTML = `
            <div class="compare-empty-state">
                <i class="fa-solid fa-scale-balanced empty-icon"></i>
                <h3 data-i18n="compare.emptyTitle">No Devices Selected</h3>
                <p data-i18n="compare.emptyMsg">Click the <strong data-i18n="compare.addDevice">+ Add Device</strong> button above to start comparing specs side-by-side.</p>
                <button class="btn-compare-add" onclick="openModal()" style="margin-top:0.5rem;" data-i18n="compare.selectSmartphones">Select Smartphones</button>
            </div>
        `;
        if (window.techboxLang) {
            window.techboxLang.applyTranslations(table);
        }
        return;
    }

    // Define table rows
    const rows = [
        {
            key: 'display',
            icon: 'fa-solid fa-tv',
            label: 'Display & Refresh',
            get: p => p.display ? `${p.display}${p.displaySub ? `<span class="cell-sub">${p.displaySub}</span>` : ''}` : '—',
            numericGetter: p => parseNumber(p.display)
        },
        {
            key: 'processor',
            icon: 'fa-solid fa-microchip',
            label: 'Processor / Chipset',
            get: p => p.processor ? `${p.processor}${p.processorSub ? `<span class="cell-sub">${p.processorSub}</span>` : ''}` : '—'
        },
        {
            key: 'ram',
            icon: 'fa-solid fa-memory',
            label: 'RAM Memory',
            get: p => p.ram ? `${p.ram}${p.ramSub ? `<span class="cell-sub">${p.ramSub}</span>` : ''}` : '—',
            numericGetter: p => parseNumber(p.ram)
        },
        {
            key: 'storage',
            icon: 'fa-solid fa-hard-drive',
            label: 'Storage Capacity',
            get: p => p.storage ? `${p.storage}${p.storageSub ? `<span class="cell-sub">${p.storageSub}</span>` : ''}` : '—',
            numericGetter: p => parseStorageGB(p.storage)
        },
        {
            key: 'camera',
            icon: 'fa-solid fa-camera',
            label: 'Camera System',
            get: p => p.camera ? `${p.camera}${p.cameraSub ? `<span class="cell-sub">${p.cameraSub}</span>` : ''}` : '—',
            numericGetter: p => parseHighestMP(p.camera)
        },
        {
            key: 'battery',
            icon: 'fa-solid fa-battery-full',
            label: 'Battery Capacity',
            get: p => p.battery ? `${p.battery}${p.batterySub ? `<span class="cell-sub">${p.batterySub}</span>` : ''}` : '—',
            numericGetter: p => parseNumber(p.battery)
        },
        {
            key: 'charging',
            icon: 'fa-solid fa-bolt',
            label: 'Fast Charging',
            get: p => p.charging ? `${p.charging}${p.chargingSub ? `<span class="cell-sub">${p.chargingSub}</span>` : ''}` : '—',
            numericGetter: p => parseNumber(p.charging)
        },
        {
            key: 'os',
            icon: 'fa-solid fa-mobile-screen',
            label: 'Operating System',
            get: p => p.os ? `${p.os}${p.osSub ? `<span class="cell-sub">${p.osSub}</span>` : ''}` : '—'
        },
        {
            key: 'build',
            icon: 'fa-solid fa-shield-halved',
            label: 'Build & Security',
            get: p => p.build ? `${p.build}${p.buildSub ? `<span class="cell-sub">${p.buildSub}</span>` : ''}` : '—'
        },
        {
            key: 'rating',
            icon: 'fa-solid fa-star',
            label: 'User Rating',
            get: p => p.rating ? `<strong>${p.rating} / 5</strong> ⭐ <span class="cell-sub">${p.ratingCount || ''}</span>` : '—',
            numericGetter: p => p.rating
        },
        {
            key: 'price',
            icon: 'fa-solid fa-tag',
            label: 'Starting Price',
            get: p => `<strong class="header-phone-price">${p.price}</strong>`,
            numericGetter: p => parseNumber(p.price),
            lowerIsBetter: true
        }
    ];

    // Compute best index for numeric rows (only if 2+ phones are selected and values differ)
    const bestIndexes = {};
    if (selectedPhones.length > 1) {
        rows.forEach((row, rowIdx) => {
            if (!row.numericGetter) return;
            const values = selectedPhones.map(p => row.numericGetter(p));
            
            // Check if at least 2 non-null values exist and are not all equal
            const valid = values.filter(v => v !== null && !isNaN(v));
            if (valid.length < 2) return;
            const allEqual = valid.every(v => v === valid[0]);
            if (allEqual) return;

            let bestIdx = null;
            values.forEach((v, i) => {
                if (v === null || isNaN(v)) return;
                if (bestIdx === null) { bestIdx = i; return; }
                const currentBest = values[bestIdx];
                if (row.lowerIsBetter) {
                    if (v < currentBest) bestIdx = i;
                } else {
                    if (v > currentBest) bestIdx = i;
                }
            });

            if (bestIdx !== null) bestIndexes[rowIdx] = bestIdx;
        });
    }

    // Render Sticky Header Row
    const headerRow = document.createElement('div');
    headerRow.className = 'row row-header';
    headerRow.innerHTML = `
        <div class="spec-label-cell">
            <i class="fa-solid fa-sliders"></i>
            <span>Specification</span>
        </div>
        ${selectedPhones.map(p => `
            <div class="header-cell">
                <img src="${p.image}" alt="${p.name}" class="header-phone-img" onerror="this.style.display='none'" />
                <h3 class="header-phone-name">${p.name}</h3>
                <span class="header-phone-price">${p.price}</span>
            </div>
        `).join('')}
    `;
    table.appendChild(headerRow);

    // Render Data Spec Rows
    rows.forEach((row, rIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        
        rowEl.innerHTML = `
            <div class="spec-label-cell">
                <i class="${row.icon}"></i>
                <span>${row.label}</span>
            </div>
        `;

        selectedPhones.forEach((phone, cIdx) => {
            const rawHtml = row.get(phone);
            const isWinner = bestIndexes[rIdx] === cIdx;
            
            const cell = document.createElement('div');
            cell.className = `cell${isWinner ? ' highlight' : ''}`;
            
            if (isWinner) {
                cell.innerHTML = `
                    <span class="badge-best"><i class="fa-solid fa-crown"></i> <span data-i18n="compare.winner">BEST</span></span>
                    <div>${rawHtml}</div>
                `;
            } else {
                cell.innerHTML = rawHtml;
            }

            rowEl.appendChild(cell);
        });

        table.appendChild(rowEl);
    });

    if (window.techboxLang) {
        window.techboxLang.applyTranslations(table);
    }
}

// ------------ 7. Parsing Utilities ------------ //
function parseNumber(str) {
    if (!str) return null;
    const cleaned = String(str).replace(/,/g, '');
    const match = cleaned.match(/([0-9]+\.?[0-9]*)/);
    return match ? parseFloat(match[1]) : null;
}

function parseStorageGB(str) {
    if (!str) return null;
    if (str.toLowerCase().includes('tb')) {
        const num = parseNumber(str);
        return num ? num * 1024 : null;
    }
    return parseNumber(str);
}

function parseHighestMP(cameraStr) {
    if (!cameraStr) return null;
    const matches = cameraStr.match(/([0-9]+)\s*MP/gi);
    if (!matches) return null;
    const numbers = matches.map(s => {
        const m = s.match(/[0-9]+/);
        return m ? parseInt(m[0], 10) : 0;
    });
    return Math.max(...numbers);
}

// ------------ 8. Toast Helper ------------ //
function showToast(message) {
    const toast = document.getElementById('compareToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ------------ 9. Theme Toggle ------------ //
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('techbox_theme') || 'dark';

    if (savedTheme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');

    function toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('techbox_theme', isLight ? 'light' : 'dark');
    }

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
}

// ------------ 10. Mobile Drawer ------------ //
function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');

    if (!hamburgerBtn || !mobileDrawer) return;

    function openMobileNav() {
        hamburgerBtn.classList.add('is-active');
        mobileDrawer.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        hamburgerBtn.classList.remove('is-active');
        mobileDrawer.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('is-open')) closeMobileNav();
        else openMobileNav();
    });

    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);
}

// ------------ 11. Navbar Scroll Effect ------------ //
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
}

// ------------ 12. Cyber Canvas Background Particles ------------ //
function initCyberCanvas() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 18000), 65);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.6 + 0.6;
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
