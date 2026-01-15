<?php
/**
 * Admin Orders List Endpoint
 * GET /api/admin/orders
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->query("
        SELECT o.id, o.order_number, o.status, o.subtotal, o.shipping_cost, o.total,
               o.first_name, o.last_name, o.email, o.phone,
               o.tracking_number, o.created_at, o.updated_at,
               u.id as user_id
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    ");
    $orders = $stmt->fetchAll();
    
    // Get items for each order
    foreach ($orders as &$order) {
        $itemStmt = $db->prepare("
            SELECT oi.id, oi.quantity, oi.price,
                   p.id as product_id, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$order['id']]);
        $items = $itemStmt->fetchAll();
        
        $order['items'] = array_map(function($item) {
            return [
                'id' => $item['id'],
                'product' => [
                    'id' => $item['product_id'],
                    'name' => $item['product_name']
                ],
                'quantity' => $item['quantity'],
                'price' => $item['price']
            ];
        }, $items);
        
        $order['customer_name'] = $order['first_name'] . ' ' . $order['last_name'];
    }
    
    jsonResponse($orders);
    
} catch (Exception $e) {
    error_log("Admin orders error: " . $e->getMessage());
    errorResponse('Failed to get orders', 500);
}
