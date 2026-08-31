# TECH BOX AI — Smartphone Discovery & AI Recommendation Platform

Welcome to **TECH BOX AI**, a modern, cyber-themed smartphone discovery, comparison, trade-in valuation, and AI recommendation web application. TECH BOX AI delivers an immersive user experience with glassmorphism design, real-time data filtering, multi-language support, conversational AI recommendations, side-by-side spec comparison, and interactive service center discovery.

---

## 🚀 Key Architectural Highlights

* **Pure Client-Side Stack**: Built with standard web technologies (HTML5, CSS3, ES6+ JavaScript), requiring no complex build tools or server runtimes.
* **Single Source of Truth**: Centralized phone catalog (`data/phones.js`) powering search, recommendations, comparison matrix, sell valuation, and AI assistant context.
* **Defensive Data Validation**: Robust data sanitization (`sanitizePhoneData`) preventing UI crashes caused by missing parameters or broken objects.
* **Persistent Multi-Language System**: Dynamic internationalization (`lang.js`) supporting English, Hindi, and Telugu with local storage persistence across navigation.
* **Cyber UI/UX Engine**: Interactive particle canvas background, floating 3D parallax effects, neon glow badges, and responsive glassmorphism containers.

---

## 📊 Comprehensive Feature Matrix

| Feature Category | Implemented Feature | Status | Main Files Involved | Description & Key Capabilities | Known Limitations / Notes |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Localization & i18n** | **Language Selection Persistence** | `Completed` | [lang.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/lang.js)<br>[index.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/index.html)<br>[script.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/script.js) | Dynamic language selection gateway (`index.html`) saving choices (`en`, `hi`, `te`) to `localStorage`. Injects interactive navbar language switcher across all pages, updates `<html lang>`, applies language font classes (`lang-hi-active`, `lang-te-active`), and translates `[data-i18n]` tags. | Full page text translation relies on `data-i18n` dictionary keys; expanded dictionary keys required for full non-nav body prose. |
| **Data Integrity** | **Data Validation & Sanity Checks** | `Completed` | [data/phones.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/data/phones.js)<br>[contact.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/contact.js)<br>[sell-phone.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/sell-phone.js)<br>[search.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/search.js) | Centralized `sanitizePhoneData()` function validates phone objects, fills missing specs/images/ratings with default fallbacks, and prevents runtime rendering crashes. Strict form input regex validation in contact and sell forms, search input sanitization, and duplicate device checks in compare matrix. | Validation is client-side; no backend database schema enforcement needed for static mode. |
| **Support & Outlets** | **Service Centres Directory** | `Completed` | [contact.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/contact.html)<br>[contact.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/contact.js)<br>[contact.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/contact.css) | Brand service centre finder integrated into the Contact page. Features brand tab filtering (Samsung, Apple, Xiaomi, OnePlus, Vivo, Realme, Google), city/zip location search filter, operating hours, phone contacts, store addresses, and distance estimates. | Service centre locations operate on curated static dataset; live GPS geolocation and external map APIs can be bound in future phases. |
| **Support & Outlets** | **Contact Page Integration** | `Completed` | [contact.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/contact.html)<br>[contact.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/contact.js)<br>[contact.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/contact.css) | All-in-one support hub containing an interactive inquiry form with real-time error messages, Service Centres directory tab, interactive FAQ accordion, emergency support hotlines, business hours widget, and social channels. | Form submission displays client-side success feedback toast without persisting messages to a database. |
| **AI Experience** | **AI Tech Assistant** | `Completed` | [ai-assistant.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/ai-assistant.html)<br>[ai-assistant.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/ai-assistant.js)<br>[ai-assistant.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/ai-assistant.css) | Interactive AI chat companion providing smartphone buying advice, spec comparisons, camera/battery breakdowns, and budget recommendations. Features quick prompt suggestion chips, typing indicator animations, multi-turn history, and dynamic phone card embedding. | Operates on client-side pattern matching and structured phone data lookup (`data/phones.js`) ensuring sub-millisecond responses without backend API keys. |
| **Content & Updates** | **Mobile News Portal** | `Completed` | [news.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/news.html)<br>[news.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/news.js)<br>[style.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/style.css) | Dedicated news hub featuring category filtering tabs (All, Launches, Leaks, Reviews, AI Tech, Software Updates), search filter, reading time badges, and clean empty-state feedback. | Currently renders structured empty-state placeholders until connected to a live external news API or RSS feed. |
| **Catalog & Trends** | **Trending & Upcoming Mobiles** | `Completed` | [home.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/home.html)<br>[home.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/home.js)<br>[mobiles.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/mobiles.html)<br>[mobiles.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/mobiles.js) | High-visibility carousel/grid showcasing top trending flagship devices with glow tags, spec pills, ratings, and instant compare triggers. Dedicated Upcoming Mobiles section featuring launch dates, expected specs, countdown timers, and notification alerts. | Launch dates and upcoming device specifications are based on catalog entries in `data/phones.js`. |
| **Comparison Tools** | **Side-by-Side Phone Compare** | `Completed` | [compare.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/compare.html)<br>[compare.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/compare.js)<br>[compare.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/compare.css) | Multi-device comparison matrix supporting up to 3 smartphones simultaneously. Detailed category breakdown (Processor, Camera, Battery, Display, RAM/Storage, Build/OS), automatic winner row highlighting, calculated score summary, difference toggle, and URL sharing (`?ids=s25-ultra,iphone-16-pro-max`). | Max comparison capacity capped at 3 slots for optimal mobile and desktop visual density. |
| **Trade-In & Sell** | **Sell Phone (Trade-In Valuation)** | `Completed` | [sell-phone.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/sell-phone.html)<br>[sell-phone.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/sell-phone.js)<br>[sell-phone.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/sell-phone.css) | Instant phone valuation calculator. Step-by-step diagnostic questionnaire (Brand/Model selection, Storage capacity, Screen condition, Body cosmetic condition, Functional checks, Original accessories). Calculates instant cash offer with visual price breakdown and booking modal. | Offer quotes are generated client-side based on base phone MSRP and condition factor algorithms. |
| **Navigation & Shell** | **Global Navigation & UI Shell** | `Completed` | [script.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/script.js)<br>[search.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/search.js)<br>[style.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/style.css) | Cyber glassmorphism sticky navigation bar across all main pages. Includes active tab highlighting, global quick search modal (`search.js`), theme toggle (dark/cyber mode), mobile drawer menu, persistent language dropdown (`lang.js`), and global footer. | Landing page (`index.html`) intentionally acts as a standalone language gateway screen before entering the main navbar shell. |
| **Product Discovery** | **Smartphone Details View** | `Completed` | [details.html](file:///c:/Users/latha/OneDrive/Mobile_Verse/details.html)<br>[details.js](file:///c:/Users/latha/OneDrive/Mobile_Verse/details.js)<br>[details.css](file:///c:/Users/latha/OneDrive/Mobile_Verse/details.css) | Full specification showcase for individual phones. Displays high-res imagery, interactive spec accordion/tabs, price comparison, rating summary, user reviews mock, key highlight tags, and direct trade-in / compare buttons. | Phone specs loaded dynamically based on URL parameter `?id=<phone_id>`. |

---

## 📁 Directory Structure & File Map

```text
Mobile_Verse/
├── assets/                    # Image assets, SVG mockups, phone renders, brand logos
├── data/
│   └── phones.js              # Centralized phone catalog & sanitizePhoneData() validator
├── index.html                 # Language selection gateway page
├── script.js                  # Gateway animations, particle canvas, language chooser logic
├── style.css                  # Global cyber CSS theme, reset, navbar, footer, responsive grid
├── lang.js                    # Shared language persistence & dropdown injection module
├── home.html                  # Main Dashboard / Home page
├── home.js                    # Home controller (Trending carousel, Hero section, Search)
├── home.css                   # Home page cyber styling & animations
├── mobiles.html               # Full Smartphone Catalog page
├── mobiles.js                 # Catalog filter, category sorting, search & pagination logic
├── mobiles.css                # Catalog grid & filter styles
├── compare.html               # Side-by-Side Comparison page
├── compare.js                 # 3-way compare matrix, winner highlight, URL params engine
├── compare.css                # Matrix layout, spec rows, highlight cards
├── sell-phone.html            # Trade-in & Valuation page
├── sell-phone.js              # Diagnostic questionnaire & valuation pricing algorithm
├── sell-phone.css             # Step wizard, condition selector & price quote breakdown
├── ai-assistant.html          # AI Tech Companion page
├── ai-assistant.js            # Chat UI controller, query matcher & card generator
├── ai-assistant.css           # Chat bubble design, typing animations & suggestion chips
├── news.html                  # Tech News & Updates page
├── news.js                    # News renderer, category tabs & empty state handling
├── contact.html               # Contact, FAQ & Service Centres hub
├── contact.js                 # Form validation, Service Centre directory filter, FAQ accordion
├── contact.css                # Contact form styles, store cards, accordion CSS
├── details.html               # Single Smartphone Specs Details view
├── details.js                 # Dynamic phone detail loader & spec view controller
├── details.css                # Specs breakdown design & image gallery
├── search.js                  # Global live search overlay controller
├── search.css                 # Search modal & result card styling
├── welcome.html               # Welcome onboarding screen
├── welcome.js                 # Onboarding interactions & theme initialization
└── welcome.css                # Onboarding styles
```

---

## ⚙️ How to Run

1. **Direct Browser Execution**:
   Simply open `index.html` in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

2. **Local Web Server (Recommended)**:
   For optimal asset loading and URL parameter handling:
   * **VS Code Live Server**: Right-click `index.html` and select **Open with Live Server**.
   * **Node.js `serve`**: Run `npx serve .` in the project root directory.
   * **Python HTTP Server**: Run `python -m http.server 8000` in the project root directory and navigate to `http://localhost:8000`.

---

## 🛡️ Maintainability & Best Practices

* **No Build Step Required**: Direct static deployment ready for GitHub Pages, Vercel, Netlify, or AWS S3.
* **Clean Code Separation**: Each page maintains modular HTML, CSS, and JS files to keep concern separation clean and maintainable.
* **Extensible i18n**: Additional language keys or fallback languages can be added directly into `translations` object inside `lang.js`.
* **Centralized Data Model**: To update smartphone catalog data, modify `data/phones.js`. The `sanitizePhoneData()` validator automatically formats and protects new records across all UI modules.
