<?php
/**
 * CORS Configuration
 * Update allowed origins for production
 */

// Allowed origins - add your domains here
$allowed_origins = [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    'https://shop-heart-flow.lovable.app',
    // Add your production domain:
    // 'https://yourdomain.com',
    // 'https://www.yourdomain.com',
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check exact match first
$origin_allowed = in_array($origin, $allowed_origins);

// Also allow any lovable.app subdomain
if (!$origin_allowed && !empty($origin) && preg_match('/^https:\/\/.*\.lovable\.app$/', $origin)) {
    $origin_allowed = true;
}

if ($origin_allowed && !empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
} else if (empty($origin)) {
    // Same-origin or non-browser requests
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
