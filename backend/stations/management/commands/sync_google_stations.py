from django.core.management.base import BaseCommand
from stations.services import GoogleMapsService

class Command(BaseCommand):
    help = 'Sync EV charging stations from Google Maps API'

    def add_arguments(self, parser):
        parser.add_argument('--lat', type=float, default=9.010, help='Latitude for search center')
        parser.add_argument('--lng', type=float, default=38.760, help='Longitude for search center')
        parser.add_argument('--radius', type=int, default=50000, help='Search radius in meters')

    def handle(self, *args, **options):
        lat = options['lat']
        lng = options['lng']
        radius = options['radius']

        self.stdout.write(f'Fetching stations near ({lat}, {lng}) with radius {radius}m...')
        
        service = GoogleMapsService()
        if not service.api_key:
            self.stderr.write('Error: GOOGLE_MAPS_API_KEY not found in environment.')
            return

        stations = service.fetch_ev_stations(location=(lat, lng), radius=radius)
        self.stdout.write(f'Found {len(stations)} stations on Google Maps.')

        synced = service.sync_to_db(stations)
        self.stdout.write(self.style.SUCCESS(f'Successfully synced {synced} new stations to database.'))
