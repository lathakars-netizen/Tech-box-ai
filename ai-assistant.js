document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatHistory = document.getElementById('chatHistory');
    const promptChips = document.querySelectorAll('.prompt-chip');

    // Make sure we have phones data
    const phones = window.phonesData || [];

    // Auto-scroll to bottom of chat
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Add User Message
    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerHTML = `<div class="message-content">${escapeHTML(text)}</div>`;
        chatHistory.appendChild(msgDiv);
        scrollToBottom();
    }

    // Add Typing Indicator
    function addTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message typing-indicator-msg';
        msgDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatHistory.appendChild(msgDiv);
        scrollToBottom();
        return msgDiv;
    }

    // Add AI Message
    function addAIMessage(htmlContent) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        msgDiv.innerHTML = `<div class="message-content">${htmlContent}</div>`;
        chatHistory.appendChild(msgDiv);
        if (window.techboxLang && typeof window.techboxLang.applyTranslations === 'function') {
            window.techboxLang.applyTranslations(msgDiv);
        }
        scrollToBottom();
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Handle Form Submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;

        chatInput.value = '';
        processQuery(query);
    });

    // Handle Prompt Chips
    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.textContent.trim();
            processQuery(query);
        });
    });

    function processQuery(query) {
        addUserMessage(query);
        const typingMsg = addTypingIndicator();

        // Simulate network delay for AI thinking
        setTimeout(() => {
            typingMsg.remove();
            generateResponse(query.toLowerCase());
        }, 1200 + Math.random() * 800);
    }

    // Enhanced Client-Side AI Recommendation Engine
    function generateResponse(query) {
        let responseHtml = '';
        const allPhones = (typeof window.phonesData !== 'undefined' ? window.phonesData : phones) || [];
        
        if (!allPhones.length) {
            addAIMessage("<p>Our phone catalog dataset is currently unavailable. Please try refreshing the page.</p>");
            return;
        }

        // 1. Handle Greetings & Conversational Queries
        const greetings = ['hello', 'hi', 'hey', 'greetings', 'who are you', 'what can you do', 'help', 'start'];
        if (greetings.some(g => query === g || query.startsWith(g + ' '))) {
            responseHtml = `
                <p>Hello! 👋 I'm your <strong>TECH BOX AI Assistant</strong>. I can analyze our verified dataset of smartphones to recommend the best devices tailored to your needs.</p>
                <p>Here are some examples of what you can ask me:</p>
                <ul>
                    <li>💡 <em>"Best camera phone under $1200"</em></li>
                    <li>🎮 <em>"Best gaming phone with high refresh rate"</em></li>
                    <li>🔋 <em>"Smartphones with huge battery and fast charging"</em></li>
                    <li>🏷️ <em>"Top budget phones under 80000 rupees"</em></li>
                    <li>⚔️ <em>"Compare Samsung and Apple"</em></li>
                </ul>
            `;
            addAIMessage(responseHtml);
            return;
        }

        // 2. Handle Side-by-Side Comparison Queries (e.g. "Compare Samsung and OnePlus" or "Compare Galaxy S25 and iPhone 16")
        if (query.includes('compare')) {
            const knownBrands = ['samsung', 'apple', 'google', 'oneplus', 'nothing', 'xiaomi', 'asus', 'vivo', 'realme'];
            let matchedBrands = knownBrands.filter(b => query.includes(b) || (b === 'apple' && query.includes('iphone')));
            
            // Loose matching by device names
            if (query.includes('s25')) matchedBrands.push('samsung');
            if (query.includes('pixel')) matchedBrands.push('google');
            if (query.includes('iphone')) matchedBrands.push('apple');
            
            matchedBrands = [...new Set(matchedBrands)];

            if (matchedBrands.length >= 2) {
                let compareList = [];
                matchedBrands.forEach(b => {
                    const match = allPhones.find(p => p.brand.toLowerCase().includes(b) || p.name.toLowerCase().includes(b));
                    if (match && !compareList.some(item => item.id === match.id) && compareList.length < 3) {
                        compareList.push(match);
                    }
                });

                if (compareList.length > 1) {
                    const compareIds = compareList.map(p => p.id).join(',');
                    responseHtml = `<p>Here is a side-by-side comparison for <strong>${compareList.map(p => p.name).join(' vs ')}</strong> based on our verified dataset:</p>`;
                    responseHtml += renderPhoneCards(compareList, (phone) => `Verified specifications matched for ${phone.brand}`);
                    responseHtml += `<p style="margin-top: 12px;"><a href="compare.html?ids=${encodeURIComponent(compareIds)}" class="btn-link-action" style="color: var(--color-cyan-bright, #38bdf8); font-weight: 600;"><i class="fa-solid fa-code-compare"></i> Open full comparison matrix in Compare Tool →</a></p>`;
                    addAIMessage(responseHtml);
                    return;
                }
            }
        }

        // 3. Multi-Criteria Feature Extraction & Scoring Engine
        let targetBudgetINR = null;
        let isBudgetQuery = false;
        let targetBrand = null;
        let intents = {
            camera: false,
            gaming: false,
            battery: false,
            display: false,
            performance: false,
            value: false
        };

        // Budget Parsing (INR prioritized, USD supported)
        if (query.includes('under') || query.includes('below') || query.includes('budget') || query.includes('cheap') || query.includes('affordable') || query.includes('price') || query.match(/[$₹\d]/)) {
            const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
            if (lakhMatch) {
                targetBudgetINR = parseFloat(lakhMatch[1]) * 100000;
                isBudgetQuery = true;
            } else {
                const usdMatch = query.match(/\$\s*(\d+[,.]?\d*)/);
                if (usdMatch) {
                    targetBudgetINR = parseFloat(usdMatch[1].replace(/,/g, '')) * 87;
                    isBudgetQuery = true;
                } else {
                    const numMatch = query.match(/(\d+[,.]?\d*)\s*(k|thousand|rupees|rs)?/i);
                    if (numMatch) {
                        let num = parseFloat(numMatch[1].replace(/,/g, ''));
                        if (numMatch[2] && numMatch[2].toLowerCase() === 'k') num *= 1000;
                        if (num < 2000) num *= 87; // Treat small numbers as USD conversion
                        targetBudgetINR = num;
                        isBudgetQuery = true;
                    }
                }
            }
            if (query.includes('budget') || query.includes('cheap') || query.includes('affordable')) {
                intents.value = true;
                if (!targetBudgetINR) targetBudgetINR = 50000;
            }
        }

        // Brand Parsing
        const knownBrandsList = [
            { key: 'samsung', names: ['samsung', 'galaxy'] },
            { key: 'apple', names: ['apple', 'iphone', 'ios'] },
            { key: 'google', names: ['google', 'pixel'] },
            { key: 'oneplus', names: ['oneplus', '1+'] },
            { key: 'iqoo', names: ['iqoo', 'neo'] },
            { key: 'xiaomi', names: ['xiaomi', 'mi', 'redmi', 'poco'] },
            { key: 'vivo', names: ['vivo'] },
            { key: 'realme', names: ['realme'] },
            { key: 'asus', names: ['asus', 'rog'] },
            { key: 'nothing', names: ['nothing'] }
        ];

        for (const b of knownBrandsList) {
            if (b.names.some(name => query.includes(name))) {
                targetBrand = b.key;
                break;
            }
        }

        // Category & Feature Intent Extraction
        if (query.includes('camera') || query.includes('photo') || query.includes('video') || query.includes('zoom') || query.includes('megapixel') || query.includes('200mp') || query.includes('portrait')) {
            intents.camera = true;
        }
        if (query.includes('gaming') || query.includes('game') || query.includes('fps') || query.includes('cooling') || query.includes('graphics') || query.includes('pubg') || query.includes('genshin')) {
            intents.gaming = true;
        }
        if (query.includes('battery') || query.includes('endurance') || query.includes('mah') || query.includes('charging') || query.includes('charge')) {
            intents.battery = true;
        }
        if (query.includes('display') || query.includes('screen') || query.includes('amoled') || query.includes('oled') || query.includes('brightness') || query.includes('nits') || query.includes('120hz')) {
            intents.display = true;
        }
        if (query.includes('performance') || query.includes('fast') || query.includes('speed') || query.includes('processor') || query.includes('chip') || query.includes('ram') || query.includes('multitask') || query.includes('ai')) {
            intents.performance = true;
        }

        const activeIntentsCount = Object.values(intents).filter(Boolean).length;

        // 4. Candidate Scoring and Phone-Specific Reasoning
        const scoredCandidates = [];

        allPhones.forEach(phone => {
            let score = 0;
            const reasons = [];

            // Extract numeric INR price
            const priceINR = (typeof phone.priceNumericINR === 'number')
                ? phone.priceNumericINR
                : (parseFloat(String(phone.price).replace(/[^0-9.]/g, '')) || 0);

            // Budget Match
            if (targetBudgetINR !== null) {
                if (priceINR <= targetBudgetINR) {
                    score += 30;
                    reasons.push(`Fits within your budget at ${phone.price}`);
                } else if (priceINR <= targetBudgetINR * 1.15) {
                    score += 10;
                    reasons.push(`Slightly above budget at ${phone.price} but offers top value`);
                } else {
                    score -= 100; // Exceeds budget significantly
                }
            }

            // Brand Match
            if (targetBrand) {
                if (phone.brand.toLowerCase().includes(targetBrand) || phone.name.toLowerCase().includes(targetBrand)) {
                    score += 30;
                    reasons.push(`Official ${phone.brand} flagship device`);
                } else {
                    score -= 15;
                }
            }

            // Camera Intent
            if (intents.camera) {
                if (phone.category.includes('camera') || (phone.camera && (phone.camera.includes('200MP') || phone.camera.includes('48MP') || phone.camera.includes('Periscope')))) {
                    score += 25;
                    const mainCam = phone.camera ? phone.camera.split('+')[0].trim() : 'Advanced Camera';
                    reasons.push(`Pro camera setup with ${mainCam}`);
                }
            }

            // Gaming Intent
            if (intents.gaming) {
                const ramGB = parseInt(phone.ram) || 0;
                if (phone.category.includes('gaming') || ramGB >= 12 || (phone.processor && (phone.processor.includes('Snapdragon 8') || phone.processor.includes('A18 Pro')))) {
                    score += 25;
                    reasons.push(`Gaming performance with ${phone.processor} and ${phone.ram} RAM`);
                }
            }

            // Battery Intent
            if (intents.battery) {
                const mah = parseInt(phone.battery) || 0;
                if (mah >= 5000 || (phone.charging && parseInt(phone.charging) >= 45)) {
                    score += 25;
                    reasons.push(`Long battery endurance (${phone.battery}) & fast charging (${phone.charging || 'Fast'})`);
                }
            }

            // Display Intent
            if (intents.display) {
                if (phone.display && (phone.display.includes('120Hz') || phone.display.includes('AMOLED') || phone.display.includes('OLED'))) {
                    score += 20;
                    reasons.push(`Vibrant ${phone.display}`);
                }
            }

            // Performance Intent
            if (intents.performance) {
                if (phone.processor && (phone.processor.includes('Gen 4') || phone.processor.includes('A18') || phone.processor.includes('Gen 3'))) {
                    score += 25;
                    reasons.push(`Powered by high-performance ${phone.processor}`);
                }
            }

            // General Rating Boost
            score += (phone.rating || 4.5) * 3;

            // Save candidate if valid
            if (score > 0 || (!isBudgetQuery && !targetBrand && activeIntentsCount === 0)) {
                scoredCandidates.push({
                    phone,
                    score,
                    reason: reasons.length ? reasons.join(' • ') : `Top rated ${phone.category} smartphone in our dataset`
                });
            }
        });

        // Sort candidates by score descending
        scoredCandidates.sort((a, b) => b.score - a.score);

        // Filter out candidates that failed budget or brand constraints severely
        const topCandidates = scoredCandidates.filter(c => c.score > 0).slice(0, 3);

        // 5. Generate Output
        if (topCandidates.length > 0) {
            let criteriaSummary = [];
            if (targetBrand) criteriaSummary.push(`brand: <strong>${targetBrand.toUpperCase()}</strong>`);
            if (targetBudgetUSD) criteriaSummary.push(`budget: <strong>${targetBudgetUSD > 2000 ? '₹' + Math.round(targetBudgetUSD * 83).toLocaleString() : '$' + Math.round(targetBudgetUSD)}</strong>`);
            if (intents.camera) criteriaSummary.push(`focus: <strong>Camera & Optics</strong>`);
            if (intents.gaming) criteriaSummary.push(`focus: <strong>Gaming Performance</strong>`);
            if (intents.battery) criteriaSummary.push(`focus: <strong>Battery Endurance</strong>`);
            if (intents.display) criteriaSummary.push(`focus: <strong>Display Quality</strong>`);
            if (intents.performance) criteriaSummary.push(`focus: <strong>Processor Speed</strong>`);

            const headerText = criteriaSummary.length 
                ? `Based on your request (${criteriaSummary.join(', ')}), here are the top verified smartphone recommendations from our dataset:`
                : `Here are our top recommended smartphones from the verified TECH BOX AI dataset:`;

            responseHtml = `<p>${headerText}</p>`;
            responseHtml += renderPhoneCards(topCandidates.map(c => c.phone), (phone) => {
                const match = topCandidates.find(c => c.phone.id === phone.id);
                return match ? match.reason : `Verified dataset match for your criteria`;
            });
        } else {
            // Unmatched Query Graceful Fallback
            let filterDesc = [];
            if (targetBrand) filterDesc.push(`brand ${targetBrand.toUpperCase()}`);
            if (targetBudgetUSD) filterDesc.push(`price under $${Math.round(targetBudgetUSD)}`);

            responseHtml = `
                <p>⚠️ No smartphones in our catalog dataset strictly match all your criteria${filterDesc.length ? ' (' + filterDesc.join(' + ') + ')' : ''}.</p>
                <p>Here are the <strong>closest matching alternatives</strong> from our verified catalog:</p>
            `;

            // Offer closest alternatives (e.g. lowest priced or top flagships)
            const fallbackPhones = allPhones
                .slice()
                .sort((a, b) => (a.rating || 0) - (b.rating || 0))
                .reverse()
                .slice(0, 2);

            responseHtml += renderPhoneCards(fallbackPhones, (p) => `Closest verified dataset alternative (${p.brand} ${p.category})`);
            responseHtml += `
                <p style="margin-top: 10px; font-size: 0.85rem; color: var(--text-muted, #9ca3af);">
                    💡 <em>Tip: Try adjusting your budget or searching by feature (e.g., "Best camera phone" or "Samsung Galaxy").</em>
                </p>
            `;
        }

        addAIMessage(responseHtml);
    }

    function renderPhoneCards(phonesList, getReasonFn = null) {
        if (!phonesList || phonesList.length === 0) return '';
        
        let html = '<div class="recommendation-grid">';
        
        phonesList.forEach(phone => {
            const reason = typeof getReasonFn === 'function' ? getReasonFn(phone) : (getReasonFn || `Recommended for its ${phone.category} capabilities`);
            
            const firstSpec = phone.specs && phone.specs[0] ? phone.specs[0] : { icon: 'fa-solid fa-microchip', text: phone.processor || 'Processor' };
            const secondSpec = phone.specs && phone.specs[1] ? phone.specs[1] : { icon: 'fa-solid fa-camera', text: phone.camera || 'Camera' };
            const thirdSpec = phone.specs && phone.specs[2] ? phone.specs[2] : { icon: 'fa-solid fa-battery-full', text: phone.battery || 'Battery' };

            html += `
                <a href="details.html?id=${encodeURIComponent(phone.id)}" class="phone-card">
                    <div class="phone-card-img-wrapper">
                        <img src="${phone.image}" alt="${phone.name}" class="phone-card-img" onerror="this.style.display='none'">
                    </div>
                    <div class="phone-card-title" style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                        <span>${phone.name}</span>
                        <span class="verified-specs-pill" style="font-size:0.62rem; padding:2px 6px;" title="Verified Dataset Specs"><i class="fa-solid fa-shield-check"></i> <span data-i18n="card.verified">Verified</span></span>
                    </div>
                    <div class="phone-card-price">${phone.price}</div>
                    <div class="phone-card-specs">
                        <span><i class="${firstSpec.icon}"></i> ${firstSpec.text}</span>
                        <span><i class="${secondSpec.icon}"></i> ${secondSpec.text}</span>
                        <span><i class="${thirdSpec.icon}"></i> ${thirdSpec.text}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #10b981; margin-top: 10px; line-height: 1.4;"><i class="fa-solid fa-circle-check"></i> ${reason}</div>
                </a>
            `;
        });
        
        html += '</div>';
        return html;
    }
});
