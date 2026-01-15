<?php
/**
 * Get Current User Endpoint
 * GET /api/auth/user
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, email, first_name, last_name, role, avatar, 
               phone, bio, location, occupation, date_of_birth,
               tiktok, whatsapp, instagram, created_at
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        notFoundResponse('User not found');
    }
    
    jsonResponse($user);
    
} catch (Exception $e) {
    error_log("Get user error: " . $e->getMessage());
    errorResponse('Failed to get user', 500);
}
