<?php
/**
 * CORS Configuration
 * Update allowed origins for production
 */

// Allowed origins - add your domains here
$allowed_origins = [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',
    'http://127.0.0.1:',
    'https://shop-heart-flow.lovable.app',  // Lovable published URL
    // Add your production domain:
    // 'https://yourdomain.com',
    // 'https://www.yourdomain.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else if (empty($origin)) {
    // Allow requests without origin (same-origin, Postman, etc.)
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
