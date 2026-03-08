<?php
/**
 * Admin Delete Category Endpoint
 * DELETE /api/admin/categories/{id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

$categoryId = $GLOBALS['route_params']['id'] ?? null;

if (!$categoryId) {
    errorResponse('Category ID is required', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check category exists
    $stmt = $db->prepare("SELECT id, name FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    
    if (!$category) {
        notFoundResponse('Category not found');
    }
    
    // Check if products are using this category
    $stmt = $db->prepare("SELECT COUNT(*) FROM products WHERE category_id = ?");
    $stmt->execute([$categoryId]);
    $productCount = (int)$stmt->fetchColumn();
    
    if ($productCount > 0) {
        // Set products' category to NULL instead of blocking
        $stmt = $db->prepare("UPDATE products SET category_id = NULL WHERE category_id = ?");
        $stmt->execute([$categoryId]);
    }
    
    $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    
    jsonResponse([
        'success' => true,
        'message' => "Category '{$category['name']}' deleted successfully",
        'products_uncategorized' => $productCount,
    ]);
    
} catch (Exception $e) {
    error_log("Admin delete category error: " . $e->getMessage());
    errorResponse('Failed to delete category', 500);
}
