/**
 * TECH BOX AI — Smartphone Review Submission & Rating Engine (reviews.js)
 * Handles customer review persistence in localStorage, interactive rating star picker,
 * real-time aggregate rating recalculation, and unauthenticated user fallback prompts.
 */

(function () {
    'use strict';

    const REVIEWS_KEY = 'techbox_reviews';

    /* ======================================================================
       1. Static Seed Reviews Database
       ====================================================================== */
    const SEED_REVIEWS = {
        's25-ultra': [
            {
                id: 'seed_s25_1',
                phoneId: 's25-ultra',
                userName: 'Marcus Vance',
                userEmail: 'marcus@techreview.com',
                rating: 5,
                title: 'Unbelievable 200MP camera & Galaxy AI features!',
                comment: 'The Snapdragon 8 Gen 4 makes everything ridiculously smooth. Galaxy AI live translation and Circle to Search work flawlessly. Battery easily lasts 1.5 days.',
                createdAt: '2026-08-20T14:32:00.000Z'
            },
            {
                id: 'seed_s25_2',
                phoneId: 's25-ultra',
                userName: 'Elena Rostova',
                userEmail: 'elena.r@design.io',
                rating: 5,
                title: 'Best display on any smartphone right now',
                comment: 'The Gorilla Glass Armor anti-reflective screen is a game changer in harsh daylight. S Pen integration is crisp as always.',
                createdAt: '2026-08-15T09:15:00.000Z'
            }
        ],
        'iphone-16-pro-max': [
            {
                id: 'seed_ip16_1',
                phoneId: 'iphone-16-pro-max',
                userName: 'David Miller',
                userEmail: 'david.m@applefan.org',
                rating: 5,
                title: 'A18 Pro power + 4K 120fps ProRes is insane',
                comment: 'Video recording quality is unmatched. The new Camera Control button takes a little getting used to, but Apple Intelligence on iOS 18 is super responsive.',
                createdAt: '2026-08-22T18:45:00.000Z'
            },
            {
                id: 'seed_ip16_2',
                phoneId: 'iphone-16-pro-max',
                userName: 'Sophia Chen',
                userEmail: 'sophia@techpulse.net',
                rating: 4,
                title: 'Stunning titanium build & battery life',
                comment: 'Easily get 10+ hours of screen-on time. The thin bezels make the 6.9-inch display look gorgeous, though it is a massive phone.',
                createdAt: '2026-08-18T11:20:00.000Z'
            }
        ],
        'pixel-9-pro-xl': [
            {
                id: 'seed_px9_1',
                phoneId: 'pixel-9-pro-xl',
                userName: 'Liam Thorne',
                userEmail: 'liam.t@androidcentral.com',
                rating: 5,
                title: 'Gemini AI integration is next level',
                comment: 'The computational photography with Gemini Video Boost is mindblowing. Cleanest stock Android experience with guaranteed 7 years of updates.',
                createdAt: '2026-08-24T16:10:00.000Z'
            }
        ],
        'oneplus-13-pro': [
            {
                id: 'seed_op13_1',
                phoneId: 'oneplus-13-pro',
                userName: 'Karan Sharma',
                userEmail: 'karan.s@speedrun.in',
                rating: 5,
                title: '100W charging from 0-100% in under 26 mins!',
                comment: 'Super smooth OxygenOS performance and Hasselblad color tuning produces natural, rich skin tones. Unbeatable value flagship.',
                createdAt: '2026-08-21T10:05:00.000Z'
            }
        ]
    };

    /* ======================================================================
       2. LocalStorage Review Operations
       ====================================================================== */
    function getStoredReviews() {
        try {
            const data = localStorage.getItem(REVIEWS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[Reviews] Failed to load reviews:', e);
            return [];
        }
    }

    function saveStoredReviews(reviews) {
        try {
            localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
        } catch (e) {
            console.error('[Reviews] Failed to save reviews:', e);
        }
    }

    function getReviewsForPhone(phoneId) {
        if (!phoneId) return [];
        const seed = SEED_REVIEWS[phoneId] || [];
        const local = getStoredReviews().filter(r => r.phoneId === phoneId);
        // Combine local (newest first) with seed
        return [...local, ...seed];
    }

    function addReview(phoneId, userName, userEmail, rating, title, comment) {
        const reviews = getStoredReviews();
        const newReview = {
            id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            phoneId: phoneId,
            userName: userName,
            userEmail: userEmail,
            rating: Number(rating),
            title: title.trim(),
            comment: comment.trim(),
            createdAt: new Date().toISOString()
        };

        reviews.unshift(newReview);
        saveStoredReviews(reviews);
        return newReview;
    }

    /* ======================================================================
       3. Main Initialization on Phone Details Page
       ====================================================================== */
    function initReviewsSection() {
        const params = new URLSearchParams(window.location.search);
        const phoneId = params.get('id');

        const section = document.getElementById('dhReviewsSection');
        if (!section || !phoneId) return;

        // Render initially
        renderAllReviewComponents(phoneId);

        // Listen for auth changes to re-render form
        if (window.techboxAuth && typeof window.techboxAuth.onAuthChange === 'function') {
            window.techboxAuth.onAuthChange(() => {
                renderReviewForm(phoneId);
            });
        }
    }

    function renderAllReviewComponents(phoneId) {
        renderReviewSummary(phoneId);
        renderReviewForm(phoneId);
        renderReviewsList(phoneId);
    }

    /* ======================================================================
       4. Render Rating Breakdown & Summary
       ====================================================================== */
    function renderReviewSummary(phoneId) {
        const reviews = getReviewsForPhone(phoneId);

        // Calculate aggregate statistics
        let avgRating = 4.8;
        let totalCount = reviews.length;

        // Fetch catalog phone base rating if available
        const catalogPhone = (window.phonesData || []).find(p => p.id === phoneId);
        if (catalogPhone && typeof catalogPhone.rating === 'number') {
            avgRating = catalogPhone.rating;
        }

        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            avgRating = (sum / reviews.length).toFixed(1);
        }

        // Update Hero rating display dynamically if present
        const heroRatingNum = document.getElementById('dhRatingNum');
        const heroRatingCount = document.getElementById('dhRatingCount');
        const heroStars = document.getElementById('dhStars');

        if (heroRatingNum) heroRatingNum.textContent = avgRating;
        if (heroRatingCount) heroRatingCount.textContent = `(${totalCount} reviews)`;

        if (heroStars) {
            const full = Math.floor(avgRating);
            const half = avgRating % 1 >= 0.5 ? 1 : 0;
            const empty = 5 - full - half;
            let starHtml = '';
            for (let i = 0; i < full; i++) starHtml += `<i class="fa-solid fa-star"></i>`;
            if (half) starHtml += `<i class="fa-solid fa-star-half-stroke"></i>`;
            for (let i = 0; i < empty; i++) starHtml += `<i class="fa-regular fa-star empty"></i>`;
            heroStars.innerHTML = starHtml;
        }

        // Render Section Summary Breakdown
        const summaryScoreEl = document.getElementById('revSummaryScore');
        const summaryStarsEl = document.getElementById('revSummaryStars');
        const summaryCountEl = document.getElementById('revSummaryCount');
        const summaryBarsEl  = document.getElementById('revSummaryBars');

        if (summaryScoreEl) summaryScoreEl.textContent = avgRating;
        if (summaryCountEl) summaryCountEl.textContent = `Based on ${totalCount} customer reviews`;

        if (summaryStarsEl) {
            const full = Math.floor(avgRating);
            const half = avgRating % 1 >= 0.5 ? 1 : 0;
            const empty = 5 - full - half;
            let starHtml = '';
            for (let i = 0; i < full; i++) starHtml += `<i class="fa-solid fa-star"></i>`;
            if (half) starHtml += `<i class="fa-solid fa-star-half-stroke"></i>`;
            for (let i = 0; i < empty; i++) starHtml += `<i class="fa-regular fa-star empty"></i>`;
            summaryStarsEl.innerHTML = starHtml;
        }

        if (summaryBarsEl) {
            // Count star frequencies
            const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviews.forEach(r => {
                if (counts[r.rating] !== undefined) counts[r.rating]++;
            });

            let barsHtml = '';
            for (let star = 5; star >= 1; star--) {
                const count = counts[star] || 0;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                barsHtml += `
                    <div class="rev-bar-row">
                        <span class="rev-bar-label">${star} <i class="fa-solid fa-star" style="color:#f59e0b; font-size:0.75rem;"></i></span>
                        <div class="rev-bar-track">
                            <div class="rev-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                        <span class="rev-bar-count">${count} (${pct}%)</span>
                    </div>
                `;
            }
            summaryBarsEl.innerHTML = barsHtml;
        }
    }

    /* ======================================================================
       5. Render Submission Form vs Unauthenticated Prompt
       ====================================================================== */
    function renderReviewForm(phoneId) {
        const formContainer = document.getElementById('revFormContainer');
        if (!formContainer) return;

        const currentUser = window.techboxAuth ? window.techboxAuth.getCurrentUser() : null;

        if (currentUser) {
            formContainer.innerHTML = `
                <div class="rev-write-card">
                    <h3 class="rev-write-title">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>Write a Review</span>
                    </h3>

                    <div class="rev-posting-as">
                        <div class="user-avatar-circle">${(currentUser.name || 'U').charAt(0).toUpperCase()}</div>
                        <div>
                            <span>Posting as <strong>${currentUser.name}</strong></span>
                            <span class="rev-user-email">(${currentUser.email})</span>
                        </div>
                    </div>

                    <div class="rev-alert" id="revFormAlert"></div>

                    <form id="revSubmitForm" novalidate>
                        <!-- Interactive Star Picker -->
                        <div class="rev-field-group">
                            <label class="rev-field-label">Your Rating <span class="req">*</span></label>
                            <div class="star-picker-wrapper" id="starPickerWrapper">
                                <div class="star-picker" id="starPicker">
                                    <i class="fa-regular fa-star star-btn" data-value="1"></i>
                                    <i class="fa-regular fa-star star-btn" data-value="2"></i>
                                    <i class="fa-regular fa-star star-btn" data-value="3"></i>
                                    <i class="fa-regular fa-star star-btn" data-value="4"></i>
                                    <i class="fa-regular fa-star star-btn" data-value="5"></i>
                                </div>
                                <span class="star-rating-hint" id="starRatingHint">Click to select rating</span>
                            </div>
                        </div>

                        <!-- Review Title -->
                        <div class="rev-field-group">
                            <label class="rev-field-label" for="revTitleInput">Review Headline <span class="req">*</span></label>
                            <input type="text" id="revTitleInput" class="rev-input" placeholder="e.g., Incredible camera & lightning fast performance!" required>
                        </div>

                        <!-- Detailed Comment -->
                        <div class="rev-field-group">
                            <label class="rev-field-label" for="revCommentInput">Detailed Review <span class="req">*</span></label>
                            <textarea id="revCommentInput" class="rev-textarea" rows="4" placeholder="Share your experience with battery life, camera quality, build design, or software features..." required></textarea>
                        </div>

                        <button type="submit" class="rev-btn-submit" id="btnSubmitReview">
                            <i class="fa-solid fa-paper-plane"></i>
                            <span>Submit Review</span>
                        </button>
                    </form>
                </div>
            `;

            bindReviewFormEvents(phoneId, currentUser);
        } else {
            formContainer.innerHTML = `
                <div class="rev-auth-prompt-card">
                    <div class="rev-prompt-icon">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                    <div class="rev-prompt-text">
                        <h3>Share Your Experience</h3>
                        <p>Sign in or create a TECH BOX AI account to submit a rating and review for this smartphone.</p>
                    </div>
                    <button class="rev-btn-auth-trigger" id="btnPromptSignIn">
                        <i class="fa-solid fa-right-to-bracket"></i>
                        <span>Sign In to Review</span>
                    </button>
                </div>
            `;

            const promptBtn = document.getElementById('btnPromptSignIn');
            if (promptBtn) {
                promptBtn.addEventListener('click', () => {
                    if (window.techboxAuth) {
                        window.techboxAuth.openAuthModal('login');
                    }
                });
            }
        }
    }

    function bindReviewFormEvents(phoneId, currentUser) {
        const picker = document.getElementById('starPicker');
        const hint = document.getElementById('starRatingHint');
        const form = document.getElementById('revSubmitForm');
        const alertEl = document.getElementById('revFormAlert');

        if (!picker || !form) return;

        let selectedRating = 0;
        const hints = ['', 'Poor (1/5)', 'Fair (2/5)', 'Good (3/5)', 'Very Good (4/5)', 'Excellent (5/5)'];

        const stars = picker.querySelectorAll('.star-btn');

        function updateStars(value) {
            stars.forEach((star, index) => {
                if (index < value) {
                    star.className = 'fa-solid fa-star star-btn active';
                } else {
                    star.className = 'fa-regular fa-star star-btn';
                }
            });
        }

        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'), 10);

            star.addEventListener('mouseenter', () => {
                updateStars(val);
                if (hint) hint.textContent = hints[val];
            });

            star.addEventListener('mouseleave', () => {
                updateStars(selectedRating);
                if (hint) hint.textContent = selectedRating ? hints[selectedRating] : 'Click to select rating';
            });

            star.addEventListener('click', () => {
                selectedRating = val;
                updateStars(selectedRating);
                if (hint) hint.textContent = hints[selectedRating];
            });
        });

        function showFormAlert(msg, isError = true) {
            if (!alertEl) return;
            alertEl.textContent = msg;
            alertEl.className = `rev-alert show ${isError ? 'error' : 'success'}`;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('revTitleInput').value.trim();
            const comment = document.getElementById('revCommentInput').value.trim();

            if (selectedRating === 0) {
                showFormAlert('Please select a star rating between 1 and 5.', true);
                return;
            }
            if (!title || title.length < 3) {
                showFormAlert('Please enter a review headline (at least 3 characters).', true);
                return;
            }
            if (!comment || comment.length < 10) {
                showFormAlert('Please write a detailed review (at least 10 characters).', true);
                return;
            }

            addReview(phoneId, currentUser.name, currentUser.email, selectedRating, title, comment);

            showFormAlert('🎉 Thank you! Your review has been submitted successfully.', false);

            setTimeout(() => {
                renderAllReviewComponents(phoneId);
            }, 800);
        });
    }

    /* ======================================================================
       6. Render Reviews List
       ====================================================================== */
    function renderReviewsList(phoneId) {
        const listEl = document.getElementById('revListContainer');
        if (!listEl) return;

        const reviews = getReviewsForPhone(phoneId);

        if (reviews.length === 0) {
            listEl.innerHTML = `
                <div class="rev-empty-state">
                    <i class="fa-regular fa-comments rev-empty-icon"></i>
                    <h3>No Reviews Yet</h3>
                    <p>Be the first customer to review this smartphone!</p>
                </div>
            `;
            return;
        }

        let html = '<div class="rev-cards-grid">';
        reviews.forEach(r => {
            const initial = (r.userName || 'U').charAt(0).toUpperCase();
            const dateStr = formatDate(r.createdAt);

            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= r.rating) starsHtml += `<i class="fa-solid fa-star"></i>`;
                else starsHtml += `<i class="fa-regular fa-star empty"></i>`;
            }

            html += `
                <div class="rev-card anim-reveal">
                    <div class="rev-card-header">
                        <div class="rev-user-info">
                            <div class="user-avatar-circle">${initial}</div>
                            <div>
                                <h4 class="rev-user-name">${escapeHtml(r.userName)}</h4>
                                <span class="rev-verified-tag"><i class="fa-solid fa-circle-check"></i> Verified User</span>
                            </div>
                        </div>
                        <span class="rev-date">${dateStr}</span>
                    </div>

                    <div class="rev-card-rating">
                        <div class="rev-stars">${starsHtml}</div>
                        <span class="rev-rating-badge">${r.rating}.0 / 5</span>
                    </div>

                    <h5 class="rev-title">${escapeHtml(r.title)}</h5>
                    <p class="rev-comment">${escapeHtml(r.comment)}</p>
                </div>
            `;
        });
        html += '</div>';

        listEl.innerHTML = html;
    }

    function formatDate(isoStr) {
        if (!isoStr) return 'Recently';
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return 'Recently';
        }
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ======================================================================
       7. Initialize on DOM Content Loaded
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', initReviewsSection);

    // Global Public API
    window.techboxReviews = {
        getReviews: getReviewsForPhone,
        addReview: addReview,
        refresh: initReviewsSection
    };

})();
