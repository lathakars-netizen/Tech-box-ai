/**
 * TECH BOX AI — Shared Language Persistence Module
 * Loaded on every page to apply the user's saved language preference.
 *
 * Reads `techbox_language` from localStorage (defaults to 'en').
 * Translates elements with [data-i18n] attributes.
 * Injects a compact language switcher into the navbar.
 * Sets <html lang> and applies language-specific font classes.
 */

(function () {
    'use strict';

    /* ======================================================================
       1. Translation Dictionary
       ====================================================================== */
    const translations = {
        en: {
            'nav.home':          'Home',
            'nav.mobiles':       'Mobiles',
            'nav.compare':       'Compare',
            'nav.sellPhone':     'Sell Phone',
            'nav.aiAssistant':   'AI Assistant',
            'nav.news':          'News',
            'nav.contact':       'Contact',
            'nav.themeMode':     'Theme Mode',
            'nav.switchTheme':   'Switch Theme',
        },
        hi: {
            'nav.home':          'होम',
            'nav.mobiles':       'मोबाइल',
            'nav.compare':       'तुलना',
            'nav.sellPhone':     'फ़ोन बेचें',
            'nav.aiAssistant':   'AI सहायक',
            'nav.news':          'समाचार',
            'nav.contact':       'संपर्क',
            'nav.themeMode':     'थीम मोड',
            'nav.switchTheme':   'थीम बदलें',
        },
        te: {
            'nav.home':          'హోమ్',
            'nav.mobiles':       'మొబైల్స్',
            'nav.compare':       'పోలిక',
            'nav.sellPhone':     'ఫోన్ అమ్మండి',
            'nav.aiAssistant':   'AI సహాయకుడు',
            'nav.news':          'వార్తలు',
            'nav.contact':       'సంప్రకింపు',
            'nav.themeMode':     'థీమ్ మోడ్',
            'nav.switchTheme':   'థీమ్ మార్చండి',
        }
    };

    /* ======================================================================
       2. Language metadata
       ====================================================================== */
    const langMeta = {
        en: { flag: '🇬🇧', code: 'EN', name: 'English' },
        hi: { flag: '🇮🇳', code: 'हि',  name: 'हिन्दी'  },
        te: { flag: '🇮🇳', code: 'తె',  name: 'తెలుగు'  }
    };

    /* ======================================================================
       3. Read persisted language
       ====================================================================== */
    function getCurrentLang() {
        const stored = localStorage.getItem('techbox_language');
        return (stored && translations[stored]) ? stored : 'en';
    }

    /* ======================================================================
       4. Translate helper — t(key)
       ====================================================================== */
    function t(key) {
        const lang = getCurrentLang();
        return (translations[lang] && translations[lang][key])
            ? translations[lang][key]
            : (translations.en[key] || key);
    }

    // Expose globally for page-specific scripts if needed
    window.techboxLang = {
        get: getCurrentLang,
        t: t,
        translations: translations,
        meta: langMeta
    };

    /* ======================================================================
       5. Apply language on DOMContentLoaded
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', function () {
        var lang = getCurrentLang();

        // 5a. Set <html lang>
        document.documentElement.lang = lang;

        // 5b. Apply font class on <body>
        document.body.classList.remove('lang-hi-active', 'lang-te-active');
        if (lang === 'hi') {
            document.body.classList.add('lang-hi-active');
        } else if (lang === 'te') {
            document.body.classList.add('lang-te-active');
        }

        // 5c. Translate all [data-i18n] elements
        var els = document.querySelectorAll('[data-i18n]');
        els.forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var translated = t(key);
            if (translated && translated !== key) {
                el.textContent = translated;
            }
        });

        // 5d. Inject language switcher into navbar
        injectLangSwitcher(lang);
    });

    /* ======================================================================
       6. Language Switcher Dropdown (injected into .nav-actions)
       ====================================================================== */
    function injectLangSwitcher(currentLang) {
        var navActions = document.querySelector('.nav-actions');
        if (!navActions) return; // Not a navbar page (e.g. index.html, welcome.html)

        // Don't inject twice
        if (document.getElementById('langSwitcherBtn')) return;

        var meta = langMeta[currentLang] || langMeta.en;

        // Create wrapper
        var wrapper = document.createElement('div');
        wrapper.className = 'lang-switcher-wrapper';

        // Trigger button
        var btn = document.createElement('button');
        btn.className = 'icon-btn lang-switcher-btn';
        btn.id = 'langSwitcherBtn';
        btn.setAttribute('aria-label', 'Change Language');
        btn.setAttribute('title', 'Language: ' + meta.name);
        btn.innerHTML = '<span class="lang-flag">' + meta.flag + '</span>' +
                        '<span class="lang-code">' + meta.code + '</span>';

        // Dropdown
        var dropdown = document.createElement('div');
        dropdown.className = 'lang-dropdown';
        dropdown.id = 'langDropdown';
        dropdown.setAttribute('aria-hidden', 'true');

        var langs = ['en', 'hi', 'te'];
        langs.forEach(function (code) {
            var m = langMeta[code];
            var item = document.createElement('button');
            item.className = 'lang-dropdown-item' + (code === currentLang ? ' active' : '');
            item.setAttribute('data-lang-switch', code);
            item.innerHTML = '<span class="lang-flag">' + m.flag + '</span>' +
                             '<span class="lang-item-name">' + m.name + '</span>' +
                             (code === currentLang ? '<i class="fa-solid fa-check lang-check"></i>' : '');
            dropdown.appendChild(item);
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);

        // Insert before the search button (first child of nav-actions)
        var firstChild = navActions.firstElementChild;
        if (firstChild) {
            navActions.insertBefore(wrapper, firstChild);
        } else {
            navActions.appendChild(wrapper);
        }

        // Toggle dropdown on click
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = dropdown.classList.toggle('is-open');
            dropdown.setAttribute('aria-hidden', String(!isOpen));
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) {
                dropdown.classList.remove('is-open');
                dropdown.setAttribute('aria-hidden', 'true');
            }
        });

        // Language switch handler
        dropdown.addEventListener('click', function (e) {
            var item = e.target.closest('[data-lang-switch]');
            if (!item) return;

            var newLang = item.getAttribute('data-lang-switch');
            if (newLang === currentLang) {
                dropdown.classList.remove('is-open');
                return;
            }

            // Save to localStorage (same keys as script.js)
            var m = langMeta[newLang];
            localStorage.setItem('techbox_language', newLang);
            localStorage.setItem('techbox_language_name', m.name);
            localStorage.setItem('techbox_lang_timestamp', new Date().toISOString());

            // Reload page to apply
            window.location.reload();
        });
    }

})();
