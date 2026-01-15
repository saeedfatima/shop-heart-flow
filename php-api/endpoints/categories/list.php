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
        SELECT id, name, slug, description, image, created_at
        FROM categories 
        ORDER BY name ASC
    ");
    
    $categories = $stmt->fetchAll();
    
    jsonResponse($categories);
    
} catch (Exception $e) {
    error_log("Categories list error: " . $e->getMessage());
    errorResponse('Failed to get categories', 500);
}
