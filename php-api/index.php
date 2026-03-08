<?php
/**
 * Main API Router
 * Shaheeda E-commerce PHP API
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/helpers/response.php';

// Parse request
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove base path and query string
$basePath = '/api';
$path = parse_url($requestUri, PHP_URL_PATH);
$path = preg_replace("#^$basePath#", '', $path);
$path = rtrim($path, '/');

// Route definitions
$routes = [
    // Health check
    'GET /health' => 'endpoints/health.php',
    
    // Auth
    'POST /auth/login' => 'endpoints/auth/login.php',
    'POST /auth/register' => 'endpoints/auth/register.php',
    'POST /auth/logout' => 'endpoints/auth/logout.php',
    'POST /auth/token/refresh' => 'endpoints/auth/refresh.php',
    'GET /auth/user' => 'endpoints/auth/user.php',
    'PUT /auth/user' => 'endpoints/auth/update-profile.php',
    'PUT /auth/update-profile' => 'endpoints/auth/update-profile.php',
    'POST /auth/user/avatar' => 'endpoints/auth/upload-avatar.php',
    'POST /auth/upload-avatar' => 'endpoints/auth/upload-avatar.php',
    'GET /auth/verify-email' => 'endpoints/auth/verify-email.php',
    'POST /auth/resend-verification' => 'endpoints/auth/resend-verification.php',
    
    // Categories
    'GET /categories' => 'endpoints/categories/list.php',
    'GET /categories/{slug}' => 'endpoints/categories/detail.php',
    
    // Products
    'GET /products' => 'endpoints/products/list.php',
    'GET /products/featured' => 'endpoints/products/featured.php',
    'GET /products/{id}' => 'endpoints/products/detail.php',
    'GET /products/{id}/reviews' => 'endpoints/products/reviews.php',
    'POST /products/{id}/reviews/create' => 'endpoints/products/create-review.php',
    
    // Reviews
    'POST /reviews/{id}/helpful' => 'endpoints/reviews/helpful.php',
    
    // Orders
    'GET /orders' => 'endpoints/orders/list.php',
    'GET /orders/{id}' => 'endpoints/orders/detail.php',
    'POST /orders/create' => 'endpoints/orders/create.php',
    
    // Addresses
    'GET /addresses' => 'endpoints/addresses/list.php',
    'POST /addresses/create' => 'endpoints/addresses/create.php',
    'PUT /addresses/{id}' => 'endpoints/addresses/update.php',
    'DELETE /addresses/{id}/delete' => 'endpoints/addresses/delete.php',
    
    // Wishlist
    'GET /wishlist' => 'endpoints/wishlist/list.php',
    'POST /wishlist/add' => 'endpoints/wishlist/add.php',
    'DELETE /wishlist/{id}/remove' => 'endpoints/wishlist/remove.php',
    
    // Payment Methods
    'GET /payment-methods' => 'endpoints/payment-methods/list.php',
    'POST /payment-methods/create' => 'endpoints/payment-methods/create.php',
    'DELETE /payment-methods/{id}/delete' => 'endpoints/payment-methods/delete.php',
    
    // Admin
    'GET /admin/stats' => 'endpoints/admin/stats.php',
    'GET /admin/orders' => 'endpoints/admin/orders.php',
    'PATCH /admin/orders/{id}/status' => 'endpoints/admin/update-order-status.php',
    'GET /admin/products' => 'endpoints/admin/products.php',
    'POST /admin/products/create' => 'endpoints/admin/create-product.php',
    'PUT /admin/products/{id}' => 'endpoints/admin/update-product.php',
    'DELETE /admin/products/{id}' => 'endpoints/admin/delete-product.php',
    'GET /admin/customers' => 'endpoints/admin/customers.php',
    'GET /admin/analytics' => 'endpoints/admin/analytics.php',
    'POST /admin/categories/create' => 'endpoints/admin/create-category.php',
    'PUT /admin/categories/{id}' => 'endpoints/admin/update-category.php',
    'DELETE /admin/categories/{id}' => 'endpoints/admin/delete-category.php',
];

// Match route
$matchedRoute = null;
$params = [];

foreach ($routes as $route => $file) {
    list($method, $pattern) = explode(' ', $route, 2);
    
    if ($requestMethod !== $method) {
        continue;
    }
    
    // Convert route pattern to regex
    $regex = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $pattern);
    $regex = "#^$regex$#";
    
    if (preg_match($regex, $path, $matches)) {
        $matchedRoute = $file;
        // Extract named parameters
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $params[$key] = $value;
            }
        }
        break;
    }
}

if ($matchedRoute) {
    // Make params available to the endpoint
    $GLOBALS['route_params'] = $params;
    
    $filePath = __DIR__ . '/' . $matchedRoute;
    if (file_exists($filePath)) {
        require $filePath;
    } else {
        errorResponse("Endpoint not implemented: $matchedRoute", 501);
    }
} else {
    notFoundResponse("Route not found: $requestMethod $path");
}
