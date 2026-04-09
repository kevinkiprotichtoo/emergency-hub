const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Configure your email service (Gmail, SendGrid, etc.)
// For Gmail: Enable "Less secure app access" or use App Password
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "your-app-password"
    }
});

// Database of rescue teams in Kenya (by region/coordinates)
// In production, this should be in a real database
const rescueTeams = {
    ACCIDENT: [
        { id: 1, name: "Nairobi Traffic Police", email: "traffic.nairobi@police.go.ke", lat: -1.2865, lon: 36.8172, region: "Nairobi" },
        { id: 2, name: "Nairobi Highway Patrol", email: "highway.patrol@police.go.ke", lat: -1.3242, lon: 36.8234, region: "Nairobi" },
        { id: 3, name: "Mombasa Traffic Police", email: "traffic.mombasa@police.go.ke", lat: -4.0383, lon: 39.6682, region: "Mombasa" },
        { id: 4, name: "Kisumu Traffic Police", email: "traffic.kisumu@police.go.ke", lat: -0.1019, lon: 34.7617, region: "Kisumu" },
    ],
    FIRE: [
        { id: 1, name: "Nairobi Fire Station", email: "fire.nairobi@nfrs.go.ke", lat: -1.2865, lon: 36.8172, region: "Nairobi" },
        { id: 2, name: "Nairobi CBD Fire Brigade", email: "cbd.fire@nfrs.go.ke", lat: -1.2831, lon: 36.8244, region: "Nairobi CBD" },
        { id: 3, name: "Mombasa Fire Station", email: "fire.mombasa@nfrs.go.ke", lat: -4.0383, lon: 39.6682, region: "Mombasa" },
        { id: 4, name: "Kisumu Fire Station", email: "fire.kisumu@nfrs.go.ke", lat: -0.1019, lon: 34.7617, region: "Kisumu" },
    ],
    FLOOD: [
        { id: 1, name: "Water Resource Management Nairobi", email: "flood.response@wrma.go.ke", lat: -1.2865, lon: 36.8172, region: "Nairobi" },
        { id: 2, name: "National Disaster Operations Center", email: "ndoc@ndma.go.ke", lat: -1.2865, lon: 36.8172, region: "Nairobi" },
        { id: 3, name: "Mombasa Drainage Authority", email: "drainage.mombasa@wrma.go.ke", lat: -4.0383, lon: 39.6682, region: "Mombasa" },
        { id: 4, name: "County Emergency Services Kisumu", email: "emergency.kisumu@county.go.ke", lat: -0.1019, lon: 34.7617, region: "Kisumu" },
    ]
};

// Calculate distance between two coordinates
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

// Find nearest rescue teams
function findNearestTeams(type, lat, lon, maxDistance = 50) {
    const teams = rescueTeams[type.toUpperCase()] || [];

    const teamsWithDistance = teams.map(team => ({
        ...team,
        distance: calculateDistance(lat, lon, team.lat, team.lon)
    }));

    // Sort by distance and return teams within max distance
    return teamsWithDistance
        .filter(team => team.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3); // Send to top 3 nearest teams
}

// Send emergency notification email
async function sendEmergencyNotification(team, incident) {
    const mailOptions = {
        from: process.env.EMAIL_USER || "emergency-alert@system.com",
        to: team.email,
        subject: `🚨 EMERGENCY ALERT: ${incident.type.toUpperCase()} - IMMEDIATE RESPONSE NEEDED`,
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f8d7da; padding: 20px; border-radius: 8px; border: 2px solid #f5c6cb;">
                <h2 style="color: #721c24;">⚠️ EMERGENCY ALERT - ${incident.type.toUpperCase()}</h2>
                
                <p style="font-size: 16px;"><strong>Report Time:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
                
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>📍 Location:</strong></p>
                    <p>Latitude: ${incident.latitude.toFixed(4)}</p>
                    <p>Longitude: ${incident.longitude.toFixed(4)}</p>
                    <p><a href="https://www.google.com/maps?q=${incident.latitude},${incident.longitude}" target="_blank" style="color: #007bff; text-decoration: none;">📌 View on Google Maps</a></p>
                </div>
                
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>📝 Description:</strong></p>
                    <p>${incident.description}</p>
                </div>
                
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>📊 Response Details:</strong></p>
                    <p>Nearest Team: ${team.name}</p>
                    <p>Region: ${team.region}</p>
                    <p>Distance from incident: ${team.distance.toFixed(2)} km</p>
                </div>
                
                <p style="color: #721c24; font-weight: bold; margin-top: 20px;">Please respond immediately to this emergency location.</p>
                <p style="color: #666; font-size: 12px; margin-top: 15px;">This is an automated emergency alert. Please treat with urgency.</p>
            </div>
        `,
        text: `EMERGENCY ALERT: ${incident.type}\n\nLocation: ${incident.latitude}, ${incident.longitude}\n\nDescription: ${incident.description}\n\nPlease respond immediately.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✓ Email sent to ${team.email}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${team.email}:`, error);
        return false;
    }
}

// Main endpoint to submit emergency report
app.post("/submit-report", async (req, res) => {
    try {
        const { type, description, latitude, longitude, timestamp, media } = req.body;

        // Validate input
        if (!type || !description || latitude === null || longitude === null) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log(`\n📢 NEW EMERGENCY REPORT: ${type.toUpperCase()}`);
        console.log(`📍 Location: ${latitude}, ${longitude}`);
        console.log(`📝 Description: ${description}`);

        // Find nearest rescue teams
        const nearestTeams = findNearestTeams(type, latitude, longitude);

        if (nearestTeams.length === 0) {
            console.warn("⚠️ No rescue teams found nearby");
            return res.status(400).json({
                error: "No rescue teams found in your area",
                notified: []
            });
        }

        // Send notifications to all nearest teams
        const incident = { type, description, latitude, longitude, timestamp };
        const notificationPromises = nearestTeams.map(team =>
            sendEmergencyNotification(team, incident)
        );

        await Promise.all(notificationPromises);

        // Return success response
        const notifiedTeams = nearestTeams.map(t =>
            `${t.name} (${t.distance.toFixed(1)}km away)`
        );

        console.log(`✓ Notifications sent to: ${notifiedTeams.join(", ")}`);

        res.json({
            success: true,
            message: "Emergency report submitted and notifications sent",
            notified: notifiedTeams,
            teamCount: nearestTeams.length
        });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "Emergency notification system is running ✓" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚨 Emergency Report System Backend`);
    console.log(`🔗 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email notifications enabled (${process.env.EMAIL_USER || "configure your email"})`);
    console.log(`⚠️  Make sure to set EMAIL_USER and EMAIL_PASSWORD environment variables\n`);
});
