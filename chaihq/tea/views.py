# from psycopg import transaction
from django.db import transaction
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Cart, Order, OrderItem, Tea
from .serializers import OrderSerializer, RegisterSerializer, TeaSerializer, UpdateOrderStatusSerializer
from .filters import TeaFilter
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdminOrReadOnly

from django.contrib.auth.models import User
from django.db.models import Avg, Sum, F
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "role": (
                "Admin"
                if self.user.groups.filter(name="Admin").exists()
                else "Customer"
            ),
        }

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"username": user.username, "message": "User registered successfully"},
            status=201,
        )

    return Response(serializer.errors, status=400)

class TeaListCreateView(generics.ListCreateAPIView):
    queryset = Tea.objects.all()
    serializer_class = TeaSerializer

    filterset_class = TeaFilter

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "name",
        "price",
        "stock",
        "created_at",
    ]

    permission_classes = [IsAdminOrReadOnly]


class TeaRetrieveUpdateDeleteView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Tea.objects.all()
    serializer_class = TeaSerializer
    permission_classes = [IsAdminOrReadOnly]
    

class DashboardStatsView(APIView):

    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        stats = {
            "total_teas": Tea.objects.count(),
            "total_users": User.objects.count(),
            "avg_price": Tea.objects.aggregate(
                Avg("price")
            )["price__avg"] or 0,
            "in_stock_teas": Tea.objects.filter(
                stock__gt=0
            ).count(),
            "out_of_stock_teas": Tea.objects.filter(
                stock=0
            ).count(),

            "latest_teas": list(
                Tea.objects.order_by("-created_at")
                .values("id", "name", "price")[:5]
            ),

            "latest_users": list(
                User.objects.order_by("-date_joined")
                .values("id", "username", "date_joined")[:5]
            ),
            "inventory_value": sum(
                tea.price * tea.stock
                for tea in Tea.objects.all()
            ),
            "low_stock_teas": list(
                Tea.objects.filter(stock__lt=5)
                .values(
                    "id",
                    "name",
                    "stock"
                )
            ),
            "top_expensive_teas": list(
                Tea.objects.order_by("-price")
                .values(
                    "id",
                    "name",
                    "price"
                )[:5]
            ),
        }

        return Response(stats)


class TeaRecommendationView(ListAPIView):

    serializer_class = TeaSerializer

    def get_queryset(self):

        tea_id = self.kwargs["pk"]

        tea = Tea.objects.get(pk=tea_id)

        recommendations = Tea.objects.filter(
            category=tea.category
        ).exclude(
            id=tea.id
        )

        if recommendations.count() >= 4:
            return recommendations[:4]

        remaining = 4 - recommendations.count()

        fallback = Tea.objects.exclude(
            id=tea.id
        ).exclude(
            category=tea.category
        ).order_by("-created_at")[:remaining]

        return list(recommendations) + list(fallback)
    
    
class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return Response({"error": "Cart not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart_items = cart.items.select_related("tea")
        if not cart_items.exists():
            return Response({"error": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        total = 0
        # Validate Stock
        for item in cart_items:
            if item.quantity > item.tea.stock:
                return Response({"error": f"{item.tea.name} is out of stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            total += (item.quantity * item.tea.price)
        order = Order.objects.create(
            user=request.user,
            total_amount=total,
        )
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                tea=item.tea,
                quantity=item.quantity,
                price_at_purchase=item.tea.price,
            )
            item.tea.stock -= item.quantity
            item.tea.save(update_fields=["stock"])

        cart_items.delete()
        serializer = OrderSerializer(order)
        return Response(serializer.data,status=status.HTTP_201_CREATED,)
    
class OrderListView(generics.ListAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related("items__tea")
            .order_by("-created_at")
        )
        
class OrderDetailView(generics.RetrieveAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related("items__tea")
        )

class AdminOrderListView(generics.ListAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return (
            Order.objects.select_related("user")
            .prefetch_related("items__tea")
            .order_by("-created_at")
        )
        
class AdminOrderUpdateView(generics.UpdateAPIView):

    serializer_class = UpdateOrderStatusSerializer
    permission_classes = [IsAdminOrReadOnly]

    queryset = Order.objects.all()

    http_method_names = ["patch"]
    


# """
# from rest_framework.decorators import api_view
# from rest_framework.response import Response

# from .models import Tea
# from .serializers import TeaSerializer


# @api_view(["GET", "POST"])
# def tea_list(request):

#     if request.method == "GET":

#         teas = Tea.objects.all()

#         # Search
#         search = request.query_params.get("search")

#         if search:
#             teas = teas.filter(
#                 name__icontains=search
#             )

#         # Min Price
#         min_price = request.query_params.get("min_price")

#         if min_price:
#             teas = teas.filter(
#                 price__gte=min_price
#             )

#         # Max Price
#         max_price = request.query_params.get("max_price")

#         if max_price:
#             teas = teas.filter(
#                 price__lte=max_price
#             )

#         # Origin
#         origin = request.query_params.get("origin")

#         if origin:
#             teas = teas.filter(
#                 origin=origin
#             )

#         # Ordering
#         ordering = request.query_params.get("ordering")

#         if ordering:
#             teas = teas.order_by(ordering)

#         serializer = TeaSerializer(
#             teas,
#             many=True
#         )

#         return Response(serializer.data)

#     if request.method == "POST":

#         serializer = TeaSerializer(
#             data=request.data
#         )

#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)

#         return Response(serializer.errors)


# @api_view(["GET", "PUT", "DELETE"])
# def tea_detail(request, id):

#     try:
#         tea = Tea.objects.get(id=id)

#     except Tea.DoesNotExist:

#         return Response(
#             {"error": "Tea not found"},
#             status=404
#         )

#     if request.method == "GET":

#         serializer = TeaSerializer(tea)

#         return Response(serializer.data)

#     if request.method == "PUT":

#         serializer = TeaSerializer(
#             tea,
#             data=request.data
#         )

#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)

#         return Response(serializer.errors)

#     if request.method == "DELETE":

#         tea.delete()

#         return Response({
#             "message": "Tea deleted successfully"
#         })
# """