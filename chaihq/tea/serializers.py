from rest_framework import serializers
from .models import Tea
from django.contrib.auth.models import User

class SafeImageField(serializers.ImageField):
    """Custom image field that safely handles Cloudinary errors"""
    def to_representation(self, value):
        try:
            return super().to_representation(value)
        except (ValueError, Exception) as e:
            # Return None or empty string if Cloudinary is not configured
            return None

class TeaSerializer(serializers.ModelSerializer):
    photo = SafeImageField(required=False, allow_null=True)
    
    class Meta:
        model = Tea
        fields = "__all__"

class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password1", "password2"]

    def validate(self, attrs):
        if attrs["password1"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password1")
        return User.objects.create_user(
            username=validated_data["username"],
            password=password,
        )
    

