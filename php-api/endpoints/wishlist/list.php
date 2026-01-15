<?php
/**
 * List Wishlist Endpoint
 * GET /api/wishlist
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT w.id, w.created_at as added_at,
               p.id as product_id, p.name, p.slug, p.price, p.original_price,
               p.description, p.in_stock, p.rating, p.review_count,
               c.name as category_name
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    ");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();
    
    // Format and get images for each product
    $wishlist = [];
    foreach ($items as $item) {
        $imgStmt = $db->prepare("
            SELECT image FROM product_images 
            WHERE product_id = ? ORDER BY `order` LIMIT 1
        ");
        $imgStmt->execute([$item['product_id']]);
        $image = $imgStmt->fetchColumn();
        
        $wishlist[] = [
            'id' => $item['id'],
            'added_at' => $item['added_at'],
            'product' => [
                'id' => (string)$item['product_id'],
                'name' => $item['name'],
                'slug' => $item['slug'],
                'price' => (float)$item['price'],
                'originalPrice' => $item['original_price'] ? (float)$item['original_price'] : null,
                'description' => $item['description'],
                'category' => $item['category_name'],
                'images' => $image ? [$image] : [],
                'inStock' => (bool)$item['in_stock'],
                'rating' => $item['rating'] ? (float)$item['rating'] : null,
                'reviewCount' => (int)$item['review_count']
            ]
        ];
    }
    
    jsonResponse($wishlist);
    
} catch (Exception $e) {
    error_log("Wishlist list error: " . $e->getMessage());
    errorResponse('Failed to get wishlist', 500);
}
