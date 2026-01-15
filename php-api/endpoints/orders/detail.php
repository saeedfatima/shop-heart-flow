<?php
/**
 * Order Detail Endpoint
 * GET /api/orders/{id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$orderId = $GLOBALS['route_params']['id'] ?? null;

if (!$orderId) {
    errorResponse('Order ID required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, order_number, status, subtotal, shipping_cost, total,
               first_name, last_name, email, phone, address, city, state,
               zip_code, country, tracking_number, tracking_url, created_at, updated_at
        FROM orders 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$orderId, $userId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        notFoundResponse('Order not found');
    }
    
    // Get order items
    $itemStmt = $db->prepare("
        SELECT oi.id, oi.quantity, oi.price, oi.selected_color as color, oi.selected_size as size,
               p.id as product_id, p.name as product_name, p.price as product_price,
               (SELECT image FROM product_images WHERE product_id = p.id ORDER BY `order` LIMIT 1) as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    $itemStmt->execute([$orderId]);
    $items = $itemStmt->fetchAll();
    
    $order['items'] = array_map(function($item) {
        return [
            'id' => $item['id'],
            'product' => [
                'id' => $item['product_id'],
                'name' => $item['product_name'],
                'price' => $item['product_price'],
                'image' => $item['product_image']
            ],
            'quantity' => $item['quantity'],
            'price' => $item['price'],
            'color' => $item['color'],
            'size' => $item['size']
        ];
    }, $items);
    
    // Format shipping address
    $order['shipping_address'] = [
        'recipient_name' => $order['first_name'] . ' ' . $order['last_name'],
        'street_address' => $order['address'],
        'city' => $order['city'],
        'state' => $order['state'],
        'postal_code' => $order['zip_code'],
        'country' => $order['country'],
        'phone' => $order['phone']
    ];
    
    jsonResponse($order);
    
} catch (Exception $e) {
    error_log("Order detail error: " . $e->getMessage());
    errorResponse('Failed to get order', 500);
}
