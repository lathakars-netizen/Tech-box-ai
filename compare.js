/* compare.js */
/*
   Compare Phones page controller.
   - Loads phone data from global window.phonesData (data/phones.js).
   - Allows user to add up to 3 phones via search input.
   - Renders selected phone chips with remove buttons.
   - Builds a side‑by‑side comparison table.
   - Highlights the better specification for each numeric field.
   - Re‑uses the enriched spec map from details.js (same source of truth).
*/

// ------------ 1. Data loading & enrichment ------------ //
const allPhones = typeof window.phonesData !== 'undefined' ? window.phonesData : [];

function getEnrichedSpecs(phoneId) {
    const map = {
        's25-ultra': {
            processor: 'Snapdragon 8 Gen 4',
            processorSub: '4nm, 45 TOPS AI — Galaxy AI onboard',
            camera: '200MP Wide + 50MP Tele + 12MP Ultra',
            cameraSub: 'Periscope 5x optical zoom, AI-upscaled 100x Space Zoom',
            battery: '5000 mAh',
            batterySub: '45W wired • 15W wireless charging',
            charging: '45W',
            display: '6.9″ Dynamic AMOLED 2X, 120Hz',
            displaySub: '2600 nits peak brightness, HDR10+',
            ram: '12 GB',
            ramSub: 'LPDDR5X high-bandwidth memory',
            storage: '256 GB / 512 GB / 1 TB',
            storageSub: 'UFS 4.0 ultra-fast flash storage',
            connectivity: '5G + Wi‑Fi 7 (802.11be)',
            connectivitySub: 'Bluetooth 5.4, NFC, USB‑C 3.2',
            build: 'Titanium frame + Gorilla Glass Armor 2',
            buildSub: 'IP68 (6m / 30 min) water resistance',
            os: 'Android 15 — One UI 7',
            osSub: '7 years of OS & security updates guaranteed',
            charging: '45W'
        },
        'iphone-16-pro-max': {
            processor: 'Apple A18 Pro',
            processorSub: '3nm TSMC — 16‑core Neural Engine 35 TOPS',
            camera: '48MP Fusion + 48MP Ultra Wide + 12MP Tele',
            cameraSub: '5x optical tetraprism zoom • 4K 120fps ProRes video',
            battery: '4685 mAh',
            batterySub: '27W wired • MagSafe 25W wireless',
            charging: '27W',
            display: '6.9″ Super Retina XDR OLED, 120Hz',
            displaySub: '2000 nits outdoor brightness, Always‑On',
            ram: '8 GB',
            ramSub: 'LPDDR5 unified memory architecture',
            storage: '256 GB / 512 GB / 1 TB',
            storageSub: 'NVMe A‑grade flash storage',
            connectivity: '5G mmWave + Wi‑Fi 7',
            connectivitySub: 'Bluetooth 5.3, NFC, USB‑C 3 (10Gbps)',
            build: 'Grade 5 Titanium + Ceramic Shield',
            buildSub: 'IP68 — 6m depth / 30 min rated',
            os: 'iOS 18 with Apple Intelligence',
            osSub: 'Multi‑year update support guaranteed',
            charging: '27W'
        },
        'pixel-9-pro-xl': {
            processor: 'Google Tensor G4',
            processorSub: 'Custom ARM Cortex + Titan M3 security chip',
            camera: '50MP Wide + 48MP Ultra Wide + 48MP Tele',
            cameraSub: '5x optical zoom • Video Boost with Gemini',
            battery: '5060 mAh',
            batterySub: '37W wired • 23W wireless • Reverse wireless',
            charging: '37W',
            display: '6.8″ LTPO OLED, 1–120Hz',
            displaySub: '3000 nits, HDR10+, Always‑On Display',
            ram: '16 GB',
            ramSub: 'LPDDR5X high‑bandwidth memory',
            storage: '128 GB / 256 GB / 512 GB / 1 TB',
            storageSub: 'UFS 3.1 flash storage',
            connectivity: '5G + Wi‑Fi 7 (802.11be)',
            connectivitySub: 'Bluetooth 5.3, NFC, USB‑C 3.2 Gen 2',
            build: 'Polished titanium + Gorilla Glass Victus 2',
            buildSub: 'IP68 — 2m depth / 30 min rated',
            os: 'Android 15 — stock Google experience',
            osSub: '7 years of OS updates guaranteed',
            charging: '37W'
        },
        'oneplus-13-pro': {
            processor: 'Snapdragon 8 Gen 4',
            processorSub: '4nm, OxygenOS AI with on‑device AI features',
            camera: '50MP Hasselblad + 64MP Periscope + 50MP Ultra',
            cameraSub: 'Hasselblad Master Edition tuning, 6x optical zoom',
            battery: '6000 mAh',
            batterySub: '100W SUPERVOOC • 50W AirVOOC wireless',
            charging: '100W',
            display: '6.82″ ProXDR AMOLED, 1–120Hz LTPO',
            displaySub: '4500 nits peak, 2K resolution, HDR10+',
            ram: '12 GB / 16 GB / 24 GB',
            ramSub: 'LPDDR5X ultra‑fast memory',
            storage: '256 GB / 512 GB / 1 TB',
            storageSub: 'UFS 4.0 flash storage',
            connectivity: '5G + Wi‑Fi 7',
            connectivitySub: 'Bluetooth 5.4, NFC, USB‑C 3.2',
            build: 'Aluminum frame + Gorilla Glass 7i',
            buildSub: 'IP69 dust & water resistance',
            os: 'Android 15 — OxygenOS 15',
            osSub: '4 years OS + 5 years security updates',
            charging: '100W'
        },
        'nothing-phone-3-pro': {
            processor: 'Snapdragon 8s Gen 3',
            processorSub: '4nm chip optimized for Nothing OS efficiency',
            camera: '50MP Wide + 50MP Ultra Wide + 50MP Tele',
            cameraSub: '3x optical zoom • AI scene detection',
            battery: '5000 mAh',
            batterySub: '65W fast charging • 15W wireless charging',
            charging: '65W',
            display: '6.77″ LTPO AMOLED, 1–120Hz',
            displaySub: '3000 nits peak, FHD+, HDR10+',
            ram: '12 GB',
            ramSub: 'LPDDR5 RAM with RAM‑Vita extension',
            storage: '256 GB / 512 GB',
            storageSub: 'UFS 3.1 flash storage',
            connectivity: '5G + Wi‑Fi 6E',
            connectivitySub: 'Bluetooth 5.3, NFC, USB‑C 2.0',
            build: 'Recycled aluminium + Gorilla Glass 5',
            buildSub: 'IP64 dust & splash resistance',
            os: 'Android 15 — Nothing OS 3.0',
            osSub: '3 years OS + 4 years security updates',
            charging: '65W'
        },
        'xiaomi-15-ultra': {
            processor: 'Snapdragon 8 Gen 4',
            processorSub: '4nm, Xiaomi HyperOS AI acceleration',
            camera: '50MP Leica 1‑inch + 200MP Tele + 50MP Ultra',
            cameraSub: 'Leica Summilux optics, 10x optical periscope zoom',
            battery: '5500 mAh',
            batterySub: '90W HyperCharge • 80W wireless • 10W reverse',
            charging: '90W',
            display: '6.73″ LTPO AMOLED, 1–120Hz',
            displaySub: '3200 nits, 2K QHD+, Dolby Vision HDR',
            ram: '16 GB / 24 GB',
            ramSub: 'LPDDR5X with HyperMemory fusion',
            storage: '512 GB / 1 TB',
            storageSub: 'UFS 4.0 ultra‑fast flash',
            connectivity: '5G + Wi‑Fi 7',
            connectivitySub: 'Bluetooth 5.4, NFC, USB‑C 3.2',
            build: 'Titanium frame + Xiaomi Shield Glass',
            buildSub: 'IP68 dust & water resistance',
            os: 'Android 15 — Xiaomi HyperOS 2',
            osSub: '4 years OS + 5 years security updates',
            charging: '90W'
        },
        'rog-phone-9-ultimate': {
            processor: 'Snapdragon 8 Gen 4 (OC)',
            processorSub: 'Overclocked 3.4GHz + ROG GameCool 9 cooling',
            camera: '50MP Wide + 13MP Ultra + 32MP Selfie',
            cameraSub: 'OIS, 8K video recording @ 30fps',
            battery: '5800 mAh',
            batterySub: '65W HyperCharge • By‑pass charging for gaming',
            charging: '65W',
            display: '6.78″ AMOLED, 185Hz adaptive',
            displaySub: '2500 nits, FHD+, 1ms touch latency, HDR10+',
            ram: '16 GB / 24 GB',
            ramSub: 'LPDDR5X — extreme gaming performance',
            storage: '512 GB / 1 TB',
            storageSub: 'UFS 4.0 ultra‑fast storage',
            connectivity: '5G + Wi‑Fi 7 (3.6Gbps)',
            connectivitySub: 'Bluetooth 5.4, NFC, USB‑C 3.2 + pogo pins',
            build: 'Aerospace‑grade aluminum + Gorilla Glass Victus 2',
            buildSub: 'IP54 splash resistance + AeroCooler 9 clip‑on fan',
            os: 'Android 15 — ROG UI / ASUS ZenUI',
            osSub: '2 years OS + 3 years security updates',
            charging: '65W'
        },
        'vivo-x100-ultra': {
            processor: 'Snapdragon 8 Gen 3 + Vivo V3+ imaging chip',
            processorSub: 'Dual‑chip architecture for AI photography',
            camera: '200MP Tele + 50MP Wide + 50MP Ultra',
            cameraSub: 'ZEISS APO Summicron optics, 10x optical periscope',
            battery: '5500 mAh',
            batterySub: '100W FlashCharge • 50W wireless charging',
            charging: '100W',
            display: '6.78″ AMOLED, 120Hz LTPO',
            displaySub: '3000 nits peak, QHD+, Dolby Vision',
            ram: '16 GB',
            ramSub: 'LPDDR5X high‑bandwidth memory',
            storage: '512 GB / 1 TB',
            storageSub: 'UFS 4.0 flash storage',
            connectivity: '5G + Wi‑Fi 7',
            connectivitySub: 'Bluetooth 5.4, NFC, USB‑C 3.2',
            build: 'Vegan leather / Glass + Aluminium alloy frame',
            buildSub: 'IP68 dust & water resistance',
            os: 'Android 15 — OriginOS 5',
            osSub: '3 years OS + 4 years security updates',
            charging: '100W'
        }
    };
    return map[phoneId] || {};
}

