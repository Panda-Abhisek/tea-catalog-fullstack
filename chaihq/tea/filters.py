import django_filters

from .models import Tea


class TeaFilter(django_filters.FilterSet):
    class Meta:
        model = Tea
        fields = {
            "price": ["exact", "lte", "gte"],
            "name": ["exact", "icontains"],
            "stock": ["exact", "lte", "gte"],
            "origin": ["exact", "icontains"],
        }