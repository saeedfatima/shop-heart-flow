<?php
/**
 * Token Refresh Endpoint
 * POST /api/auth/token/refresh
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$data = getRequestBody();

if (!isset($data['refresh']) || empty($data['refresh'])) {
    errorResponse('Refresh token required', 400);
}

$refreshToken = $data['refresh'];

// Validate refresh token
$payload = JWT::validate($refreshToken);

if (!$payload || ($payload['type'] ?? '') !== 'refresh') {
    errorResponse('Invalid or expired refresh token', 401);
}

$userId = $payload['user_id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get user
    $stmt = $db->prepare("SELECT id, email, role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        errorResponse('User not found', 401);
    }
    
    // Generate new access token
    $accessPayload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'type' => 'access'
    ];
    
    $newAccessToken = JWT::generate($accessPayload, JWT_ACCESS_EXPIRY);
    
    jsonResponse([
        'access' => $newAccessToken
    ]);
    
} catch (Exception $e) {
    error_log("Token refresh error: " . $e->getMessage());
    errorResponse('Token refresh failed', 500);
}