// ------------ 2. UI helpers ------------ //
const selectedPhones = [];
const maxPhones = 3;

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

function renderSelectedChips() {
    const container = $('#selectedPhones');
    if (!container) return;
    container.innerHTML = '';
    selectedPhones.forEach((phone, idx) => {
        const chip = document.createElement('div');
        chip.className = 'phone-chip';
        chip.innerHTML = `
            <img src="${phone.image}" alt="${phone.name}" onerror="this.style.display='none'" />
            <div>
                <strong>${phone.name}</strong><br/>
                <span>${phone.price}</span>
            </div>
            <button class="remove-btn" aria-label="Remove ${phone.name}" data-index="${idx}">&times;</button>
        `;
        container.appendChild(chip);
        chip.querySelector('.remove-btn').addEventListener('click', (e) => {
            const i = parseInt(e.currentTarget.dataset.index, 10);
            selectedPhones.splice(i, 1);
            renderSelectedChips();
            renderComparison();
        });
    });
}

function parseNumber(str) {
    if (!str) return null;
    // extract first number (may have commas, spaces, etc.)
    const m = str.replace(/,/g, '').match(/([0-9]+\.?[0-9]*)/);
    return m ? parseFloat(m[1]) : null;
}

function extractHighestMP(cameraStr) {
    if (!cameraStr) return null;
    const matches = cameraStr.match(/([0-9]+)\s*MP/gi);
    if (!matches) return null;
    const numbers = matches.map(s => parseInt(s.match(/[0-9]+/)[0], 10));
    return Math.max(...numbers);
}

