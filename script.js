let userLocation = { lat: null, lon: null };

// DOM Elements
const previewType = document.getElementById("previewType");
const previewDescription = document.getElementById("previewDescription");
const previewLocation = document.getElementById("previewLocation");
const locationStatus = document.getElementById("location");
const currentTimeElement = document.getElementById("current-time");
const reportForm = document.getElementById("reportForm");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const navLinks = document.querySelectorAll(".nav-link");

// Update live time display
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    if (currentTimeElement) {
        currentTimeElement.innerText = `⏰ ${timeString}`;
    }
}

// Update form preview with current inputs
function updatePreview() {
    if (previewType) previewType.textContent = typeInput.value || 'Accident';
    if (previewDescription) {
        const descText = descriptionInput.value.trim() || 'Enter description...';
        previewDescription.textContent = descText.length > 50 ? descText.substring(0, 50) + '...' : descText;
    }
    if (previewLocation) {
        previewLocation.textContent = userLocation.lat && userLocation.lon
            ? `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`
            : 'Waiting for GPS...';
    }
}

// Set location message with styling
function setLocationMessage(message, color = '#cbd5e1') {
    if (locationStatus) {
        locationStatus.innerText = message;
        locationStatus.style.color = color;
    }
}

// Initialize time and preview updates
setInterval(updateCurrentTime, 1000);
updateCurrentTime();
updatePreview();

// Geolocation handler
function getLocation() {
    setLocationMessage('📍 Detecting location... ⏳', '#fbbf24');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation.lat = position.coords.latitude;
                userLocation.lon = position.coords.longitude;

                const locationText = `✅ Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`;
                setLocationMessage(locationText, '#22c55e');
                updatePreview();
            },
            error => {
                setLocationMessage('❌ Unable to get location. Please enable location access.', '#ef4444');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        setLocationMessage('❌ Geolocation not supported by your browser.', '#ef4444');
    }
}

// Distance calculation (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Live preview updates
if (typeInput) {
    typeInput.addEventListener('change', updatePreview);
    typeInput.addEventListener('input', updatePreview);
}

if (descriptionInput) {
    descriptionInput.addEventListener('input', updatePreview);
}

// Form submission handler
if (reportForm) {
    reportForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const type = typeInput.value;
        const description = descriptionInput.value.trim();
        const submitBtn = e.target.querySelector("button[type='submit']");

        // Validation
        if (!type) {
            alert("⚠️ Please select an incident type!");
            typeInput.focus();
            return;
        }

        if (!description) {
            alert("⚠️ Please describe the emergency!");
            descriptionInput.focus();
            return;
        }

        if (!userLocation.lat || !userLocation.lon) {
            alert("⚠️ Please get your location first!");
            return;
        }

        // Create timestamp
        const submissionTime = new Date();
        const formattedTime = submissionTime.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Update button to loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "🚨 Sending Alert...";
        }

        try {
            const response = await fetch("http://localhost:8000/api/submit-report/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: type,
                    description: description,
                    latitude: userLocation.lat,
                    longitude: userLocation.lon,
                    timestamp: submissionTime.toISOString(),
                    submitted_at: formattedTime,
                    media: document.getElementById("media").value
                })
            });

            if (response.ok) {
                const data = await response.json();
                const notifiedTeams = data.notified && data.notified.length > 0
                    ? data.notified.join("\n")
                    : "Alert teams in your area";

                alert(
                    `✅ EMERGENCY REPORT SUBMITTED!\n\n` +
                    `⏰ Time: ${formattedTime}\n` +
                    `🚨 Type: ${type}\n` +
                    `📍 Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}\n\n` +
                    `📧 Notified Teams:\n${notifiedTeams}`
                );

                // Reset form
                reportForm.reset();
                userLocation = { lat: null, lon: null };
                setLocationMessage('📍 Location: Not acquired yet', '#cbd5e1');
                updatePreview();
            } else {
                const result = await response.json().catch(() => ({}));
                alert(`❌ Error submitting report.\n${result.error || 'Please try again.'}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Connection error. Make sure backend server is running at http://localhost:8000");
        } finally {
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "🚨 Submit Report";
            }
        }
    });
}

// Navigation link smooth scroll and active state
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();

            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            if (this.classList.contains('nav-link')) {
                this.classList.add('active');
            }

            // Smooth scroll
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
