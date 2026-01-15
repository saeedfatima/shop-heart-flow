<?php
/**
 * Mark Review as Helpful Endpoint
 * POST /api/reviews/{id}/helpful
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$reviewId = $GLOBALS['route_params']['id'] ?? null;

if (!$reviewId) {
    errorResponse('Review ID required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if review exists
    $stmt = $db->prepare("SELECT id, helpful_count FROM reviews WHERE id = ?");
    $stmt->execute([$reviewId]);
    $review = $stmt->fetch();
    
    if (!$review) {
        notFoundResponse('Review not found');
    }
    
    // Check if user already marked this review as helpful
    $stmt = $db->prepare("SELECT id FROM review_helpful WHERE review_id = ? AND user_id = ?");
    $stmt->execute([$reviewId, $userId]);
    
    if ($stmt->fetch()) {
        errorResponse('You already marked this review as helpful', 409);
    }
    
    // Add helpful vote
    $stmt = $db->prepare("INSERT INTO review_helpful (review_id, user_id, created_at) VALUES (?, ?, NOW())");
    $stmt->execute([$reviewId, $userId]);
    
    // Update helpful count
    $stmt = $db->prepare("UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?");
    $stmt->execute([$reviewId]);
    
    jsonResponse([
        'helpful_count' => $review['helpful_count'] + 1
    ]);
    
} catch (Exception $e) {
    error_log("Mark helpful error: " . $e->getMessage());
    errorResponse('Failed to mark review as helpful', 500);
}