// ------------ 3. Comparison Table Rendering ------------ //
function renderComparison() {
    const table = $('#compareTable');
    if (!table) return;
    // Clear existing
    table.innerHTML = '';
    if (selectedPhones.length === 0) {
        table.innerHTML = '<p style="text-align:center;">No phones selected. Use the search box above to add phones.</p>';
        return;
    }

    // Define rows (label and a getter function for each phone)
    const rows = [
        { label: 'Image', get: p => `<img src="${p.image}" alt="${p.name}" style="width:80px; height:auto;" onerror="this.style.display='none'"/>` },
        { label: 'Name', get: p => p.name },
        { label: 'Brand', get: p => p.brand },
        { label: 'Processor/Chipset', get: p => {
            const e = getEnrichedSpecs(p.id);
            return e.processor || (p.specs?.find(s=>s.icon.includes('microchip'))?.text) || '—';
        } },
        { label: 'RAM', get: p => {
            const e = getEnrichedSpecs(p.id);
            return e.ram || (p.specs?.find(s=>s.icon.includes('memory'))?.text) || '—';
        } },
        { label: 'Storage', get: p => {
            const e = getEnrichedSpecs(p.id);
            return e.storage || (p.specs?.find(s=>s.icon.includes('hard-drive'))?.text) || '—';
        } },
        { label: 'Camera', get: p => {
            const e = getEnrichedSpecs(p.id);
            return e.camera || (p.specs?.find(s=>s.icon.includes('camera'))?.text) || '—';
        } },
        { label: 'Battery', get: p => {
            const e = getEnrichedSpecs(p.id);
            return e.battery || (p.specs?.find(s=>s.icon.includes('battery'))?.text) || '—';
        } },
        { label: 'Charging', get: p => {
            const e = getEnrichedSpecs(p.id);
            return e.charging || (p.specs?.find(s=>s.icon.includes('bolt'))?.text) || '—';
        } },
        { label: 'Operating System', get: p => {
            const e = getEnrichedSpecs(p.id);
            return e.os || (p.brand === 'Apple' ? 'iOS' : 'Android');
        } },
        { label: 'Price', get: p => p.price },
        { label: 'Rating', get: p => p.rating?.toString() || '—' },
    ];

    // Compute best values for numeric rows
    const numericRows = ['RAM', 'Storage', 'Camera', 'Battery', 'Charging', 'Price', 'Rating'];
    const bestIndexes = {};
    rows.forEach((row, rowIdx) => {
        if (!numericRows.includes(row.label)) return;
        const values = selectedPhones.map(p => {
            const val = row.get(p);
            if (row.label === 'Price') {
                // price like "$1,299"
                const num = parseNumber(val.replace(/[^0-9.,]/g, ''));
                return num !== null ? num : null;
            } else if (row.label === 'Rating') {
                const num = parseFloat(val);
                return isNaN(num) ? null : num;
            } else if (row.label === 'Camera') {
                const num = extractHighestMP(val);
                return num !== null ? num : null;
            } else if (row.label === 'Charging') {
                const num = parseNumber(val);
                return num !== null ? num : null;
            } else {
                // RAM, Storage, Battery – assume number with unit
                const num = parseNumber(val);
                return num !== null ? num : null;
            }
        });
        // Determine the best index according to rule (higher is better except Price lower is better)
        let bestIdx = null;
        values.forEach((v, i) => {
            if (v === null) return;
            if (bestIdx === null) { bestIdx = i; return; }
            const bestVal = values[bestIdx];
            if (row.label === 'Price') {
                if (v < bestVal) bestIdx = i;
            } else {
                if (v > bestVal) bestIdx = i;
            }
        });
        if (bestIdx !== null) bestIndexes[rowIdx] = bestIdx;
    });

    // Render header row (empty first cell then each phone name)
    const header = document.createElement('div');
    header.className = 'row header';
    header.innerHTML = `<div class="spec-label"></div>` + selectedPhones.map(p => `<div class="cell"><strong>${p.name}</strong></div>`).join('');
    table.appendChild(header);

    rows.forEach((row, rIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        // spec label cell
        rowEl.innerHTML = `<div class="spec-label">${row.label}</div>`;
        // value cells
        selectedPhones.forEach((phone, cIdx) => {
            const raw = row.get(phone);
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (bestIndexes[rIdx] === cIdx) {
                cell.classList.add('highlight');
            }
            cell.innerHTML = raw;
            rowEl.appendChild(cell);
        });
        table.appendChild(rowEl);
    });
}

