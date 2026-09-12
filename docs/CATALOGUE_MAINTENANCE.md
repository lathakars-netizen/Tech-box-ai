# TECH BOX AI — Indian Smartphone Catalogue Maintenance Guide

## Overview
This document provides complete instructions for maintaining, updating, and extending the offline Indian smartphone database for **TECH BOX AI**.

TECH BOX AI operates with a **zero-dependency, offline-first architecture**. It does not rely on paid or live external APIs, ensuring rapid page loads, 100% uptime, deterministic search ranking, and reliable performance across desktop and mobile devices.

---

## 1. Single Source of Truth

The entire website reads from one unified file:
- **File Path**: `data/phones.js`
- **Global Object**: `window.phonesData`
- **Node.js Export**: `module.exports = { phonesData, sanitizePhoneData }`

Every component in the application consumes this file:
- **Home Search & Trending**: `home.js`
- **Global Search Modal (Ctrl+K)**: `search.js`
- **Mobiles Grid & Filters**: `mobiles.js`
- **Side-by-Side Comparison**: `compare.js`
- **AI Recommendation Engine**: `ai-assistant.js`
- **Phone Details & Tech Sheet**: `details.js`
- **Sell Phone Valuation**: `sell-phone.js`
- **Brand Experience Stores**: `contact.js`

---

## 2. Phone Record Schema

Each smartphone in `data/phones.js` follows this structured schema:

```javascript
{
    // Unique kebab-case identifier (used in URL queries: ?id=s25-ultra)
    id: "s25-ultra",

    // Official retail name in the Indian market
    name: "Galaxy S25 Ultra",

    // Brand name (must match across filters and AI assistant)
    brand: "Samsung",
    brandIcon: "fa-solid fa-mobile-retro",
    brandClass: "brand-samsung",

    // Indian Pricing (Starting variant)
    price: "₹1,29,999",
    priceNumericINR: 129999,
    priceNote: "Starting from ₹1,29,999 (256GB)",

    // Verified Variant & Verification Date
    storageVariant: "12GB + 256GB Base Variant",
    priceCheckDate: "2026-09",

    // Availability status: 'available' | 'officially listed' | 'discontinued'
    availability: "available",

    // Rating and Social Proof
    rating: 4.9,
    ratingCount: "(1.4k)",

    // Visual Asset & Fallback
    image: "assets/s25_ultra.jpg",
    fallbackName: "S25 ULTRA",
    highlightTag: { text: "200MP OPTIC", icon: "fa-solid fa-wand-magic-sparkles", colorClass: "cyan" },
    glowClass: "purple",

    // Category Tags (multi-tag space-separated string)
    category: "flagship camera 5g ai",

    // Quick Spec Pills (3 items displayed on cards and hero badges)
    specs: [
        { icon: "fa-solid fa-microchip", text: "Snapdragon 8 Elite" },
        { icon: "fa-solid fa-camera", text: "200MP Quad AI" },
        { icon: "fa-solid fa-battery-full", text: "5000 mAh" }
    ],

    // Comprehensive Tech Sheet
    processor: "Qualcomm Snapdragon 8 Elite for Galaxy",
    processorSub: "3nm Oryon CPU (up to 4.47 GHz), Galaxy AI Engine",
    camera: "200MP Wide + 50MP Periscope (5x) + 10MP Tele (3x) + 50MP Ultra Wide",
    cameraSub: "100x Space Zoom, Dual Telephoto OIS, 8K Video @ 30fps",
    battery: "5000 mAh",
    batterySub: "45W wired (65% in 30 mins) • 15W wireless",
    charging: "45W",
    chargingSub: "0-65% in 30 mins",
    display: "6.86″ Dynamic LTPO AMOLED 2X, 120Hz",
    displaySub: "2600 nits peak, 1440 x 3120 pixels, Gorilla Armor 2",
    ram: "12 GB",
    ramSub: "LPDDR5X high-speed RAM",
    storage: "256 GB / 512 GB / 1 TB",
    storageSub: "UFS 4.0 ultra-fast flash storage",
    connectivity: "5G + Wi-Fi 7 (802.11be)",
    connectivitySub: "Bluetooth 5.4, NFC, Ultra Wideband (UWB), USB-C 3.2",
    build: "Grade 5 Titanium frame + Gorilla Armor 2 + S-Pen",
    buildSub: "IP68 (1.5m / 30 min) water resistance",
    os: "Android 15 — One UI 7",
    osSub: "7 generations of OS upgrades & 7 years of security updates",

    // Source Citations
    sourceSpecsUrl: "https://www.gsmarena.com/samsung_galaxy_s25_ultra-13324.php",
    sourcePriceUrl: "https://www.91mobiles.com/samsung-galaxy-s25-ultra-price-in-india",
    imageLicense: "Official Samsung India press asset / verified reference",

    // Search Aliases (lowercase, with and without spaces/hyphens)
    aliases: [
        "samsung", "galaxy", "s25", "s25 ultra", "s25u",
        "galaxy s25 ultra", "samsung galaxy s25 ultra", "s25ultra"
    ]
}
```

---

## 3. How to Add a Newly Launched Phone

When an OEM launches a new smartphone in India, follow these steps:

