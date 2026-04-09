# Deploy Emergency System to Render (Cloud Hosting)

## Why Render is Easier Than XAMPP

| Feature | XAMPP | Render |
|---------|-------|--------|
| **Setup** | Complex (multiple services) | Simple (cloud-based) |
| **Maintenance** | Manual (you manage it) | Automatic (they manage it) |
| **Uptime** | Only when your computer is on | 24/7 online |
| **Accessibility** | Only on your computer | Accessible worldwide |
| **Cost** | Free but need powerful PC | Free tier available |
| **Deployment** | Copy files manually | Automatic via GitHub |

**Render = Just upload and it runs!** ✓

---

## What You'll Get

After deployment:
- **Frontend**: `https://your-app.onrender.com`
- **Backend API**: `https://your-api.onrender.com`
- **No local setup needed!**

---

## Step-by-Step Deployment to Render

### Step 1: Create GitHub Account (Free)

1. Go to: https://github.com/signup
2. Create account (email, password, username)
3. Verify email

### Step 2: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `emergency-report-system`
3. Description: "Emergency Report System with automatic rescue team notifications"
4. Click **Create repository**

### Step 3: Upload Your Files to GitHub

**Option A: Using GitHub Web Interface (Easiest)**

1. On your repo page, click **Add file** → **Upload files**
2. Drag and drop these folders/files:
   ```
   Index.html
   script.js
   style.css
   manage.py
   requirements.txt
   .env.example
   emergency_system/
   reports/
   ```
3. Click **Commit changes**

**Option B: Using PowerShell (If you know Git)**

```powershell
cd "C:\Users\Administrator\Desktop\my checkin\emergency report system"
git init
git add .
git commit -m "Initial commit: Emergency report system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/emergency-report-system.git
git push -u origin main
```

### Step 4: Deploy Frontend to Render

1. Go to: https://render.com
2. Click **Sign Up** (use GitHub account)
3. Click **New +** → **Static Site**
4. Connect your GitHub repo
5. Select: `emergency-report-system`
6. Name: `emergency-system`
7. Build command: (leave empty)
8. Publish directory: `.` (current directory)
9. Click **Create Static Site**

**Wait 2-3 minutes...**

Your frontend is live! You'll get a URL like:
```
https://emergency-system-xxxxx.onrender.com
```

### Step 5: Deploy Backend to Render

1. In Render, click **New +** → **Web Service**
2. Connect your GitHub repo
3. Name: `emergency-api`
4. Environment: `Python 3`
5. Build command:
   ```
   pip install -r requirements.txt
   python manage.py migrate
   ```
6. Start command:
   ```
   gunicorn emergency_system.wsgi:application --bind 0.0.0.0:$PORT
   ```
7. Click **Create Web Service**

**Wait 5-10 minutes...**

Your backend is live! You'll get a URL like:
```
https://emergency-api-xxxxx.onrender.com
```

### Step 6: Set Environment Variables on Render

1. On Render dashboard, go to your **emergency-api** service
2. Click **Environment** (left sidebar)
3. Add these variables:
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = your-app-password (from Gmail)
   ```
4. Click **Save**

**Backend automatically restarts with new settings!**

### Step 7: Update Frontend to Use Backend URL

On Render, go to **emergency-system** static site:

1. Click **Settings**
2. Note your frontend URL: `https://emergency-system-xxxxx.onrender.com`

Edit `script.js` and change:
```javascript
const response = await fetch("https://emergency-api-xxxxx.onrender.com/api/submit-report/", {
```

(Replace `xxxxx` with your actual Render app name)

Then push to GitHub:
```powershell
cd "C:\Users\Administrator\Desktop\my checkin\emergency report system"
git add script.js
git commit -m "Update API URL for Render deployment"
git push
```

Render automatically redeploys!

### Step 8: Test Your Live System

1. Open `https://emergency-system-xxxxx.onrender.com` in browser
2. Fill out emergency report
3. Submit
4. Check if emails are sent!

---

## Create `.env` File for Render

Update your repository with environment file:

Create `.env` in your project root:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
DEBUG=False
ALLOWED_HOSTS=emergency-api-xxxxx.onrender.com,emergency-system-xxxxx.onrender.com
```

But **DON'T commit this to GitHub!** Instead:
1. Set variables directly in Render dashboard (like Step 6)
2. Render reads from dashboard, not `.env`

---

## Complete Checklist

- [ ] Create GitHub account
- [ ] Create GitHub repository
- [ ] Upload files to GitHub
- [ ] Deploy frontend to Render
- [ ] Deploy backend to Render
- [ ] Set EMAIL_USER environment variable
- [ ] Set EMAIL_PASSWORD environment variable
- [ ] Update script.js with backend URL
- [ ] Push updated script.js to GitHub
- [ ] Test system with live URL

---

## Your Final System

```
┌─────────────────────────────────────────┐
│   Browser: Emergency Report Form        │
│  https://emergency-system-xxxxx....     │
└──────────────────┬──────────────────────┘
                   │
                   ↓ (Submit Report)
┌─────────────────────────────────────────┐
│   Django Backend on Render              │
│  https://emergency-api-xxxxx.onrender   │
│                                         │
│  - Finds nearest rescue teams          │
│  - Sends emails to rescue teams        │
│  - Stores reports in database          │
└─────────────────────────────────────────┘
                   │
                   ↓ (Sends emails)
             Police Traffic
              Fire Stations
            Flood Response Teams
```

---

## Troubleshooting on Render

### Issue: "Build failed"
- Check requirements.txt has all dependencies
- Make sure `manage.py` is in root directory

### Issue: "API not responding"
- Check Environment variables are set
- View logs in Render dashboard: **Logs** tab

### Issue: "Emails not sending"
- Verify EMAIL_USER and EMAIL_PASSWORD in Render dashboard
- Check spam folder

### View Logs
1. Go to your service on Render
2. Click **Logs** tab
3. See what's happening in real-time

---

## Cost

**Render Free Tier:**
- ✓ Frontend hosting: Free
- ✓ Backend sleeping after 15 min inactivity (spins up when needed)
- ✓ Perfect for emergency system (users wake it up)

**Upgrade to Paid:**
- $7/month for 24/7 uptime backend (optional)

---

## Next Steps After Deployment

1. **Test everything works**
2. **Update CORS in settings.py** to include Render domains
3. **Monitor logs** regularly
4. **Set up email properly** (if having issues)

---

## CORS Configuration for Render

Update `emergency_system/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://emergency-system-xxxxx.onrender.com",
    "https://emergency-api-xxxxx.onrender.com",
    "http://localhost:3000",
    "http://localhost:8000",
]
```

Push to GitHub and Render redeploys automatically!

---

## No More Local Setup! 🎉

**That's it!**
- No XAMPP to manage
- No PowerShell terminals
- No local servers to start
- Just click a button and it's live!

Visit your site: `https://your-emergency-system.onrender.com`

---

## Summary

| Step | Service | Time |
|------|---------|------|
| 1. GitHub account | GitHub | 2 min |
| 2. Upload code | GitHub | 5 min |
| 3. Deploy frontend | Render | 3 min |
| 4. Deploy backend | Render | 10 min |
| 5. Set variables | Render | 2 min |
| 6. Test | Browser | 2 min |

**Total: ~25 minutes and you're done!** ✨

---

## Support

- Render docs: https://render.com/docs
- Need help? Check Render status: https://status.render.com

Your emergency system is now **live forever!** 🚀
