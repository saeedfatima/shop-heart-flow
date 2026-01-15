<?php
/**
 * List User Orders Endpoint
 * GET /api/orders
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, order_number, status, subtotal, shipping_cost, total,
               tracking_number, created_at, updated_at
        FROM orders 
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll();
    
    // Get items for each order
    foreach ($orders as &$order) {
        $itemStmt = $db->prepare("
            SELECT oi.id, oi.quantity, oi.price, oi.selected_color as color, oi.selected_size as size,
                   p.id as product_id, p.name as product_name, p.price as product_price,
                   (SELECT image FROM product_images WHERE product_id = p.id ORDER BY `order` LIMIT 1) as product_image
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
    }
    
    jsonResponse($orders);
    
} catch (Exception $e) {
    error_log("Orders list error: " . $e->getMessage());
    errorResponse('Failed to get orders', 500);
}
