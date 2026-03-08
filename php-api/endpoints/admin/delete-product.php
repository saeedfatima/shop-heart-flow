<?php
/**
 * Admin Delete Product Endpoint
 * DELETE /api/admin/products/{id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

$productId = $GLOBALS['route_params']['id'] ?? null;

if (!$productId) {
    errorResponse('Product ID is required', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if product exists
    $stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    
    if (!$stmt->fetch()) {
        notFoundResponse('Product not found');
    }
    
    // Check if product has pending/processing orders
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = ? AND o.status IN ('pending', 'processing')
    ");
    $stmt->execute([$productId]);
    $activeOrders = $stmt->fetchColumn();
    
    if ($activeOrders > 0) {
        errorResponse('Cannot delete product with active orders', 400);
    }
    
    // Delete product (cascades to images, color_map, size_stock)
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    
    jsonResponse(['success' => true, 'message' => 'Product deleted successfully']);
    
} catch (Exception $e) {
    error_log("Admin delete product error: " . $e->getMessage());
    errorResponse('Failed to delete product', 500);
}
