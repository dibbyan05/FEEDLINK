/**
 * Find NGO Handler
 * Handles loading and displaying registered NGOs
 */

let allNGOs = [];

document.addEventListener('DOMContentLoaded', function() {
    loadRegisteredNGOs();
    setupFilters();
});

/**
 * Load registered NGOs from API
 */
async function loadRegisteredNGOs() {
    try {
        const response = await APIUtils.get('/ngos/all');

        if (response.success && response.data) {
            allNGOs = response.data;
            displayNGOs(allNGOs);
        } else {
            showEmptyState('Failed to load NGOs. Please try again later.');
        }
    } catch (error) {
        console.error('Error loading NGOs:', error);
        showEmptyState('Error loading NGOs. Please try again later.');
    }
}

/**
 * Display NGOs in grid
 */
function displayNGOs(ngos) {
    const ngoGrid = document.getElementById('ngoGrid');
    const loadingState = document.getElementById('ngoLoadingState');
    const emptyState = document.getElementById('ngoEmptyState');

    // Hide loading state
    if (loadingState) loadingState.style.display = 'none';

    if (!ngos || ngos.length === 0) {
        showEmptyState('No NGOs found');
        return;
    }

    // Clear grid
    ngoGrid.innerHTML = '';

    // Create and append NGO cards
    ngos.forEach(ngo => {
        const card = createNGOCard(ngo);
        ngoGrid.appendChild(card);
    });

    // Show grid, hide empty state
    ngoGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
}

/**
 * Create NGO card element
 */
function createNGOCard(ngo) {
    const card = document.createElement('div');
    card.className = 'ngo-card';

    const rating = ngo.rating || 0;
    const stars = generateStars(rating);

    card.innerHTML = `
        <div class="ngo-card-header">
            <h3>${escapeHtml(ngo.name)}</h3>
            <div class="ngo-category">${escapeHtml(ngo.category || 'NGO')}</div>
        </div>

        <div class="ngo-card-details">
            <p class="ngo-location">
                <i class="fas fa-map-marker-alt"></i> ${escapeHtml(ngo.city || 'Location not specified')}
            </p>
            <p class="ngo-email">
                <i class="fas fa-envelope"></i> ${escapeHtml(ngo.email || 'N/A')}
            </p>
            <p class="ngo-phone">
                <i class="fas fa-phone"></i> ${escapeHtml(ngo.phone || 'N/A')}
            </p>
            ${ngo.description ? `<p class="ngo-description">${escapeHtml(ngo.description.substring(0, 100))}${ngo.description.length > 100 ? '...' : ''}</p>` : ''}
        </div>

        <div class="ngo-card-rating">
            <div class="stars">${stars}</div>
            <span class="rating-text">${rating.toFixed(1)}/5.0</span>
        </div>

        <div class="ngo-card-stats">
            <div class="stat">
                <span class="stat-value">${ngo.mealsDistributed || 0}</span>
                <span class="stat-label">Meals Distributed</span>
            </div>
            <div class="stat">
                <span class="stat-value">${ngo.donationsReceived || 0}</span>
                <span class="stat-label">Donations</span>
            </div>
        </div>

        <button class="ngo-contact-btn" onclick="contactNGO('${ngo.id}', '${escapeHtml(ngo.name)}')">
            <i class="fas fa-handshake"></i> Contact NGO
        </button>
    `;

    return card;
}

/**
 * Generate star rating HTML
 */
function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    return starsHTML;
}

/**
 * Setup filters
 */
function setupFilters() {
    const searchInput = document.getElementById('ngoSearchInput');
    const categoryFilter = document.getElementById('ngoFilterCategory');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
}

/**
 * Apply filters and search
 */
function applyFilters() {
    const searchTerm = document.getElementById('ngoSearchInput').value.toLowerCase();
    const category = document.getElementById('ngoFilterCategory').value;

    const filtered = allNGOs.filter(ngo => {
        const matchesSearch = !searchTerm || 
            ngo.name.toLowerCase().includes(searchTerm) ||
            (ngo.city && ngo.city.toLowerCase().includes(searchTerm)) ||
            (ngo.description && ngo.description.toLowerCase().includes(searchTerm));

        const matchesCategory = !category || ngo.category === category;

        return matchesSearch && matchesCategory;
    });

    displayNGOs(filtered);
}

/**
 * Show empty state
 */
function showEmptyState(message = 'No NGOs found') {
    const ngoGrid = document.getElementById('ngoGrid');
    const loadingState = document.getElementById('ngoLoadingState');
    const emptyState = document.getElementById('ngoEmptyState');

    if (ngoGrid) ngoGrid.style.display = 'none';
    if (loadingState) loadingState.style.display = 'none';
    if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.querySelector('p').textContent = message;
    }
}

/**
 * Contact NGO
 */
function contactNGO(ngoId, ngoName) {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        APIUtils.showErrorMessage('Please log in to contact NGOs');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Show contact options
    const message = `Contact form for ${ngoName} would open here or redirect to messaging page`;
    APIUtils.showSuccessMessage(`Connecting you with ${ngoName}...`);
    
    // TODO: Implement contact form or messaging system
    console.log(`Contact NGO: ${ngoId} - ${ngoName}`);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
