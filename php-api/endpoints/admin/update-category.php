<?php
/**
 * Admin Update Category Endpoint
 * PUT /api/admin/categories/{id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

$categoryId = $GLOBALS['route_params']['id'] ?? null;

if (!$categoryId) {
    errorResponse('Category ID is required', 400);
}

$data = getRequestBody();

if (empty($data)) {
    errorResponse('No data provided', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check category exists
    $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Category not found');
    }
    
    // Check slug uniqueness if updating slug
    if (!empty($data['slug'])) {
        $stmt = $db->prepare("SELECT id FROM categories WHERE slug = ? AND id != ?");
        $stmt->execute([$data['slug'], $categoryId]);
        if ($stmt->fetch()) {
            errorResponse('A category with this slug already exists', 409);
        }
    }
    
    // Build dynamic update
    $fields = [];
    $values = [];
    
    foreach (['name', 'slug', 'description', 'image'] as $field) {
        if (array_key_exists($field, $data)) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        errorResponse('No valid fields to update', 400);
    }
    
    $values[] = $categoryId;
    $sql = "UPDATE categories SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($values);
    
    // Return updated category
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    
    jsonResponse([
        'success' => true,
        'message' => 'Category updated successfully',
        'category' => $category,
    ]);
    
} catch (Exception $e) {
    error_log("Admin update category error: " . $e->getMessage());
    errorResponse('Failed to update category', 500);
}
