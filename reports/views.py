"""
Views for emergency reporting system
"""
import json
import math
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from .models import EmergencyReport, RescueTeam, NotificationLog
import logging

logger = logging.getLogger(__name__)

# Rescue teams data
RESCUE_TEAMS_DATA = {
    'ACCIDENT': [
        {'name': 'Nairobi Traffic Police', 'email': 'traffic.nairobi@police.go.ke', 'lat': -1.2865, 'lon': 36.8172, 'region': 'Nairobi'},
        {'name': 'Nairobi Highway Patrol', 'email': 'highway.patrol@police.go.ke', 'lat': -1.3242, 'lon': 36.8234, 'region': 'Nairobi'},
        {'name': 'Mombasa Traffic Police', 'email': 'traffic.mombasa@police.go.ke', 'lat': -4.0383, 'lon': 39.6682, 'region': 'Mombasa'},
        {'name': 'Kisumu Traffic Police', 'email': 'traffic.kisumu@police.go.ke', 'lat': -0.1019, 'lon': 34.7617, 'region': 'Kisumu'},
    ],
    'FIRE': [
        {'name': 'Nairobi Fire Station', 'email': 'fire.nairobi@nfrs.go.ke', 'lat': -1.2865, 'lon': 36.8172, 'region': 'Nairobi'},
        {'name': 'Nairobi CBD Fire Brigade', 'email': 'cbd.fire@nfrs.go.ke', 'lat': -1.2831, 'lon': 36.8244, 'region': 'Nairobi CBD'},
        {'name': 'Mombasa Fire Station', 'email': 'fire.mombasa@nfrs.go.ke', 'lat': -4.0383, 'lon': 39.6682, 'region': 'Mombasa'},
        {'name': 'Kisumu Fire Station', 'email': 'fire.kisumu@nfrs.go.ke', 'lat': -0.1019, 'lon': 34.7617, 'region': 'Kisumu'},
    ],
    'FLOOD': [
        {'name': 'Water Resource Management Nairobi', 'email': 'flood.response@wrma.go.ke', 'lat': -1.2865, 'lon': 36.8172, 'region': 'Nairobi'},
        {'name': 'National Disaster Operations Center', 'email': 'ndoc@ndma.go.ke', 'lat': -1.2865, 'lon': 36.8172, 'region': 'Nairobi'},
        {'name': 'Mombasa Drainage Authority', 'email': 'drainage.mombasa@wrma.go.ke', 'lat': -4.0383, 'lon': 39.6682, 'region': 'Mombasa'},
        {'name': 'County Emergency Services Kisumu', 'email': 'emergency.kisumu@county.go.ke', 'lat': -0.1019, 'lon': 34.7617, 'region': 'Kisumu'},
    ]
}


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula"""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def find_nearest_teams(incident_type, latitude, longitude, max_distance=50):
    """Find nearest rescue teams for the incident type"""
    teams = RESCUE_TEAMS_DATA.get(incident_type.upper(), [])
    
    teams_with_distance = []
    for team in teams:
        distance = calculate_distance(latitude, longitude, team['lat'], team['lon'])
        if distance <= max_distance:
            teams_with_distance.append({
                **team,
                'distance': distance
            })
    
    # Sort by distance and return top 3
    return sorted(teams_with_distance, key=lambda x: x['distance'])[:3]


def send_emergency_email(team, incident):
    """Send emergency notification email to rescue team"""
    try:
        subject = f"🚨 EMERGENCY ALERT: {incident['type'].upper()} - IMMEDIATE RESPONSE NEEDED"
        
        # Format timestamp nicely
        from datetime import datetime
        incident_time = datetime.fromisoformat(incident['timestamp'].replace('Z', '+00:00'))
        formatted_time = incident_time.strftime("%B %d, %Y at %I:%M:%S %p")
        
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f8d7da; padding: 20px; border-radius: 8px; border: 2px solid #f5c6cb;">
            <h2 style="color: #721c24;">⚠️ EMERGENCY ALERT - {incident['type'].upper()}</h2>
            
            <div style="background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; color: #856404;">
                <p style="margin: 0; font-weight: bold;">🚨 TIME CRITICAL - IMMEDIATE RESPONSE REQUIRED 🚨</p>
            </div>
            
            <p style="font-size: 16px;"><strong>⏰ Report Time:</strong> {formatted_time}</p>
            <p style="font-size: 16px;"><strong>📅 ISO Timestamp:</strong> {incident['timestamp']}</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>📍 Location:</strong></p>
                <p>Latitude: {incident['latitude']:.4f}</p>
                <p>Longitude: {incident['longitude']:.4f}</p>
                <p><a href="https://www.google.com/maps?q={incident['latitude']},{incident['longitude']}" target="_blank" style="color: #007bff; text-decoration: none;">📌 View on Google Maps</a></p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>📝 Description:</strong></p>
                <p>{incident['description']}</p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>📊 Response Details:</strong></p>
                <p>Nearest Team: {team['name']}</p>
                <p>Region: {team['region']}</p>
                <p>Distance from incident: {team['distance']:.2f} km</p>
            </div>
            
            <p style="color: #721c24; font-weight: bold; margin-top: 20px;">⚠️ PLEASE RESPOND IMMEDIATELY TO THIS EMERGENCY LOCATION ⚠️</p>
            <p style="color: #666; font-size: 12px; margin-top: 15px;">This is an automated emergency alert system. Time-stamped {formatted_time}. Please treat with URGENCY.</p>
        </div>
        """
        
        send_mail(
            subject,
            f"EMERGENCY: {incident['type']}\n\nTime Reported: {formatted_time}\n\nLocation: {incident['latitude']}, {incident['longitude']}\n\nDescription: {incident['description']}",
            None,  # Uses DEFAULT_FROM_EMAIL from settings
            [team['email']],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"✓ Email sent to {team['email']} at {formatted_time}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {team['email']}: {str(e)}")
        return False


