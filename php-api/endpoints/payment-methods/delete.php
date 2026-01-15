<?php
/**
 * Delete Payment Method Endpoint
 * DELETE /api/payment-methods/{id}/delete
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$methodId = $GLOBALS['route_params']['id'] ?? null;

if (!$methodId) {
    errorResponse('Payment method ID required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if payment method belongs to user
    $stmt = $db->prepare("SELECT id FROM payment_methods WHERE id = ? AND user_id = ?");
    $stmt->execute([$methodId, $userId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Payment method not found');
    }
    
    // Delete payment method
    $stmt = $db->prepare("DELETE FROM payment_methods WHERE id = ? AND user_id = ?");
    $stmt->execute([$methodId, $userId]);
    
    jsonResponse(['message' => 'Payment method deleted successfully']);
    
} catch (Exception $e) {
    error_log("Delete payment method error: " . $e->getMessage());
    errorResponse('Failed to delete payment method', 500);
}
