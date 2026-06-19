from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Tea(models.Model):
    name = models.CharField(max_length=100)
    origin = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    description = models.TextField(null=True, blank=True)
    photo = models.ImageField(upload_to='tea_photos/', null=True, blank=True)
    CATEGORY_CHOICES = [
        ("Green", "Green"),
        ("Black", "Black"),
        ("Herbal", "Herbal"),
    ]
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="Green"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class Cart(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cart"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username}'s Cart"
    
class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )

    tea = models.ForeignKey(
        Tea,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "cart",
            "tea"
        )

    def __str__(self):
        return f"{self.tea.name} x {self.quantity}"