1. **Verify Official Indian Launch**:
   - Check official OEM Indian Store (e.g., samsung.com/in, apple.com/in, mi.com/in, realme.com/in, vivo.com/in, etc.), Amazon India, or Flipkart.
   - Confirm official starting MRP/MOP in INR (`₹XX,XXX`) and base variant configuration (e.g. `8GB + 128GB`).
   - Cross-check technical specifications on [GSM Arena](https://www.gsmarena.com) and [91mobiles](https://www.91mobiles.com).

2. **Generate a Unique ID**:
   - Must be all lowercase, hyphen-separated: `[brand]-[series]-[model]`.
   - Examples: `oppo-k13-5g`, `iqoo-neo-10`, `pixel-9a`.

3. **Populate Search Aliases**:
   Search aliases MUST include:
   - Full name with spaces: `"oppo k13 5g"`
   - Compact spaceless string: `"oppok135g"`, `"oppok13"`
   - Shorthand / series abbreviations: `"k13"`, `"k13 5g"`
   - Model name without brand: `"k13 5g"`
   - Common misspellings or legacy identifiers: `"oppo k 13"`

4. **Append to `data/phones.js`**:
   - Add the new object to the `phonesData` array in `data/phones.js`.
   - Ensure the trailing comma is placed properly.

5. **Run Verification Suite**:
   ```bash
   node test_catalogue.js
   ```
   Confirm all test cases pass with zero validation errors.

---

## 4. How to Update Prices & Availability

Smartphone prices fluctuate during festival sales (Big Billion Days, Great Indian Festival) or official price drops.

1. Locate the phone record in `data/phones.js` by its `id`.
2. Update:
   - `price`: E.g., `"₹16,999"`
   - `priceNumericINR`: `16999`
   - `priceNote`: `"Starting from ₹16,999 (128GB)"`
   - `priceCheckDate`: Current year-month (e.g., `"2026-10"`)
3. Update `availability`:
   - `"available"`: Currently available in Indian retail or online channels.
   - `"officially listed"`: Announced officially in India, pre-order open, or launching shortly.
   - `"discontinued"`: Officially phased out by OEM; retained in database for comparison and sell-phone trade-in valuation.

---

## 5. Search Normalization Rules

The search system uses deterministic normalization:
```javascript
const normQ = query.toLowerCase().replace(/[^a-z0-9]/g, '');
```

Every phone record MUST include both spaced and spaceless alias variants:
| User Search Query | Target Record | Matched Alias |
|---|---|---|
| `OPPO K13 5G` | OPPO K13 5G | `"oppo k13 5g"` |
| `oppo k13` | OPPO K13 5G | `"oppo k13"` |
| `oppok135g` | OPPO K13 5G | `"oppok135g"` |
| `iQOO Neo 10` | iQOO Neo 10 | `"iqoo neo 10"` |
| `iqooneo10` | iQOO Neo 10 | `"iqooneo10"` |
| `S25 Ultra` | Galaxy S25 Ultra | `"s25 ultra"` |
| `s25ultra` | Galaxy S25 Ultra | `"s25ultra"` |
| `Nothing 2` | Nothing Phone (2) | `"nothing 2"`, `"phone 2"` |
| `16promax` | iPhone 16 Pro Max | `"16promax"` |
| `edge50fusion` | Motorola Edge 50 Fusion | `"edge50fusion"` |

---

## 6. Verification & Exclusion Policy

### Inclusion Criteria
A phone is included in this catalogue ONLY IF:
1. It has officially released in India or has an official Indian OEM listing.
2. It supports Indian 5G bands (N28, N78, etc.) and Indian VoLTE/VoNR networks.
3. Indian pricing in ₹ is documented on official OEM stores, Flipkart, Amazon India, or 91mobiles/Smartprix.

### Excluded Models Report & Justification
The following models were reviewed and excluded to maintain data integrity:

| Brand & Model | Exclusion Rationale |
|---|---|
| **Xiaomi 15 Pro** | China-exclusive release. In India, Xiaomi officially brought the standard **Xiaomi 15** and **Xiaomi 15 Ultra**. |
| **vivo X100s / X100s Pro** | China domestic market refresh only; Indian market proceeded with **vivo X100 / X100 Pro** and **vivo X200 / X200 Pro**. |
| **OnePlus Ace 3 / Ace 5** | China domestic naming scheme; these devices were officially launched in India under the **OnePlus 12R** and **OnePlus 13R** names, which are included in the catalogue. |
| **Honor Magic 6 Ultimate / RSR** | Luxury domestic editions never officially imported or distributed by HTech in India; **Honor 200** and **Honor 200 Pro** are included. |
| **realme Neo 7** | China domestic branding; India received the **realme GT 7 Pro** and **realme P-series**, which are fully included. |
| **Samsung Galaxy W25 / W25 Flip** | China-exclusive luxury ceramic foldables; India receives the **Galaxy Z Fold6** and **Galaxy Z Flip6**, which are fully included. |
| **POCO F6 Pro Global Edition** | Xiaomi India officially launched the **POCO F6** (Snapdragon 8s Gen 3) and **POCO X6 Pro** in India. The F6 Pro was not given an official BIS launch in India. |
| **Google Pixel 5a / 6a (Legacy)** | Discontinued legacy devices; replaced by official Indian models **Pixel 8a, 8, 8 Pro, 9, 9 Pro, 9 Pro XL, 9 Pro Fold**. |

---

## 7. Automated Test Verification

To verify catalogue integrity at any time, run:
```bash
node test_catalogue.js
```
This tests:
- Total phone count and brand breakdown
- Zero duplicate IDs across all records
- All mandatory attributes populated
- Over 50 search queries (exact names, spaceless aliases, typos, token combinations, spec queries)
- Price filter brackets
- Sorting algorithms
