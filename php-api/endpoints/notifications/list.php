<?php
/**
 * Get User Notifications
 * GET /api/notifications
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

try {
    $userId = JWT::requireAuth();

    $database = new Database();
    $db = $database->getConnection();

    // Fetch both private notifications and global announcements
    $stmt = $db->prepare("
        SELECT id, title, message, type, is_read, created_at
        FROM notifications
        WHERE (user_id = ? OR is_global = 1)
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    jsonResponse($notifications);

} catch (Throwable $e) {
    error_log("Get notifications error: " . $e->getMessage());
    errorResponse('Failed to fetch notifications', 500);
}
