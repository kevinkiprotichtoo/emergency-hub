let userLocation = { lat: null, lon: null };

// Display current time
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
    const timeElement = document.getElementById("current-time");
    if (timeElement) {
        timeElement.innerText = `⏰ ${timeString}`;
    }
}

// Update time every second
setInterval(updateCurrentTime, 1000);
updateCurrentTime(); // Initial call

function getLocation() {
    const locationText = document.getElementById("location");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation.lat = position.coords.latitude;
            userLocation.lon = position.coords.longitude;

            locationText.innerText = `✓ Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`;
            locationText.style.color = "#10b981";
        }, () => {
            locationText.innerText = "❌ Unable to get location.";
            locationText.style.color = "#ef4444";
        });
    } else {
        locationText.innerText = "❌ Geolocation not supported.";
    }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Handle form submission
document.getElementById("reportForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value;
    const submitBtn = event.target.querySelector("button[type='submit']");

    // Capture exact submission time
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

    if (!userLocation.lat || !userLocation.lon) {
        alert("⚠️ Please get your location first!");
        return;
    }

    if (!description.trim()) {
        alert("⚠️ Please describe the emergency!");
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerText = "📤 Sending Alert...";

    try {
        // Send to backend to notify rescue teams and store report
        // Use this URL for Django: http://localhost:8000/api/submit-report/
        // Use this URL for Node.js: http://localhost:5000/submit-report
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
            alert(`✓ Emergency report submitted!\n\n⏰ Submitted at: ${formattedTime}\n\n📧 Notifications sent to nearest ${type} response team(s):\n${data.notified.join("\n")}`);

            // Reset form
            document.getElementById("reportForm").reset();
            document.getElementById("location").innerText = "";
            userLocation = { lat: null, lon: null };
        } else {
            alert("❌ Error submitting report. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Connection error. Make sure backend server is running.");
    }

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Report";
});