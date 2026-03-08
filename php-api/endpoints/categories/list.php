<?php
/**
 * List Categories Endpoint
 * GET /api/categories
 */

require_once __DIR__ . '/../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->query("
        SELECT c.id, c.name, c.slug, c.description, c.image, c.created_at,
               COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id, c.name, c.slug, c.description, c.image, c.created_at
        ORDER BY c.name ASC
    ");
    
    $categories = $stmt->fetchAll();
    
    jsonResponse($categories);
    
} catch (Exception $e) {
    error_log("Categories list error: " . $e->getMessage());
    errorResponse('Failed to get categories', 500);
}
