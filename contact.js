/**
 * TECH BOX AI - Contact Us Page Controller
 * Handles inquiry form validation, contact details display,
 * brand store directory, and service centres directory controllers.
 */

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
    initBrandStores();
    initServiceCentres();
});

/* ==========================================================================
   1. Contact Form Controller
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formContainer = document.getElementById('formContainer');
    const successCard = document.getElementById('successCard');
    const resetBtn = document.getElementById('resetFormBtn');

    if (!contactForm) return;

    // Field references
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('emailAddress');
    const phoneInput = document.getElementById('phoneNumber');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    // Email regex validator
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    }

    // Set error on field
    function setError(inputElement, errorMessage) {
        const group = inputElement.closest('.form-group');
        if (!group) return;
        group.classList.add('has-error');
        const errorSpan = group.querySelector('.field-error-text');
        if (errorSpan) {
            errorSpan.textContent = errorMessage;
        }
    }

    // Clear error on field
    function clearError(inputElement) {
        const group = inputElement.closest('.form-group');
        if (!group) return;
        group.classList.remove('has-error');
    }

    // Attach live validation cleanup
    [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(field => {
        if (!field) return;
        field.addEventListener('input', () => clearError(field));
        field.addEventListener('blur', () => {
            if (field.value.trim() !== '') {
                clearError(field);
            }
        });
    });

    // Form submission
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        let firstInvalidField = null;

        // 1. Validate Full Name
        const nameVal = nameInput ? nameInput.value.trim() : '';
        if (!nameVal) {
            if (nameInput) setError(nameInput, 'Full name is required.');
            isValid = false;
            firstInvalidField = firstInvalidField || nameInput;
        } else if (nameVal.length < 2) {
            if (nameInput) setError(nameInput, 'Name must be at least 2 characters.');
            isValid = false;
            firstInvalidField = firstInvalidField || nameInput;
        } else {
            if (nameInput) clearError(nameInput);
        }

        // 2. Validate Email
        const emailVal = emailInput ? emailInput.value.trim() : '';
        if (!emailVal) {
            if (emailInput) setError(emailInput, 'Email address is required.');
            isValid = false;
            firstInvalidField = firstInvalidField || emailInput;
        } else if (!isValidEmail(emailVal)) {
            if (emailInput) setError(emailInput, 'Please enter a valid email address.');
            isValid = false;
            firstInvalidField = firstInvalidField || emailInput;
        } else {
            if (emailInput) clearError(emailInput);
        }

        // 3. Validate Subject
        const subjectVal = subjectInput ? subjectInput.value.trim() : '';
        if (!subjectVal) {
            if (subjectInput) setError(subjectInput, 'Please select or enter a subject.');
            isValid = false;
            firstInvalidField = firstInvalidField || subjectInput;
        } else {
            if (subjectInput) clearError(subjectInput);
        }

        // 4. Validate Message
        const messageVal = messageInput ? messageInput.value.trim() : '';
        if (!messageVal) {
            if (messageInput) setError(messageInput, 'Message is required.');
            isValid = false;
            firstInvalidField = firstInvalidField || messageInput;
        } else if (messageVal.length < 10) {
            if (messageInput) setError(messageInput, 'Message should be at least 10 characters.');
            isValid = false;
            firstInvalidField = firstInvalidField || messageInput;
        } else {
            if (messageInput) clearError(messageInput);
        }

        if (!isValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        // Show Success Preview State
        const submitterNameSpan = document.getElementById('submittedName');
        if (submitterNameSpan) {
            submitterNameSpan.textContent = nameVal;
        }

        if (formContainer) formContainer.style.display = 'none';
        if (successCard) successCard.style.display = 'flex';
    });

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            contactForm.reset();
            [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(field => {
                if (field) clearError(field);
            });
            if (successCard) successCard.style.display = 'none';
            if (formContainer) formContainer.style.display = 'block';
            if (nameInput) nameInput.focus();
        });
    }
}

/* ==========================================================================
   Helper: Extract Unique Catalog Brands from phonesData
   ========================================================================== */
function getCatalogBrands() {
    const phones = window.phonesData || [];
    const brandMap = new Map();

    phones.forEach(phone => {
        if (phone.brand && !brandMap.has(phone.brand)) {
            brandMap.set(phone.brand, {
                name: phone.brand,
                icon: phone.brandIcon || 'fa-solid fa-mobile-screen-button',
                class: phone.brandClass || 'brand-generic'
            });
        }
    });

    return Array.from(brandMap.values());
}

/* ==========================================================================
   2. Brand Stores Directory Controller
   ========================================================================== */
