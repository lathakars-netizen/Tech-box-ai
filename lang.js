/**
 * TECH BOX AI — Shared Language Persistence Module
 * Loaded on every page to apply the user's saved language preference.
 *
 * Reads `techbox_language` from localStorage (defaults to 'en').
 * Translates elements with [data-i18n], [data-i18n-ph], [data-i18n-title], [data-i18n-html] attributes.
 * Injects a compact language switcher into the navbar.
 * Sets <html lang> and applies language-specific font classes.
 */

(function () {
    'use strict';

    /* ======================================================================
       1. Comprehensive Global Translation Dictionary
       ====================================================================== */
    const translations = {
        en: {
            // Navigation & Drawer
            'nav.home':          'Home',
            'nav.mobiles':       'Mobiles',
            'nav.compare':       'Compare',
            'nav.sellPhone':     'Sell Phone',
            'nav.aiAssistant':   'AI Assistant',
            'nav.news':          'News',
            'nav.contact':       'Contact',
            'nav.themeMode':     'Theme Mode',
            'nav.switchTheme':   'Switch Theme',
            'nav.searchTitle':   'Search (Ctrl + K)',
            'nav.toggleTheme':   'Toggle Theme',
            'nav.toggleMenu':    'Toggle Mobile Menu',
            'nav.closeMenu':     'Close menu',

            // Gateway Screen
            'gateway.title':     'Choose Your Language',
            'gateway.subtitle':  'Select your preferred language to customize your AI experience',
            'gateway.enSub':     'Default System Language',
            'gateway.hiSub':     'Experience in Hindi',
            'gateway.teSub':     'Experience in Telugu',
            'gateway.status':    'AI Engine Online • v3.8',

            // Hero Section
            'hero.badge':        'TECH BOX AI NEURAL ENGINE 3.0',
            'hero.line1':        'REVOLUTIONIZE YOUR',
            'hero.line2':        'MOBILE EXPERIENCE',
            'hero.line3':        'WITH AI INTELLIGENCE',
            'hero.subtitle':     'Discover flagship smartphones, evaluate real-world camera capabilities, benchmark neural processing power, and compare devices side-by-side with instant AI precision.',
            'hero.searchPh':     'Search phones e.g. "Best camera phone under $900"...',
            'hero.searchBtn':    'Search',
            'hero.popularTags':  'Popular:',
            'hero.exploreBtn':   'Explore Mobiles',
            'hero.compareBtn':   'Compare Phones',

            // Micro Metrics
            'metrics.devices':   'Devices Cataloged',
            'metrics.precision': 'Neural Precision',
            'metrics.unbiased':  'Unbiased Insights',

            // Card Common Actions & Labels
            'card.verified':     'Verified',
            'card.startingAt':   'Starting at',
            'card.details':      'Details',
            'card.compare':      'Compare',
            'card.addToCompare': 'Add to Compare',
            'card.addToFav':     'Add to Favorites',

            // Section Headers & Titles
            'section.trendingBadge':    'NEURAL RANKED FLAGSHIPS',
            'section.trendingTitle':    'Trending',
            'section.trendingAccent':   'Mobiles',
            'section.trendingSubtitle': 'Explore top-rated smartphones benchmarked by AI performance, camera optics, and battery endurance.',
            'section.viewAll':          'View All',
            'upcoming.badge':           'FUTURE RELEASES',
            'upcoming.title':           'Upcoming',
            'upcoming.accent':          'Mobiles',
            'upcoming.subtitle':        'A preview of highly anticipated devices (Release dates not available in current data).',
            'upcoming.emptyTitle':      'Upcoming Mobiles',
            'upcoming.emptyMsg':        'New launches will appear here when verified release information is available.',

            // Filter Tabs & Dropdowns
            'filter.all':           'All Mobiles',
            'filter.flagship':      'Flagship AI',
            'filter.camera':        'Camera Beasts',
            'filter.gaming':        'Gaming Beasts',
            'filter.value':         'Value Killers',
            'filter.brandLabel':    'Brand:',
            'filter.priceLabel':    'Price:',
            'filter.sortLabel':     'Sort by:',
            'filter.priceAll':      'All',
            'filter.priceUnder500':  'Under $500',
            'filter.price500to900': '$500 – $900',
            'filter.price900to1300':'$900 – $1300',
            'filter.priceAbove1300':'Above $1300',
            'sort.priceAsc':        'Price – Low to High',
            'sort.priceDesc':       'Price – High to Low',
            'sort.ratingDesc':      'Rating – High to Low',
            'sort.newest':          'Newest',

            // Quick Search & Search Modal
            'search.badge':          'SEARCH RESULTS',
            'search.resultsFor':     'Results for',
            'search.foundMatches':   'Found {count} phones matching your search',
            'search.close':          'Close',
            'search.noResultsTitle': 'No phones found',
            'search.noResultsMsg':   'No results for {query}. Try searching by brand, model, processor, or camera specs.',
            'search.try':            'Try:',
            'search.modalPlaceholder':'Search phone name, brand, processor, camera, RAM, battery or price...',
            'search.escClose':       'Close',
            'search.navigate':       'Navigate',
            'search.select':         'Select',
            'search.clearSearch':    'Clear search',
            'search.closeModal':     'Close search modal',

            // Mobiles Page
            'mobiles.title':       'Explore Mobiles',
            'mobiles.subtitle':    'Search, filter, sort and compare the latest flagship and value smartphones powered by AI.',
            'mobiles.searchPh':    'Search phones...',

            // Compare Page
            'compare.matrixBadge':   'DEVICE MATRIX',
            'compare.title':         'Compare',
            'compare.titleAccent':   'Smartphones',
            'compare.subtitle':      'Select up to 3 devices to evaluate specifications side-by-side with AI-driven spec highlighting.',
            'compare.addBtn':        'Add Device',
            'compare.clearAll':      'Clear All',
            'compare.selectedCount': '{count} of 3 Selected',
            'compare.selectPhone':   'Select Smartphone',
            'compare.modalSearchPh': 'Search phone name or brand…',
            'compare.emptySlot':     'Empty Slot',
            'compare.clickToAdd':    'Click Add Device to compare',
            'compare.rowBrand':      'Brand',
            'compare.rowModel':      'Model',
            'compare.rowPrice':      'Price',
            'compare.rowRating':     'Rating',
            'compare.rowProcessor':  'Processor',
            'compare.rowCamera':     'Camera',
            'compare.rowRamStorage': 'RAM / Storage',
            'compare.rowBattery':    'Battery & Charging',
            'compare.rowDisplay':    'Display',
            'compare.rowOS':         'Operating System',
            'compare.rowHighlight':  'Highlight Feature',
            'compare.rowScore':      'AI Score',
            'compare.winner':        'Winner',
            'compare.remove':        'Remove',
            'compare.emptyState':    'Select up to 3 devices to evaluate specifications side-by-side.',
            'compare.emptyTitle':    'No Devices Selected',
            'compare.emptyMsg':      'Click the + Add Device button above to start comparing specs side-by-side.',
            'compare.addDevice':     '+ Add Device',
            'compare.selectSmartphones': 'Select Smartphones',

            // Details Page
            'details.loader':        'Loading device data…',
            'details.notFoundTitle': 'Device Not Found',
            'details.notFoundMsg':   'The phone you\'re looking for doesn\'t exist in our database.',
            'details.backToMobiles': 'Back to Mobiles',
            'details.back':          'Back',
            'details.bcHome':        'Home',
            'details.bcMobiles':     'Mobiles',
            'details.bcDevice':      'Device',
            'details.verifiedSpecs': 'Verified Specs',
            'details.startingAt':    'Starting at',
            'details.buyNow':        'Buy Now',
            'details.fullSpecsBadge':'FULL SPECIFICATIONS',
            'details.fullSpecsTitle':'Complete',
            'details.fullSpecsAccent':'Tech Sheet',
            'details.verifiedBanner':'Verified Dataset Specifications — Sourced directly from official TECH BOX AI catalog dataset',
            'details.secGeneral':    'General Information',
            'details.secPerformance':'Performance & Hardware',
            'details.secCamera':     'Camera System',
            'details.secBattery':    'Battery & Power',
            'details.secDisplay':    'Display & Design',
            'details.secOS':         'Operating System & AI',

            // AI Assistant Page
            'ai.title':        'TECH BOX AI',
            'ai.subtitle':     'Your Neural Mobile Advisor',
            'ai.welcomeMsg':   'Hello! I\'m the TECH BOX AI Assistant. I can help you find the perfect smartphone, compare specs, or answer questions about our devices based on our neural database.',
            'ai.tryAsking':    'Try asking me:',
            'ai.chip1':        'Best phone under $1,000',
            'ai.chip2':        'Best camera phone',
            'ai.chip3':        'Best gaming phone',
            'ai.chip4':        'Compare Samsung and OnePlus',
            'ai.inputPh':      'Ask about phones, specs, or comparisons...',
            'ai.disclaimer':   'AI recommendations are based exclusively on TECH BOX AI\'s secure device catalog.',

            // News Feed Page
            'news.badge':       'LIVE FEED',
            'news.title':       'Tech',
            'news.accent':      'News',
            'news.subtitle':    'Stay up-to-date with the latest tech advancements and mobile industry news.',
            'news.all':         'All News',
            'news.smartphones': 'Smartphones',
            'news.launches':    'Launches',
            'news.technology':  'Technology',
            'news.ai':          'AI',
            'news.reviews':     'Reviews',
            'news.readArticle': 'Read Article',

            // Sell Phone Page
            'sell.badge':           'AI TRADE-IN',
            'sell.title':           'Sell Your',
            'sell.accent':          'Phone',
            'sell.subtitle':        'Get an instant estimated value based on your device\'s condition and our market data.',
            'sell.detailsHeading':  'Device Details',
            'sell.brandLabel':      'Brand',
            'sell.selectBrand':     'Select Brand',
            'sell.modelLabel':      'Model',
            'sell.selectModel':     'Select Model',
            'sell.conditionLabel':  'Condition',
            'sell.condLikeNew':     'Like New',
            'sell.condLikeNewDesc': 'Flawless, no scratches',
            'sell.condExcellent':   'Excellent',
            'sell.condExcellentDesc':'Minor micro-scratches',
            'sell.condGood':        'Good',
            'sell.condGoodDesc':    'Visible wear & tear',
            'sell.condFair':        'Fair',
            'sell.condFairDesc':    'Heavy wear, intact',
            'sell.accLabel':        'Accessories & Status',
            'sell.chkCharger':      'I have the original charger',
            'sell.chkBox':          'I have the original box',
            'sell.chkDamage':       'The device has screen/body damage or needs repair',
            'sell.emptyState':      'Select your device brand and model to see your estimated resale value.',
            'sell.estimateLabel':   'Estimated Resale Value',
            'sell.estimateNote':    'Based on your condition selection. Final offer may vary.',
            'sell.summaryCondition':'Condition:',
            'sell.summaryAccessories':'Accessories:',
            'sell.summaryDamage':   'Major Damage:',
            'sell.getStarted':      'Get Started',
            'sell.yes':             'Yes',
            'sell.no':              'No',
            'sell.errBrand':        'Please select a brand.',
            'sell.errModel':        'Please select a model.',

            // Contact Page
            'contact.badge':       'GET IN TOUCH & DIRECTORY',
            'contact.title':       'Connect with',
            'contact.accent':      'TECH BOX AI',
            'contact.subtitle':    'Have questions, feedback, or need assistance? Reach out to our team, view head office details, or explore our brand store and service centre directory.',
            'contact.formHeading': 'Send Us a Message',
            'contact.formSubtext': 'Fill out the details below and we will get back to you as soon as possible.',
            'contact.fullName':    'Full Name *',
            'contact.fullNamePh':  'e.g. Alex Mercer',
            'contact.emailAddress':'Email Address *',
            'contact.emailAddressPh':'e.g. alex@example.com',
            'contact.phone':       'Phone Number',
            'contact.phoneOptional':'(Optional)',
            'contact.phonePh':     'e.g. +1 (555) 019-2834',
            'contact.subject':     'Subject *',
            'contact.selectSubject':'Select a subject',
            'contact.subjGeneral': 'General Inquiry',
            'contact.subjData':    'Device Data / Spec Feedback',
            'contact.subjAI':      'AI Assistant Question',
            'contact.subjTradeIn': 'Trade-In / Sell Phone Support',
            'contact.subjPartner': 'Partnership / Collaboration',
            'contact.message':     'Message *',
            'contact.messagePh':   'How can we help you?',
            'contact.sendBtn':     'Send Message',
            'contact.errName':     'Please enter your name.',
            'contact.errEmail':    'Please enter a valid email address.',
            'contact.errSubject':  'Please select a subject.',
            'contact.errMessage':  'Please enter a message.',
        },
        hi: {
            // Navigation & Drawer
            'nav.home':          'होम',
            'nav.mobiles':       'मोबाइल',
            'nav.compare':       'तुलना',
            'nav.sellPhone':     'फ़ोन बेचें',
            'nav.aiAssistant':   'AI सहायक',
            'nav.news':          'समाचार',
            'nav.contact':       'संपर्क',
            'nav.themeMode':     'थीम मोड',
            'nav.switchTheme':   'थीम बदलें',
            'nav.searchTitle':   'खोजें (Ctrl + K)',
            'nav.toggleTheme':   'डार्क/लाइट मोड बदलें',
            'nav.toggleMenu':    'मोबाइल मेनू खोलें/बंद करें',
            'nav.closeMenu':     'मेनू बंद करें',

            // Gateway Screen
            'gateway.title':     'अपनी भाषा चुनें',
            'gateway.subtitle':  'अपने AI अनुभव को कस्टमाइज़ करने के लिए अपनी पसंदीदा भाषा चुनें',
            'gateway.enSub':     'डिफ़ॉल्ट सिस्टम भाषा',
            'gateway.hiSub':     'हिंदी में अनुभव करें',
            'gateway.teSub':     'तेलुगु में अनुभव करें',
            'gateway.status':    'AI इंजन ऑनलाइन • v3.8',

            // Hero Section
            'hero.badge':        'TECH BOX AI न्यूरल इंजन 3.0',
            'hero.line1':        'अपने मोबाइल अनुभव को',
            'hero.line2':        'AI बुद्धिमत्ता के साथ',
            'hero.line3':        'क्रांतिकारी बनाएं',
            'hero.subtitle':     'फ्लैगशिप स्मार्टफोन्स खोजें, वास्तविक कैमरा क्षमताओं का मूल्यांकन करें, न्यूरल प्रोसेसिंग पावर का परीक्षण करें, और तुरंत AI सटीकता के साथ उपकरणों की तुलना करें।',
            'hero.searchPh':     'फ़ोन खोजें जैसे "₹75,000 से कम में सर्वश्रेष्ठ कैमरा फ़ोन"...',
            'hero.searchBtn':    'खोजें',
            'hero.popularTags':  'लोकप्रिय:',
            'hero.exploreBtn':   'मोबाइल खोजें',
            'hero.compareBtn':   'फ़ोनों की तुलना करें',

            // Micro Metrics
            'metrics.devices':   'कैटलॉग किए गए उपकरण',
            'metrics.precision': 'न्यूरल सटीकता',
            'metrics.unbiased':  'निष्पक्ष विश्लेषण',

            // Card Common Actions & Labels
            'card.verified':     'सत्यापित',
            'card.startingAt':   'शुरुआती कीमत',
            'card.details':      'विवरण',
            'card.compare':      'तुलना करें',
            'card.addToCompare': 'तुलना में जोड़ें',
            'card.addToFav':     'पसंदीदा में जोड़ें',

            // Section Headers & Titles
            'section.trendingBadge':    'न्यूरल रैंक किए गए फ्लैगशिप',
            'section.trendingTitle':    'ट्रेंडिंग',
            'section.trendingAccent':   'मोबाइल',
            'section.trendingSubtitle': 'AI प्रदर्शन, कैमरा ऑप्टिक्स और बैटरी क्षमता द्वारा जांचे गए शीर्ष स्मार्टफोन्स खोजें।',
            'section.viewAll':          'सभी देखें',
            'upcoming.badge':           'आगामी रिलीज़',
            'upcoming.title':           'आगामी',
            'upcoming.accent':          'मोबाइल',
            'upcoming.subtitle':        'अत्यधिक प्रतीक्षित उपकरणों की एक झलक (वर्तमान डेटा में रिलीज़ की तारीखें उपलब्ध नहीं हैं)।',
            'upcoming.emptyTitle':      'आगामी मोबाइल',
            'upcoming.emptyMsg':        'सत्यापित रिलीज़ जानकारी उपलब्ध होने पर नए लॉन्च यहां दिखाई देंगे।',

            // Filter Tabs & Dropdowns
            'filter.all':           'सभी मोबाइल',
            'filter.flagship':      'फ्लैगशिप AI',
            'filter.camera':        'सर्वश्रेष्ठ कैमरा',
            'filter.gaming':        'गेमिंग बीस्ट्स',
            'filter.value':         'वैल्यू किलर्स',
            'filter.brandLabel':    'ब्रांड:',
            'filter.priceLabel':    'कीमत:',
            'filter.sortLabel':     'क्रमबद्ध करें:',
            'filter.priceAll':      'सभी',
            'filter.priceUnder500':  '$500 से कम',
            'filter.price500to900': '$500 – $900',
            'filter.price900to1300':'$900 – $1300',
            'filter.priceAbove1300':'$1300 से अधिक',
            'sort.priceAsc':        'कीमत – कम से ज्यादा',
            'sort.priceDesc':       'कीमत – ज्यादा से कम',
            'sort.ratingDesc':      'रेटिंग – ज्यादा से कम',
            'sort.newest':          'नवीनतम',

            // Quick Search & Search Modal
            'search.badge':          'खोज परिणाम',
            'search.resultsFor':     'परिणाम:',
            'search.foundMatches':   'आपकी खोज से मेल खाते {count} फ़ोन मिले',
            'search.close':          'बंद करें',
            'search.noResultsTitle': 'कोई फ़ोन नहीं मिला',
            'search.noResultsMsg':   '{query} के लिए कोई परिणाम नहीं। ब्रांड, मॉडल, प्रोसेसर या कैमरा स्पेक्स द्वारा खोजने का प्रयास करें।',
            'search.try':            'प्रयास करें:',
            'search.modalPlaceholder':'फ़ोन का नाम, ब्रांड, प्रोसेसर, कैमरा, रैम, बैटरी या कीमत खोजें...',
            'search.escClose':       'बंद करें',
            'search.navigate':       'नेविगेट करें',
            'search.select':         'चुनें',
            'search.clearSearch':    'खोज साफ़ करें',
            'search.closeModal':     'खोज मोडल बंद करें',

            // Mobiles Page
            'mobiles.title':       'मोबाइल खोजें',
            'mobiles.subtitle':    'AI द्वारा संचालित नवीनतम फ्लैगशिप और वैल्यू स्मार्टफोन्स को खोजें, फ़िल्टर करें, क्रमबद्ध करें और तुलना करें।',
            'mobiles.searchPh':    'फ़ोन खोजें...',

            // Compare Page
            'compare.matrixBadge':   'डिवाइस मैट्रिक्स',
            'compare.title':         'तुलना करें',
            'compare.titleAccent':   'स्मार्टफोन',
            'compare.subtitle':      'AI-संचालित स्पेक हाइलाइटिंग के साथ पक्ष-दर-पक्ष विनिर्देशों का मूल्यांकन करने के लिए 3 उपकरणों तक का चयन करें।',
            'compare.addBtn':        'डिवाइस जोड़ें',
            'compare.clearAll':      'सभी हटाएं',
            'compare.selectedCount': '3 में से {count} चुने गए',
            'compare.selectPhone':   'स्मार्टफोन चुनें',
            'compare.modalSearchPh': 'फ़ोन का नाम या ब्रांड खोजें…',
            'compare.emptySlot':     'खाली स्लॉट',
            'compare.clickToAdd':    'तुलना करने के लिए डिवाइस जोड़ें पर क्लिक करें',
            'compare.rowBrand':      'ब्रांड',
            'compare.rowModel':      'मॉडल',
            'compare.rowPrice':      'कीमत',
            'compare.rowRating':     'रेटिंग',
            'compare.rowProcessor':  'प्रोसेसर',
            'compare.rowCamera':     'कैमरा',
            'compare.rowRamStorage': 'रैम / स्टोरेज',
            'compare.rowBattery':    'बैटरी और चार्जिंग',
            'compare.rowDisplay':    'डिस्प्ले',
            'compare.rowOS':         'ऑपरेटिंग सिस्टम',
            'compare.rowHighlight':  'प्रमुख विशेषता',
            'compare.rowScore':      'AI स्कोर',
            'compare.winner':        'विजेता',
            'compare.remove':        'हटाएं',
            'compare.emptyState':    'पक्ष-दर-पक्ष विनिर्देशों का मूल्यांकन करने के लिए 3 उपकरणों तक का चयन करें।',
            'compare.emptyTitle':    'कोई उपकरण नहीं चुना गया',
            'compare.emptyMsg':      'पक्ष-दर-पक्ष स्पेक्स की तुलना शुरू करने के लिए ऊपर + डिवाइस जोड़ें बटन पर क्लिक करें।',
            'compare.addDevice':     '+ डिवाइस जोड़ें',
            'compare.selectSmartphones': 'स्मार्टफ़ोन चुनें',

            // Details Page
            'details.loader':        'डिवाइस डेटा लोड हो रहा है…',
            'details.notFoundTitle': 'डिवाइस नहीं मिला',
            'details.notFoundMsg':   'आप जिस फ़ोन की तलाश कर रहे हैं वह हमारे डेटाबेस में मौजूद नहीं है।',
            'details.backToMobiles': 'मोबाइल पर वापस जाएं',
            'details.back':          'वापस',
            'details.bcHome':        'होम',
            'details.bcMobiles':     'मोबाइल',
            'details.bcDevice':      'डिवाइस',
            'details.verifiedSpecs': 'सत्यापित स्पेक्स',
            'details.startingAt':    'शुरुआती कीमत',
            'details.buyNow':        'अभी खरीदें',
            'details.fullSpecsBadge':'पूर्ण विनिर्देश',
            'details.fullSpecsTitle':'संपूर्ण',
            'details.fullSpecsAccent':'टेक शीट',
            'details.verifiedBanner':'सत्यापित डेटासेट विनिर्देश — सीधे आधिकारिक TECH BOX AI कैटलॉग डेटासेट से प्राप्त',
            'details.secGeneral':    'सामान्य जानकारी',
            'details.secPerformance':'प्रदर्शन और हार्डवेयर',
            'details.secCamera':     'कैमरा सिस्टम',
            'details.secBattery':    'बैटरी और पावर',
            'details.secDisplay':    'डिस्प्ले और डिज़ाइन',
            'details.secOS':         'ऑपरेटिंग सिस्टम और AI',

            // AI Assistant Page
            'ai.title':        'TECH BOX AI',
            'ai.subtitle':     'आपका न्यूरल मोबाइल सलाहकार',
            'ai.welcomeMsg':   'नमस्ते! मैं TECH BOX AI सहायक हूं। मैं आपको सही स्मार्टफोन खोजने, स्पेक्स की तुलना करने या हमारे न्यूरल डेटाबेस के आधार पर हमारे उपकरणों के बारे में प्रश्नों के उत्तर देने में मदद कर सकता हूं।',
            'ai.tryAsking':    'मुझसे पूछने का प्रयास करें:',
            'ai.chip1':        '$1,000 से कम में सर्वश्रेष्ठ फ़ोन',
            'ai.chip2':        'सर्वश्रेष्ठ कैमरा फ़ोन',
            'ai.chip3':        'सर्वश्रेष्ठ गेमिंग फ़ोन',
            'ai.chip4':        'सैमसंग और वनप्लस की तुलना करें',
            'ai.inputPh':      'फ़ोन, स्पेक्स या तुलनाओं के बारे में पूछें...',
            'ai.disclaimer':   'AI सिफारिशें विशेष रूप से TECH BOX AI के सुरक्षित डिवाइस कैटलॉग पर आधारित हैं।',

            // News Feed Page
            'news.badge':       'लाइव फीड',
            'news.title':       'टेक',
            'news.accent':      'समाचार',
            'news.subtitle':    'नवीनतम तकनीक की प्रगति और मोबाइल उद्योग के समाचारों के साथ अद्यतन रहें।',
            'news.all':         'सभी समाचार',
            'news.smartphones': 'स्मार्टफोन',
            'news.launches':    'लॉन्च',
            'news.technology':  'तकनीक',
            'news.ai':          'AI',
            'news.reviews':     'समीक्षाएं',
            'news.readArticle': 'लेख पढ़ें',

            // Sell Phone Page
            'sell.badge':           'AI ट्रेड-इन',
            'sell.title':           'अपना बेचें',
            'sell.accent':          'फ़ोन',
            'sell.subtitle':        'अपने डिवाइस की स्थिति और हमारे बाज़ार डेटा के आधार पर तुरंत अनुमानित मूल्य प्राप्त करें।',
            'sell.detailsHeading':  'डिवाइस विवरण',
            'sell.brandLabel':      'ब्रांड',
            'sell.selectBrand':     'ब्रांड चुनें',
            'sell.modelLabel':      'मॉडल',
            'sell.selectModel':     'मॉडल चुनें',
            'sell.conditionLabel':  'स्थिति',
            'sell.condLikeNew':     'बिल्कुल नया जैसा',
            'sell.condLikeNewDesc': 'बिना किसी खरोंच के एकदम सही',
            'sell.condExcellent':   'उत्कृष्ट',
            'sell.condExcellentDesc':'मामूली सूक्ष्म खरोंच',
            'sell.condGood':        'अच्छा',
            'sell.condGoodDesc':    'दिखाई देने वाला उपयोग',
            'sell.condFair':        'सामान्य',
            'sell.condFairDesc':    'काफी इस्तेमाल किया गया, काम कर रहा है',
            'sell.accLabel':        'सहायक उपकरण और स्थिति',
            'sell.chkCharger':      'मेरे पास मूल चार्जर है',
            'sell.chkBox':          'मेरे पास मूल बॉक्स है',
            'sell.chkDamage':       'डिवाइस की स्क्रीन/बॉडी क्षतिग्रस्त है या मरम्मत की आवश्यकता है',
            'sell.emptyState':      'अपने अनुमानित पुनर्विक्रय मूल्य को देखने के लिए अपने डिवाइस का ब्रांड और मॉडल चुनें।',
            'sell.estimateLabel':   'अनुमानित पुनर्विक्रय मूल्य',
            'sell.estimateNote':    'आपकी स्थिति चयन के आधार पर। अंतिम प्रस्ताव भिन्न हो सकता है।',
            'sell.summaryCondition':'स्थिति:',
            'sell.summaryAccessories':'सहायक उपकरण:',
            'sell.summaryDamage':   'बड़ा नुकसान:',
            'sell.getStarted':      'शुरू करें',
            'sell.yes':             'हां',
            'sell.no':              'नहीं',
            'sell.errBrand':        'कृपया एक ब्रांड चुनें।',
            'sell.errModel':        'कृपया एक मॉडल चुनें।',

            // Contact Page
            'contact.badge':       'संपर्क करें और निर्देशिका',
            'contact.title':       'जुड़ें',
            'contact.accent':      'TECH BOX AI से',
            'contact.subtitle':    'क्या आपके पास प्रश्न, प्रतिक्रिया है या सहायता की आवश्यकता है? हमारी टीम से संपर्क करें, प्रधान कार्यालय के विवरण देखें, या हमारे ब्रांड स्टोर और सेवा केंद्र निर्देशिका का पता लगाएं।',
            'contact.formHeading': 'हमें एक संदेश भेजें',
            'contact.formSubtext': 'नीचे दिए गए विवरण भरें और हम जल्द से जल्द आपसे संपर्क करेंगे।',
            'contact.fullName':    'पूरा नाम *',
            'contact.fullNamePh':  'जैसे अमित शर्मा',
            'contact.emailAddress':'ईमेल पता *',
            'contact.emailAddressPh':'जैसे alex@example.com',
            'contact.phone':       'फ़ोन नंबर',
            'contact.phoneOptional':'(वैकल्पिक)',
            'contact.phonePh':     'जैसे +91 98765 43210',
            'contact.subject':     'विषय *',
            'contact.selectSubject':'एक विषय चुनें',
            'contact.subjGeneral': 'सामान्य पूछताछ',
            'contact.subjData':    'डिवाइस डेटा / स्पेक प्रतिक्रिया',
            'contact.subjAI':      'AI सहायक प्रश्न',
            'contact.subjTradeIn': 'ट्रेड-इन / फ़ोन बेचें सहायता',
            'contact.subjPartner': 'साझेदारी / सहयोग',
            'contact.message':     'संदेश *',
            'contact.messagePh':   'हम आपकी क्या सहायता कर सकते हैं?',
            'contact.sendBtn':     'संदेश भेजें',
            'contact.errName':     'कृपया अपना नाम दर्ज करें।',
            'contact.errEmail':    'कृपया एक मान्य ईमेल दर्ज करें।',
            'contact.errSubject':  'कृपया एक विषय चुनें।',
            'contact.errMessage':  'कृपया एक संदेश दर्ज करें।',
        },
        te: {
            // Navigation & Drawer
            'nav.home':          'హోమ్',
            'nav.mobiles':       'మొబైల్స్',
            'nav.compare':       'పోలిక',
            'nav.sellPhone':     'ఫోన్ అమ్మండి',
            'nav.aiAssistant':   'AI సహాయకుడు',
            'nav.news':          'వార్తలు',
            'nav.contact':       'సంప్రదింపు',
            'nav.themeMode':     'థీమ్ మోడ్',
            'nav.switchTheme':   'థీమ్ మార్చండి',
            'nav.searchTitle':   'వెతకండి (Ctrl + K)',
            'nav.toggleTheme':   'డార్క్/లైట్ మోడ్ మార్చండి',
            'nav.toggleMenu':    'మొబైల్ మెనూ మార్చండి',
            'nav.closeMenu':     'మెనూ మూసివేయండి',

            // Gateway Screen
            'gateway.title':     'మీ భాషను ఎంచుకోండి',
            'gateway.subtitle':  'మీ AI అనుభవాన్ని అనుకూలీకరించడానికి మీ ప్రాధాన్యత కలిగిన భాషను ఎంచుకోండి',
            'gateway.enSub':     'డిఫాల్ట్ సిస్టమ్ భాష',
            'gateway.hiSub':     'హిందీలో అనుభవించండి',
            'gateway.teSub':     'తెలుగులో అనుభవించండి',
            'gateway.status':    'AI ఇంజిన్ ఆన్‌లైన్ • v3.8',

            // Hero Section
            'hero.badge':        'TECH BOX AI న్యూరల్ ఇంజిన్ 3.0',
            'hero.line1':        'మీ మొబైల్ అనుభవాన్ని',
            'hero.line2':        'AI మేధస్సుతో',
            'hero.line3':        'విప్లవాత్మకంగా మార్చండి',
            'hero.subtitle':     'ఫ్లాగ్‌షిప్ స్మార్ట్‌ఫోన్‌లను కనుగొనండి, కెమెరా సామర్థ్యాలను పరిశీలించండి, న్యూరల్ ప్రాసెసింగ్ శక్తిని బెంచ్‌మార్క్ చేయండి మరియు తక్షణ AI ఖచ్చితత్వంతో పరికరాలను పక్కపక్కనే పోల్చండి.',
            'hero.searchPh':     'ఫోన్‌లను వెతకండి ఉదా. "ఉత్తమ కెమెరా ఫోన్"...',
            'hero.searchBtn':    'వెతకండి',
            'hero.popularTags':  'ప్రజాదరణ పొందినవి:',
            'hero.exploreBtn':   'మొబైల్స్ అన్వేషించండి',
            'hero.compareBtn':   'ఫోన్‌లను పోల్చండి',

            // Micro Metrics
            'metrics.devices':   'కాటలాగ్ చేసిన పరికరాలు',
            'metrics.precision': 'న్యూరల్ ఖచ్చితత్వం',
            'metrics.unbiased':  'నిష్పాక్షిక విశ్లేషణలు',

            // Card Common Actions & Labels
            'card.verified':     'ధృవీకరించబడింది',
            'card.startingAt':   'ప్రారంభ ధర',
            'card.details':      'వివరాలు',
            'card.compare':      'పోల్చండి',
            'card.addToCompare': 'పోలికకు జోడించండి',
            'card.addToFav':     'ప్రియమైన వాటికి జోడించండి',

            // Section Headers & Titles
            'section.trendingBadge':    'న్యూరల్ ర్యాంక్ చేసిన ఫ్లాగ్‌షిప్‌లు',
            'section.trendingTitle':    'ట్రెండింగ్',
            'section.trendingAccent':   'మొబైల్స్',
            'section.trendingSubtitle': 'AI పనితీరు, కెమెరా ఆప్టిక్స్ మరియు బ్యాటరీ సామర్థ్యంతో బెంచ్‌మార్క్ చేయబడిన అగ్రశ్రేణి స్మార్ట్‌ఫోన్‌లను అన్వేషించండి.',
            'section.viewAll':          'అన్నీ చూడండి',
            'upcoming.badge':           'రాబోయే రిలీజ్‌లు',
            'upcoming.title':           'రాబోయే',
            'upcoming.accent':          'మొబైల్స్',
            'upcoming.subtitle':        'అత్యంత అంచనాలున్న పరికరాల ముందస్తు వీక్షణ (ప్రస్తుత డేటాలో విడుదల తేదీలు అందుబాటులో లేవు).',
            'upcoming.emptyTitle':      'రాబోయే మొబైల్స్',
            'upcoming.emptyMsg':        'ధృవీకరించబడిన విడుదల సమాచారం అందుబాటులో ఉన్నప్పుడు కొత్త లాంచ్‌లు ఇక్కడ కనిపిస్తాయి.',

            // Filter Tabs & Dropdowns
            'filter.all':           'అన్ని మొబైల్స్',
            'filter.flagship':      'ఫ్లాగ్‌షిప్ AI',
            'filter.camera':        'కెమెరా బీస్ట్స్',
            'filter.gaming':        'గేమింగ్ బీస్ట్స్',
            'filter.value':         'వాల్యూ కిల్లర్స్',
            'filter.brandLabel':    'బ్రాండ్:',
            'filter.priceLabel':    'ధర:',
            'filter.sortLabel':     'క్రమబద్ధీకరించు:',
            'filter.priceAll':      'అన్నీ',
            'filter.priceUnder500':  '$500 కంటే తక్కువ',
            'filter.price500to900': '$500 – $900',
            'filter.price900to1300':'$900 – $1300',
            'filter.priceAbove1300':'$1300 కంటే ఎక్కువ',
            'sort.priceAsc':        'ధర – తక్కువ నుండి ఎక్కువ',
            'sort.priceDesc':       'ధర – ఎక్కువ నుండి తక్కువ',
            'sort.ratingDesc':      'రేటింగ్ – ఎక్కువ నుండి తక్కువ',
            'sort.newest':          'కొత్తవి',

            // Quick Search & Search Modal
            'search.badge':          'శోధన ఫలితాలు',
            'search.resultsFor':     'ఫలితాలు:',
            'search.foundMatches':   'మీ శోధనకు సరిపోలే {count} ఫోన్‌లు కనుగొనబడ్డాయి',
            'search.close':          'మూసివేయి',
            'search.noResultsTitle': 'ఏ ఫోన్‌లు కనుగొనబడలేదు',
            'search.noResultsMsg':   '{query} కి ఫలితాలు లేవు. బ్రాండ్, మోడల్, ప్రాసెసర్ లేదా కెమెరా స్పెసిఫికేషన్‌ల ద్వారా వెతకడానికి ప్రయత్నించండి.',
            'search.try':            'ప్రయత్నించండి:',
            'search.modalPlaceholder':'ఫోన్ పేరు, బ్రాండ్, ప్రాసెసర్, కెమెరా, ర్యామ్, బ్యాటరీ లేదా ధరను వెతకండి...',
            'search.escClose':       'మూసివేయి',
            'search.navigate':       'నేవిగేట్ చేయండి',
            'search.select':         'ఎంచుకోండి',
            'search.clearSearch':    'శోధన క్లియర్ చేయండి',
            'search.closeModal':     'శోధన మోడల్ మూసివేయండి',

            // Mobiles Page
            'mobiles.title':       'మొబైల్స్ అన్వేషించండి',
            'mobiles.subtitle':    'AI ద్వారా ఆధారితమైన తాజా ఫ్లాగ్‌షిప్ మరియు వాల్యూ స్మార్ట్‌ఫోన్‌లను వెతకండి, ఫిల్టర్ చేయండి, క్రమబద్ధించండి మరియు పోల్చండి.',
            'mobiles.searchPh':    'ఫోన్‌లను వెతకండి...',

            // Compare Page
            'compare.matrixBadge':   'పరికరం మ్యాట్రిక్స్',
            'compare.title':         'పోల్చండి',
            'compare.titleAccent':   'స్మార్ట్‌ఫోన్‌లు',
            'compare.subtitle':      'AI-చోదక స్పెసిఫికేషన్ హైలైటింగ్‌తో పక్కపక్కనే స్పెసిఫికేషన్‌లను పరిశీలించడానికి 3 పరికరాల వరకు ఎంచుకోండి.',
            'compare.addBtn':        'పరికరాన్ని జోడించండి',
            'compare.clearAll':      'అన్నీ తీసివేయండి',
            'compare.selectedCount': '3 లో {count} ఎంపిక చేయబడ్డాయి',
            'compare.selectPhone':   'స్మార్ట్‌ఫోన్‌ను ఎంచుకోండి',
            'compare.modalSearchPh': 'ఫోన్ పేరు లేదా బ్రాండ్‌ను వెతకండి…',
            'compare.emptySlot':     'ఖాళీ స్లాట్',
            'compare.clickToAdd':    'పోల్చడానికి పరికరాన్ని జోడించు క్లిక్ చేయండి',
            'compare.rowBrand':      'బ్రాండ్',
            'compare.rowModel':      'మోడల్',
            'compare.rowPrice':      'ధర',
            'compare.rowRating':     'రేటింగ్',
            'compare.rowProcessor':  'ప్రాసెసర్',
            'compare.rowCamera':     'కెమెరా',
            'compare.rowRamStorage': 'ర్యామ్ / స్టోరేజ్',
            'compare.rowBattery':    'బ్యాటరీ & ఛార్జింగ్',
            'compare.rowDisplay':    'డిస్ప్లే',
            'compare.rowOS':         'ఆపరేటింగ్ సిస్టమ్',
            'compare.rowHighlight':  'ముఖ్యాంశం',
            'compare.rowScore':      'AI స్కోర్',
            'compare.winner':        'విజేత',
            'compare.remove':        'తొలగించు',
            'compare.emptyState':    'పక్కపక్కనే స్పెసిఫికేషన్‌లను పరిశీలించడానికి 3 పరికరాల వరకు ఎంచుకోండి.',
            'compare.emptyTitle':    'ఏ పరికరాలు ఎంపిక చేయబడలేదు',
            'compare.emptyMsg':      'పక్కపక్కనే స్పెసిఫికేషన్‌లను పోల్చడం ప్రారంభించడానికి పైన ఉన్న + పరికరాన్ని జోడించండి బటన్‌ను క్లిక్ చేయండి.',
            'compare.addDevice':     '+ పరికరాన్ని జోడించండి',
            'compare.selectSmartphones': 'స్మార్ట్‌ఫోన్‌లను ఎంచుకోండి',

            // Details Page
            'details.loader':        'పరికరం డేటా లోడ్ అవుతోంది…',
            'details.notFoundTitle': 'పరికరం కనుగొనబడలేదు',
            'details.notFoundMsg':   'మీరు వెతుకుతున్న ఫోన్ మా డేటాబేస్‌లో లేదు.',
            'details.backToMobiles': 'మొబైల్స్‌కు తిరిగి వెళ్లండి',
            'details.back':          'వెనుకకు',
            'details.bcHome':        'హోమ్',
            'details.bcMobiles':     'మొబైల్స్',
            'details.bcDevice':      'పరికరం',
            'details.verifiedSpecs': 'ధృవీకరించబడిన స్పెసిఫికేషన్‌లు',
            'details.startingAt':    'ప్రారంభ ధర',
            'details.buyNow':        'ఇప్పుడే కొనండి',
            'details.fullSpecsBadge':'పూర్తి స్పెసిఫికేషన్‌లు',
            'details.fullSpecsTitle':'పూర్తి',
            'details.fullSpecsAccent':'టెక్ షీట్',
            'details.verifiedBanner':'ధృవీకరించబడిన డేటాసెట్ స్పెసిఫికేషన్‌లు — అధికారిక TECH BOX AI కాటలాగ్ డేటాసెట్ నుండి పొందబడింది',
            'details.secGeneral':    'సాధారణ సమాచారం',
            'details.secPerformance':'పనితీరు & హార్డ్‌వేర్',
            'details.secCamera':     'కెమెరా సిస్టమ్',
            'details.secBattery':    'బ్యాటరీ & పవర్',
            'details.secDisplay':    'డిస్ప్లే & డిజైన్',
            'details.secOS':         'ఆపరేటింగ్ సిస్టమ్ & AI',

            // AI Assistant Page
            'ai.title':        'TECH BOX AI',
            'ai.subtitle':     'మీ న్యూరల్ మొబైల్ సలహాదారు',
            'ai.welcomeMsg':   'హలో! నేను TECH BOX AI సహాయకుడిని. మీరు సరైన స్మార్ట్‌ఫోన్‌ను కనుగొనడంలో, స్పెసిఫికేషన్‌లను పోల్చడంలో లేదా మా న్యూరల్ డేటాబేస్ ఆధారంగా ప్రశ్నలకు సమాధానాలు ఇవ్వడంలో నేను సహాయపడగలను.',
            'ai.tryAsking':    'నన్ను అడగటానికి ప్రయత్నించండి:',
            'ai.chip1':        '$1,000 కంటే తక్కువలో ఉత్తమ ఫోన్',
            'ai.chip2':        'ఉత్తమ కెమెరా ఫోన్',
            'ai.chip3':        'ఉత్తమ గేమింగ్ ఫోన్',
            'ai.chip4':        'శామ్‌సంగ్ మరియు వన్‌ప్లస్‌లను పోల్చండి',
            'ai.inputPh':      'ఫోన్‌లు, స్పెసిఫికేషన్‌లు లేదా పోలికల గురించి అడగండి...',
            'ai.disclaimer':   'AI సిఫార్సులు TECH BOX AI యొక్క సురక్షిత పరికర కాటలాగ్ ఆధారంగా మాత్రమే ఉంటాయి.',

            // News Feed Page
            'news.badge':       'లైవ్ ఫీడ్',
            'news.title':       'టెక్',
            'news.accent':      'వార్తలు',
            'news.subtitle':    'తాజా టెక్ పురోగతులు మరియు మొబైల్ పరిశ్రమ వార్తలతో ఎప్పటికప్పుడు తెలుసుకోండి.',
            'news.all':         'అన్ని వార్తలు',
            'news.smartphones': 'స్మార్ట్‌ఫోన్‌లు',
            'news.launches':    'లాంచ్‌లు',
            'news.technology':  'సాంకేతికత',
            'news.ai':          'AI',
            'news.reviews':     'సమీక్షలు',
            'news.readArticle': 'వ్యాసం చదవండి',

            // Sell Phone Page
            'sell.badge':           'AI ట్రేడ్-ఇన్',
            'sell.title':           'మీ ఫోన్',
            'sell.accent':          'అమ్మండి',
            'sell.subtitle':        'మీ పరికరం పరిస్థితి మరియు మా మార్కెట్ డేటా ఆధారంగా తక్షణ అంచనా విలువను పొందండి.',
            'sell.detailsHeading':  'పరికరం వివరాలు',
            'sell.brandLabel':      'బ్రాండ్',
            'sell.selectBrand':     'బ్రాండ్‌ను ఎంచుకోండి',
            'sell.modelLabel':      'మోడల్',
            'sell.selectModel':     'మోడల్‌ను ఎంచుకోండి',
            'sell.conditionLabel':  'పరిస్థితి',
            'sell.condLikeNew':     'కొత్తది లాగా',
            'sell.condLikeNewDesc': 'ఏలాంటి గీతలు లేవు',
            'sell.condExcellent':   'అద్భుతం',
            'sell.condExcellentDesc':'చిన్న గీతలు',
            'sell.condGood':        'బాగుంది',
            'sell.condGoodDesc':    'కనిపించే వాడకం',
            'sell.condFair':        'సాధారణం',
            'sell.condFairDesc':    'ఎక్కువగా వాడబడింది, పని చేస్తోంది',
            'sell.accLabel':        'ఉపకరణాలు & స్థితి',
            'sell.chkCharger':      'నా వద్ద ఒరిజినల్ ఛార్జర్ ఉంది',
            'sell.chkBox':          'నా వద్ద ఒరిజినల్ బాక్స్ ఉంది',
            'sell.chkDamage':       'పరికరం స్క్రీన్/బాడీ దెబ్బతింది లేదా రిపేర్ అవసరం',
            'sell.emptyState':      'మీ అంచనా రీసేల్ విలువను చూడటానికి మీ పరికరం బ్రాండ్ మరియు మోడల్‌ను ఎంచుకోండి.',
            'sell.estimateLabel':   'అంచనా వేసిన రీసేల్ విలువ',
            'sell.estimateNote':    'మీ పరిస్థితి ఎంపిక ఆధారంగా. తుది ఆఫర్ మారవచ్చు.',
            'sell.summaryCondition':'పరిస్థితి:',
            'sell.summaryAccessories':'ఉపకరణాలు:',
            'sell.summaryDamage':   'భారీ నష్టం:',
            'sell.getStarted':      'ప్రారంభించండి',
            'sell.yes':             'అవును',
            'sell.no':              'కాదు',
            'sell.errBrand':        'దయచేసి ఒక బ్రాండ్‌ను ఎంచుకోండి.',
            'sell.errModel':        'దయచేసి ఒక మోడల్‌ను ఎంచుకోండి.',

            // Contact Page
            'contact.badge':       'సంప్రదించండి & డైరెక్టరీ',
            'contact.title':       'సంప్రదించండి',
            'contact.accent':      'TECH BOX AI తో',
            'contact.subtitle':    'ప్రశ్నలు, ఫీడ్‌బ్యాక్ ఉన్నాయా లేదా సహాయం కావాలా? మా బృందాన్ని సంప్రదించండి, ప్రధాన కార్యాలయ వివరాలను చూడండి లేదా మా బ్రాండ్ స్టోర్ మరియు సర్వీస్ సెంటర్ డైరెక్టరీని చూడండి.',
            'contact.formHeading': 'మాకు ఒక సందేశాన్ని పంపండి',
            'contact.formSubtext': 'కింది వివరాలను నింపండి, మేము సాధ్యమైనంత త్వరగా మిమ్మల్ని సంప్రదిస్తాము.',
            'contact.fullName':    'పూర్తి పేరు *',
            'contact.fullNamePh':  'ఉదా. రమేష్ కుమార్',
            'contact.emailAddress':'ఈమెయిల్ చిరునామా *',
            'contact.emailAddressPh':'ఉదా. alex@example.com',
            'contact.phone':       'ఫోన్ నంబరు',
            'contact.phoneOptional':'(ఐచ్ఛికం)',
            'contact.phonePh':     'ఉదా. +91 98765 43210',
            'contact.subject':     'విషయం *',
            'contact.selectSubject':'ఒక విషయాన్ని ఎంచుకోండి',
            'contact.subjGeneral': 'సాధారణ విచారణ',
            'contact.subjData':    'పరికరం డేటా / స్పెసిఫికేషన్ ఫీడ్‌బ్యాక్',
            'contact.subjAI':      'AI సహాయకుడి ప్రశ్న',
            'contact.subjTradeIn': 'ట్రేడ్-ఇన్ / ఫోన్ అమ్మకం సహాయం',
            'contact.subjPartner': 'భాగస్వామ్యం / సహకారం',
            'contact.message':     'సందేశం *',
            'contact.messagePh':   'మేము మీకు ఎలా సహాయపడగలము?',
            'contact.sendBtn':     'సందేశం పంపండి',
            'contact.errName':     'దయచేసి మీ పేరును నమోదు చేయండి.',
            'contact.errEmail':    'దయచేసి చెల్లుబాటు అయ్యే ఈమెయిల్ నమోదు చేయండి.',
            'contact.errSubject':  'దయచేసి ఒక విషయాన్ని ఎంచుకోండి.',
            'contact.errMessage':  'దయచేసి ఒక సందేశాన్ని నమోదు చేయండి.',
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
        const stored = localStorage.getItem('techbox_language') || localStorage.getItem('techboxLang');
        return (stored && translations[stored]) ? stored : 'en';
    }

    /* ======================================================================
       4. Translate helper — t(key, params)
       ====================================================================== */
    function t(key, params) {
        const lang = getCurrentLang();
        let text = (translations[lang] && translations[lang][key])
            ? translations[lang][key]
            : (translations.en[key] || key);

        if (params && typeof params === 'object') {
            Object.keys(params).forEach(function (p) {
                text = text.replace(new RegExp('\\{' + p + '\\}', 'g'), params[p]);
            });
        }
        return text;
    }

    /* ======================================================================
       5. Translate entire container or document
       ====================================================================== */
    function applyTranslations(root) {
        root = root || document;

        // 5a. [data-i18n] -> textContent
        var els = root.querySelectorAll('[data-i18n]');
        els.forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var translated = t(key);
            if (translated && translated !== key) {
                el.textContent = translated;
            }
        });

        // 5b. [data-i18n-ph] -> placeholder
        var phEls = root.querySelectorAll('[data-i18n-ph]');
        phEls.forEach(function (el) {
            var key = el.getAttribute('data-i18n-ph');
            var translated = t(key);
            if (translated && translated !== key) {
                el.setAttribute('placeholder', translated);
            }
        });

        // 5c. [data-i18n-title] -> title & aria-label
        var titleEls = root.querySelectorAll('[data-i18n-title]');
        titleEls.forEach(function (el) {
            var key = el.getAttribute('data-i18n-title');
            var translated = t(key);
            if (translated && translated !== key) {
                el.setAttribute('title', translated);
                el.setAttribute('aria-label', translated);
            }
        });
    }

    // Expose globally
    window.techboxLang = {
        get: getCurrentLang,
        t: t,
        translations: translations,
        meta: langMeta,
        applyTranslations: applyTranslations
    };

    /* ======================================================================
       6. Apply language on DOMContentLoaded
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', function () {
        var lang = getCurrentLang();

        // 6a. Set <html lang>
        document.documentElement.lang = lang;

        // 6b. Apply font class on <body>
        document.body.classList.remove('lang-hi-active', 'lang-te-active');
        if (lang === 'hi') {
            document.body.classList.add('lang-hi-active');
        } else if (lang === 'te') {
            document.body.classList.add('lang-te-active');
        }

        // 6c. Apply translations to all tagged elements
        applyTranslations(document);

        // 6d. Inject language switcher into navbar
        injectLangSwitcher(lang);
    });

    /* ======================================================================
       7. Language Switcher Dropdown (injected into .nav-actions)
       ====================================================================== */
    function injectLangSwitcher(currentLang) {
        var navActions = document.querySelector('.nav-actions');
        if (!navActions) return; // Not a navbar page

        if (document.getElementById('langSwitcherBtn')) return;

        var meta = langMeta[currentLang] || langMeta.en;

        var wrapper = document.createElement('div');
        wrapper.className = 'lang-switcher-wrapper';

        var btn = document.createElement('button');
        btn.className = 'icon-btn lang-switcher-btn';
        btn.id = 'langSwitcherBtn';
        btn.setAttribute('aria-label', 'Change Language');
        btn.setAttribute('title', 'Language: ' + meta.name);
        btn.innerHTML = '<span class="lang-flag">' + meta.flag + '</span>' +
                        '<span class="lang-code">' + meta.code + '</span>';

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

        var firstChild = navActions.firstElementChild;
        if (firstChild) {
            navActions.insertBefore(wrapper, firstChild);
        } else {
            navActions.appendChild(wrapper);
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = dropdown.classList.toggle('is-open');
            dropdown.setAttribute('aria-hidden', String(!isOpen));
        });

        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) {
                dropdown.classList.remove('is-open');
                dropdown.setAttribute('aria-hidden', 'true');
            }
        });

        dropdown.addEventListener('click', function (e) {
            var item = e.target.closest('[data-lang-switch]');
            if (!item) return;

            var newLang = item.getAttribute('data-lang-switch');
            if (newLang === currentLang) {
                dropdown.classList.remove('is-open');
                return;
            }

            var m = langMeta[newLang];
            localStorage.setItem('techbox_language', newLang);
            localStorage.setItem('techboxLang', newLang);
            localStorage.setItem('techbox_language_name', m.name);
            localStorage.setItem('techbox_lang_timestamp', new Date().toISOString());

            window.location.reload();
        });
    }

})();
