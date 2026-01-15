<?php
/**
 * Upload Avatar Endpoint
 * POST /api/auth/user/avatar
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();

if (!isset($_FILES['avatar'])) {
    errorResponse('No file uploaded');
}

$file = $_FILES['avatar'];

// Validate file
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowedTypes)) {
    errorResponse('Invalid file type. Allowed: JPG, PNG, GIF, WEBP');
}

if ($file['size'] > $maxSize) {
    errorResponse('File too large. Maximum size: 5MB');
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    errorResponse('Upload failed');
}

try {
    // Create upload directory
    $uploadDir = __DIR__ . '/../../uploads/avatars/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'avatar_' . $userId . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        errorResponse('Failed to save file');
    }
    
    // Update user avatar in database
    $avatarUrl = '/uploads/avatars/' . $filename;
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Delete old avatar if exists
    $stmt = $db->prepare("SELECT avatar FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $oldAvatar = $stmt->fetchColumn();
    
    if ($oldAvatar && file_exists(__DIR__ . '/../..' . $oldAvatar)) {
        unlink(__DIR__ . '/../..' . $oldAvatar);
    }
    
    // Update avatar
    $stmt = $db->prepare("UPDATE users SET avatar = ? WHERE id = ?");
    $stmt->execute([$avatarUrl, $userId]);
    
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
        'message' => 'Avatar uploaded successfully',
        'user' => $user
    ]);
    
} catch (Exception $e) {
    error_log("Avatar upload error: " . $e->getMessage());
    errorResponse('Failed to upload avatar', 500);
}
