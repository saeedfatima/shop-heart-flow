<?php
/**
 * Admin Create Category Endpoint
 * POST /api/admin/categories/create
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

$data = getRequestBody();
$errors = validateRequired($data, ['name', 'slug']);

if (!empty($errors)) {
    validationError($errors);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check for duplicate slug
    $stmt = $db->prepare("SELECT id FROM categories WHERE slug = ?");
    $stmt->execute([$data['slug']]);
    if ($stmt->fetch()) {
        errorResponse('A category with this slug already exists', 409);
    }
    
    $stmt = $db->prepare("
        INSERT INTO categories (name, slug, description, image)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $data['name'],
        $data['slug'],
        $data['description'] ?? null,
        $data['image'] ?? null,
    ]);
    
    $categoryId = $db->lastInsertId();
    
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    
    jsonResponse([
        'success' => true,
        'message' => 'Category created successfully',
        'category' => $category,
    ], 201);
    
} catch (Exception $e) {
    error_log("Admin create category error: " . $e->getMessage());
    errorResponse('Failed to create category', 500);
}
