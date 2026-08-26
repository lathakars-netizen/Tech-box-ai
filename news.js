/**
 * TECH BOX AI - News Page Controller
 * Handles news rendering, category filtering, and empty states.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNewsUI();
});

function initNewsUI() {
    renderNewsCards('all');

    // Category Filter Tabs
    const filterTabs = document.querySelectorAll('#newsFilterTabs .filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Render based on category
            const category = tab.getAttribute('data-category');
            renderNewsCards(category);
        });
    });
}

function renderNewsCards(category) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    // Data Validation and Sanity Check
    const safeCategory = (typeof category === 'string' && category.trim() !== '') ? category.trim().toLowerCase() : 'all';

    // We do not have a real news source or API connected yet.
    // Instead of fabricating fake data, we display a professional empty state.
    // In the future, real news fetch logic (e.g., fetch('api/news')) would go here.
    
    let displayCat = '';
    if (safeCategory !== 'all') {
        if (safeCategory === 'ai') {
            displayCat = 'AI ';
        } else {
            displayCat = safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1) + ' ';
        }
    }
    
    grid.innerHTML = `
        <div class="search-no-results" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 4rem 1rem; text-align: center;">
            <div class="no-results-icon" style="margin-bottom: 1.5rem;">
                <i class="fa-regular fa-newspaper" style="font-size: 3rem; color: var(--text-muted, #9ca3af);"></i>
            </div>
            <h3 class="no-results-title" style="margin-bottom: 0.75rem; font-size: 1.5rem; color: var(--text-main, #f3f4f6);">No ${displayCat}news available</h3>
            <p class="no-results-msg" style="color: var(--text-muted, #9ca3af); max-width: 450px; line-height: 1.6;">
                Verified mobile industry news, technology updates, and reviews will appear here once a live news source is connected. 
                <br><br>
                Stay tuned for the latest updates on flagship launches and AI advancements!
            </p>
        </div>
    `;
}
