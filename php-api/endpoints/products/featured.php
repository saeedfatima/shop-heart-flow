<?php
/**
 * Featured Products Endpoint
 * GET /api/products/featured
 */

require_once __DIR__ . '/../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->query("
        SELECT p.id, p.name, p.slug, p.price, p.original_price, p.description,
               p.in_stock, p.featured, p.rating, p.review_count,
               p.created_at, p.updated_at,
               c.id as category_id, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.featured = 1
        ORDER BY p.created_at DESC
        LIMIT 8
    ");
    $products = $stmt->fetchAll();
    
    // Get images, colors, sizes for each product
    foreach ($products as &$product) {
        $imgStmt = $db->prepare("
            SELECT id, image, alt_text 
            FROM product_images 
            WHERE product_id = ? 
            ORDER BY `order` ASC
        ");
        $imgStmt->execute([$product['id']]);
        $product['images'] = $imgStmt->fetchAll();
        
        $colorStmt = $db->prepare("
            SELECT pc.name, pc.value
            FROM product_colors pc
            JOIN product_color_map pcm ON pc.id = pcm.color_id
            WHERE pcm.product_id = ?
        ");
        $colorStmt->execute([$product['id']]);
        $product['colors'] = $colorStmt->fetchAll();
        
        $sizeStmt = $db->prepare("
            SELECT ps.name, pss.in_stock as inStock
            FROM product_sizes ps
            JOIN product_size_stock pss ON ps.id = pss.size_id
            WHERE pss.product_id = ?
        ");
        $sizeStmt->execute([$product['id']]);
        $product['sizes'] = $sizeStmt->fetchAll();
        
        $product['category'] = [
            'id' => $product['category_id'],
            'name' => $product['category_name'],
            'slug' => $product['category_slug']
        ];
        unset($product['category_id'], $product['category_name'], $product['category_slug']);
    }
    
    jsonResponse($products);
    
} catch (Exception $e) {
    error_log("Featured products error: " . $e->getMessage());
    errorResponse('Failed to get featured products', 500);
}
