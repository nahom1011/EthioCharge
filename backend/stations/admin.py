from django.contrib import admin
from .models import Station, Review


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ['name', 'station_type', 'status', 'city', 'is_approved', 'created_by', 'created_at']
    list_filter = ['station_type', 'charger_type', 'status', 'city', 'is_approved']
    search_fields = ['name', 'city', 'description']
    list_editable = ['is_approved', 'status']
    ordering = ['-created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'station', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['comment', 'user__username', 'station__name']
