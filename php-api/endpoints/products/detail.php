<?php
/**
 * Product Detail Endpoint
 * GET /api/products/{id}
 */

require_once __DIR__ . '/../../config/database.php';

$productId = $GLOBALS['route_params']['id'] ?? null;

if (!$productId) {
    errorResponse('Product ID required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT p.id, p.name, p.slug, p.price, p.original_price, p.description,
               p.in_stock, p.featured, p.rating, p.review_count,
               p.created_at, p.updated_at,
               c.id as category_id, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    ");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    
    if (!$product) {
        notFoundResponse('Product not found');
    }
    
    // Get images
    $imgStmt = $db->prepare("
        SELECT id, image, alt_text 
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY `order` ASC
    ");
    $imgStmt->execute([$productId]);
    $product['images'] = $imgStmt->fetchAll();
    
    // Get colors
    $colorStmt = $db->prepare("
        SELECT pc.name, pc.value
        FROM product_colors pc
        JOIN product_color_map pcm ON pc.id = pcm.color_id
        WHERE pcm.product_id = ?
    ");
    $colorStmt->execute([$productId]);
    $product['colors'] = $colorStmt->fetchAll();
    
    // Get sizes with stock
    $sizeStmt = $db->prepare("
        SELECT ps.name, pss.in_stock as inStock
        FROM product_sizes ps
        JOIN product_size_stock pss ON ps.id = pss.size_id
        WHERE pss.product_id = ?
    ");
    $sizeStmt->execute([$productId]);
    $product['sizes'] = $sizeStmt->fetchAll();
    
    // Format category
    $product['category'] = [
        'id' => $product['category_id'],
        'name' => $product['category_name'],
        'slug' => $product['category_slug']
    ];
    unset($product['category_id'], $product['category_name'], $product['category_slug']);
    
    jsonResponse($product);
    
} catch (Exception $e) {
    error_log("Product detail error: " . $e->getMessage());
    errorResponse('Failed to get product', 500);
}
