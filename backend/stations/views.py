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
