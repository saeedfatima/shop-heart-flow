<?php
/**
 * Admin: Reply to Support Ticket
 * POST /api/admin/tickets/{id}/reply
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/jwt.php';

try {
    $adminId = JWT::requireAdmin();
    $ticketId = $GLOBALS['route_params']['id'];
    $data = getRequestBody();

    $errors = validateRequired($data, ['message']);
    if (!empty($errors)) {
        validationError($errors);
    }

    $database = new Database();
    $db = $database->getConnection();

    // Check if ticket exists
    $stmt = $db->prepare("SELECT user_id, subject FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        notFoundResponse('Ticket not found');
    }

    // Insert Reply
    $stmtReply = $db->prepare("
        INSERT INTO ticket_replies (ticket_id, sender_id, message, is_admin_reply, created_at)
        VALUES (?, ?, ?, 1, NOW())
    ");
    $stmtReply->execute([$ticketId, $adminId, $data['message']]);

    // Create Notification for User
    $stmtNotif = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, created_at)
        VALUES (?, ?, ?, 'info', NOW())
    ");
    $stmtNotif->execute([
        $ticket['user_id'],
        "New reply on your ticket: " . $ticket['subject'],
        "A support agent has responded to your inquiry. Please check your ticket details.",
    ]);

    jsonResponse(['message' => 'Reply sent successfully']);

} catch (Throwable $e) {
    error_log("Admin reply ticket error: " . $e->getMessage());
    errorResponse('Failed to send reply', 500);
}
