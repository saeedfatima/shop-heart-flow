# Django REST Framework Backend Integration Guide

## Complete guide for integrating this React e-commerce frontend with Django backend using function-based views.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Models](#2-models)
3. [Serializers](#3-serializers)
4. [Views](#4-views)
5. [URLs](#5-urls)
6. [Authentication](#6-authentication)
7. [CORS Configuration](#7-cors-configuration)
8. [Frontend Integration](#8-frontend-integration)
9. [File Uploads](#9-file-uploads)
10. [Testing](#10-testing)

---

## 1. Project Setup

### 1.1 Create Django Project

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework django-cors-headers Pillow djangorestframework-simplejwt

# Create project and app
django-admin startproject ecommerce_backend
cd ecommerce_backend
python manage.py startapp store
python manage.py startapp accounts
```

### 1.2 Project Structure

```
ecommerce_backend/
├── ecommerce_backend/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── store/
│   ├── __init__.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── accounts/
│   ├── __init__.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── media/
└── manage.py
```

### 1.3 Settings Configuration

```python
# ecommerce_backend/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Local apps
    'store',
    'accounts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
```

---

## 2. Models

### 2.1 Custom User Model (accounts/models.py)

```python
# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom user model matching frontend User interface"""
    
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    occupation = models.CharField(max_length=200, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Social media links
    tiktok = models.CharField(max_length=100, null=True, blank=True)
    whatsapp = models.CharField(max_length=20, null=True, blank=True)
    instagram = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
```

### 2.2 Store Models (store/models.py)

```python
# store/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Category(models.Model):
    """Product category"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ProductColor(models.Model):
    """Available product colors"""
    name = models.CharField(max_length=50)
    value = models.CharField(max_length=7)  # Hex color code
    
    class Meta:
        db_table = 'product_colors'
    
    def __str__(self):
        return self.name


class ProductSize(models.Model):
    """Available product sizes"""
    name = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'product_sizes'
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Product model matching frontend Product interface"""
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    colors = models.ManyToManyField(ProductColor, blank=True, related_name='products')
    sizes = models.ManyToManyField(ProductSize, blank=True, related_name='products')
    in_stock = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True,
                                  validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Product images"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'product_images'
        ordering = ['order']


class ProductSizeStock(models.Model):
    """Track stock status for each product size"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='size_stock')
    size = models.ForeignKey(ProductSize, on_delete=models.CASCADE)
    in_stock = models.BooleanField(default=True)
    quantity = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'product_size_stock'
        unique_together = ['product', 'size']


class Review(models.Model):
    """Product reviews"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    content = models.TextField()
    helpful_count = models.PositiveIntegerField(default=0)
    verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ['product', 'user']
    
    def __str__(self):
        return f"{self.user.first_name}'s review of {self.product.name}"


class Order(models.Model):
    """Order model matching frontend Order interface"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                             related_name='orders', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Customer info (for guest checkout)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    
    # Tracking
    tracking_number = models.CharField(max_length=100, null=True, blank=True)
    tracking_url = models.URLField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id} - {self.status}"


class OrderItem(models.Model):
    """Order items (cart items)"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of order
    selected_color = models.ForeignKey(ProductColor, on_delete=models.SET_NULL, null=True)
    selected_size = models.ForeignKey(ProductSize, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'order_items'
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"


class Address(models.Model):
    """User saved addresses"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50)  # e.g., "Home", "Work"
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'addresses'
        verbose_name_plural = 'addresses'
    
    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class Wishlist(models.Model):
    """User wishlist items"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'wishlist'
        unique_together = ['user', 'product']


class PaymentMethod(models.Model):
    """User saved payment methods"""
    CARD_TYPE_CHOICES = [
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('amex', 'American Express'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_methods')
    card_type = models.CharField(max_length=20, choices=CARD_TYPE_CHOICES)
    last_four = models.CharField(max_length=4)
    expiry_month = models.PositiveIntegerField()
    expiry_year = models.PositiveIntegerField()
    cardholder_name = models.CharField(max_length=200)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payment_methods'
    
    def save(self, *args, **kwargs):
        if self.is_default:
            PaymentMethod.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
```

### 2.3 Update Settings for Custom User Model

```python
# ecommerce_backend/settings.py

AUTH_USER_MODEL = 'accounts.User'
```

---

## 3. Serializers

### 3.1 Account Serializers (accounts/serializers.py)

```python
# accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 
            'avatar', 'phone', 'bio', 'location', 'occupation',
            'date_of_birth', 'tiktok', 'whatsapp', 'instagram',
            'created_at'
        ]
        read_only_fields = ['id', 'role', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'bio', 
            'location', 'occupation', 'date_of_birth',
            'tiktok', 'whatsapp', 'instagram', 'avatar'
        ]
```

### 3.2 Store Serializers (store/serializers.py)

```python
# store/serializers.py

from rest_framework import serializers
from .models import (
    Category, Product, ProductColor, ProductSize, ProductImage,
    ProductSizeStock, Review, Order, OrderItem, Address, Wishlist, PaymentMethod
)
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count']
    
    def get_product_count(self, obj):
        return obj.products.count()


class ProductColorSerializer(serializers.ModelSerializer):
    """Product color serializer"""
    
    class Meta:
        model = ProductColor
        fields = ['id', 'name', 'value']


class ProductSizeSerializer(serializers.ModelSerializer):
    """Product size serializer"""
    in_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductSize
        fields = ['id', 'name', 'in_stock']
    
    def get_in_stock(self, obj):
        # Check if being serialized within a product context
        product = self.context.get('product')
        if product:
            stock = ProductSizeStock.objects.filter(product=product, size=obj).first()
            return stock.in_stock if stock else True
        return True


class ProductImageSerializer(serializers.ModelSerializer):
    """Product image serializer"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list (minimal data)"""
    category = serializers.CharField(source='category.slug')
    images = serializers.SerializerMethodField()
    colors = ProductColorSerializer(many=True, read_only=True)
    sizes = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'original_price', 'description',
            'category', 'images', 'colors', 'sizes', 'in_stock',
            'featured', 'rating', 'review_count'
        ]
    
    def get_images(self, obj):
        return [img.image.url for img in obj.images.all()]
    
    def get_sizes(self, obj):
        serializer = ProductSizeSerializer(
            obj.sizes.all(), 
            many=True, 
            context={'product': obj}
        )
        return serializer.data


class ProductDetailSerializer(ProductListSerializer):
    """Serializer for product detail (full data)"""
    category_detail = CategorySerializer(source='category', read_only=True)
    
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['category_detail']


class ReviewSerializer(serializers.ModelSerializer):
    """Review serializer"""
    user = UserSerializer(read_only=True)
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'user_avatar', 'rating', 
            'title', 'content', 'helpful_count', 'verified_purchase', 
            'created_at'
        ]
        read_only_fields = ['user', 'helpful_count', 'verified_purchase', 'created_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_user_avatar(self, obj):
        return obj.user.avatar.url if obj.user.avatar else None


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = Review
        fields = ['rating', 'title', 'content']


class OrderItemSerializer(serializers.ModelSerializer):
    """Order item serializer"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    selected_color = ProductColorSerializer(read_only=True)
    selected_color_id = serializers.IntegerField(write_only=True, required=False)
    selected_size = ProductSizeSerializer(read_only=True)
    selected_size_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'price',
            'selected_color', 'selected_color_id', 
            'selected_size', 'selected_size_id'
        ]
        read_only_fields = ['price']


class OrderSerializer(serializers.ModelSerializer):
    """Order serializer"""
    items = OrderItemSerializer(many=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'status_display', 'subtotal', 'shipping', 'total',
            'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'state', 'zip_code', 'country',
            'tracking_number', 'tracking_url',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'subtotal', 'shipping', 'total', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'state', 'zip_code', 'country',
            'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate totals
        subtotal = sum(
            Product.objects.get(id=item['product_id']).price * item['quantity']
            for item in items_data
        )
        shipping = 0 if subtotal >= 100 else 10  # Free shipping over $100
        total = subtotal + shipping
        
        # Create order
        order = Order.objects.create(
            **validated_data,
            subtotal=subtotal,
            shipping=shipping,
            total=total,
            user=self.context['request'].user if self.context['request'].user.is_authenticated else None
        )
        
        # Create order items
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.price,
                selected_color_id=item_data.get('selected_color_id'),
                selected_size_id=item_data.get('selected_size_id')
            )
        
        return order


class AddressSerializer(serializers.ModelSerializer):
    """Address serializer"""
    
    class Meta:
        model = Address
        fields = [
            'id', 'label', 'first_name', 'last_name', 'address',
            'city', 'state', 'zip_code', 'country', 'phone', 
            'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class WishlistSerializer(serializers.ModelSerializer):
    """Wishlist serializer"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'added_at']
        read_only_fields = ['id', 'added_at']


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Payment method serializer"""
    card_type_display = serializers.CharField(source='get_card_type_display', read_only=True)
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'card_type', 'card_type_display', 'last_four',
            'expiry_month', 'expiry_year', 'cardholder_name', 
            'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
```

---

## 4. Views

### 4.1 Account Views (accounts/views.py)

```python
# accounts/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    PasswordChangeSerializer, UserProfileUpdateSerializer
)

User = get_user_model()


# =============================================================================
# AUTHENTICATION VIEWS
# =============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user account.
    
    POST /api/auth/register/
    Body: {
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "securepassword123",
        "password_confirm": "securepassword123"
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Account created successfully!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Registration failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Authenticate user and return tokens.
    
    POST /api/auth/login/
    Body: {
        "email": "user@example.com",
        "password": "securepassword123"
    }
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Login successful!',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({
        'success': False,
        'message': 'Invalid input',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by blacklisting refresh token.
    
    POST /api/auth/logout/
    Body: {
        "refresh": "refresh_token_here"
    }
    """
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# USER PROFILE VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get current user's profile.
    
    GET /api/auth/profile/
    """
    serializer = UserSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update current user's profile.
    
    PUT/PATCH /api/auth/profile/
    Body: {
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890",
        "bio": "My bio",
        "location": "New York",
        "occupation": "Developer",
        "date_of_birth": "1990-01-15",
        "tiktok": "@username",
        "whatsapp": "+1234567890",
        "instagram": "@username"
    }
    """
    serializer = UserProfileUpdateSerializer(
        request.user, 
        data=request.data, 
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Update failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user's password.
    
    POST /api/auth/change-password/
    Body: {
        "current_password": "oldpassword",
        "new_password": "newpassword123",
        "new_password_confirm": "newpassword123"
    }
    """
    serializer = PasswordChangeSerializer(data=request.data)
    
    if serializer.is_valid():
        user = request.user
        
        # Check current password
        if not user.check_password(serializer.validated_data['current_password']):
            return Response({
                'success': False,
                'message': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Invalid input',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar(request):
    """
    Upload user avatar.
    
    POST /api/auth/avatar/
    Body: FormData with 'avatar' file
    """
    if 'avatar' not in request.FILES:
        return Response({
            'success': False,
            'message': 'No avatar file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    avatar = request.FILES['avatar']
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if avatar.content_type not in allowed_types:
        return Response({
            'success': False,
            'message': 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file size (max 5MB)
    if avatar.size > 5 * 1024 * 1024:
        return Response({
            'success': False,
            'message': 'File too large. Maximum size is 5MB'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Delete old avatar if exists
    if request.user.avatar:
        request.user.avatar.delete()
    
    request.user.avatar = avatar
    request.user.save()
    
    return Response({
        'success': True,
        'message': 'Avatar uploaded successfully',
        'avatar_url': request.user.avatar.url
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_avatar(request):
    """
    Delete user avatar.
    
    DELETE /api/auth/avatar/
    """
    if request.user.avatar:
        request.user.avatar.delete()
        request.user.save()
    
    return Response({
        'success': True,
        'message': 'Avatar deleted successfully'
    }, status=status.HTTP_200_OK)
```

### 4.2 Store Views (store/views.py)

```python
# store/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg

from .models import (
    Category, Product, Review, Order, Address, Wishlist, PaymentMethod
)
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ReviewSerializer, ReviewCreateSerializer, OrderSerializer, 
    OrderCreateSerializer, AddressSerializer, WishlistSerializer,
    PaymentMethodSerializer
)


# =============================================================================
# PAGINATION HELPER
# =============================================================================

class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


def get_paginated_response(queryset, request, serializer_class, context=None):
    """Helper function to return paginated response"""
    paginator = StandardPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    if context:
        serializer = serializer_class(page, many=True, context=context)
    else:
        serializer = serializer_class(page, many=True)
    
    return paginator.get_paginated_response(serializer.data)


# =============================================================================
# CATEGORY VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    """
    Get all categories.
    
    GET /api/categories/
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    
    return Response({
        'success': True,
        'categories': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def category_detail(request, slug):
    """
    Get category by slug.
    
    GET /api/categories/<slug>/
    """
    category = get_object_or_404(Category, slug=slug)
    serializer = CategorySerializer(category)
    
    return Response({
        'success': True,
        'category': serializer.data
    }, status=status.HTTP_200_OK)


# =============================================================================
# PRODUCT VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    """
    Get all products with filtering and sorting.
    
    GET /api/products/
    
    Query Parameters:
    - category: Filter by category slug
    - search: Search in name and description
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - in_stock: Filter by stock status (true/false)
    - featured: Filter by featured status (true/false)
    - sort: Sort by (name, -name, price, -price, created, -created, rating, -rating)
    - page: Page number
    - page_size: Items per page (default: 12, max: 50)
    """
    products = Product.objects.all()
    
    # Category filter
    category = request.query_params.get('category')
    if category and category != 'all':
        products = products.filter(category__slug=category)
    
    # Search filter
    search = request.query_params.get('search')
    if search:
        products = products.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )
    
    # Price filters
    min_price = request.query_params.get('min_price')
    max_price = request.query_params.get('max_price')
    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)
    
    # Stock filter
    in_stock = request.query_params.get('in_stock')
    if in_stock is not None:
        products = products.filter(in_stock=in_stock.lower() == 'true')
    
    # Featured filter
    featured = request.query_params.get('featured')
    if featured is not None:
        products = products.filter(featured=featured.lower() == 'true')
    
    # Sorting
    sort = request.query_params.get('sort', '-created')
    sort_mapping = {
        'name': 'name',
        '-name': '-name',
        'price': 'price',
        '-price': '-price',
        'created': 'created_at',
        '-created': '-created_at',
        'rating': '-rating',
        '-rating': 'rating',
    }
    products = products.order_by(sort_mapping.get(sort, '-created_at'))
    
    return get_paginated_response(products, request, ProductListSerializer)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    """
    Get product by ID.
    
    GET /api/products/<id>/
    """
    product = get_object_or_404(Product, pk=pk)
    serializer = ProductDetailSerializer(product)
    
    return Response({
        'success': True,
        'product': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """
    Get featured products.
    
    GET /api/products/featured/
    """
    products = Product.objects.filter(featured=True)[:8]
    serializer = ProductListSerializer(products, many=True)
    
    return Response({
        'success': True,
        'products': serializer.data
    }, status=status.HTTP_200_OK)


# =============================================================================
# REVIEW VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def product_reviews(request, product_id):
    """
    Get reviews for a product with filtering and sorting.
    
    GET /api/products/<product_id>/reviews/
    
    Query Parameters:
    - rating: Filter by rating (1-5)
    - sort: Sort by (newest, oldest, highest, lowest, helpful)
    """
    product = get_object_or_404(Product, pk=product_id)
    reviews = product.reviews.all()
    
    # Rating filter
    rating = request.query_params.get('rating')
    if rating and rating != 'all':
        reviews = reviews.filter(rating=int(rating))
    
    # Sorting
    sort = request.query_params.get('sort', 'newest')
    sort_mapping = {
        'newest': '-created_at',
        'oldest': 'created_at',
        'highest': '-rating',
        'lowest': 'rating',
        'helpful': '-helpful_count',
    }
    reviews = reviews.order_by(sort_mapping.get(sort, '-created_at'))
    
    return get_paginated_response(reviews, request, ReviewSerializer)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request, product_id):
    """
    Create a review for a product.
    
    POST /api/products/<product_id>/reviews/
    Body: {
        "rating": 5,
        "title": "Great product!",
        "content": "Really loved this product..."
    }
    """
    product = get_object_or_404(Product, pk=product_id)
    
    # Check if user already reviewed this product
    if Review.objects.filter(product=product, user=request.user).exists():
        return Response({
            'success': False,
            'message': 'You have already reviewed this product'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ReviewCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        # Check if user has purchased this product
        verified_purchase = Order.objects.filter(
            user=request.user,
            items__product=product,
            status='delivered'
        ).exists()
        
        review = serializer.save(
            product=product,
            user=request.user,
            verified_purchase=verified_purchase
        )
        
        # Update product rating
        avg_rating = product.reviews.aggregate(Avg('rating'))['rating__avg']
        product.rating = round(avg_rating, 1)
        product.review_count = product.reviews.count()
        product.save()
        
        return Response({
            'success': True,
            'message': 'Review submitted successfully',
            'review': ReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Invalid input',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_review_helpful(request, review_id):
    """
    Mark a review as helpful.
    
    POST /api/reviews/<review_id>/helpful/
    """
    review = get_object_or_404(Review, pk=review_id)
    review.helpful_count += 1
    review.save()
    
    return Response({
        'success': True,
        'message': 'Review marked as helpful',
        'helpful_count': review.helpful_count
    }, status=status.HTTP_200_OK)


# =============================================================================
# ORDER VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    """
    Get user's orders.
    
    GET /api/orders/
    
    Query Parameters:
    - status: Filter by status (pending, paid, processing, shipped, delivered)
    """
    orders = Order.objects.filter(user=request.user)
    
    # Status filter
    order_status = request.query_params.get('status')
    if order_status:
        orders = orders.filter(status=order_status)
    
    return get_paginated_response(orders, request, OrderSerializer)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    """
    Get order by ID.
    
    GET /api/orders/<id>/
    """
    order = get_object_or_404(Order, pk=pk, user=request.user)
    serializer = OrderSerializer(order)
    
    return Response({
        'success': True,
        'order': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow guest checkout
def create_order(request):
    """
    Create a new order.
    
    POST /api/orders/
    Body: {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip_code": "10001",
        "country": "USA",
        "items": [
            {
                "product_id": 1,
                "quantity": 2,
                "selected_color_id": 1,
                "selected_size_id": 2
            }
        ]
    }
    """
    serializer = OrderCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        order = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Order created successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Invalid order data',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# ADDRESS VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def address_list(request):
    """
    Get user's addresses.
    
    GET /api/addresses/
    """
    addresses = Address.objects.filter(user=request.user)
    serializer = AddressSerializer(addresses, many=True)
    
    return Response({
        'success': True,
        'addresses': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_address(request):
    """
    Create a new address.
    
    POST /api/addresses/
    """
    serializer = AddressSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save(user=request.user)
        
        return Response({
            'success': True,
            'message': 'Address added successfully',
            'address': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Invalid address data',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_address(request, pk):
    """
    Update an address.
    
    PUT/PATCH /api/addresses/<id>/
    """
    address = get_object_or_404(Address, pk=pk, user=request.user)
    serializer = AddressSerializer(address, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Address updated successfully',
            'address': serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Invalid address data',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_address(request, pk):
    """
    Delete an address.
    
    DELETE /api/addresses/<id>/
    """
    address = get_object_or_404(Address, pk=pk, user=request.user)
    address.delete()
    
    return Response({
        'success': True,
        'message': 'Address deleted successfully'
    }, status=status.HTTP_200_OK)


# =============================================================================
# WISHLIST VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    """
    Get user's wishlist.
    
    GET /api/wishlist/
    """
    wishlist = Wishlist.objects.filter(user=request.user)
    serializer = WishlistSerializer(wishlist, many=True)
    
    return Response({
        'success': True,
        'wishlist': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    """
    Add product to wishlist.
    
    POST /api/wishlist/
    Body: {
        "product_id": 1
    }
    """
    product_id = request.data.get('product_id')
    
    if Wishlist.objects.filter(user=request.user, product_id=product_id).exists():
        return Response({
            'success': False,
            'message': 'Product already in wishlist'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = WishlistSerializer(data={'product_id': product_id})
    
    if serializer.is_valid():
        serializer.save(user=request.user)
        
        return Response({
            'success': True,
            'message': 'Added to wishlist',
            'item': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Invalid product',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    """
    Remove product from wishlist.
    
    DELETE /api/wishlist/<product_id>/
    """
    wishlist_item = get_object_or_404(
        Wishlist, 
        user=request.user, 
        product_id=product_id
    )
    wishlist_item.delete()
    
    return Response({
        'success': True,
        'message': 'Removed from wishlist'
    }, status=status.HTTP_200_OK)


# =============================================================================
# PAYMENT METHOD VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_method_list(request):
    """
    Get user's payment methods.
    
    GET /api/payment-methods/
    """
    payment_methods = PaymentMethod.objects.filter(user=request.user)
    serializer = PaymentMethodSerializer(payment_methods, many=True)
    
    return Response({
        'success': True,
        'payment_methods': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_method(request):
    """
    Add a new payment method.
    
    POST /api/payment-methods/
    Body: {
        "card_type": "visa",
        "last_four": "4242",
        "expiry_month": 12,
        "expiry_year": 2025,
        "cardholder_name": "John Doe",
        "is_default": true
    }
    """
    serializer = PaymentMethodSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save(user=request.user)
        
        return Response({
            'success': True,
            'message': 'Payment method added successfully',
            'payment_method': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Invalid payment method data',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_payment_method(request, pk):
    """
    Delete a payment method.
    
    DELETE /api/payment-methods/<id>/
    """
    payment_method = get_object_or_404(
        PaymentMethod, 
        pk=pk, 
        user=request.user
    )
    payment_method.delete()
    
    return Response({
        'success': True,
        'message': 'Payment method deleted successfully'
    }, status=status.HTTP_200_OK)


# =============================================================================
# ADMIN VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """
    Get admin dashboard statistics.
    
    GET /api/admin/stats/
    """
    from django.db.models import Sum, Count
    from django.utils import timezone
    from datetime import timedelta
    
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    
    stats = {
        'total_products': Product.objects.count(),
        'total_orders': Order.objects.count(),
        'total_customers': User.objects.filter(role='user').count(),
        'total_revenue': Order.objects.filter(
            status__in=['paid', 'processing', 'shipped', 'delivered']
        ).aggregate(Sum('total'))['total__sum'] or 0,
        'orders_today': Order.objects.filter(created_at__date=today).count(),
        'orders_last_30_days': Order.objects.filter(created_at__date__gte=last_30_days).count(),
        'pending_orders': Order.objects.filter(status='pending').count(),
        'low_stock_products': Product.objects.filter(in_stock=False).count(),
    }
    
    return Response({
        'success': True,
        'stats': stats
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_order_list(request):
    """
    Get all orders (admin).
    
    GET /api/admin/orders/
    """
    orders = Order.objects.all()
    
    # Status filter
    order_status = request.query_params.get('status')
    if order_status:
        orders = orders.filter(status=order_status)
    
    return get_paginated_response(orders, request, OrderSerializer)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_update_order_status(request, pk):
    """
    Update order status (admin).
    
    PATCH /api/admin/orders/<id>/status/
    Body: {
        "status": "shipped",
        "tracking_number": "ABC123",
        "tracking_url": "https://tracking.example.com/ABC123"
    }
    """
    order = get_object_or_404(Order, pk=pk)
    
    new_status = request.data.get('status')
    if new_status:
        order.status = new_status
    
    tracking_number = request.data.get('tracking_number')
    if tracking_number:
        order.tracking_number = tracking_number
    
    tracking_url = request.data.get('tracking_url')
    if tracking_url:
        order.tracking_url = tracking_url
    
    order.save()
    
    return Response({
        'success': True,
        'message': 'Order updated successfully',
        'order': OrderSerializer(order).data
    }, status=status.HTTP_200_OK)
```

---

## 5. URLs

### 5.1 Project URLs (ecommerce_backend/urls.py)

```python
# ecommerce_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('store.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 5.2 Accounts URLs (accounts/urls.py)

```python
# accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('avatar/', views.upload_avatar, name='upload_avatar'),
    path('avatar/delete/', views.delete_avatar, name='delete_avatar'),
]
```

### 5.3 Store URLs (store/urls.py)

```python
# store/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.category_list, name='category_list'),
    path('categories/<slug:slug>/', views.category_detail, name='category_detail'),
    
    # Products
    path('products/', views.product_list, name='product_list'),
    path('products/featured/', views.featured_products, name='featured_products'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    
    # Reviews
    path('products/<int:product_id>/reviews/', views.product_reviews, name='product_reviews'),
    path('products/<int:product_id>/reviews/create/', views.create_review, name='create_review'),
    path('reviews/<int:review_id>/helpful/', views.mark_review_helpful, name='mark_review_helpful'),
    
    # Orders
    path('orders/', views.order_list, name='order_list'),
    path('orders/create/', views.create_order, name='create_order'),
    path('orders/<int:pk>/', views.order_detail, name='order_detail'),
    
    # Addresses
    path('addresses/', views.address_list, name='address_list'),
    path('addresses/create/', views.create_address, name='create_address'),
    path('addresses/<int:pk>/', views.update_address, name='update_address'),
    path('addresses/<int:pk>/delete/', views.delete_address, name='delete_address'),
    
    # Wishlist
    path('wishlist/', views.wishlist_list, name='wishlist_list'),
    path('wishlist/add/', views.add_to_wishlist, name='add_to_wishlist'),
    path('wishlist/<int:product_id>/remove/', views.remove_from_wishlist, name='remove_from_wishlist'),
    
    # Payment Methods
    path('payment-methods/', views.payment_method_list, name='payment_method_list'),
    path('payment-methods/create/', views.create_payment_method, name='create_payment_method'),
    path('payment-methods/<int:pk>/delete/', views.delete_payment_method, name='delete_payment_method'),
    
    # Admin
    path('admin/stats/', views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/orders/', views.admin_order_list, name='admin_order_list'),
    path('admin/orders/<int:pk>/status/', views.admin_update_order_status, name='admin_update_order_status'),
]
```

---

## 6. Authentication

### 6.1 JWT Token Flow

```
1. User registers/logs in → Server returns access + refresh tokens
2. Frontend stores tokens (localStorage/httpOnly cookie)
3. All authenticated requests include: Authorization: Bearer <access_token>
4. When access token expires, use refresh token to get new access token
5. On logout, blacklist refresh token
```

### 6.2 Token Refresh Setup

```python
# Add to INSTALLED_APPS in settings.py
INSTALLED_APPS = [
    ...
    'rest_framework_simplejwt.token_blacklist',
]

# Run migrations after adding
python manage.py migrate
```

---

## 7. CORS Configuration

```python
# ecommerce_backend/settings.py

# Development settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",      # Vite dev server
    "http://localhost:3000",      # Alternative React port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# OR allow all origins in development (not recommended for production)
# CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Production settings
# CORS_ALLOWED_ORIGINS = [
#     "https://yourdomain.com",
# ]
```

---

## 8. Frontend Integration

### 8.1 API Client Setup

Create a file `src/lib/api.ts` in your React project:

```typescript
// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface TokenPair {
  access: string;
  refresh: string;
}

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  
  private setTokens(tokens: TokenPair): void {
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
  }
  
  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return true;
      }
      
      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const token = this.getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      let response = await fetch(url, { ...options, headers });
      
      // If 401, try to refresh token and retry
      if (response.status === 401 && token) {
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          (headers as Record<string, string>)['Authorization'] = 
            `Bearer ${this.getAccessToken()}`;
          response = await fetch(url, { ...options, headers });
        }
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        return { data: null, error: data.message || 'Request failed' };
      }
      
      return { data, error: null };
    } catch (err) {
      return { data: null, error: 'Network error' };
    }
  }
  
  // Auth methods
  async login(email: string, password: string) {
    const result = await this.request<{
      success: boolean;
      message: string;
      user: User;
      tokens: TokenPair;
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.data?.success) {
      this.setTokens(result.data.tokens);
    }
    
    return result;
  }
  
  async register(data: { 
    email: string; 
    firstName: string; 
    lastName: string; 
    password: string;
    passwordConfirm: string;
  }) {
    const result = await this.request<{
      success: boolean;
      message: string;
      user: User;
      tokens: TokenPair;
    }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
        password_confirm: data.passwordConfirm,
      }),
    });
    
    if (result.data?.success) {
      this.setTokens(result.data.tokens);
    }
    
    return result;
  }
  
  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
    
    this.clearTokens();
  }
  
  // Convenience methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
```

### 8.2 Updated AuthContext

```typescript
// src/context/AuthContext.tsx (updated for Django backend)

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  date_of_birth?: string;
  tiktok?: string;
  whatsapp?: string;
  instagram?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const { data } = await api.get<{ success: boolean; user: User }>('/auth/profile/');
    if (data?.success) {
      setUser(data.user);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await api.login(email, password);
    
    if (data?.success) {
      setUser(data.user);
      return { success: true, message: data.message };
    }
    
    return { success: false, message: error || 'Login failed' };
  };

  const signup = async (signupData: SignupData) => {
    const { data, error } = await api.register({
      email: signupData.email,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      password: signupData.password,
      passwordConfirm: signupData.passwordConfirm,
    });
    
    if (data?.success) {
      setUser(data.user);
      return { success: true, message: data.message };
    }
    
    return { success: false, message: error || 'Signup failed' };
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const { data, error } = await api.patch<{ success: boolean; message: string; user: User }>(
      '/auth/profile/update/',
      profileData
    );
    
    if (data?.success) {
      setUser(data.user);
      return { success: true, message: data.message };
    }
    
    return { success: false, message: error || 'Update failed' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 8.3 Environment Variables

Create `.env` file in React project root:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 9. File Uploads

### 9.1 Avatar Upload Function

```typescript
// In your React component or API client

async function uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string }> {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}/auth/avatar/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (data.success) {
    return { success: true, avatarUrl: data.avatar_url };
  }
  
  return { success: false };
}
```

---

## 10. Testing

### 10.1 Run Django Server

```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### 10.2 API Testing with curl

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","first_name":"Test","last_name":"User","password":"testpass123","password_confirm":"testpass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Get products
curl http://localhost:8000/api/products/

# Get products with filters
curl "http://localhost:8000/api/products/?category=clothing&min_price=20&sort=-price"
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login user |
| POST | `/api/auth/logout/` | Logout user |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get current user profile |
| PATCH | `/api/auth/profile/update/` | Update profile |
| POST | `/api/auth/change-password/` | Change password |
| POST | `/api/auth/avatar/` | Upload avatar |
| DELETE | `/api/auth/avatar/delete/` | Delete avatar |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List products (with filters) |
| GET | `/api/products/<id>/` | Get product details |
| GET | `/api/products/featured/` | Get featured products |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/` | List categories |
| GET | `/api/categories/<slug>/` | Get category details |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/<id>/reviews/` | Get product reviews |
| POST | `/api/products/<id>/reviews/create/` | Create review |
| POST | `/api/reviews/<id>/helpful/` | Mark review helpful |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List user orders |
| POST | `/api/orders/create/` | Create order |
| GET | `/api/orders/<id>/` | Get order details |

### Addresses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses/` | List addresses |
| POST | `/api/addresses/create/` | Create address |
| PATCH | `/api/addresses/<id>/` | Update address |
| DELETE | `/api/addresses/<id>/delete/` | Delete address |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist/` | Get wishlist |
| POST | `/api/wishlist/add/` | Add to wishlist |
| DELETE | `/api/wishlist/<product_id>/remove/` | Remove from wishlist |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats/` | Dashboard statistics |
| GET | `/api/admin/orders/` | All orders |
| PATCH | `/api/admin/orders/<id>/status/` | Update order status |

---

## Production Checklist

- [ ] Set `DEBUG = False` in settings
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set proper `CORS_ALLOWED_ORIGINS`
- [ ] Use environment variables for secrets
- [ ] Configure proper database (PostgreSQL recommended)
- [ ] Set up static files serving (whitenoise or nginx)
- [ ] Enable HTTPS
- [ ] Configure proper logging
- [ ] Set up backup strategy for database

---

## Common Issues & Solutions

### 1. CORS Errors
Ensure `corsheaders.middleware.CorsMiddleware` is at the top of `MIDDLEWARE` list.

### 2. Token Expiry
Implement token refresh in frontend to handle expired access tokens.

### 3. File Upload Issues
Ensure `MEDIA_ROOT` and `MEDIA_URL` are configured correctly.

### 4. 500 Errors
Check Django server logs for detailed error messages.

---

*This guide provides a complete backend structure. Adjust models and views based on your specific requirements.*