// ------------ 4. Search & Add Logic ------------ //
function addPhoneByQuery(query) {
    if (!query) return;
    const q = query.trim().toLowerCase();
    const phone = allPhones.find(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    if (!phone) {
        alert('Phone not found. Try a different name or brand.');
        return;
    }
    if (selectedPhones.some(p => p.id === phone.id)) {
        alert('Phone already selected.');
        return;
    }
    if (selectedPhones.length >= maxPhones) {
        alert(`You can compare a maximum of ${maxPhones} phones.`);
        return;
    }
    selectedPhones.push(phone);
    renderSelectedChips();
    renderComparison();
    $('#compareSearchInput').value = '';
}

// ------------ 4. Search & Add Logic ------------ //
function addPhoneById(phoneId) {
    const phone = allPhones.find(p => p.id === phoneId);
    if (!phone) return;
    // Checks
    if (selectedPhones.some(p => p.id === phone.id)) {
        alert('Phone already selected.');
        return;
    }
    if (selectedPhones.length >= maxPhones) {
        alert(`You can compare a maximum of ${maxPhones} phones.`);
        return;
    }
    selectedPhones.push(phone);
    renderSelectedChips();
    renderComparison();
}

function openModal() {
    console.log('openModal called');
    const modal = $('#phoneModal');
    if (!modal) return;
    modal.style.display = 'flex';
    // Populate list
    const list = $('#phoneList');
    list.innerHTML = '';
    allPhones.forEach(phone => {
        const li = document.createElement('li');
        li.className = 'phone-item';
        li.dataset.id = phone.id;
        li.style.cursor = 'pointer';
        li.style.padding = '0.5rem';
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '0.75rem';
        li.innerHTML = `
            <img src="${phone.image}" alt="${phone.name}" style="width:40px;height:auto;border-radius:0.3rem;" onerror="this.style.display='none'" />
            <div>
                <strong>${phone.name}</strong><br/>
                <span>${phone.brand}</span>
            </div>`;
        li.addEventListener('click', () => {
            addPhoneById(phone.id);
            closeModal();
        });
        list.appendChild(li);
    });
    // Focus search input
    const modalSearch = $('#modalSearchInput');
    modalSearch.value = '';
    modalSearch.focus();
    modalSearch.addEventListener('input', filterPhoneList);
}

function closeModal() {
    const modal = $('#phoneModal');
    if (modal) modal.style.display = 'none';
}

function filterPhoneList() {
    const query = $('#modalSearchInput').value.trim().toLowerCase();
    const items = $$('#phoneList .phone-item');
    items.forEach(item => {
        const name = item.querySelector('strong').textContent.toLowerCase();
        const brand = item.querySelector('span').textContent.toLowerCase();
        const match = name.includes(query) || brand.includes(query);
        item.style.display = match ? 'flex' : 'none';
    });
}

function initComparePage() {
    $('#addPhoneBtn')?.addEventListener('click', openModal);
    $('#closeModalBtn')?.addEventListener('click', closeModal);
    renderComparison();
}

// Run after DOM ready
document.addEventListener('DOMContentLoaded', initComparePage);
