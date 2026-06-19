from django.db import models

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