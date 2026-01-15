<?php
/**
 * Admin Update Order Status Endpoint
 * PATCH /api/admin/orders/{id}/status
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

$orderId = $GLOBALS['route_params']['id'] ?? null;

if (!$orderId) {
    errorResponse('Order ID required');
}

$data = getRequestBody();

if (!isset($data['status'])) {
    errorResponse('Status required');
}

$validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
if (!in_array($data['status'], $validStatuses)) {
    errorResponse('Invalid status. Valid: ' . implode(', ', $validStatuses));
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if order exists
    $stmt = $db->prepare("SELECT id FROM orders WHERE id = ?");
    $stmt->execute([$orderId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Order not found');
    }
    
    // Update status
    $stmt = $db->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$data['status'], $orderId]);
    
    // Return updated order
    $stmt = $db->prepare("
        SELECT id, order_number, status, subtotal, shipping_cost, total,
               first_name, last_name, email, tracking_number, created_at, updated_at
        FROM orders WHERE id = ?
    ");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    
    jsonResponse($order);
    
} catch (Exception $e) {
    error_log("Update order status error: " . $e->getMessage());
    errorResponse('Failed to update order status', 500);
}
