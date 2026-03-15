<?php
/**
 * Admin: Send Global Announcement
 * POST /api/admin/broadcast
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

try {
    JWT::requireAdmin();
    $data = getRequestBody();

    $errors = validateRequired($data, ['title', 'message']);
    if (!empty($errors)) {
        validationError($errors);
    }

    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("
        INSERT INTO notifications (title, message, type, is_global, created_at)
        VALUES (?, ?, ?, 1, NOW())
    ");

    $type = $data['type'] ?? 'info';
    
    $stmt->execute([
        $data['title'],
        $data['message'],
        $type
    ]);

    // If it's an email broadcast too, we would loop through all users here
    if (isset($data['send_email']) && $data['send_email']) {
        // Mock email logic for now
        // require_once __DIR__ . '/../../config/mailer.php';
        // $users = $db->query("SELECT email FROM users")->fetchAll();
        // foreach($users as $user) { Mailer::send($user['email'], $data['title'], $data['message']); }
    }

    jsonResponse(['message' => 'Announcement broadcasted successfully']);

} catch (Throwable $e) {
    error_log("Admin broadcast error: " . $e->getMessage());
    errorResponse('Failed to broadcast announcement', 500);
}
