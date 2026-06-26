from django.urls import path

from .views import (
    AdminOrderListView,
    AdminOrderUpdateView,
    CheckoutView,
    CreatePaymentOrderView,
    DashboardStatsView,
    OrderDetailView,
    OrderListView,
    RazorpayWebhookView,
    TeaListCreateView,
    TeaRetrieveUpdateDeleteView,
    VerifyPaymentView,
    health, register, TeaRecommendationView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from .views import CustomTokenObtainPairView
from .cart_views import AddToCartView, CartView, ClearCartView, RemoveCartItemView, UpdateCartItemView

urlpatterns = [
    path("health/", health),
    path(
        "teas/",
        TeaListCreateView.as_view(),
        name="tea-list-create",
    ),

    path(
        "teas/<int:pk>/",
        TeaRetrieveUpdateDeleteView.as_view(),
        name="tea-detail",
    ),

    path("register/", register),

    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

     path(
        "schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    path(
        "docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema"
        ),
        name="swagger-ui",
    ),
    path(
        "dashboard/stats/",
        DashboardStatsView.as_view(),
        name="dashboard-stats",
    ),
    path(
        "teas/<int:pk>/recommendations/",
        TeaRecommendationView.as_view(),
        name="tea-recommendations",
    ),
    path(
        "cart/",
        CartView.as_view(),
        name="cart"
    ),
    path(
        "cart/add/",
        AddToCartView.as_view(),
        name="cart-add",
    ),
    path(
        "cart/item/<int:item_id>/",
        UpdateCartItemView.as_view(),
        name="cart-item-update",
    ),
    path(
        "cart/item/<int:item_id>/delete/",
        RemoveCartItemView.as_view(),
        name="cart-item-delete",
    ),
    path(
        "cart/clear/",
        ClearCartView.as_view(),
        name="cart-clear",
    ),
    path(
        "orders/",
        OrderListView.as_view(),
    ),

    path(
        "orders/<int:pk>/",
        OrderDetailView.as_view(),
    ),

    path(
        "orders/checkout/",
        CheckoutView.as_view(),
    ),
    path(
        "admin/orders/",
        AdminOrderListView.as_view(),
    ),

    path(
        "admin/orders/<int:pk>/",
        AdminOrderUpdateView.as_view(),
    ),
    path(
        "payments/create-order/",
        CreatePaymentOrderView.as_view(),
    ),
    path(
        "payments/verify/",
        VerifyPaymentView.as_view(),
    ),
    path(
        "payments/webhook/",
        RazorpayWebhookView.as_view(),
    ),
]


# from django.urls import path

# from .views import (
#     tea_list,
#     tea_detail
# )

# urlpatterns = [
#     path(
#         "teas/",
#         tea_list,
#         name="tea-list"
#     ),

#     path(
#         "teas/<int:id>/",
#         tea_detail,
#         name="tea-detail"
#     ),
# ]