@csrf_exempt
@require_http_methods(["POST"])
def submit_report(request):
    """Submit emergency report and notify rescue teams"""
    try:
        data = json.loads(request.body)
        
        # Validate input
        required_fields = ['type', 'description', 'latitude', 'longitude', 'timestamp']
        if not all(field in data for field in required_fields):
            return JsonResponse({
                'error': 'Missing required fields',
                'notified': []
            }, status=400)
        
        incident_type = data.get('type')
        description = data.get('description')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        timestamp = data.get('timestamp')
        submitted_at = data.get('submitted_at', '')
        
        # Format timestamp for logging
        from datetime import datetime
        incident_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        formatted_time = incident_time.strftime("%B %d, %Y at %I:%M:%S %p")
        
        logger.info(f"\n{'='*60}")
        logger.info(f"📢 NEW EMERGENCY REPORT RECEIVED")
        logger.info(f"{'='*60}")
        logger.info(f"⏰ Time Reported: {formatted_time}")
        logger.info(f"🚨 Incident Type: {incident_type.upper()}")
        logger.info(f"📍 Location: {latitude}, {longitude}")
        logger.info(f"📝 Description: {description}")
        logger.info(f"{'='*60}\n")
        
        # Save report to database
        report = EmergencyReport.objects.create(
            incident_type=incident_type.upper(),
            description=description,
            latitude=latitude,
            longitude=longitude,
            timestamp=timezone.now()
        )
        
        # Find nearest rescue teams
        nearest_teams = find_nearest_teams(incident_type, latitude, longitude)
        
        if not nearest_teams:
            logger.warning("⚠️ No rescue teams found nearby")
            return JsonResponse({
                'error': 'No rescue teams found in your area',
                'notified': []
            }, status=400)
        
        # Send notifications
        notified_teams = []
        incident_data = {
            'type': incident_type,
            'description': description,
            'latitude': latitude,
            'longitude': longitude,
            'timestamp': timestamp
        }
        
        logger.info(f"📧 Sending notifications to {len(nearest_teams)} team(s)...\n")
        
        for team in nearest_teams:
            success = send_emergency_email(team, incident_data)
            
            # Log notification
            NotificationLog.objects.create(
                report=report,
                team=None,  # Would need to create team objects in DB
                status='SENT' if success else 'FAILED',
                distance_km=team['distance'],
                sent_at=timezone.now() if success else None,
                error_message='' if success else 'Email send failed'
            )
            
            notified_teams.append(f"{team['name']} ({team['distance']:.1f}km away)")
        
        logger.info(f"\n✓ Notifications sent to: {', '.join(notified_teams)}")
        logger.info(f"✓ Report stored in database with ID: {report.id}\n")
        
        return JsonResponse({
            'success': True,
            'message': 'Emergency report submitted and notifications sent',
            'notified': notified_teams,
            'teamCount': len(notified_teams),
            'report_id': report.id,
            'timestamp': formatted_time
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"❌ Server error: {str(e)}")
        return JsonResponse({
            'error': 'Server error',
            'details': str(e)
        }, status=500)


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'Emergency notification system is running ✓'
    })
