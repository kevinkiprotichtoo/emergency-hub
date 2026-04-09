# Django Backend Setup Guide

## Quick Comparison: Node.js vs Django

| Feature | Node.js/Express | Django |
|---------|-----------------|--------|
| **Complexity** | Lightweight, minimal setup | Full-featured framework |
| **Database** | Manual setup | Built-in ORM |
| **Email** | Nodemailer module | Django mail framework |
| **Admin Panel** | Need to build | Built-in admin interface |
| **Scalability** | Good | Excellent |
| **Email Verification** | Manual | Built-in middleware |

---

## Installation Steps

### Step 1: Create Virtual Environment (Recommended)

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `Django` - Web framework
- `django-cors-headers` - Enable CORS for frontend requests
- `python-dotenv` - Load environment variables

### Step 3: Create or Configure `.env`

Copy `.env.example` to `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 4: Initialize Database

```bash
python manage.py migrate
```

(Note: This project uses SQLite by default, no additional setup needed)

### Step 5: Create Superuser (Optional - For Admin Panel)

```bash
python manage.py createsuperuser
```

Then access admin at: `http://localhost:8000/admin`

### Step 6: Run Development Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

---

## File Structure

```
emergency_system/
├── manage.py                      # Django management script
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment template
├── db.sqlite3                     # SQLite database (auto-created)
│
├── emergency_system/              # Project config
│   ├── __init__.py
│   ├── settings.py               # Flask-like config file
│   ├── urls.py                   # Route definitions
│   └── wsgi.py                   # WSGI for production
│
└── reports/                       # Django app (business logic)
    ├── __init__.py
    ├── models.py                 # Database models
    ├── views.py                  # API endpoints
    ├── admin.py                  # Admin interface
    └── migrations/               # Database schema changes
```

---

## API Endpoints

### POST `/api/submit-report/`
Submit an emergency report.

**Request:**
```json
{
  "type": "Fire",
  "description": "Building on fire at main street",
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

### GET `/api/health/`
Check if backend is running.

**Response:**
```json
{
  "status": "Emergency notification system is running ✓"
}
```

---

## Key Differences from Node Backend

### 1. Project Structure
- Django uses a "project" + "apps" architecture
- Each app has models, views, urls, etc.

### 2. Database Models (Django's ORM)
```python
# Instead of manually managing data
class EmergencyReport(models.Model):
    incident_type = models.CharField(max_length=20)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
```

### 3. Migrations
When you change models, Django tracks changes:
```bash
python manage.py makemigrations   # Create migration file
python manage.py migrate          # Apply to database
```

### 4. Built-in Admin Panel
Access at `/admin/` to manage data without code:
- Add/edit/delete rescue teams
- View emergency reports
- Track notifications

### 5. Email Configuration
Django handles email through settings:
```python
# In settings.py
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_PASSWORD')
```

---

## Testing the System

1. **Start Django server:**
   ```bash
   python manage.py runserver
   ```

2. **Update frontend URL** in script.js:
   ```javascript
   // Change from http://localhost:5000 to:
   const response = await fetch("http://localhost:8000/api/submit-report/", {
   ```

3. **Test with frontend:**
   - Open Index.html
   - Get location
   - Submit report
   - Check console for notifications

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'django'"
✓ Make sure virtual environment is activated
✓ Run `pip install -r requirements.txt`

### Issue: "Address already in use :8000"
✓ Kill existing process: `python manage.py runserver 8001`

### Issue: Emails not sending
✓ Verify `.env` has correct EMAIL_USER and EMAIL_PASSWORD
✓ Check Gmail app password (not regular password)

### Issue: CORS error from frontend
✓ Already configured, but verify in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "file://",
]
```

---

## Production Deployment

### Using Gunicorn (recommended)
```bash
pip install gunicorn
gunicorn emergency_system.wsgi:application --bind 0.0.0.0:8000
```

### Deploy to Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
```

### Deploy to AWS/DigitalOcean
- Use gunicorn + Nginx reverse proxy
- Use PostgreSQL instead of SQLite
- Use environment variables for secrets

---

## Adding More Features with Django ORM

### Add rescue team to database:
```python
from reports.models import RescueTeam

RescueTeam.objects.create(
    name="Nakuru Traffic Police",
    team_type="POLICE",
    email="traffic.nakuru@police.go.ke",
    latitude=-0.2862,
    longitude=35.8678,
    region="Nakuru"
)
```

### Query reports:
```python
from reports.models import EmergencyReport

# Get all fire incidents
fire_reports = EmergencyReport.objects.filter(incident_type='FIRE')

# Get reports from last 24 hours
from django.utils import timezone
from datetime import timedelta
recent = EmergencyReport.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=1)
)
```

---

## Django Admin Interface

Access `/admin/` to:
- ✓ Manage rescue teams
- ✓ View emergency reports
- ✓ Track notifications
- ✓ Monitor system health

Create superuser first:
```bash
python manage.py createsuperuser
```

---

## Comparison Summary

| Aspect | Node.js | Django |
|--------|---------|--------|
| Setup Time | 5 minutes | 15 minutes |
| Learning Curve | Easier | Slightly steeper |
| Built-in Features | Minimal | Rich (ORM, admin, auth) |
| Database Management | Manual | Automated (migrations) |
| Scalability | Good | Excellent |
| Team Experience | JavaScript devs | Python devs |

**Choose Django if:**
- You want built-in database management
- You need admin panel for data management
- You're comfortable with Python
- You want less boilerplate code

**Choose Node.js if:**
- You prefer JavaScript
- You want minimal setup
- Your team prefers lightweight frameworks

---

## Next Steps

1. ✓ Set up Django backend (you're here)
2. ✓ Configure email settings
3. ✓ Update frontend URL
4. ✓ Test the complete system
5. Add database persistence
6. Build admin dashboard
7. Deploy to production

---

**Happy coding! 🚀**
