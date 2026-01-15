<?php
/**
 * Product Reviews Endpoint
 * GET /api/products/{id}/reviews
 */

require_once __DIR__ . '/../../config/database.php';

$productId = $GLOBALS['route_params']['id'] ?? null;

if (!$productId) {
    errorResponse('Product ID required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT r.id, r.rating, r.title, r.content as comment, 
               r.helpful_count, r.verified_purchase, r.created_at,
               u.id as user_id, u.first_name, u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$productId]);
    $reviews = $stmt->fetchAll();
    
    // Format reviews
    $formattedReviews = array_map(function($review) {
        return [
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
        ];
    }, $reviews);
    
    jsonResponse($formattedReviews);
    
} catch (Exception $e) {
    error_log("Product reviews error: " . $e->getMessage());
    errorResponse('Failed to get reviews', 500);
}
