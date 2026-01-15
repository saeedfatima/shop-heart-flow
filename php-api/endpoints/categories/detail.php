<?php
/**
 * Get Category by Slug
 * GET /api/categories/{slug}
 */

require_once __DIR__ . '/../../config/database.php';

$slug = $GLOBALS['route_params']['slug'] ?? null;

if (!$slug) {
    errorResponse('Category slug required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, name, slug, description, image, created_at
        FROM categories 
        WHERE slug = ?
    ");
    $stmt->execute([$slug]);
    $category = $stmt->fetch();
    
    if (!$category) {
        notFoundResponse('Category not found');
    }
    
    jsonResponse($category);
    
} catch (Exception $e) {
    error_log("Category detail error: " . $e->getMessage());
    errorResponse('Failed to get category', 500);
}
