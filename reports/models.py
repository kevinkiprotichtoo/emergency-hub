"""
Database models for emergency reports
"""
from django.db import models
from django.utils import timezone


class EmergencyReport(models.Model):
    """Store emergency report data"""
    
    INCIDENT_TYPES = [
        ('ACCIDENT', 'Traffic Accident'),
        ('FIRE', 'Fire'),
        ('FLOOD', 'Flooding'),
        ('OTHER', 'Other'),
    ]
    
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPES)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    media_file = models.FileField(upload_to='emergency_media/', null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.incident_type} - {self.created_at}"


class RescueTeam(models.Model):
    """Store rescue team information"""
    
    TEAM_TYPES = [
        ('POLICE', 'Police'),
        ('FIRE', 'Fire Department'),
        ('FLOOD', 'Flood Response'),
    ]
    
    name = models.CharField(max_length=200)
    team_type = models.CharField(max_length=20, choices=TEAM_TYPES)
    email = models.EmailField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    region = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['region', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.region})"


class NotificationLog(models.Model):
    """Track sent notifications"""
    
    STATUS_CHOICES = [
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
        ('PENDING', 'Pending'),
    ]
    
    report = models.ForeignKey(EmergencyReport, on_delete=models.CASCADE)
    team = models.ForeignKey(RescueTeam, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    distance_km = models.FloatField()
    
    def __str__(self):
        return f"{self.report.incident_type} → {self.team.name} ({self.status})"
