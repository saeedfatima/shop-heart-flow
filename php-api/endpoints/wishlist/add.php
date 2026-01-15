<?php
/**
 * Add to Wishlist Endpoint
 * POST /api/wishlist/add
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$data = getRequestBody();

if (!isset($data['product_id'])) {
    errorResponse('Product ID required');
}

$productId = intval($data['product_id']);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if product exists
    $stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Product not found');
    }
    
    // Check if already in wishlist
    $stmt = $db->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$userId, $productId]);
    if ($stmt->fetch()) {
        errorResponse('Product already in wishlist', 409);
    }
    
    // Add to wishlist
    $stmt = $db->prepare("INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, NOW())");
    $stmt->execute([$userId, $productId]);
    
    $wishlistId = $db->lastInsertId();
    
    // Get the wishlist item with product
    $stmt = $db->prepare("
        SELECT w.id, w.created_at as added_at,
               p.id as product_id, p.name, p.price
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.id = ?
    ");
    $stmt->execute([$wishlistId]);
    $item = $stmt->fetch();
    
    jsonResponse([
        'id' => $item['id'],
        'added_at' => $item['added_at'],
        'product' => [
            'id' => $item['product_id'],
            'name' => $item['name'],
            'price' => $item['price']
        ]
    ], 201);
    
} catch (Exception $e) {
    error_log("Add to wishlist error: " . $e->getMessage());
    errorResponse('Failed to add to wishlist', 500);
}
