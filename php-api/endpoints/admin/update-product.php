<?php
/**
 * Update Product Endpoint (Admin)
 * PUT /api/admin/products/{id}
 * Supports multipart/form-data with image uploads
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$productId = $GLOBALS['route_params']['id'] ?? null;

if (!$productId) {
    errorResponse('Product ID is required');
}

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

    // Check product exists
    $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        notFoundResponse('Product not found');
    }

    // Parse input
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'multipart/form-data') !== false) {
        $data = $_POST;
    } else {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
    }

    $db->beginTransaction();

    // Build update fields dynamically
    $updates = [];
    $params = [];

    if (isset($data['name'])) {
        $updates[] = 'name = ?';
        $params[] = trim($data['name']);
    }
    if (isset($data['slug'])) {
        $slug = trim($data['slug']);
        // Ensure unique slug (excluding current product)
        $baseSlug = $slug;
        $counter = 1;
        while (true) {
            $stmt = $db->prepare("SELECT id FROM products WHERE slug = ? AND id != ?");
            $stmt->execute([$slug, $productId]);
            if (!$stmt->fetch()) break;
            $slug = $baseSlug . '-' . $counter++;
        }
        $updates[] = 'slug = ?';
        $params[] = $slug;
    }
    if (isset($data['price'])) {
        $updates[] = 'price = ?';
        $params[] = (float)$data['price'];
    }
    if (isset($data['original_price'])) {
        $updates[] = 'original_price = ?';
        $params[] = $data['original_price'] !== '' ? (float)$data['original_price'] : null;
    }
    if (isset($data['description'])) {
        $updates[] = 'description = ?';
        $params[] = trim($data['description']);
    }
    if (isset($data['category_id'])) {
        $catId = !empty($data['category_id']) ? (int)$data['category_id'] : null;
        if ($catId) {
            $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
            $stmt->execute([$catId]);
            if (!$stmt->fetch()) {
                errorResponse('Category not found', 404);
            }
        }
        $updates[] = 'category_id = ?';
        $params[] = $catId;
    }
    if (isset($data['in_stock'])) {
        $updates[] = 'in_stock = ?';
        $params[] = filter_var($data['in_stock'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    }
    if (isset($data['featured'])) {
        $updates[] = 'featured = ?';
        $params[] = filter_var($data['featured'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    }

    if (!empty($updates)) {
        $params[] = $productId;
        $sql = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    }

    // Handle image deletions
    $deleteImages = $data['delete_images'] ?? null;
    if (is_string($deleteImages)) {
        $deleteImages = json_decode($deleteImages, true);
    }
    if (is_array($deleteImages) && count($deleteImages) > 0) {
        // Get file paths before deleting records
        $placeholders = implode(',', array_fill(0, count($deleteImages), '?'));
        $stmt = $db->prepare("SELECT image FROM product_images WHERE id IN ($placeholders) AND product_id = ?");
        $stmt->execute(array_merge($deleteImages, [$productId]));
        $imagesToDelete = $stmt->fetchAll();

        foreach ($imagesToDelete as $img) {
            $filePath = __DIR__ . '/../../' . ltrim($img['image'], '/');
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        $stmt = $db->prepare("DELETE FROM product_images WHERE id IN ($placeholders) AND product_id = ?");
        $stmt->execute(array_merge($deleteImages, [$productId]));
    }

    // Handle new image uploads
    $uploadedImages = [];
    if (!empty($_FILES['images'])) {
        $uploadDir = __DIR__ . '/../../uploads/products/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 10 * 1024 * 1024;

        // Get current max order
        $stmt = $db->prepare("SELECT COALESCE(MAX(`order`), -1) as max_order FROM product_images WHERE product_id = ?");
        $stmt->execute([$productId]);
        $maxOrder = (int)$stmt->fetch()['max_order'];

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

        foreach ($files as $idx => $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) continue;
            if (!in_array($file['type'], $allowedTypes)) continue;
            if ($file['size'] > $maxSize) continue;

            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'product_' . $productId . '_' . time() . '_' . $idx . '.' . $ext;
            $filepath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                $imageUrl = '/uploads/products/' . $filename;
                $order = $maxOrder + $idx + 1;

                $stmt = $db->prepare("INSERT INTO product_images (product_id, image, alt_text, `order`) VALUES (?, ?, ?, ?)");
                $stmt->execute([$productId, $imageUrl, $data['name'] ?? $product['name'], $order]);

                $uploadedImages[] = $imageUrl;
            }
        }
    }

    // Handle colors replacement
    $colors = $data['colors'] ?? null;
    if (is_string($colors)) $colors = json_decode($colors, true);
    if (is_array($colors)) {
        $db->prepare("DELETE FROM product_color_map WHERE product_id = ?")->execute([$productId]);
        foreach ($colors as $color) {
            $colorName = $color['name'] ?? '';
            $colorValue = $color['value'] ?? '';
            if (empty($colorName) || empty($colorValue)) continue;

            $stmt = $db->prepare("SELECT id FROM product_colors WHERE name = ? AND value = ?");
            $stmt->execute([$colorName, $colorValue]);
            $existing = $stmt->fetch();

            $colorId = $existing ? $existing['id'] : null;
            if (!$colorId) {
                $stmt = $db->prepare("INSERT INTO product_colors (name, value) VALUES (?, ?)");
                $stmt->execute([$colorName, $colorValue]);
                $colorId = $db->lastInsertId();
            }

            $db->prepare("INSERT INTO product_color_map (product_id, color_id) VALUES (?, ?)")->execute([$productId, $colorId]);
        }
    }

    // Handle sizes replacement
    $sizes = $data['sizes'] ?? null;
    if (is_string($sizes)) $sizes = json_decode($sizes, true);
    if (is_array($sizes)) {
        $db->prepare("DELETE FROM product_size_stock WHERE product_id = ?")->execute([$productId]);
        foreach ($sizes as $size) {
            $sizeName = is_string($size) ? $size : ($size['name'] ?? '');
            $sizeInStock = is_string($size) ? true : ($size['inStock'] ?? true);
            $sizeQty = is_string($size) ? 0 : ($size['quantity'] ?? 0);
            if (empty($sizeName)) continue;

            $stmt = $db->prepare("SELECT id FROM product_sizes WHERE name = ?");
            $stmt->execute([$sizeName]);
            $existing = $stmt->fetch();

            $sizeId = $existing ? $existing['id'] : null;
            if (!$sizeId) {
                $stmt = $db->prepare("INSERT INTO product_sizes (name) VALUES (?)");
                $stmt->execute([$sizeName]);
                $sizeId = $db->lastInsertId();
            }

            $db->prepare("INSERT INTO product_size_stock (product_id, size_id, in_stock, quantity) VALUES (?, ?, ?, ?)")
                ->execute([$productId, $sizeId, $sizeInStock ? 1 : 0, (int)$sizeQty]);
        }
    }

    $db->commit();

    // Fetch updated product
    $stmt = $db->prepare("
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    ");
    $stmt->execute([$productId]);
    $updated = $stmt->fetch();

    // Fetch images
    $stmt = $db->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY `order`");
    $stmt->execute([$productId]);
    $updated['images'] = $stmt->fetchAll();

    jsonResponse([
        'success' => true,
        'message' => 'Product updated successfully',
        'product' => $updated,
    ]);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Update product error: " . $e->getMessage());
    errorResponse('Failed to update product', 500);
}
