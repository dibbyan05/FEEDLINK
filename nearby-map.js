// Nearby NGOs and Donors Interactive Map
let nearbyMap = null;
let userMarker = null;
let ngoMarkers = [];
let donorMarkers = [];
let searchRadius = 5; // km
const SEARCH_RADIUS_KM = 5;

// Initialize the map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeNearbyMap();
    setupLocationButton();
});

// Initialize the map
function initializeNearbyMap() {
    const mapElement = document.getElementById('nearbyMap');
    if (!mapElement) return;

    // Default to center of India (you can change this)
    const defaultCenter = { lat: 28.7041, lng: 77.1025 };

    nearbyMap = new google.maps.Map(mapElement, {
        zoom: 13,
        center: defaultCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
    });
}

// Setup location button
function setupLocationButton() {
    const loadBtn = document.getElementById('loadLocationBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', getUserLocationAndFetchNearby);
    }
}

// Get user location and fetch nearby NGOs/Donors
function getUserLocationAndFetchNearby() {
    const loadBtn = document.getElementById('loadLocationBtn');
    
    if (!navigator.geolocation) {
        APIUtils.showErrorMessage('Geolocation is not supported by your browser');
        return;
    }

    // Show loading state
    const originalText = loadBtn.innerHTML;
    loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    loadBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Center map on user location
            nearbyMap.setCenter(userLocation);
            nearbyMap.setZoom(13);

            // Add user marker
            addUserMarker(userLocation);

            // Fetch nearby NGOs and donors from API
            fetchNearbyLocations(userLocation);

            // Reset button
            loadBtn.innerHTML = originalText;
            loadBtn.disabled = false;
        },
        function(error) {
            let errorMsg = 'Unable to get your location';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information is unavailable';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timed out';
                    break;
            }
            APIUtils.showErrorMessage(errorMsg);
            loadBtn.innerHTML = originalText;
            loadBtn.disabled = false;
        }
    );
}

// Add user marker to map
function addUserMarker(location) {
    // Remove existing user marker
    if (userMarker) {
        userMarker.setMap(null);
    }

    userMarker = new google.maps.Marker({
        position: location,
        map: nearbyMap,
        title: 'Your Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: '<div style="text-align: center;"><strong>Your Location</strong><br>This is where you are</div>'
    });

    userMarker.addListener('click', function() {
        infoWindow.open(nearbyMap, userMarker);
    });
}

// Fetch nearby NGOs and Donors from API
async function fetchNearbyLocations(userLocation) {
    try {
        // Show loading state
        document.getElementById('ngoCount').textContent = '...';
        document.getElementById('donorCount').textContent = '...';

        // API call to get nearby NGOs
        const ngoResponse = await APIUtils.getNearbyNGOs({
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            radiusKm: SEARCH_RADIUS_KM
        });

        // API call to get nearby Donors
        const donorResponse = await APIUtils.getNearbyDonors({
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            radiusKm: SEARCH_RADIUS_KM
        });

        // Add markers for NGOs
        if (ngoResponse.success && ngoResponse.data) {
            addNGOMarkers(ngoResponse.data, userLocation);
        }

        // Add markers for Donors
        if (donorResponse.success && donorResponse.data) {
            addDonorMarkers(donorResponse.data, userLocation);
        }

        // Update counts
        document.getElementById('ngoCount').textContent = (ngoResponse.data?.length || 0);
        document.getElementById('donorCount').textContent = (donorResponse.data?.length || 0);

        // Adjust map bounds to show all markers
        fitMapToBounds();

    } catch (error) {
        console.error('Error fetching nearby locations:', error);
        APIUtils.showErrorMessage('Failed to load nearby locations');
        document.getElementById('ngoCount').textContent = '0';
        document.getElementById('donorCount').textContent = '0';
    }
}

// Add NGO markers to map
function addNGOMarkers(ngos, userLocation) {
    // Clear existing markers
    ngoMarkers.forEach(marker => marker.setMap(null));
    ngoMarkers = [];

    ngos.forEach(ngo => {
        const marker = new google.maps.Marker({
            position: { lat: ngo.latitude, lng: ngo.longitude },
            map: nearbyMap,
            title: ngo.name,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });

        // Calculate distance
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            ngo.latitude, ngo.longitude
        );

        // Info window content
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="font-family: Arial; width: 250px;">
                    <h3 style="margin: 5px 0; color: #d32f2f;">${ngo.name}</h3>
                    <p style="margin: 5px 0; font-size: 0.9em;"><strong>${ngo.category || 'NGO'}</strong></p>
                    <p style="margin: 5px 0; font-size: 0.85em;"><i class="fas fa-map-marker-alt"></i> ${distance.toFixed(1)} km away</p>
                    <p style="margin: 5px 0; font-size: 0.85em; color: #666;">${ngo.city || 'City'}</p>
                    <p style="margin: 5px 0; font-size: 0.85em;"><strong>Phone:</strong> ${ngo.phone || 'N/A'}</p>
                    <button style="margin-top: 8px; padding: 5px 10px; background-color: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                        View Details
                    </button>
                </div>
            `
        });

        marker.addListener('click', function() {
            // Close all other info windows
            closeAllInfoWindows();
            infoWindow.open(nearbyMap, marker);
        });

        ngoMarkers.push(marker);
    });
}

// Add Donor markers to map
function addDonorMarkers(donors, userLocation) {
    // Clear existing markers
    donorMarkers.forEach(marker => marker.setMap(null));
    donorMarkers = [];

    donors.forEach(donor => {
        const marker = new google.maps.Marker({
            position: { lat: donor.latitude, lng: donor.longitude },
            map: nearbyMap,
            title: donor.name,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });

        // Calculate distance
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            donor.latitude, donor.longitude
        );

        // Info window content
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="font-family: Arial; width: 250px;">
                    <h3 style="margin: 5px 0; color: #388e3c;">${donor.name}</h3>
                    <p style="margin: 5px 0; font-size: 0.9em;"><strong>Donor</strong></p>
                    <p style="margin: 5px 0; font-size: 0.85em;"><i class="fas fa-map-marker-alt"></i> ${distance.toFixed(1)} km away</p>
                    <p style="margin: 5px 0; font-size: 0.85em; color: #666;">${donor.city || 'City'}</p>
                    <p style="margin: 5px 0; font-size: 0.85em;"><strong>Phone:</strong> ${donor.phone || 'N/A'}</p>
                    <button style="margin-top: 8px; padding: 5px 10px; background-color: #388e3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                        Contact
                    </button>
                </div>
            `
        });

        marker.addListener('click', function() {
            // Close all other info windows
            closeAllInfoWindows();
            infoWindow.open(nearbyMap, marker);
        });

        donorMarkers.push(marker);
    });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Fit map to show all markers
function fitMapToBounds() {
    const bounds = new google.maps.LatLngBounds();

    // Include user marker
    if (userMarker) {
        bounds.extend(userMarker.getPosition());
    }

    // Include NGO markers
    ngoMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
    });

    // Include Donor markers
    donorMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
    });

    // If there are markers, fit bounds
    if (ngoMarkers.length > 0 || donorMarkers.length > 0) {
        nearbyMap.fitBounds(bounds, 50);
    }
}

// Close all info windows
function closeAllInfoWindows() {
    // Note: We'll need to track info windows if we want to close them
    // For now, the google maps API handles this automatically
}
