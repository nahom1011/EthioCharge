from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Station, Review
from .serializers import StationSerializer, StationDetailSerializer, ReviewSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user or request.user.is_staff


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.filter(is_approved=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['station_type', 'charger_type', 'status', 'city']
    search_fields = ['name', 'city', 'address', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StationDetailSerializer
        return StationSerializer

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        station = self.get_object()
        reviews = station.reviews.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def sync_google(self, request):
        from .services import GoogleMapsService
        lat = request.data.get('lat', 9.010)
        lng = request.data.get('lng', 38.760)
        radius = request.data.get('radius', 50000)

        service = GoogleMapsService()
        if not service.api_key:
            return Response({'error': 'Google Maps API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        stations_data = service.fetch_ev_stations(location=(lat, lng), radius=radius)
        synced_count = service.sync_to_db(stations_data)

        return Response({
            'message': f'Successfully synced {synced_count} new stations.',
            'total_found': len(stations_data)
        })


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
