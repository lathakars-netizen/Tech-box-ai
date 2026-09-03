/**
 * TECH BOX AI - Sell Your Phone Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initSellPhone();
});

function initSellPhone() {
    const brandSelect = document.getElementById('brandSelect');
    const modelSelect = document.getElementById('modelSelect');
    const sellForm = document.getElementById('sellForm');
    
    if (!brandSelect || !modelSelect || !sellForm) return;

    // 1. Load Data
    const dataList = (typeof phonesData !== 'undefined') ? phonesData : (window.phonesData || []);
    
    // 2. Populate Brands
    const brands = [...new Set(dataList.map(p => p.brand))].sort();
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    // 3. Handle Brand Change
    brandSelect.addEventListener('change', (e) => {
        const selectedBrand = e.target.value;
        modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
        
        if (selectedBrand) {
            const models = dataList.filter(p => p.brand === selectedBrand);
            models.forEach(phone => {
                const option = document.createElement('option');
                option.value = phone.id;
                option.textContent = phone.name;
                modelSelect.appendChild(option);
            });
            modelSelect.disabled = false;
        } else {
            modelSelect.disabled = true;
        }
        
        // Reset phone display
        updatePhoneDisplay(null);
        validateSelect(brandSelect);
    });

    // 4. Handle Model Change
    modelSelect.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const phone = dataList.find(p => p.id === selectedId);
        updatePhoneDisplay(phone);
        validateSelect(modelSelect);
        calculateEstimate();
    });

    // 5. Handle all input changes to recalculate estimate
    const inputs = sellForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', calculateEstimate);
    });

    // 6. Form Submission / CTA
    const ctaBtn = document.getElementById('sellCtaBtn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            let isValid = true;
            if (!brandSelect.value) {
                isValid = false;
                validateSelect(brandSelect);
            }
            if (!modelSelect.value) {
                isValid = false;
                validateSelect(modelSelect);
            }

            if (isValid) {
                const phone = dataList.find(p => p.id === modelSelect.value);
                if (phone) {
                    alert(`Lead generated for ${phone.name}! A TECH BOX AI representative will contact you with the final quote.`);
                }
            } else {
                alert('Please select a Brand and Model first.');
            }
        });
    }
}

function validateSelect(selectEl) {
    const group = selectEl.closest('.form-group');
    if (!selectEl.value) {
        group.classList.add('has-error');
    } else {
        group.classList.remove('has-error');
    }
}

let currentOriginalPrice = 0;

function updatePhoneDisplay(phone) {
    const emptyState = document.getElementById('summaryEmptyState');
    const resultState = document.getElementById('summaryResultState');
    
    if (!phone) {
        if (emptyState) emptyState.style.display = 'block';
        if (resultState) resultState.style.display = 'none';
        currentOriginalPrice = 0;
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (resultState) resultState.style.display = 'flex';

    const sumImg = document.getElementById('sumImg');
    if (sumImg) {
        sumImg.src = phone.image || '';
        sumImg.alt = phone.name || 'Phone';
        sumImg.style.display = 'block';
    }
    
    const sumBrand = document.getElementById('sumBrand');
    if (sumBrand) sumBrand.textContent = phone.brand || '';
    
    const sumTitle = document.getElementById('sumTitle');
    if (sumTitle) sumTitle.textContent = phone.name || '';

    // Render basic specifications
    const sumSpecs = document.getElementById('sumSpecs');
    if (sumSpecs) {
        if (phone.specs && phone.specs.length > 0) {
            sumSpecs.innerHTML = phone.specs.map(s => 
                `<span class="spec-badge"><i class="${s.icon}"></i> ${s.text}</span>`
            ).join('');
        } else {
            sumSpecs.innerHTML = '';
        }
    }

    // Parse numeric price from "$1,299" -> 1299
    currentOriginalPrice = parseFloat((phone.price || '').replace(/[^0-9.-]+/g, '')) || 0;
}

function calculateEstimate() {
    const sumEstimate = document.getElementById('sumEstimate');
    if (!sumEstimate) return;

    if (currentOriginalPrice === 0) {
        sumEstimate.textContent = '$0';
        return;
    }

    // Base value is a percentage of original price depending on condition
    const conditionEl = document.querySelector('input[name="condition"]:checked');
    const condition = conditionEl ? conditionEl.value : 'like-new';
    let multiplier = 0.60;

    switch (condition) {
        case 'like-new': multiplier = 0.60; break;
        case 'excellent': multiplier = 0.50; break;
        case 'good': multiplier = 0.40; break;
        case 'fair': multiplier = 0.25; break;
        default: multiplier = 0.50;
    }

    let estimate = currentOriginalPrice * multiplier;

    // Adjustments
    const chkCharger = document.getElementById('chkCharger');
    const chkBox = document.getElementById('chkBox');
    const chkDamage = document.getElementById('chkDamage');

    const hasCharger = chkCharger ? chkCharger.checked : false;
    const hasBox = chkBox ? chkBox.checked : false;
    const hasDamage = chkDamage ? chkDamage.checked : false;

    if (!hasCharger) estimate -= 20;
    if (!hasBox) estimate -= 10;
    if (hasDamage) {
        estimate -= (estimate * 0.40); // 40% deduction for damage
    }

    // Floor
    if (estimate < 10) estimate = 10; // Minimum trade-in value

    sumEstimate.textContent = '$' + Math.round(estimate).toLocaleString();
    
    // Update summary rows
    const cLabelEl = document.querySelector(`input[name="condition"]:checked + .radio-label .radio-label-title`);
    const cLabel = cLabelEl ? cLabelEl.textContent : 'Like New';
    const sumCondition = document.getElementById('sumCondition');
    if (sumCondition) sumCondition.textContent = cLabel;
    
    let accessories = [];
    if (hasCharger) accessories.push('Charger');
    if (hasBox) accessories.push('Box');
    
    const sumAccessories = document.getElementById('sumAccessories');
    if (sumAccessories) {
        sumAccessories.textContent = accessories.length ? accessories.join(', ') : 'None';
    }

    const sumDamage = document.getElementById('sumDamage');
    if (sumDamage) {
        const yesText = (window.techboxLang ? window.techboxLang.t('sell.yes') : 'Yes');
        const noText = (window.techboxLang ? window.techboxLang.t('sell.no') : 'No');
        sumDamage.textContent = hasDamage ? `${yesText} (Value reduced)` : noText;
    }
}
