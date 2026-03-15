<?php
/**
 * Create Support Ticket Endpoint
 * POST /api/tickets/create
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

try {
    $userId = JWT::requireAuth();
    $data = getRequestBody();

    $errors = validateRequired($data, ['subject', 'category', 'message']);
    if (!empty($errors)) {
        validationError($errors);
    }

    $database = new Database();
    $db = $database->getConnection();

    // Generate Ticket Number
    $ticketNumber = 'TKT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

    $stmt = $db->prepare("
        INSERT INTO tickets (user_id, ticket_number, subject, category, message, priority, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'open', NOW())
    ");

    $priority = $data['priority'] ?? 'medium';
    
    $stmt->execute([
        $userId,
        $ticketNumber,
        $data['subject'],
        $data['category'],
        $data['message'],
        $priority
    ]);

    $ticketId = $db->lastInsertId();

    // Add original message to replies as well for unified chat view
    $stmtReply = $db->prepare("
        INSERT INTO ticket_replies (ticket_id, sender_id, message, is_admin_reply, created_at)
        VALUES (?, ?, ?, 0, NOW())
    ");
    $stmtReply->execute([$ticketId, $userId, $data['message']]);

    jsonResponse([
        'id' => $ticketId,
        'ticket_number' => $ticketNumber,
        'status' => 'open',
        'message' => 'Ticket created successfully'
    ], 201);

} catch (Throwable $e) {
    error_log("Create ticket error: " . $e->getMessage());
    errorResponse('Failed to create support ticket', 500);
}
