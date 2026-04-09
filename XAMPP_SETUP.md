# Hosting Emergency System with XAMPP

## Overview
XAMPP provides Apache, MySQL, PHP, and Perl. You can use it to:
- ✓ Host static files (HTML, CSS, JavaScript) via Apache
- ✓ Run Python/Django via Apache (with config)
- ✓ Run separate backend servers alongside XAMPP

## Recommended Setup

**Option 1: XAMPP for Frontend + Django Backend (EASIEST)**
- XAMPP serves HTML/CSS/JS files
- Django runs separately (port 8000)
- Best flexibility

**Option 2: XAMPP for Both (Advanced)**
- Configure Apache with mod_wsgi for Django
- Requires more setup

**Option 3: XAMPP for Frontend + Node.js Backend**
- XAMPP serves frontend
- Node.js runs separately
- Clean separation

---

## Setup Option 1: XAMPP + Django (RECOMMENDED)

### Step 1: Install XAMPP
1. Download from: https://www.apachefriends.org/
2. Install to default location (C:\xampp)
3. Start Apache from XAMPP Control Panel

### Step 2: Copy Frontend to XAMPP

Move your frontend files to XAMPP's web directory:

```
C:\xampp\htdocs\emergency-system\
├── Index.html
├── script.js
└── style.css
```

**Steps:**
1. Create folder: `C:\xampp\htdocs\emergency-system`
2. Copy `Index.html`, `script.js`, `style.css` to that folder
3. Access at: `http://localhost/emergency-system/`

### Step 3: The Script.js is Already Updated
Your script.js already points to Django backend at `http://localhost:8000/api/submit-report/`

### Step 4: Run Django Backend

In a **separate PowerShell window** (not XAMPP):

```powershell
cd "C:\Users\Administrator\Desktop\my checkin\emergency report system"
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Django runs on `http://localhost:8000` (separate from XAMPP)

### Step 5: Test
1. Open browser: `http://localhost/emergency-system/`
2. Use the form
3. Reports submit to Django backend (running separately)
4. Django sends emails to rescue teams

---

## Setup Option 2: XAMPP Only (Django via Apache)

This requires Apache configuration with mod_wsgi.

### Step 1: Install mod_wsgi for Django

```powershell
pip install mod_wsgi
```

### Step 2: Configure Apache

Edit `C:\xampp\apache\conf\httpd.conf`:

Add at the end:
```apache
# Django WSGI Configuration
WSGIScriptAlias / "C:\Users\Administrator\Desktop\my checkin\emergency report system\emergency_system\wsgi.py"
WSGIPythonHome "C:\Users\Administrator\Desktop\my checkin\emergency report system\venv"
WSGIPythonPath "C:\Users\Administrator\Desktop\my checkin\emergency report system"

<Directory "C:\Users\Administrator\Desktop\my checkin\emergency report system\emergency_system">
    <Files wsgi.py>
        Require all granted
    </Files>
</Directory>
```

### Step 3: Restart Apache
- XAMPP Control Panel → Apache → Stop → Start

### Pros & Cons
✓ Everything in one place
✗ More complex setup
✗ Harder to debug

---

## Setup Option 3: XAMPP + Node.js Backend

### Step 1: Copy Frontend to XAMPP
Same as Option 1, Step 2

### Step 2: Update script.js to use Node.js endpoint
```javascript
const response = await fetch("http://localhost:5000/submit-report", {
```

### Step 3: Install Node.js
Download from: https://nodejs.org/

### Step 4: Setup Node.js Backend

```powershell
cd "C:\Users\Administrator\Desktop\my checkin\emergency report system"
npm install
npm start
```

Node runs on `http://localhost:5000`

---

## Complete Step-by-Step (Option 1 - Easiest)

### Prerequisites
- XAMPP installed
- Python with Django setup
- Your emergency system files

### Setup Frontend in XAMPP:

