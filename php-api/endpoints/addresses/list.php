<?php
/**
 * List User Addresses Endpoint
 * GET /api/addresses
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, label, address_type, recipient_name, street_address,
               apartment, city, state, postal_code, country, phone, is_default
        FROM addresses 
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
    ");
    $stmt->execute([$userId]);
    $addresses = $stmt->fetchAll();
    
    // Convert is_default to boolean
    $addresses = array_map(function($addr) {
        $addr['is_default'] = (bool)$addr['is_default'];
        return $addr;
    }, $addresses);
    
    jsonResponse($addresses);
    
} catch (Exception $e) {
    error_log("Addresses list error: " . $e->getMessage());
    errorResponse('Failed to get addresses', 500);
}
