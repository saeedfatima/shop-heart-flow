<?php
/**
 * Admin Products List Endpoint
 * GET /api/admin/products
 * Returns all products with stock info for admin management
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all products with category and stock info
    $stmt = $db->query("
        SELECT p.id, p.name, p.slug, p.price, p.original_price, p.description,
               p.in_stock, p.featured, p.rating, p.review_count,
               p.created_at, p.updated_at,
               c.name as category_name, c.id as category_id,
               COALESCE(SUM(pss.quantity), 0) as total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_size_stock pss ON pss.product_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ");
    $products = $stmt->fetchAll();
    
    // Get first image for each product
    $imgStmt = $db->prepare("
        SELECT image FROM product_images 
        WHERE product_id = ? 
        ORDER BY `order` ASC 
        LIMIT 1
    ");
    
    $formattedProducts = [];
    foreach ($products as $product) {
        $imgStmt->execute([$product['id']]);
        $image = $imgStmt->fetchColumn();
        
        $stock = (int)$product['total_stock'];
        
        // Determine status based on stock
        if (!$product['in_stock'] || $stock === 0) {
            $status = 'out_of_stock';
        } elseif ($stock <= 10) {
            $status = 'low_stock';
        } else {
            $status = 'active';
        }
        
        $formattedProducts[] = [
            'id' => (int)$product['id'],
            'name' => $product['name'],
            'slug' => $product['slug'],
            'category' => $product['category_name'] ?? 'Uncategorized',
            'category_id' => $product['category_id'],
            'price' => (float)$product['price'],
            'original_price' => $product['original_price'] ? (float)$product['original_price'] : null,
            'stock' => $stock,
            'status' => $status,
            'in_stock' => (bool)$product['in_stock'],
            'featured' => (bool)$product['featured'],
            'rating' => $product['rating'] ? (float)$product['rating'] : null,
            'review_count' => (int)$product['review_count'],
            'image' => $image ?: null,
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at'],
        ];
    }
    
    // Calculate stats
    $totalProducts = count($formattedProducts);
    $inStock = count(array_filter($formattedProducts, fn($p) => $p['status'] === 'active'));
    $lowStock = count(array_filter($formattedProducts, fn($p) => $p['status'] === 'low_stock'));
    $outOfStock = count(array_filter($formattedProducts, fn($p) => $p['status'] === 'out_of_stock'));
    
    jsonResponse([
        'products' => $formattedProducts,
        'stats' => [
            'total' => $totalProducts,
            'in_stock' => $inStock,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Admin products error: " . $e->getMessage());
    errorResponse('Failed to get products', 500);
}
