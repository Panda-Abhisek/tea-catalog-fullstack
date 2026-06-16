from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Tea
from .serializers import RegisterSerializer, TeaSerializer
from .filters import TeaFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
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

    permission_classes = [IsAuthenticatedOrReadOnly]


class TeaRetrieveUpdateDeleteView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Tea.objects.all()
    serializer_class = TeaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


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