<?php
/**
 * CORS Configuration
 * Supports local dev (XAMPP/WAMP/MAMP), Lovable preview/published domains,
 * and standard PHP/MySQL hosting deployments.
 */

$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://puretrustgeneralenterpise.com.ng',
    'https://shop-heart-flow.lovable.app',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

function isLocalNetworkOrigin(string $origin): bool {
    return (bool) preg_match(
        '/^https?:\/\/(' .
        'localhost|' .
        '127\.0\.0\.1|' .
        '\[::1\]|' .
        '10\.\d{1,3}\.\d{1,3}\.\d{1,3}|' .
        '192\.168\.\d{1,3}\.\d{1,3}|' .
        '172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|' .
        '[a-z0-9-]+|' .
        '[a-z0-9-]+\.local' .
        ')(:\d+)?$/i',
        $origin
    );
}

function isAllowedOrigin(string $origin, array $allowedOrigins): bool {
    if ($origin === '') {
        return false;
    }

    if (in_array($origin, $allowedOrigins, true)) {
        return true;
    }

    if (isLocalNetworkOrigin($origin)) {
        return true;
    }

    return (bool) preg_match('/^https:\/\/.*\.lovable\.app$/', $origin)
        || (bool) preg_match('/^https:\/\/.*\.lovableproject\.com$/', $origin);
}

$originAllowed = isAllowedOrigin($origin, $allowed_origins);

if ($originAllowed) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
} elseif ($origin === '') {
    // Allow curl/Postman/local direct requests without an Origin header.
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, x-auth-token, x-client-info, apikey');
header('Access-Control-Expose-Headers: Content-Type, Content-Length');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