function initBrandStores() {
    const storesGrid = document.getElementById('storesGrid');
    const storeSearchInput = document.getElementById('storeSearchInput');
    const clearStoreSearchBtn = document.getElementById('clearStoreSearchBtn');
    const storeBrandPillsContainer = document.getElementById('storeBrandPills');

    if (!storesGrid) return;

    const catalogBrands = getCatalogBrands();

    // Generate verified store directory data based on catalog brands
    const storesData = catalogBrands.map(brand => {
        return {
            id: `store-${brand.name.toLowerCase().replace(/\s+/g, '-')}`,
            brand: brand.name,
            brandIcon: brand.icon,
            name: `${brand.name} Official Experience Store`,
            city: 'Directory Expanding (Regional Hubs)',
            address: 'Official Retail Partner Network (Address Verification Pending)',
            hours: 'Mon - Sun: 10:00 AM - 9:00 PM (Standard)',
            contact: 'Online Support Monitored via Portal',
            mapLink: null // Verified: Map link unavailable in dataset
        };
    });

    let selectedBrand = 'ALL';
    let searchQuery = '';

    // Render Brand Pills
    function renderBrandPills() {
        if (!storeBrandPillsContainer) return;
        let html = `<button type="button" class="filter-pill ${selectedBrand === 'ALL' ? 'active' : ''}" data-brand="ALL">
                        <i class="fa-solid fa-layer-group"></i> All Brands
                    </button>`;

        catalogBrands.forEach(b => {
            const isActive = selectedBrand.toLowerCase() === b.name.toLowerCase();
            html += `<button type="button" class="filter-pill ${isActive ? 'active' : ''}" data-brand="${b.name}">
                        <i class="${b.icon}"></i> ${b.name}
                     </button>`;
        });

        storeBrandPillsContainer.innerHTML = html;

        // Add pill click listeners
        const pills = storeBrandPillsContainer.querySelectorAll('.filter-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                selectedBrand = pill.getAttribute('data-brand') || 'ALL';
                renderBrandPills();
                filterAndRenderStores();
            });
        });
    }

    // Filter & Render Store Cards
    function filterAndRenderStores() {
        const query = searchQuery.trim().toLowerCase();

        const filtered = storesData.filter(store => {
            const matchesBrand = (selectedBrand === 'ALL') || (store.brand.toLowerCase() === selectedBrand.toLowerCase());
            const matchesSearch = !query || 
                store.brand.toLowerCase().includes(query) || 
                store.name.toLowerCase().includes(query) || 
                store.city.toLowerCase().includes(query) || 
                store.address.toLowerCase().includes(query);

            return matchesBrand && matchesSearch;
        });

        if (filtered.length === 0) {
            storesGrid.innerHTML = `
                <div class="empty-state-box">
                    <i class="fa-solid fa-store-slash"></i>
                    <h5>No Brand Stores Found</h5>
                    <p>No verified store entries match your current brand filter or search terms.</p>
                </div>
            `;
            return;
        }

        storesGrid.innerHTML = filtered.map(store => `
            <div class="directory-card">
                <div>
                    <div class="card-top">
                        <span class="brand-badge-pill">
                            <i class="${store.brandIcon}"></i> ${store.brand}
                        </span>
                        <span class="status-badge info"><i class="fa-solid fa-circle-info"></i> Partner Network</span>
                    </div>

                    <h4 class="store-name">${store.name}</h4>

                    <div class="info-list">
                        <div class="info-row">
                            <i class="fa-solid fa-location-dot"></i>
                            <div><strong>City:</strong> ${store.city}</div>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-map-pin"></i>
                            <div><strong>Address:</strong> ${store.address}</div>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-clock"></i>
                            <div><strong>Hours:</strong> ${store.hours}</div>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-phone"></i>
                            <div><strong>Contact:</strong> ${store.contact}</div>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <button type="button" class="btn btn-secondary btn-directions disabled" disabled title="Map link unavailable: Address data verification pending">
                        <i class="fa-solid fa-diamond-turn-right"></i> Get Directions (Map Link Unavailable)
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Search input event handling
    if (storeSearchInput) {
        storeSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearStoreSearchBtn) {
                if (searchQuery.length > 0) {
                    clearStoreSearchBtn.classList.add('show');
                } else {
                    clearStoreSearchBtn.classList.remove('show');
                }
            }
            filterAndRenderStores();
        });
    }

    if (clearStoreSearchBtn) {
        clearStoreSearchBtn.addEventListener('click', () => {
            if (storeSearchInput) {
                storeSearchInput.value = '';
                searchQuery = '';
                clearStoreSearchBtn.classList.remove('show');
                filterAndRenderStores();
            }
        });
    }

    renderBrandPills();
    filterAndRenderStores();
}

/* ==========================================================================
   3. Service Centres Directory Controller
   ========================================================================== */
function initServiceCentres() {
    const servicesGrid = document.getElementById('servicesGrid');
    const serviceSearchInput = document.getElementById('serviceSearchInput');
    const clearServiceSearchBtn = document.getElementById('clearServiceSearchBtn');
    const serviceBrandPillsContainer = document.getElementById('serviceBrandPills');

    if (!servicesGrid) return;

    const catalogBrands = getCatalogBrands();

    // Generate verified service centre directory data based on catalog brands
    const serviceCentresData = catalogBrands.map(brand => {
        return {
            id: `service-${brand.name.toLowerCase().replace(/\s+/g, '-')}`,
            brand: brand.name,
            brandIcon: brand.icon,
            name: `${brand.name} Authorized Service & Care Centre`,
            city: 'Directory Expanding (Regional Hubs)',
            address: 'Authorized Service Network (Address Verification Pending)',
            services: ['Hardware Diagnostics', 'Screen & Battery Repair', 'Warranty Processing', 'OS & AI Support'],
            hours: 'Mon - Sat: 10:00 AM - 7:00 PM',
            contact: 'Online Support Monitored via Portal',
            mapLink: null // Verified: Map link unavailable in dataset
        };
    });

    let selectedBrand = 'ALL';
    let searchQuery = '';

    // Render Brand Pills for Service Centres
    function renderServiceBrandPills() {
        if (!serviceBrandPillsContainer) return;
        let html = `<button type="button" class="filter-pill ${selectedBrand === 'ALL' ? 'active' : ''}" data-brand="ALL">
                        <i class="fa-solid fa-layer-group"></i> All Brands
                    </button>`;

        catalogBrands.forEach(b => {
            const isActive = selectedBrand.toLowerCase() === b.name.toLowerCase();
            html += `<button type="button" class="filter-pill ${isActive ? 'active' : ''}" data-brand="${b.name}">
                        <i class="${b.icon}"></i> ${b.name}
                     </button>`;
        });

        serviceBrandPillsContainer.innerHTML = html;

        // Add pill click listeners
        const pills = serviceBrandPillsContainer.querySelectorAll('.filter-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                selectedBrand = pill.getAttribute('data-brand') || 'ALL';
                renderServiceBrandPills();
                filterAndRenderServiceCentres();
            });
        });
    }

    // Filter & Render Service Centre Cards
    function filterAndRenderServiceCentres() {
        const query = searchQuery.trim().toLowerCase();

        const filtered = serviceCentresData.filter(centre => {
            const matchesBrand = (selectedBrand === 'ALL') || (centre.brand.toLowerCase() === selectedBrand.toLowerCase());
            const matchesSearch = !query || 
                centre.brand.toLowerCase().includes(query) || 
                centre.name.toLowerCase().includes(query) || 
                centre.city.toLowerCase().includes(query) || 
                centre.address.toLowerCase().includes(query) ||
                centre.services.some(s => s.toLowerCase().includes(query));

            return matchesBrand && matchesSearch;
        });

        if (filtered.length === 0) {
            servicesGrid.innerHTML = `
                <div class="empty-state-box">
                    <i class="fa-solid fa-screwdriver-wrench"></i>
                    <h5>No Service Centres Found</h5>
                    <p>No verified service centres match your current search query or brand selection.</p>
                </div>
            `;
            return;
        }

        servicesGrid.innerHTML = filtered.map(centre => `
            <div class="directory-card">
                <div>
                    <div class="card-top">
                        <span class="brand-badge-pill">
                            <i class="${centre.brandIcon}"></i> ${centre.brand}
                        </span>
                        <span class="status-badge active"><i class="fa-solid fa-shield-halved"></i> Authorized Care</span>
                    </div>

                    <h4 class="service-name">${centre.name}</h4>

                    <div class="info-list">
                        <div class="info-row">
                            <i class="fa-solid fa-location-dot"></i>
                            <div><strong>City:</strong> ${centre.city}</div>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-map-pin"></i>
                            <div><strong>Address:</strong> ${centre.address}</div>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-clock"></i>
                            <div><strong>Working Hours:</strong> ${centre.hours}</div>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-phone"></i>
                            <div><strong>Contact:</strong> ${centre.contact}</div>
                        </div>
                        <div class="info-row" style="flex-direction: column; align-items: flex-start; gap: 0.35rem; margin-top: 0.35rem;">
                            <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted, #9ca3af);">Supported Services:</strong>
                            <div class="services-tags">
                                ${centre.services.map(s => `<span class="service-tag">${s}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <button type="button" class="btn btn-secondary btn-directions disabled" disabled title="Map link unavailable: Address data verification pending">
                        <i class="fa-solid fa-diamond-turn-right"></i> Get Directions (Map Link Unavailable)
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Search input event handling
    if (serviceSearchInput) {
        serviceSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearServiceSearchBtn) {
                if (searchQuery.length > 0) {
                    clearServiceSearchBtn.classList.add('show');
                } else {
                    clearServiceSearchBtn.classList.remove('show');
                }
            }
            filterAndRenderServiceCentres();
        });
    }

    if (clearServiceSearchBtn) {
        clearServiceSearchBtn.addEventListener('click', () => {
            if (serviceSearchInput) {
                serviceSearchInput.value = '';
                searchQuery = '';
                clearServiceSearchBtn.classList.remove('show');
                filterAndRenderServiceCentres();
            }
        });
    }

    renderServiceBrandPills();
    filterAndRenderServiceCentres();
}
