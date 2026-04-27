from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Station(models.Model):
    CHARGER_TYPE_CHOICES = [
        ('fast', 'Fast DC'),
        ('slow', 'Slow AC'),
        ('unknown', 'Unknown'),
    ]
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('busy', 'Busy'),
        ('offline', 'Offline'),
    ]
    STATION_TYPE_CHOICES = [
        ('ev', 'EV Charger'),
        ('fuel', 'Fuel Station'),
        ('garage', 'Garage / Mechanic'),
        ('carwash', 'Car Wash'),
        ('service', 'Car Service'),
    ]

    name         = models.CharField(max_length=200)
    latitude     = models.DecimalField(max_digits=10, decimal_places=7)
    longitude    = models.DecimalField(max_digits=10, decimal_places=7)
    station_type = models.CharField(max_length=20, choices=STATION_TYPE_CHOICES, default='ev')
    charger_type = models.CharField(max_length=20, choices=CHARGER_TYPE_CHOICES, default='unknown', blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    description  = models.TextField(blank=True)
    address      = models.CharField(max_length=300, blank=True)
    city         = models.CharField(max_length=100, default='Addis Ababa')
    phone        = models.CharField(max_length=20, blank=True)
    google_place_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    is_approved  = models.BooleanField(default=True)
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='stations')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_station_type_display()})"

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    @property
    def review_count(self):
        return self.reviews.count()


class Review(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    station    = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='reviews')
    rating     = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'station']   # one review per user per station

    def __str__(self):
        return f"{self.user.username} → {self.station.name} ({self.rating}★)"
