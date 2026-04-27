import googlemaps
from django.conf import settings
from .models import Station
import os

class GoogleMapsService:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        if self.api_key:
            self.gmaps = googlemaps.Client(key=self.api_key)
        else:
            self.gmaps = None

    def fetch_ev_stations(self, location=(9.010, 38.760), radius=50000):
        """
        Fetch EV charging stations from Google Places API.
        Default location is Addis Ababa.
        Radius is in meters.
        """
        if not self.gmaps:
            return []

        # Search for electric vehicle charging stations
        places_result = self.gmaps.places(
            query="EV charging station",
            location=location,
            radius=radius,
            type="electric_vehicle_charging_station"
        )

        stations_found = []
        for result in places_result.get('results', []):
            station_data = {
                'name': result.get('name'),
                'latitude': result['geometry']['location']['lat'],
                'longitude': result['geometry']['location']['lng'],
                'address': result.get('formatted_address', ''),
                'place_id': result.get('place_id'),
                'rating': result.get('rating'),
                'user_ratings_total': result.get('user_ratings_total', 0),
            }
            stations_found.append(station_data)
        
        return stations_found

    def sync_to_db(self, stations_data):
        """
        Sync fetched data to the local database.
        """
        synced_count = 0
        for data in stations_data:
            # Use google_place_id for deduplication
            station, created = Station.objects.update_or_create(
                google_place_id=data['place_id'],
                defaults={
                    'name': data['name'],
                    'latitude': data['latitude'],
                    'longitude': data['longitude'],
                    'address': data['address'],
                    'station_type': 'ev',
                    'description': f"Google Maps Rating: {data.get('rating')} ({data.get('user_ratings_total')} reviews). Data synced from Google Maps.",
                    'is_approved': True,
                }
            )
            if created:
                synced_count += 1
        
        return synced_count
