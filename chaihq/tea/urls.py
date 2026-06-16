from django.urls import path

from .views import (
    TeaListCreateView,
    TeaRetrieveUpdateDeleteView, register
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

urlpatterns = [
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