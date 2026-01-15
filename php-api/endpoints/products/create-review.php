<?php
/**
 * Create Product Review Endpoint
 * POST /api/products/{id}/reviews/create
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$productId = $GLOBALS['route_params']['id'] ?? null;

if (!$productId) {
    errorResponse('Product ID required');
}

$data = getRequestBody();

$errors = validateRequired($data, ['rating', 'title', 'comment']);
if (!empty($errors)) {
    validationError($errors);
}

$rating = intval($data['rating']);
if ($rating < 1 || $rating > 5) {
    errorResponse('Rating must be between 1 and 5');
}

$title = htmlspecialchars(trim($data['title']), ENT_QUOTES, 'UTF-8');
$comment = htmlspecialchars(trim($data['comment']), ENT_QUOTES, 'UTF-8');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if product exists
    $stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Product not found');
    }
    
    // Check if user already reviewed this product
    $stmt = $db->prepare("SELECT id FROM reviews WHERE product_id = ? AND user_id = ?");
    $stmt->execute([$productId, $userId]);
    if ($stmt->fetch()) {
        errorResponse('You have already reviewed this product', 409);
    }
    
    // Check if user purchased this product (for verified_purchase)
    $stmt = $db->prepare("
        SELECT oi.id FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered'
    ");
    $stmt->execute([$productId, $userId]);
    $verifiedPurchase = $stmt->fetch() ? 1 : 0;
    
    // Create review
    $stmt = $db->prepare("
        INSERT INTO reviews (product_id, user_id, rating, title, content, verified_purchase, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$productId, $userId, $rating, $title, $comment, $verifiedPurchase]);
    $reviewId = $db->lastInsertId();
    
    // Update product rating and review count
    $stmt = $db->prepare("
        UPDATE products 
        SET review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?),
            rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?)
        WHERE id = ?
    ");
    $stmt->execute([$productId, $productId, $productId]);
    
    // Get created review
    $stmt = $db->prepare("
        SELECT r.id, r.rating, r.title, r.content as comment, 
               r.helpful_count, r.verified_purchase, r.created_at,
               u.id as user_id, u.first_name, u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$reviewId]);
    $review = $stmt->fetch();
    
    jsonResponse([
        'id' => $review['id'],
        'user' => [
            'id' => $review['user_id'],
            'first_name' => $review['first_name'],
            'last_name' => $review['last_name']
        ],
        'rating' => $review['rating'],
        'title' => $review['title'],
        'comment' => $review['comment'],
        'helpful_count' => $review['helpful_count'],
        'verified_purchase' => (bool)$review['verified_purchase'],
        'created_at' => $review['created_at']
    ], 201);
    
} catch (Exception $e) {
    error_log("Create review error: " . $e->getMessage());
    errorResponse('Failed to create review', 500);
}
