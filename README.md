# 🚨 Emergency Report System with Automatic Rescue Team Notifications

## Overview
This system automatically notifies the nearest rescue teams when emergencies are reported:
- **Accidents** → Police Traffic Officers
- **Fire** → Fire Rescue Station
- **Flood** → Water Resource Management & Emergency Services

## Features
✅ Automatic geolocation capture  
✅ Distance calculation to find nearest rescue teams  
✅ Automatic email notifications  
✅ Pre-configured rescue teams database (Kenya)  
✅ Real-time incident tracking  
✅ Beautiful, responsive UI  

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Gmail account (or other email service)

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web server
- `nodemailer` - Email sending
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### Step 2: Configure Email Service

**Option A: Gmail (Recommended)**
1. Go to Google Account: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Create a `.env` file (copy from `.env.example`)
5. Update with your email:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Option B: SendGrid (Alternative)**
1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env`:
```
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=your-email@yourdomain.com
```

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
🚨 Emergency Report System Backend
🔗 Server running on http://localhost:5000
📧 Email notifications enabled
⚠️  Make sure to set EMAIL_USER and EMAIL_PASSWORD environment variables
```

### Step 4: Test the System
1. Open `Index.html` in your browser
2. Fill out the form:
   - Select incident type (Accident, Fire, Flood)
   - Add description
   - Click "Get Location" button
   - Submit report
3. Check the console for notifications sent
4. Check the configured email inbox for incoming alerts

---

## How It Works

### Frontend Flow
1. User reports emergency and grants location permission
2. User submits form with incident details
3. Frontend sends request to backend with location & description

### Backend Flow
1. Parse incident type and location
2. Query database to find rescue teams by incident type
3. Calculate distance from incident to each team
4. Sort and select 3 nearest teams
5. Send formatted HTML email to each team with:
   - Incident details
   - Exact coordinates
   - Google Maps link
   - Distance from their station

### Email Structure
Each notification includes:
- 🚨 Alert status and severity
- 📍 Precise GPS coordinates with Google Maps link
- 📝 Incident description
- 📊 Response team and distance
- ⏰ Timestamp

---

## Database Structure

### Rescue Teams Format
```javascript
{
  id: 1,
  name: "Team Name",
  email: "team@email.com",
  lat: -1.2865,      // Latitude
  lon: 36.8172,      // Longitude
  region: "Nairobi"
}
```

### Current Coverage
- **Nairobi**: Police, Fire, Water Management
- **Mombasa**: Police, Fire, Drainage
- **Kisumu**: Police, Fire, County Services

### Add More Teams
Edit `server.js` and add teams to the `rescueTeams` object:
```javascript
rescueTeams.ACCIDENT.push({
  id: 5,
  name: "Nakuru Traffic Police",
  email: "traffic.nakuru@police.go.ke",
  lat: -0.2862,
  lon: 35.8678,
  region: "Nakuru"
});
```

---

## Testing Without Email (Development)

To test without actually sending emails:

1. Comment out email sending in `server.js`:
```javascript
// await sendEmergencyNotification(team, incident);
console.log(`Would send to: ${team.email}`);
```

2. Check console logs for simulation

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `EMAIL_USER` | Gmail address | your-email@gmail.com |
| `EMAIL_PASSWORD` | App password (Gmail) | xxxx-xxxx-xxxx-xxxx |
| `PORT` | Server port | 5000 |
| `SENDGRID_API_KEY` | SendGrid API key (alternative) | SG.xxxxx |

---

## Troubleshooting

### Issue: "Connection refused" error
✓ Make sure backend server is running (`npm start`)
✓ Verify server is on http://localhost:5000

### Issue: Emails not sending
✓ Check `.env` file has correct EMAIL_USER and EMAIL_PASSWORD
✓ For Gmail: Verify App Password was generated correctly
✓ Check spam/junk folder
✓ Verify rescue team emails are real

### Issue: "Geolocation not supported"
✓ Use HTTPS (required for geolocation)
✓ Grant location permission when browser asks
✓ For localhost testing: works fine

### Issue: No rescue teams found
✓ Verify your test location is within 50km of a team
✓ Check coordinates in `server.js`
✓ Adjust `maxDistance` parameter in `findNearestTeams()`

---

## Production Deployment

### Before going live:
1. ✓ Use a real database (MongoDB/PostgreSQL) for rescue teams
2. ✓ Add authentication for team accounts
3. ✓ Use HTTPS for secure communication
4. ✓ Deploy on Heroku/AWS/Azure/DigitalOcean
5. ✓ Use environment variables for all secrets
6. ✓ Add incident logging to database
7. ✓ Set up SMS notifications as backup
8. ✓ Add status page to track response times

### Deploy to Heroku:
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-password
```

---

## API Endpoints

### POST `/submit-report`
Submit an emergency report.

**Request:**
```json
{
  "type": "Fire",
  "description": "Building on fire at...",
  "latitude": -1.2865,
  "longitude": 36.8172,
  "timestamp": "2024-04-09T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "notified": [
    "Nairobi Fire Station (2.5km away)",
    "Nairobi CBD Fire Brigade (3.1km away)"
  ],
  "teamCount": 2
}
```

### GET `/health`
Check if backend is running.

**Response:**
```json
{
  "status": "Emergency notification system is running ✓"
}
```

---

## Future Enhancements

- [ ] SMS notifications as backup
- [ ] WhatsApp alerts to rescue teams
- [ ] Real-time incident tracking map
- [ ] Multiple photo/video uploads
- [ ] Incident categorization by severity
- [ ] Response time tracking
- [ ] Team status updates (en route, arrived, etc.)
- [ ] Integration with emergency dispatch centers
- [ ] Mobile app version
- [ ] AI-powered incident classification

---

## Support & Contact

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for errors
3. Verify `.env` configuration
4. Test with simpler incidents first

---

## Developer

👨‍💻 **Kevin Kiprotich** - Software Developer  
GitHub: [@kevinkiprotichtoo](https://github.com/kevinkiprotichtoo)

---

## License
MIT License - Feel free to modify and distribute

---

**Stay Safe! 🚨 Together We Respond. Together We Save.**
