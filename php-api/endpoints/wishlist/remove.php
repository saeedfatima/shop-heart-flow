<?php
/**
 * Remove from Wishlist Endpoint
 * DELETE /api/wishlist/{product_id}/remove
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$productId = $GLOBALS['route_params']['id'] ?? null;

if (!$productId) {
    errorResponse('Product ID required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if in wishlist
    $stmt = $db->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$userId, $productId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Product not in wishlist');
    }
    
    // Remove from wishlist
    $stmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$userId, $productId]);
    
    jsonResponse(['message' => 'Removed from wishlist']);
    
} catch (Exception $e) {
    error_log("Remove from wishlist error: " . $e->getMessage());
    errorResponse('Failed to remove from wishlist', 500);
}
