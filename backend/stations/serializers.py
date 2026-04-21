from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Station, Review


class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_username', 'station', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class StationSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    average_rating      = serializers.FloatField(read_only=True)
    review_count        = serializers.IntegerField(read_only=True)

    class Meta:
        model = Station
        fields = [
            'id', 'name', 'latitude', 'longitude',
            'station_type', 'charger_type', 'status',
            'description', 'address', 'city', 'phone',
            'is_approved', 'created_by', 'created_by_username',
            'average_rating', 'review_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'is_approved']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class StationDetailSerializer(StationSerializer):
    """Full station serializer including embedded reviews."""
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(StationSerializer.Meta):
        fields = StationSerializer.Meta.fields + ['reviews']
