<?php
/**
 * Get Ticket Details and Replies
 * GET /api/tickets/{id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

try {
    $userId = JWT::requireAuth();
    $ticketId = $GLOBALS['route_params']['id'];

    $database = new Database();
    $db = $database->getConnection();

    // Verify ownership
    $stmt = $db->prepare("SELECT * FROM tickets WHERE id = ? AND user_id = ?");
    $stmt->execute([$ticketId, $userId]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        notFoundResponse('Ticket not found');
    }

    // Get replies
    $stmtReplies = $db->prepare("
        SELECT message, is_admin_reply, created_at
        FROM ticket_replies
        WHERE ticket_id = ?
        ORDER BY created_at ASC
    ");
    $stmtReplies->execute([$ticketId]);
    $replies = $stmtReplies->fetchAll();

    $ticket['replies'] = $replies;

    jsonResponse($ticket);

} catch (Throwable $e) {
    error_log("Get ticket details error: " . $e->getMessage());
    errorResponse('Failed to fetch ticket details', 500);
}