```powershell
# Create directory
New-Item -ItemType Directory -Path "C:\xampp\htdocs\emergency-system" -Force

# Copy frontend files
Copy-Item "C:\Users\Administrator\Desktop\my checkin\emergency report system\Index.html" `
  -Destination "C:\xampp\htdocs\emergency-system\"
Copy-Item "C:\Users\Administrator\Desktop\my checkin\emergency report system\script.js" `
  -Destination "C:\xampp\htdocs\emergency-system\"
Copy-Item "C:\Users\Administrator\Desktop\my checkin\emergency report system\style.css" `
  -Destination "C:\xampp\htdocs\emergency-system\"
```

### Start Services:

**Terminal 1: Start Apache in XAMPP**
1. Open XAMPP Control Panel
2. Click "Start" button next to Apache

**Terminal 2: Start Django Backend**
```powershell
cd "C:\Users\Administrator\Desktop\my checkin\emergency report system"
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Access Application:
- Frontend: `http://localhost/emergency-system/`
- Backend: `http://localhost:8000/api/health/`
- Admin Panel: `http://localhost:8000/admin/`

---

## File Structure with XAMPP

```
C:\xampp\
├── htdocs\
│   └── emergency-system\         ← Frontend files
│       ├── Index.html
│       ├── script.js             ← Points to http://localhost:8000/api/submit-report/
│       └── style.css
│
└── apache\
    └── conf\
        └── httpd.conf            ← (Only modify for Option 2)

C:\Users\Administrator\Desktop\my checkin\emergency report system\
├── manage.py
├── requirements.txt
├── emergency_system\             ← Django project
├── reports\                      ← Django app
└── .env                          ← Email settings
```

---

## Important Notes

### CORS Configuration
Django already has CORS enabled in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost/emergency-system/",
    "http://127.0.0.1/emergency-system/",
    "http://localhost:8000",
]
```

### Port Management
- **XAMPP Apache**: Uses port 80 (for frontend)
- **Django Backend**: Uses port 8000 (for API)
- **Node.js Backend**: Uses port 5000 (if using Node instead)

No conflicts! They can run simultaneously.

### Database
- Django uses SQLite (`emergency_reports.db`)
- Data is stored locally, not in XAMPP's MySQL
- If you want to use MySQL with Django, we can configure it

---

## Troubleshooting

### Issue: "Address already in use :80"
Apache can't start if another service uses port 80
```powershell
netstat -ano | findstr :80
taskkill /PID <PID> /F
```

### Issue: CORS Error from Frontend
Check that Django settings include the correct origin:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost",      # Add this
    "http://127.0.0.1",
]
```

### Issue: Can't access `http://localhost/emergency-system/`
✓ Verify Apache is running (green light in XAMPP)
✓ Verify files are in `C:\xampp\htdocs\emergency-system\`
✓ Check filename is `Index.html` (capital I)

### Issue: Backend not responding
✓ Django must be running in separate terminal
✓ Check URL is `http://localhost:8000/api/health/`
✓ Verify `.env` has email settings

---

## Quick Checklist

- [ ] XAMPP installed and Apache started
- [ ] Frontend files copied to `C:\xampp\htdocs\emergency-system\`
- [ ] Django dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` configured with email credentials
- [ ] Database migrated (`python manage.py migrate`)
- [ ] Django running on port 8000
- [ ] script.js pointing to `http://localhost:8000/api/submit-report/`

---

## Accessing the System

After everything is running:

| Component | URL |
|-----------|-----|
| Frontend (XAMPP) | `http://localhost/emergency-system/` |
| Django API | `http://localhost:8000/api/submit-report/` |
| Health Check | `http://localhost:8000/api/health/` |
| Admin Panel | `http://localhost:8000/admin/` |
| XAMPP Dashboard | `http://localhost/` |

---

## Summary

**Best Setup for You: Option 1**

| What | Where | Port |
|------|-------|------|
| Frontend (HTML/CSS/JS) | XAMPP Apache | 80 |
| Backend (Django API) | Python Process | 8000 |
| Database | SQLite | - |

Simple, clean, and everything works together! 🚀
