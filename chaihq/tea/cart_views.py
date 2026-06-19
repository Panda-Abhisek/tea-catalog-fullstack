from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Cart, CartItem, Tea
from .serializers import AddToCartSerializer, CartSerializer, UpdateCartItemSerializer

class CartView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        cart, created = (
            Cart.objects.get_or_create(
                user=request.user
            )
        )

        serializer = CartSerializer(
            cart
        )

        return Response(
            serializer.data
        )
        

class AddToCartView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        serializer = AddToCartSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        tea_id = serializer.validated_data[
            "tea_id"
        ]

        quantity = serializer.validated_data[
            "quantity"
        ]

        tea = Tea.objects.get(
            id=tea_id
        )

        cart, created = (
            Cart.objects.get_or_create(
                user=request.user
            )
        )

        cart_item, created = (
            CartItem.objects.get_or_create(
                cart=cart,
                tea=tea,
                defaults={
                    "quantity": quantity
                }
            )
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response(
            {
                "message":
                "Item added to cart"
            },
            status=status.HTTP_201_CREATED
        )
        
        
class UpdateCartItemView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        item_id
    ):

        serializer = (
            UpdateCartItemSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        cart = Cart.objects.get(
            user=request.user
        )

        cart_item = CartItem.objects.get(
            id=item_id,
            cart=cart
        )

        cart_item.quantity = (
            serializer.validated_data[
                "quantity"
            ]
        )

        cart_item.save()

        return Response(
            {
                "message":
                "Cart updated"
            }
        )
        
        
class RemoveCartItemView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def delete(
        self,
        request,
        item_id
    ):

        cart = Cart.objects.get(
            user=request.user
        )

        cart_item = CartItem.objects.get(
            id=item_id,
            cart=cart
        )

        cart_item.delete()

        return Response(
            {
                "message":
                "Item removed from cart"
            }
        )
        
        
class ClearCartView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def delete(
        self,
        request
    ):

        cart = Cart.objects.get(
            user=request.user
        )

        cart.items.all().delete()

        return Response(
            {
                "message":
                "Cart cleared"
            }
        )