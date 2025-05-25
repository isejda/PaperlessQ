from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Note

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
        
        