<?php
/**
 * Admin: List All Support Tickets
 * GET /api/admin/tickets
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

try {
    JWT::requireAdmin();

    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("
        SELECT t.*, u.first_name, u.last_name, u.email as user_email
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
    ");
    $stmt->execute();
    $tickets = $stmt->fetchAll();

    jsonResponse($tickets);

} catch (Throwable $e) {
    error_log("Admin list tickets error: " . $e->getMessage());
    errorResponse('Failed to fetch support tickets', 500);
}
