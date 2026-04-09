"""
URL configuration for emergency_system
"""
from django.urls import path
from reports import views

urlpatterns = [
    path('api/submit-report/', views.submit_report, name='submit_report'),
    path('api/health/', views.health_check, name='health_check'),
]
