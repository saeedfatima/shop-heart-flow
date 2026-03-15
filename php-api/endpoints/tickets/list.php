<?php
/**
 * List User Support Tickets
 * GET /api/tickets
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

try {
    $userId = JWT::requireAuth();

    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("
        SELECT id, ticket_number, subject, category, priority, status, created_at, updated_at
        FROM tickets
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $tickets = $stmt->fetchAll();

    // For each ticket, get the latest reply/status info if needed
    // But for listing, this summary is enough

    jsonResponse($tickets);

} catch (Throwable $e) {
    error_log("List tickets error: " . $e->getMessage());
    errorResponse('Failed to fetch support tickets', 500);
}
