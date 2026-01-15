# PHP REST API for Shaheeda E-commerce

Complete PHP backend API replacing Django. Works with XAMPP locally and cPanel in production.

## Quick Start (XAMPP)

1. **Start XAMPP** - Start Apache and MySQL
2. **Create Database** - Open phpMyAdmin, create `shaheeda_ecommerce`
3. **Import Schema** - Import `database/schema.sql`
4. **Copy Files** - Copy `php-api` folder to `C:\xampp\htdocs\api`
5. **Update Config** - Edit `config/database.php` with your credentials
6. **Test** - Visit `http://localhost/api/health`

## Folder Structure

```
php-api/
├── config/
│   ├── database.php    # MySQL connection
│   ├── jwt.php         # JWT authentication
│   └── cors.php        # CORS headers
├── endpoints/
│   ├── auth/           # Login, register, profile
│   ├── products/       # Products, reviews
│   ├── categories/     # Categories
│   ├── orders/         # Orders
│   ├── addresses/      # User addresses
│   ├── wishlist/       # Wishlist
│   ├── payment-methods/# Payment methods
│   └── admin/          # Admin endpoints
├── helpers/
│   └── response.php    # JSON response helpers
├── uploads/            # File uploads (avatars, etc.)
├── database/
│   └── schema.sql      # MySQL schema
├── index.php           # Main router
├── .htaccess           # URL rewriting
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/login | No | User login |
| POST | /auth/register | No | User registration |
| GET | /auth/user | Yes | Get current user |
| PUT | /auth/user | Yes | Update profile |
| GET | /categories | No | List categories |
| GET | /products | No | List products |
| GET | /products/featured | No | Featured products |
| GET | /products/{id} | No | Product detail |
| GET | /orders | Yes | User orders |
| POST | /orders/create | Yes | Create order |
| GET | /addresses | Yes | User addresses |
| GET | /wishlist | Yes | User wishlist |
| GET | /admin/stats | Admin | Dashboard stats |

## cPanel Deployment

1. Upload `php-api` folder to `public_html/api`
2. Create MySQL database in cPanel
3. Update `config/database.php` with cPanel credentials
4. Import `database/schema.sql`
5. Update `config/cors.php` with production domains
6. Update `config/jwt.php` with secure secret key

## Default Admin

- Email: `admin@shaheeda.com`
- Password: `Admin123!`
