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

    // Rule-based Recommendation Engine
    function generateResponse(query) {
        let responseHtml = '';
        let matchedPhones = [...phones];
        let explanations = [];

        // 1. Check for specific comparisons (e.g. Compare Samsung and OnePlus)
        if (query.includes('compare')) {
            const brands = ['samsung', 'apple', 'google', 'oneplus', 'nothing', 'xiaomi', 'asus', 'vivo'];
            let foundBrands = brands.filter(b => query.includes(b) || query.includes(b === 'apple' ? 'iphone' : ''));
            
            // Allow comparison by specific phone names too loosely (e.g., compare s25 and pixel 9)
            if (foundBrands.length < 2) {
                 if (query.includes('s25')) foundBrands.push('samsung');
                 if (query.includes('iphone 16')) foundBrands.push('apple');
                 if (query.includes('pixel 9')) foundBrands.push('google');
            }
            // filter duplicates
            foundBrands = [...new Set(foundBrands)];

            if (foundBrands.length >= 2) {
                let phonesToCompare = [];
                for(let b of foundBrands) {
                    const p = phones.find(phone => phone.brand.toLowerCase().includes(b) || phone.name.toLowerCase().includes(b));
                    if (p && phonesToCompare.length < 3) phonesToCompare.push(p);
                }
                
                if (phonesToCompare.length > 1) {
                    responseHtml = `<p>Here is a comparison between <strong>${phonesToCompare.map(p=>p.brand).join(' and ')}</strong>.</p>`;
                    responseHtml += renderPhoneCards(phonesToCompare, "Selected for comparison.");
                    responseHtml += `<p><a href="compare.html" style="color: var(--color-cyan-bright);">Click here to view detailed comparison in our Compare tool.</a></p>`;
                } else {
                    responseHtml = `<p>I couldn't find enough phones from those brands in our database to compare.</p>`;
                }
                addAIMessage(responseHtml);
                return;
            }
        }

        // Apply filters sequentially for multiple conditions
        let isFiltered = false;

        // 2. Budget
        if (query.includes('under') || query.includes('budget') || query.includes('cheap') || query.match(/₹\s*\d+/)) {
            let maxPrice = 999999;
            const numMatch = query.match(/(\d+[,.]?\d*)/);
            if (numMatch) {
                maxPrice = parseInt(numMatch[1].replace(/,/g, ''));
                if (query.includes('k ')) maxPrice = maxPrice * 1000;
                
                // If it looks like INR, convert to USD roughly (assume $1 = ₹83)
                if (query.includes('₹') || query.includes('rs') || query.includes('rupees') || maxPrice > 5000) {
                    maxPrice = maxPrice / 83;
                }
            }
            
            const preFilterCount = matchedPhones.length;
            matchedPhones = matchedPhones.filter(p => {
                let pPrice = parseInt(p.price.replace('$', '').replace(',', ''));
                return pPrice <= maxPrice;
            });

            if (matchedPhones.length > 0 && preFilterCount !== matchedPhones.length) {
                explanations.push(`fits within your budget`);
                isFiltered = true;
            }
        }

        // 3. Category / Specs
        if (query.includes('camera') || query.includes('photo') || query.includes('video')) {
            matchedPhones = matchedPhones.filter(p => p.category.includes('camera') || p.camera.toLowerCase().includes('200mp'));
            explanations.push(`features exceptional camera optics (${matchedPhones[0]?.camera.split('+')[0] || ''})`);
            isFiltered = true;
        }
        
        if (query.includes('gaming') || query.includes('game') || query.includes('hz')) {
            matchedPhones = matchedPhones.filter(p => p.category.includes('gaming') || parseInt(p.ram) >= 16 || p.processor.includes('Gen 4'));
            explanations.push(`offers high-end gaming performance and cooling`);
            isFiltered = true;
        }

        if (query.includes('battery') || query.includes('endurance')) {
            matchedPhones = matchedPhones.sort((a,b) => parseInt(b.battery) - parseInt(a.battery)).slice(0, 4);
            explanations.push(`packs a massive battery capacity`);
            isFiltered = true;
        }

        if (query.includes('charging') || query.includes('charge')) {
            matchedPhones = matchedPhones.sort((a,b) => parseInt(b.charging) - parseInt(a.charging)).slice(0, 4);
            explanations.push(`supports ultra-fast charging`);
            isFiltered = true;
        }

        if (query.includes('performance') || query.includes('fast') || query.includes('processor')) {
            matchedPhones = matchedPhones.filter(p => p.processor.includes('Gen 4') || p.processor.includes('A18'));
            explanations.push(`is powered by a top-tier flagship processor`);
            isFiltered = true;
        }

        if (query.includes('display') || query.includes('screen')) {
            matchedPhones = matchedPhones.filter(p => parseInt(p.displaySub) >= 2500); // 2500+ nits
            explanations.push(`features an incredibly bright and smooth display`);
            isFiltered = true;
        }

        // 4. Brand
        const brands = ['samsung', 'apple', 'iphone', 'google', 'pixel', 'oneplus', 'xiaomi', 'vivo', 'asus', 'rog', 'nothing'];
        const foundBrand = brands.find(b => query.includes(b));
        if (foundBrand) {
            matchedPhones = matchedPhones.filter(p => p.brand.toLowerCase().includes(foundBrand) || p.name.toLowerCase().includes(foundBrand));
            explanations.push(`is from your preferred brand`);
            isFiltered = true;
        }

        // 5. Best / All-rounder
        if ((query.includes('best') || query.includes('recommend') || query.includes('all rounder')) && !isFiltered) {
            matchedPhones = matchedPhones.filter(p => p.category.includes('flagship') && !p.category.includes('value'));
            explanations.push(`is rated as a top all-rounder flagship`);
            isFiltered = true;
        }

        // Generate Final Output
        if (matchedPhones.length > 0 && isFiltered) {
            // Take top 3 max
            matchedPhones = matchedPhones.slice(0, 3);
            let reasonText = explanations.join(' and ');
            responseHtml = `<p>Based on your criteria, here are my top recommendations because each <strong>${reasonText}</strong>:</p>`;
            responseHtml += renderPhoneCards(matchedPhones);
        } else if (matchedPhones.length === 0) {
            responseHtml = `<p>I couldn't find any phones in our database that match all your exact criteria.</p>`;
            responseHtml += `<p>However, here are some of our best overall value phones you might consider:</p>`;
            responseHtml += renderPhoneCards(phones.filter(p => p.category.includes('value')).slice(0, 2), "Great value alternative");
        } else {
            // Fallback / Unknown
            responseHtml = `
                <p>I'm not quite sure I understand your criteria. You can try asking for:</p>
                <ul>
                    <li>"Best phone under ₹30,000"</li>
                    <li>"Best camera phone"</li>
                    <li>"Best gaming phone"</li>
                    <li>"Compare Samsung and OnePlus"</li>
                </ul>
            `;
        }

        addAIMessage(responseHtml);
    }

    function renderPhoneCards(phonesList, customReason = null) {
        if (!phonesList || phonesList.length === 0) return '';
        
        let html = '<div class="recommendation-grid">';
        
        phonesList.forEach(phone => {
            const reason = customReason || `Recommended for its ${phone.category} capabilities`;
            html += `
                <a href="details.html?id=${phone.id}" class="phone-card">
                    <div class="phone-card-img-wrapper">
                        <img src="${phone.image}" alt="${phone.name}" class="phone-card-img" onerror="this.style.display='none'">
                    </div>
                    <div class="phone-card-title" style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                        <span>${phone.name}</span>
                        <span class="verified-specs-pill" style="font-size:0.62rem; padding:2px 6px;" title="Verified Dataset Specs"><i class="fa-solid fa-shield-check"></i> Verified</span>
                    </div>
                    <div class="phone-card-price">${phone.price}</div>
                    <div class="phone-card-specs">
                        <span><i class="${phone.specs[0]?.icon || 'fa-solid fa-microchip'}"></i> ${phone.processor.split(' ')[0]} ${phone.processor.split(' ')[1] || ''}</span>
                        <span><i class="${phone.specs[1]?.icon || 'fa-solid fa-camera'}"></i> ${phone.camera.split('+')[0]}</span>
                        <span><i class="${phone.specs[2]?.icon || 'fa-solid fa-battery-full'}"></i> ${phone.battery}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #10b981; margin-top: 10px; font-style: italic;"><i class="fa-solid fa-check"></i> ${reason}</div>
                </a>
            `;
        });
        
        html += '</div>';
        return html;
    }
});
