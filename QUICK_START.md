# Quick Start: Emergency System on XAMPP

## Step 1: Copy Frontend Files to XAMPP (Windows PowerShell)

```powershell
# Create directory for your project
$xamppPath = "C:\xampp\htdocs\emergency-system"
New-Item -ItemType Directory -Path $xamppPath -Force

# Copy your files
$sourceDir = "C:\Users\Administrator\Desktop\my checkin\emergency report system"
Copy-Item "$sourceDir\Index.html" -Destination $xamppPath -Force
Copy-Item "$sourceDir\script.js" -Destination $xamppPath -Force
Copy-Item "$sourceDir\style.css" -Destination $xamppPath -Force
```

### Verify Files:
```powershell
Get-ChildItem -Path "C:\xampp\htdocs\emergency-system"
```

You should see:
```
Index.html
script.js
style.css
```

---

## Step 2: Start Apache in XAMPP

1. Open **XAMPP Control Panel**
2. Look for **Apache** module
3. Click the **Start** button
4. You should see a green checkmark
5. Check browser: `http://localhost` should show XAMPP dashboard

---

## Step 3: Start Django Backend (Separate Terminal)

**Open a NEW PowerShell window** and run:

```powershell
# Navigate to your project
cd "C:\Users\Administrator\Desktop\my checkin\emergency report system"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run Django server
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

---

## Step 4: Access Your System

| What | URL |
|------|-----|
| **Frontend** | `http://localhost/emergency-system/` |
| **Django API** | `http://localhost:8000/api/health/` |
| **Admin Panel** | `http://localhost:8000/admin/` |

---

## Testing Complete Flow

1. **Open browser**: `http://localhost/emergency-system/`
2. **You should see**:
   - ⏰ Live clock ticking
   - Report form with incident type dropdown
3. **Fill form**:
   - Select incident: Accident/Fire/Flood
   - Add description
   - Click "📍 Get Location" (grant permission)
4. **Submit Report**
5. **Check console** (both browser and Django terminal) for notifications

---

## Troubleshooting

### Apache won't start?
```powershell
# Check if port 80 is already in use
netstat -ano | findstr :80

# If something is using it, kill that process
taskkill /PID <PID> /F
```

### Can't access `http://localhost/emergency-system/`?
- ✓ Verify Apache is running (green light in XAMPP)
- ✓ Verify files are in `C:\xampp\htdocs\emergency-system\`
- ✓ Refresh browser (Ctrl+F5)

### Backend shows "Connection error"?
- ✓ Django must be running in separate terminal
- ✓ Check django terminal shows `http://127.0.0.1:8000/`
- ✓ Verify URL in script.js: `http://localhost:8000/api/submit-report/`

### No emails sending?
- ✓ Check `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD`
- ✓ For Gmail: Use App Password (not regular password)
- ✓ Check spam folder

---

## Keep Running (Both Needed)

| Service | Terminal | Port | Status |
|---------|----------|------|--------|
| Apache (XAMPP) | XAMPP Control Panel | 80 | 🟢 Start|
| Django Backend | PowerShell #2 | 8000 | 🟢 Running |

**Both must be running for system to work!**

---

## If Using Node.js Instead

If you prefer Node.js backend (instead of Django):

1. Update script.js URL to: `http://localhost:5000/submit-report`
2. In PowerShell:
```powershell
cd "C:\Users\Administrator\Desktop\my checkin\emergency report system"
npm install
npm start
```

Backend runs on port 5000 instead of 8000.

---

## Summary

```
✓ Install XAMPP ← You're here
✓ Copy files to C:\xampp\htdocs\emergency-system\
✓ Start Apache (XAMPP Control Panel)
✓ Start Django (PowerShell terminal)
✓ Open http://localhost/emergency-system/ in browser
✓ Test system by submitting report
```

**That's it! Your emergency system is live!** 🚀
