from rest_framework import serializers
from .models import Cart, Order, OrderItem, Tea, CartItem
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
    

class DashboardStatsSerializer(serializers.Serializer):
    total_teas = serializers.IntegerField()
    total_users = serializers.IntegerField()
    avg_price = serializers.FloatField()
    in_stock_teas = serializers.IntegerField()
    out_of_stock_teas = serializers.IntegerField()
    

class CartItemSerializer(serializers.ModelSerializer):
    tea_name = serializers.CharField(source="tea.name",read_only=True)
    tea_price = serializers.DecimalField(
        source="tea.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    tea_photo = serializers.ImageField(source="tea.photo",read_only=True)

    class Meta:
        model = CartItem

        fields = [
            "id",
            "tea",
            "tea_name",
            "tea_price",
            "tea_photo",
            "quantity",
        ]
        
        
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True,read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart

        fields = [
            "id",
            "user",
            "items",
            "total_items",
            "total_price",
        ]

    def get_total_items(self,obj):
        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_total_price(self,obj):
        return sum(
            item.quantity * item.tea.price
            for item in obj.items.all()
        )
        
        
class AddToCartSerializer(serializers.Serializer):
    tea_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    

class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    
class UpdateOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]

class OrderItemSerializer(serializers.ModelSerializer):
    tea_name = serializers.CharField(source="tea.name", read_only = True)
    tea_photo = serializers.ImageField(source="tea.photo",read_only=True,)
    
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "tea",
            "tea_name",
            "tea_photo",
            "quantity",
            "price_at_purchase"
        ]
        
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "username",
            "status",
            "payment_status",
            "total_amount",
            "total_items",
            "created_at",
            "updated_at",
            "items",
        ]
        
    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())
    

class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()