# PHP REST API for Shaheeda E-commerce

Complete PHP backend API for the Shaheeda e-commerce platform. Works with XAMPP locally and cPanel in production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup (XAMPP)](#local-development-setup-xampp)
3. [Frontend Connection](#frontend-connection)
4. [cPanel Production Deployment](#cpanel-production-deployment)
5. [API Reference](#api-reference)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Local Development
- **XAMPP** (PHP 7.4+ and MySQL 5.7+) - [Download](https://www.apachefriends.org/)
- **Git** (optional) - [Download](https://git-scm.com/)
- **Text Editor** - VS Code, Sublime Text, or similar

### For Production
- **cPanel Hosting** with PHP 7.4+ and MySQL support
- **Domain Name** (optional but recommended)
- **SSL Certificate** (recommended for HTTPS)

---

## Local Development Setup (XAMPP)

### Step 1: Install XAMPP

1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Run the installer and follow the prompts
3. Install to default location: `C:\xampp` (Windows) or `/Applications/XAMPP` (Mac)

### Step 2: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Both should show green "Running" status

### Step 3: Create the Database

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **"New"** in the left sidebar
3. Enter database name: `shaheeda_ecommerce`
4. Select collation: `utf8mb4_unicode_ci`
5. Click **"Create"**

### Step 4: Import Database Schema

1. In phpMyAdmin, click on `shaheeda_ecommerce` database
2. Click the **"Import"** tab
3. Click **"Choose File"** and select `php-api/database/schema.sql`
4. Click **"Go"** at the bottom
5. You should see "Import has been successfully finished"

### Step 5: Copy API Files

**Windows:**
```bash
# Copy the php-api folder to XAMPP htdocs
xcopy /E /I "php-api" "C:\xampp\htdocs\api"
```

**Mac/Linux:**
```bash
# Copy the php-api folder to XAMPP htdocs
cp -r php-api /Applications/XAMPP/htdocs/api
```

Or manually copy the `php-api` folder and rename it to `api` in:
- Windows: `C:\xampp\htdocs\api`
- Mac: `/Applications/XAMPP/htdocs/api`

### Step 6: Configure Database Connection

Edit `C:\xampp\htdocs\api\config\database.php`:

```php
<?php
// Local Development Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'shaheeda_ecommerce');
define('DB_USER', 'root');
define('DB_PASS', ''); // Default XAMPP has no password

// Create connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Database connection failed']));
    }
}
```

### Step 7: Configure JWT Secret

Edit `C:\xampp\htdocs\api\config\jwt.php`:

```php
<?php
// IMPORTANT: Change this to a secure random string in production!
define('JWT_SECRET', 'your-local-development-secret-key-change-in-production');
define('JWT_EXPIRY', 86400); // 24 hours in seconds
```

### Step 8: Configure CORS

Edit `C:\xampp\htdocs\api\config\cors.php`:

```php
<?php
// Allowed origins for local development
$allowed_origins = [
    'http://localhost:5173',      // Vite default
    'http://localhost:3000',      // Alternative port
    'http://localhost:8080',      // Alternative port
    'http://127.0.0.1:5173',
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### Step 9: Test the API

1. Open your browser and go to: `http://localhost/api/health`
2. You should see:
```json
{
  "status": "ok",
  "message": "Shaheeda E-commerce API is running",
  "timestamp": "2024-01-15T10:30:00+00:00"
}
```

### Step 10: Test with Postman/curl

**Test Health Endpoint:**
```bash
curl http://localhost/api/health
```

**Test Login:**
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shaheeda.com","password":"Admin123!"}'
```

**Test Products:**
```bash
curl http://localhost/api/products
```

---

## Frontend Connection

### Step 1: Update Environment Variables

Edit the `.env` file in your React project root:

```env
VITE_API_URL=http://localhost/api
```

### Step 2: Start the Frontend

```bash
npm run dev
```

### Step 3: Verify Connection

1. Open the React app in your browser
2. Open Developer Tools (F12) → Network tab
3. Navigate to the Shop page
4. You should see successful API calls to `http://localhost/api/products`

### Common Issues

**CORS Errors:**
- Make sure XAMPP Apache is running
- Verify the origin in `cors.php` matches your frontend URL
- Check that the `.htaccess` file is in the `api` folder

**404 Not Found:**
- Ensure the `api` folder is directly in `htdocs`
- Verify `.htaccess` mod_rewrite is enabled in Apache

---

## cPanel Production Deployment

### Pre-Deployment Checklist

- [ ] cPanel login credentials ready
- [ ] Domain name configured (or use cPanel subdomain)
- [ ] SSL certificate installed (recommended)
- [ ] Frontend deployed to Lovable or hosting

### Step 1: Create MySQL Database

1. Log into **cPanel**
2. Go to **MySQL Databases**
3. Create a new database:
   - Database name: `shaheeda_ecommerce`
   - Full name will be: `cpanelusername_shaheeda_ecommerce`
4. Create a new user:
   - Username: `shaheeda_user`
   - Password: Generate a strong password (save this!)
   - Full username will be: `cpanelusername_shaheeda_user`
5. Add user to database:
   - Select the user and database
   - Grant **ALL PRIVILEGES**
   - Click "Make Changes"

### Step 2: Upload PHP API Files

**Option A: Using File Manager**
1. In cPanel, open **File Manager**
2. Navigate to `public_html`
3. Create a new folder called `api`
4. Upload all contents of `php-api` folder into `public_html/api`

**Option B: Using FTP**
1. Connect via FTP (FileZilla recommended)
2. Navigate to `public_html`
3. Create `api` folder
4. Upload all contents of `php-api` folder

**Folder Structure on Server:**
```
public_html/
└── api/
    ├── config/
    │   ├── database.php
    │   ├── jwt.php
    │   └── cors.php
    ├── endpoints/
    │   ├── auth/
    │   ├── products/
    │   └── ...
    ├── helpers/
    ├── database/
    ├── uploads/
    ├── index.php
    └── .htaccess
```

### Step 3: Import Database Schema

1. In cPanel, open **phpMyAdmin**
2. Select your database (e.g., `cpanelusername_shaheeda_ecommerce`)
3. Click **Import** tab
4. Choose file: `database/schema.sql`
5. Click **Go**

### Step 4: Configure Database Connection

Edit `public_html/api/config/database.php`:

```php
<?php
// Production Configuration - cPanel
define('DB_HOST', 'localhost');
define('DB_NAME', 'cpanelusername_shaheeda_ecommerce'); // Your full database name
define('DB_USER', 'cpanelusername_shaheeda_user');      // Your full username
define('DB_PASS', 'YOUR_STRONG_PASSWORD_HERE');          // Password you created

function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Database connection failed']));
    }
}
```

### Step 5: Configure CORS for Production

Edit `public_html/api/config/cors.php`:

```php
<?php
// Production CORS Configuration
$allowed_origins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://your-app.lovable.app',        // Your Lovable app URL
    'https://id-preview--xxxxx.lovable.app' // Your Lovable preview URL
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (preg_match('/\.lovable\.app$/', $origin)) {
    // Allow all Lovable preview URLs
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### Step 6: Configure JWT Secret (IMPORTANT!)

Edit `public_html/api/config/jwt.php`:

```php
<?php
// Generate a secure secret: Use a random 64-character string
// You can generate one at: https://randomkeygen.com/
define('JWT_SECRET', 'REPLACE_WITH_64_CHARACTER_RANDOM_STRING_HERE');
define('JWT_EXPIRY', 86400); // 24 hours
```

**Generate a secure secret:**
```bash
# Linux/Mac terminal
openssl rand -hex 32

# Or use online generator: https://randomkeygen.com/
```

### Step 7: Create Uploads Folder

1. In File Manager, navigate to `public_html/api`
2. Create a new folder called `uploads`
3. Right-click → **Change Permissions**
4. Set to `755` or `775`
5. Check "Recurse into subdirectories"

### Step 8: Configure .htaccess

Ensure `public_html/api/.htaccess` contains:

```apache
RewriteEngine On

# Handle Authorization Header
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

# Redirect all requests to index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Deny access to sensitive files
<FilesMatch "\.(sql|md|json)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### Step 9: Force HTTPS (Recommended)

Add to the TOP of your `.htaccess`:

```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Step 10: Test Production API

1. Visit: `https://yourdomain.com/api/health`
2. You should see the health check response

### Step 11: Connect Frontend to Production API

Update your Lovable project's `.env`:

```env
VITE_API_URL=https://yourdomain.com/api
```

Or for local development pointing to production:
```env
VITE_API_URL=https://yourdomain.com/api
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | User login |
| POST | `/auth/logout` | Yes | User logout |
| GET | `/auth/user` | Yes | Get current user profile |
| PUT | `/auth/user` | Yes | Update user profile |
| POST | `/auth/upload-avatar` | Yes | Upload profile picture |

### Product Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List all products |
| GET | `/products/featured` | No | Get featured products |
| GET | `/products/{id}` | No | Get product details |
| GET | `/products/{id}/reviews` | No | Get product reviews |
| POST | `/products/{id}/reviews` | Yes | Create product review |

### Category Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List all categories |
| GET | `/categories/{id}` | No | Get category details |

### Order Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | Yes | List user orders |
| POST | `/orders/create` | Yes | Create new order |
| GET | `/orders/{id}` | Yes | Get order details |

### Address Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/addresses` | Yes | List user addresses |
| POST | `/addresses/create` | Yes | Add new address |
| PUT | `/addresses/{id}` | Yes | Update address |
| DELETE | `/addresses/{id}` | Yes | Delete address |

### Wishlist Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | Yes | List wishlist items |
| POST | `/wishlist/add` | Yes | Add to wishlist |
| DELETE | `/wishlist/{id}` | Yes | Remove from wishlist |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/stats` | Admin | Dashboard statistics |
| GET | `/admin/orders` | Admin | All orders |
| PUT | `/admin/orders/{id}/status` | Admin | Update order status |

### Request Examples

**Register User:**
```bash
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Login:**
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Products with Auth:**
```bash
curl https://yourdomain.com/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Best Practices

### 1. Change Default Admin Password
After importing the database, immediately change the admin password:
- Email: `admin@shaheeda.com`
- Default Password: `Admin123!`

### 2. Use Strong JWT Secret
Generate a cryptographically secure random string (64+ characters) for production.

### 3. Enable HTTPS
Always use HTTPS in production. Most cPanel hosts provide free SSL via Let's Encrypt.

### 4. Restrict CORS Origins
Only allow specific domains in `cors.php`. Never use `*` in production.

### 5. Database Security
- Use strong database passwords
- Limit database user privileges if possible
- Never expose database credentials in client-side code

### 6. Regular Backups
- Set up automated database backups in cPanel
- Download backups regularly
- Test backup restoration

### 7. Keep PHP Updated
Ensure your hosting uses PHP 7.4 or higher for security patches.

---

## Troubleshooting

### Database Connection Failed

**Error:** `Database connection failed`

**Solutions:**
1. Verify database credentials in `config/database.php`
2. Check database name format: `cpanelusername_dbname`
3. Ensure database user has proper privileges
4. Test connection in phpMyAdmin first

### CORS Errors

**Error:** `Access to fetch has been blocked by CORS policy`

**Solutions:**
1. Add your frontend URL to `config/cors.php` allowed origins
2. Clear browser cache
3. Check that `.htaccess` is properly configured
4. Verify Apache mod_headers is enabled

### 404 Not Found

**Error:** All API endpoints return 404

**Solutions:**
1. Ensure `.htaccess` is uploaded (it's a hidden file!)
2. Enable mod_rewrite in Apache
3. Check file permissions (755 for folders, 644 for files)
4. Verify `index.php` is in the `api` folder

### 500 Internal Server Error

**Error:** API returns 500 error

**Solutions:**
1. Check PHP error logs in cPanel → Error Log
2. Verify PHP version compatibility (7.4+)
3. Check file syntax errors
4. Ensure all required PHP extensions are enabled

### Authorization Header Missing

**Error:** JWT token not received

**Solutions:**
1. Add Authorization rewrite rule to `.htaccess`:
```apache
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]
```
2. For Apache with CGI/FastCGI, add to `.htaccess`:
```apache
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

### File Upload Errors

**Error:** Avatar upload fails

**Solutions:**
1. Create `uploads` folder in `api` directory
2. Set folder permissions to 755 or 775
3. Check PHP `upload_max_filesize` in cPanel → PHP Settings
4. Verify folder path in upload script

### Slow API Responses

**Solutions:**
1. Add database indexes (already in schema.sql)
2. Enable PHP OPcache in cPanel
3. Check hosting resource limits
4. Optimize queries if needed

---

## Default Credentials

**Admin User:**
- Email: `admin@shaheeda.com`
- Password: `Admin123!`

⚠️ **IMPORTANT:** Change these credentials immediately after deployment!

---

## Support

For issues specific to:
- **XAMPP:** [Apache Friends Forum](https://community.apachefriends.org/)
- **cPanel:** Contact your hosting provider
- **This API:** Check the troubleshooting section above

---

## License

MIT License - Feel free to use and modify for your projects.
