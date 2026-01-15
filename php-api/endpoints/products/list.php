<?php
/**
 * List Products Endpoint
 * GET /api/products
 * 
 * Query params: page, category, search, ordering
 */

require_once __DIR__ . '/../../config/database.php';

$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$perPage = 12;
$offset = ($page - 1) * $perPage;

$category = $_GET['category'] ?? null;
$search = $_GET['search'] ?? null;
$ordering = $_GET['ordering'] ?? '-created_at';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Build query
    $where = [];
    $params = [];
    
    if ($category) {
        $where[] = "c.slug = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $where[] = "(p.name LIKE ? OR p.description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    $whereClause = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";
    
    // Ordering
    $orderMap = [
        'price' => 'p.price ASC',
        '-price' => 'p.price DESC',
        'name' => 'p.name ASC',
        '-name' => 'p.name DESC',
        'created_at' => 'p.created_at ASC',
        '-created_at' => 'p.created_at DESC',
    ];
    $orderBy = $orderMap[$ordering] ?? 'p.created_at DESC';
    
    // Count total
    $countSql = "
        SELECT COUNT(*) 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        $whereClause
    ";
    $stmt = $db->prepare($countSql);
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    
    // Get products
    $sql = "
        SELECT p.id, p.name, p.slug, p.price, p.original_price, p.description,
               p.in_stock, p.featured, p.rating, p.review_count,
               p.created_at, p.updated_at,
               c.id as category_id, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        $whereClause
        ORDER BY $orderBy
        LIMIT ? OFFSET ?
    ";
    $params[] = $perPage;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Get images and colors for each product
    foreach ($products as &$product) {
        // Get images
        $imgStmt = $db->prepare("
            SELECT id, image, alt_text 
            FROM product_images 
            WHERE product_id = ? 
            ORDER BY `order` ASC
        ");
        $imgStmt->execute([$product['id']]);
        $product['images'] = $imgStmt->fetchAll();
        
        // Get colors
        $colorStmt = $db->prepare("
            SELECT pc.name, pc.value
            FROM product_colors pc
            JOIN product_color_map pcm ON pc.id = pcm.color_id
            WHERE pcm.product_id = ?
        ");
        $colorStmt->execute([$product['id']]);
        $product['colors'] = $colorStmt->fetchAll();
        
        // Get sizes with stock
        $sizeStmt = $db->prepare("
            SELECT ps.name, pss.in_stock as inStock
            FROM product_sizes ps
            JOIN product_size_stock pss ON ps.id = pss.size_id
            WHERE pss.product_id = ?
        ");
        $sizeStmt->execute([$product['id']]);
        $product['sizes'] = $sizeStmt->fetchAll();
        
        // Format category
        $product['category'] = [
            'id' => $product['category_id'],
            'name' => $product['category_name'],
            'slug' => $product['category_slug']
        ];
        unset($product['category_id'], $product['category_name'], $product['category_slug']);
    }
    
    // Pagination
    $totalPages = ceil($total / $perPage);
    $baseUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . "://{$_SERVER['HTTP_HOST']}/api/products";
    
    jsonResponse([
        'count' => $total,
        'next' => $page < $totalPages ? "$baseUrl?page=" . ($page + 1) : null,
        'previous' => $page > 1 ? "$baseUrl?page=" . ($page - 1) : null,
        'results' => $products
    ]);
    
} catch (Exception $e) {
    error_log("Products list error: " . $e->getMessage());
    errorResponse('Failed to get products', 500);
}
