<?php
/**
 * List Payment Methods Endpoint
 * GET /api/payment-methods
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, card_type, last_four, expiry_month, expiry_year,
               cardholder_name, is_default
        FROM payment_methods 
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
    ");
    $stmt->execute([$userId]);
    $methods = $stmt->fetchAll();
    
    // Convert is_default to boolean
    $methods = array_map(function($method) {
        $method['is_default'] = (bool)$method['is_default'];
        return $method;
    }, $methods);
    
    jsonResponse($methods);
    
} catch (Exception $e) {
    error_log("Payment methods list error: " . $e->getMessage());
    errorResponse('Failed to get payment methods', 500);
}
