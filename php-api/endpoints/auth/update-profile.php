<?php
/**
 * Update User Profile Endpoint
 * PUT /api/auth/user
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$data = getRequestBody();

// Allowed fields to update
$allowedFields = [
    'first_name', 'last_name', 'phone', 'bio', 
    'location', 'occupation', 'date_of_birth',
    'tiktok', 'whatsapp', 'instagram'
];

$updates = [];
$values = [];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $updates[] = "$field = ?";
        $values[] = htmlspecialchars(trim($data[$field]), ENT_QUOTES, 'UTF-8');
    }
}

if (empty($updates)) {
    errorResponse('No fields to update');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $values[] = $userId;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($values);
    
    // Return updated user
    $stmt = $db->prepare("
        SELECT id, email, first_name, last_name, role, avatar, 
               phone, bio, location, occupation, date_of_birth,
               tiktok, whatsapp, instagram, created_at
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    jsonResponse([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $user
    ]);
    
} catch (Exception $e) {
    error_log("Update profile error: " . $e->getMessage());
    errorResponse('Failed to update profile', 500);
}
