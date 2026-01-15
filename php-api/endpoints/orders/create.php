<?php
/**
 * Create Order Endpoint
 * POST /api/orders/create
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$data = getRequestBody();

$errors = validateRequired($data, ['items', 'shipping_address_id']);
if (!empty($errors)) {
    validationError($errors);
}

if (!is_array($data['items']) || count($data['items']) === 0) {
    errorResponse('At least one item is required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $db->beginTransaction();
    
    // Get shipping address
    $stmt = $db->prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?");
    $stmt->execute([$data['shipping_address_id'], $userId]);
    $address = $stmt->fetch();
    
    if (!$address) {
        errorResponse('Shipping address not found');
    }
    
    // Calculate totals and validate products
    $subtotal = 0;
    $orderItems = [];
    
    foreach ($data['items'] as $item) {
        $stmt = $db->prepare("SELECT id, name, price, in_stock FROM products WHERE id = ?");
        $stmt->execute([$item['product_id']]);
        $product = $stmt->fetch();
        
        if (!$product) {
            $db->rollBack();
            errorResponse("Product not found: {$item['product_id']}");
        }
        
        if (!$product['in_stock']) {
            $db->rollBack();
            errorResponse("Product out of stock: {$product['name']}");
        }
        
        $itemTotal = $product['price'] * $item['quantity'];
        $subtotal += $itemTotal;
        
        $orderItems[] = [
            'product_id' => $product['id'],
            'quantity' => $item['quantity'],
            'price' => $product['price'],
            'color' => $item['color'] ?? null,
            'size' => $item['size'] ?? null
        ];
    }
    
    // Calculate shipping (free over $100)
    $shippingCost = $subtotal >= 100 ? 0 : 10;
    $total = $subtotal + $shippingCost;
    
    // Generate order number
    $orderNumber = 'ORD-' . strtoupper(uniqid());
    
    // Create order
    $stmt = $db->prepare("
        INSERT INTO orders (
            user_id, order_number, status, subtotal, shipping_cost, total,
            first_name, last_name, email, phone, address, city, state,
            zip_code, country, created_at
        ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    // Get user email
    $userStmt = $db->prepare("SELECT email FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $userEmail = $userStmt->fetchColumn();
    
    $stmt->execute([
        $userId, $orderNumber, $subtotal, $shippingCost, $total,
        $address['recipient_name'], '', $userEmail, $address['phone'],
        $address['street_address'], $address['city'], $address['state'],
        $address['postal_code'], $address['country']
    ]);
    
    $orderId = $db->lastInsertId();
    
    // Create order items
    foreach ($orderItems as $item) {
        $stmt = $db->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price, selected_color, selected_size)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $orderId, $item['product_id'], $item['quantity'],
            $item['price'], $item['color'], $item['size']
        ]);
    }
    
    $db->commit();
    
    // Return created order
    $stmt = $db->prepare("
        SELECT id, order_number, status, subtotal, shipping_cost, total, created_at
        FROM orders WHERE id = ?
    ");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    
    jsonResponse($order, 201);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Create order error: " . $e->getMessage());
    errorResponse('Failed to create order', 500);
}
