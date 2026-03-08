<?php
/**
 * Create Product Endpoint (Admin)
 * POST /api/admin/products/create
 * Supports multipart/form-data with image uploads
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify admin role
    $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || $user['role'] !== 'admin') {
        errorResponse('Unauthorized: Admin access required', 403);
    }

    // Parse input - support both JSON and multipart/form-data
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (strpos($contentType, 'multipart/form-data') !== false) {
        $data = $_POST;
    } else {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
    }

    // Validate required fields
    $name = trim($data['name'] ?? '');
    $price = $data['price'] ?? null;

    if (empty($name)) {
        errorResponse('Product name is required');
    }
    if ($price === null || !is_numeric($price) || $price < 0) {
        errorResponse('Valid price is required');
    }

    // Optional fields
    $slug = trim($data['slug'] ?? '');
    if (empty($slug)) {
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
        $slug = trim($slug, '-');
    }

    $description = trim($data['description'] ?? '');
    $categoryId = !empty($data['category_id']) ? (int)$data['category_id'] : null;
    $originalPrice = !empty($data['original_price']) ? (float)$data['original_price'] : null;
    $inStock = isset($data['in_stock']) ? (bool)$data['in_stock'] : true;
    $featured = isset($data['featured']) ? (bool)$data['featured'] : false;

    // Ensure unique slug
    $baseSlug = $slug;
    $counter = 1;
    while (true) {
        $stmt = $db->prepare("SELECT id FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        if (!$stmt->fetch()) break;
        $slug = $baseSlug . '-' . $counter++;
    }

    // Validate category exists if provided
    if ($categoryId) {
        $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
        $stmt->execute([$categoryId]);
        if (!$stmt->fetch()) {
            errorResponse('Category not found', 404);
        }
    }

    $db->beginTransaction();

    // Insert product
    $stmt = $db->prepare("
        INSERT INTO products (name, slug, price, original_price, description, category_id, in_stock, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $name,
        $slug,
        (float)$price,
        $originalPrice,
        $description,
        $categoryId,
        $inStock ? 1 : 0,
        $featured ? 1 : 0,
    ]);

    $productId = $db->lastInsertId();

    // Handle image uploads
    $uploadedImages = [];
    if (!empty($_FILES['images'])) {
        $uploadDir = __DIR__ . '/../../uploads/products/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 10 * 1024 * 1024; // 10MB per image

        // Normalize $_FILES array for multiple uploads
        $files = [];
        if (is_array($_FILES['images']['name'])) {
            for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
                $files[] = [
                    'name' => $_FILES['images']['name'][$i],
                    'type' => $_FILES['images']['type'][$i],
                    'tmp_name' => $_FILES['images']['tmp_name'][$i],
                    'error' => $_FILES['images']['error'][$i],
                    'size' => $_FILES['images']['size'][$i],
                ];
            }
        } else {
            $files[] = $_FILES['images'];
        }

        foreach ($files as $order => $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) continue;
            if (!in_array($file['type'], $allowedTypes)) continue;
            if ($file['size'] > $maxSize) continue;

            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'product_' . $productId . '_' . time() . '_' . $order . '.' . $ext;
            $filepath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                $imageUrl = '/uploads/products/' . $filename;

                $stmt = $db->prepare("
                    INSERT INTO product_images (product_id, image, alt_text, `order`)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([$productId, $imageUrl, $name, $order]);

                $uploadedImages[] = $imageUrl;
            }
        }
    }

    // Handle colors (JSON array string or array)
    $colors = $data['colors'] ?? null;
    if (is_string($colors)) {
        $colors = json_decode($colors, true);
    }
    if (is_array($colors) && count($colors) > 0) {
        foreach ($colors as $color) {
            $colorName = $color['name'] ?? '';
            $colorValue = $color['value'] ?? '';
            if (empty($colorName) || empty($colorValue)) continue;

            // Find or create color
            $stmt = $db->prepare("SELECT id FROM product_colors WHERE name = ? AND value = ?");
            $stmt->execute([$colorName, $colorValue]);
            $existing = $stmt->fetch();

            if ($existing) {
                $colorId = $existing['id'];
            } else {
                $stmt = $db->prepare("INSERT INTO product_colors (name, value) VALUES (?, ?)");
                $stmt->execute([$colorName, $colorValue]);
                $colorId = $db->lastInsertId();
            }

            $stmt = $db->prepare("INSERT INTO product_color_map (product_id, color_id) VALUES (?, ?)");
            $stmt->execute([$productId, $colorId]);
        }
    }

    // Handle sizes (JSON array string or array)
    $sizes = $data['sizes'] ?? null;
    if (is_string($sizes)) {
        $sizes = json_decode($sizes, true);
    }
    if (is_array($sizes) && count($sizes) > 0) {
        foreach ($sizes as $size) {
            $sizeName = is_string($size) ? $size : ($size['name'] ?? '');
            $sizeInStock = is_string($size) ? true : ($size['inStock'] ?? true);
            $sizeQty = is_string($size) ? 0 : ($size['quantity'] ?? 0);
            if (empty($sizeName)) continue;

            // Find or create size
            $stmt = $db->prepare("SELECT id FROM product_sizes WHERE name = ?");
            $stmt->execute([$sizeName]);
            $existing = $stmt->fetch();

            if ($existing) {
                $sizeId = $existing['id'];
            } else {
                $stmt = $db->prepare("INSERT INTO product_sizes (name) VALUES (?)");
                $stmt->execute([$sizeName]);
                $sizeId = $db->lastInsertId();
            }

            $stmt = $db->prepare("INSERT INTO product_size_stock (product_id, size_id, in_stock, quantity) VALUES (?, ?, ?, ?)");
            $stmt->execute([$productId, $sizeId, $sizeInStock ? 1 : 0, (int)$sizeQty]);
        }
    }

    $db->commit();

    // Fetch the created product with relations
    $stmt = $db->prepare("
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    ");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    $product['images'] = $uploadedImages;

    jsonResponse([
        'success' => true,
        'message' => 'Product created successfully',
        'product' => $product,
    ], 201);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Create product error: " . $e->getMessage());
    errorResponse('Failed to create product', 500);
}
