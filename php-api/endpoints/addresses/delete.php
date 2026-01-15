<?php
/**
 * Delete Address Endpoint
 * DELETE /api/addresses/{id}/delete
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$addressId = $GLOBALS['route_params']['id'] ?? null;

if (!$addressId) {
    errorResponse('Address ID required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if address belongs to user
    $stmt = $db->prepare("SELECT id FROM addresses WHERE id = ? AND user_id = ?");
    $stmt->execute([$addressId, $userId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Address not found');
    }
    
    // Delete address
    $stmt = $db->prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?");
    $stmt->execute([$addressId, $userId]);
    
    jsonResponse(['message' => 'Address deleted successfully']);
    
} catch (Exception $e) {
    error_log("Delete address error: " . $e->getMessage());
    errorResponse('Failed to delete address', 500);
}
