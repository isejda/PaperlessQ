from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Note, Services, ServiceQueue, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "password", "date_joined", "is_active", "is_staff"]
        extra_kwargs = {
            "password": {"write_only": True},
            "is_active": {"read_only": True},
            "date_joined": {"read_only": True}
        }

    def create(self, validated_data):
        # print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user
    

def update(self, instance, validated_data):
    validated_data.pop('password', None)

    request = self.context.get('request')

    if request and request.user.is_staff:
        # Allow staff users to update is_active or other admin-level fields if needed
        is_active = validated_data.pop('is_staff', None)
        if is_active is not None:
            instance.is_active = is_active

    for attr, value in validated_data.items():
        setattr(instance, attr, value)

    instance.save()
    return instance

    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}
        
    

class ServiceQueueSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = ServiceQueue
        fields = ['user', 'joined_at']


class ServicesSerializer(serializers.ModelSerializer):
    queue_entries = serializers.SerializerMethodField()
    now_serving = serializers.SerializerMethodField()

    class Meta:
        model = Services
        fields = ['id', 'title', 'content', 'service_provider', 'queue_entries', 'now_serving', 'created_at']
        extra_kwargs = {"service_provider": {"read_only": True}}

    def get_queue_entries(self, obj):
        return [
            {
                'user_id': entry.user.id,
                'user': entry.user.username,
                'joined_at': entry.joined_at
            }
            for entry in obj.queue_entries.order_by('joined_at')
        ]

    def get_now_serving(self, obj):
        first_entry = obj.queue_entries.order_by('joined_at').first()
        if first_entry:
            return {
                'user_id': first_entry.user.id,
                'username': first_entry.user.username,
                'joined_at': first_entry.joined_at
            }
        return None
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read']

