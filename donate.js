/**
 * Donation Form Handler
 * Manages food donation posting with backend integration
 */

document.addEventListener('DOMContentLoaded', function() {
    const foodImageInput = document.getElementById('foodImage');
    const fileNameDisplay = document.getElementById('fileName');
    const donateForm = document.getElementById('donateForm');
    const getCurrentLocationBtn = document.getElementById('getCurrentLocationBtn');
    const locationStatus = document.getElementById('locationStatus');

    // Display file name when selected
    foodImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileNameDisplay.textContent = `Selected: ${this.files[0].name}`;
        }
    });

    // Get current location
    getCurrentLocationBtn.addEventListener('click', function(e) {
        e.preventDefault();

        if (!navigator.geolocation) {
            showLocationStatus('Geolocation is not supported by your browser', 'error');
            return;
        }

        getCurrentLocationBtn.disabled = true;
        showLocationStatus('Getting your location...', 'loading');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getAddressFromCoordinates(latitude, longitude);
            },
            (error) => {
                let errorMessage = 'Unable to get your location';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                
                showLocationStatus(errorMessage, 'error');
                getCurrentLocationBtn.disabled = false;
            }
        );
    });

    // Reverse geocoding: Convert coordinates to address
    function getAddressFromCoordinates(latitude, longitude) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const address = data.address;
                
                // Extract relevant information
                const street = address.road || address.street || '';
                const houseNumber = address.house_number || '';
                const city = address.city || address.town || address.village || '';
                const postcode = address.postcode || '';
                const displayAddress = `${houseNumber} ${street}`.trim() || 'Current Location';

                // Fill in the form fields
                document.getElementById('address').value = displayAddress;
                document.getElementById('city').value = city;
                document.getElementById('pincode').value = postcode;

                // Store coordinates for later use
                document.getElementById('address').dataset.latitude = latitude;
                document.getElementById('address').dataset.longitude = longitude;

                showLocationStatus(`✓ Location found: ${city}`, 'success');
                getCurrentLocationBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                showLocationStatus('Could not fetch address details. Please enter manually.', 'error');
                
                // Still fill in at least the coordinates as reference
                document.getElementById('address').value = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
                document.getElementById('address').dataset.latitude = latitude;
                document.getElementById('address').dataset.longitude = longitude;
                
                getCurrentLocationBtn.disabled = false;
            });
    }

    // Show status message
    function showLocationStatus(message, type) {
        locationStatus.textContent = message;
        locationStatus.className = `location-status ${type}`;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                locationStatus.className = 'location-status';
            }, 3000);
        }
    }

    // Handle form submission
    donateForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check authentication
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            APIUtils.showErrorMessage('Please login to post a donation');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return;
        }

        // Collect form data
        const foodName = document.getElementById('foodName').value.trim();
        const quantity = document.getElementById('quantity').value;
        const unit = document.getElementById('unit').value;
        const vegetarian = document.querySelector('input[name="vegetarian"]:checked')?.value;
        const expiryDate = document.getElementById('expiryDate').value;
        const expiryTime = document.getElementById('expiryTime').value;
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const pincode = document.getElementById('pincode').value.trim();
        const landmark = document.getElementById('landmark').value.trim();
        const description = document.getElementById('description').value.trim();
        const contactPhone = document.getElementById('contactPhone').value.trim();
        const foodImage = foodImageInput.files[0];

        // Get selected categories
        const selectedCategories = Array.from(
            document.querySelectorAll('input[name="category"]:checked')
        ).map(checkbox => checkbox.id.replace('tag-', ''));

        // Validation
        if (!foodName) {
            APIUtils.showErrorMessage('Please enter food name');
            return;
        }

        if (!quantity || quantity <= 0) {
            APIUtils.showErrorMessage('Please enter valid quantity');
            return;
        }

        if (!unit) {
            APIUtils.showErrorMessage('Please select a unit');
            return;
        }

        if (!vegetarian) {
            APIUtils.showErrorMessage('Please select vegetarian/non-vegetarian');
            return;
        }

        if (selectedCategories.length === 0) {
            APIUtils.showErrorMessage('Please select at least one food category');
            return;
        }

        if (!expiryDate || !expiryTime) {
            APIUtils.showErrorMessage('Please enter expiry date and time');
            return;
        }

        if (!address) {
            APIUtils.showErrorMessage('Please enter pickup address');
            return;
        }

        if (!city) {
            APIUtils.showErrorMessage('Please enter city');
            return;
        }

        if (!pincode) {
            APIUtils.showErrorMessage('Please enter pin code');
            return;
        }

        if (!contactPhone) {
            APIUtils.showErrorMessage('Please enter contact phone number');
            return;
        }

        if (!foodImage) {
            APIUtils.showErrorMessage('Please upload a food image');
            return;
        }

        // Get coordinates if available
        const latitude = document.getElementById('address').dataset.latitude || null;
        const longitude = document.getElementById('address').dataset.longitude || null;

        // Show loading state
        const submitBtn = donateForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting Donation...';
        submitBtn.disabled = true;

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('foodName', foodName);
            formData.append('quantity', quantity);
            formData.append('unit', unit);
            formData.append('vegetarian', vegetarian === 'yes');
            formData.append('categories', JSON.stringify(selectedCategories));
            formData.append('expiryDate', expiryDate);
            formData.append('expiryTime', expiryTime);
            formData.append('address', address);
            formData.append('city', city);
            formData.append('pincode', pincode);
            formData.append('landmark', landmark);
            formData.append('description', description);
            formData.append('contactPhone', contactPhone);
            if (latitude) formData.append('latitude', latitude);
            if (longitude) formData.append('longitude', longitude);
            formData.append('foodImage', foodImage);

            // Send to backend with authentication
            const response = await fetch(`${APIUtils.BASE_URL}/donations/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                APIUtils.showSuccessMessage('Donation posted successfully! Nearby NGOs have been notified.');
                
                // Reset form
                donateForm.reset();
                fileNameDisplay.textContent = '';
                locationStatus.className = 'location-status';
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                APIUtils.showErrorMessage(result.error || 'Failed to post donation. Please try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Donation submission error:', error);
            APIUtils.showErrorMessage('An error occurred while posting the donation. Please try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});
