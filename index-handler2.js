/**
 * Index Page - Dynamic Content Handler
 * Manages food listings and statistics updates
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Load featured donations and statistics
    await loadFeaturedDonations();
    await loadDashboardStatistics();
    
    // Set up periodic refresh (every 30 seconds)
    setInterval(loadFeaturedDonations, 30000);
    setInterval(loadDashboardStatistics, 30000);
});

/**
 * Load featured food donations from backend
 */
async function loadFeaturedDonations() {
    const foodGrid = document.querySelector('.food-grid');
    if (!foodGrid) return;

    // Show loading state
    const originalContent = foodGrid.innerHTML;
    foodGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; color: var(--primary-color);"></i>
            <p style="margin-top: 10px; color: var(--text-light);">Loading food donations...</p>
        </div>
    `;

    const result = await APIUtils.getFeaturedDonations();

    if (!result.success) {
        console.error('Failed to load donations:', result.error);
        foodGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 30px; color: #ff9800;"></i>
                <p style="margin-top: 10px; color: var(--text-light);">Unable to load donations. Please refresh the page.</p>
            </div>
        `;
        return;
    }

    let donations = result.data?.donations || [];

    // Filter out expired donations
    donations = donations.filter(donation => !isExpired(donation.expiresAt));

    if (donations.length === 0) {
        foodGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-inbox" style="font-size: 30px; color: var(--primary-light);"></i>
                <p style="margin-top: 10px; color: var(--text-light);">No food donations available at the moment.</p>
            </div>
        `;
        return;
    }

    // Render food cards
    foodGrid.innerHTML = donations.slice(0, 3).map(donation => createFoodCard(donation)).join('');

    // Add event listeners to request buttons
    document.querySelectorAll('.request-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const donationId = this.dataset.donationId;
            handleRequestPickup(donationId);
        });
    });
}

/**
 * Create food card HTML
 */
function createFoodCard(donation) {
    const urgencyClass = getUrgencyBadge(donation.expiryTime);
    const imageUrl = donation.imageUrl || 'https://via.placeholder.com/300x200?text=Food+Donation';
    const expiryDate = new Date(donation.expiresAt);
    const timeRemaining = getTimeRemaining(donation.expiresAt);
    
    return `
        <div class="food-card">
            <div class="food-badge">${urgencyClass.text}</div>
            <img src="${imageUrl}" alt="${donation.foodName}" onerror="this.src='https://via.placeholder.com/300x200?text=Food+Donation'">
            <div class="food-info">
                <h3>${escapeHtml(donation.foodName)}</h3>
                <div class="food-meta">
                    <p><i class="fas fa-box"></i> ${donation.quantity} ${donation.unit}</p>
                    <p><i class="fas fa-clock"></i> ${timeRemaining}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(donation.city)}</p>
                </div>
                <div class="food-tags">
                    ${donation.vegetarian ? '<span class="tag">🥬 Vegetarian</span>' : '<span class="tag">🍗 Non-Veg</span>'}
                    ${donation.categories.map(cat => `<span class="tag">${formatCategory(cat)}</span>`).join('')}
                </div>
                <button class="request-btn" data-donation-id="${donation.id}">
                    <i class="fas fa-check-circle"></i> Request Pickup
                </button>
            </div>
        </div>
    `;
}

/**
 * Check if a donation is expired
 */
function isExpired(expiryTime) {
    const now = new Date();
    const expiry = new Date(expiryTime);
    return expiry <= now;
}

/**
 * Get urgency badge based on expiry time
 */
function getUrgencyBadge(expiryTime) {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffMinutes = (expiry - now) / (1000 * 60);

    if (diffMinutes < 60) {
        return { text: 'URGENT', class: 'urgent' };
    } else if (diffMinutes < 240) {
        return { text: 'HOT', class: 'hot' };
    }
    return { text: 'AVAILABLE', class: 'available' };
}

/**
 * Calculate time remaining until expiry
 */
function getTimeRemaining(expiryTime) {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffMs = expiry - now;
    
    if (diffMs < 0) return 'EXPIRED';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `Expires in ${hours}h ${minutes}m`;
    }
    return `Expires in ${minutes}m`;
}

/**
 * Format category display
 */
function formatCategory(category) {
    const categoryMap = {
        'cooked': '🍳 Cooked',
        'raw': '🥕 Raw/Fresh',
        'packaged': '📦 Packaged',
        'baked': '🥐 Baked',
        'dairy': '🥛 Dairy',
        'beverages': '☕ Beverages',
    };
    return categoryMap[category] || category;
}

/**
 * Handle pickup request
 */
async function handleRequestPickup(donationId) {
    if (!confirm('Are you sure you want to request this food donation?')) {
        return;
    }

    const result = await APIUtils.requestPickup(donationId);

    if (result.success) {
        APIUtils.showSuccessMessage('Pickup request sent successfully!');
        // Reload donations to reflect change
        await loadFeaturedDonations();
    } else {
        APIUtils.showErrorMessage('Failed to request pickup. Please try again.');
    }
}

/**
 * Load dashboard statistics in real-time
 */
async function loadDashboardStatistics() {
    const result = await APIUtils.getDashboardStatistics();

    if (!result.success) {
        console.error('Failed to load statistics:', result.error);
        return;
    }

    const stats = result.data?.statistics || {};

    // Update stats in hero section
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 3) {
        updateStatItem(statItems[0], stats.mealDistributed || 0, 'Meals Distributed');
        updateStatItem(statItems[1], stats.activeNGOs || 0, 'Active NGOs');
        updateStatItem(statItems[2], stats.activeDonors || 0, 'Donors');
    }
}

/**
 * Update individual stat item
 */
function updateStatItem(element, value, label) {
    const h4 = element.querySelector('h4');
    const p = element.querySelector('p');

    if (h4) {
        // Format large numbers
        const formatted = formatLargeNumber(value);
        h4.textContent = formatted;
    }
    if (p) {
        p.textContent = label;
    }
}

/**
 * Format large numbers (10000 -> 10,000+)
 */
function formatLargeNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
        return Math.floor(num / 1000) + 'K+';
    }
    return num + '+';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

async function claimFood(donationId) {
    const user = APIUtils.getUserData();
    
    // 1. Authorization Check
    if (!user || user.role !== 'ngo') {
        APIUtils.showErrorMessage("Only registered NGOs can claim food donations.");
        return;
    }

    // 2. Visual Loading State
    const btn = document.querySelector(`[data-id="${donationId}"] .claim-btn`);
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        // 3. API Call
        const response = await APIUtils.post(
            API_CONFIG.ENDPOINTS.DONATIONS.REQUEST_PICKUP.replace('{id}', donationId)
        );

        if (response.success) {
            APIUtils.showSuccessMessage("Food claimed! Check your 'My Requests' for pickup details.");
            // 4. Update UI immediately
            loadFeaturedDonations(); 
        }
    } catch (error) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        APIUtils.showErrorMessage("Failed to claim food. It might have just been taken.");
    }
}
