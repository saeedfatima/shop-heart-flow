<?php
/**
 * Create Address Endpoint
 * POST /api/addresses/create
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$data = getRequestBody();

$errors = validateRequired($data, [
    'label', 'address_type', 'recipient_name', 'street_address',
    'city', 'state', 'postal_code', 'country', 'phone'
]);
if (!empty($errors)) {
    validationError($errors);
}

$addressTypes = ['home', 'work', 'other'];
if (!in_array($data['address_type'], $addressTypes)) {
    errorResponse('Invalid address type');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // If this is set as default, unset other defaults
    if (!empty($data['is_default'])) {
        $stmt = $db->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?");
        $stmt->execute([$userId]);
    }
    
    $stmt = $db->prepare("
        INSERT INTO addresses (
            user_id, label, address_type, recipient_name, street_address,
            apartment, city, state, postal_code, country, phone, is_default, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $userId,
        htmlspecialchars(trim($data['label']), ENT_QUOTES, 'UTF-8'),
        $data['address_type'],
        htmlspecialchars(trim($data['recipient_name']), ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(trim($data['street_address']), ENT_QUOTES, 'UTF-8'),
        isset($data['apartment']) ? htmlspecialchars(trim($data['apartment']), ENT_QUOTES, 'UTF-8') : null,
        htmlspecialchars(trim($data['city']), ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(trim($data['state']), ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(trim($data['postal_code']), ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(trim($data['country']), ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(trim($data['phone']), ENT_QUOTES, 'UTF-8'),
        !empty($data['is_default']) ? 1 : 0
    ]);
    
    $addressId = $db->lastInsertId();
    
    $stmt = $db->prepare("SELECT * FROM addresses WHERE id = ?");
    $stmt->execute([$addressId]);
    $address = $stmt->fetch();
    $address['is_default'] = (bool)$address['is_default'];
    
    jsonResponse($address, 201);
    
} catch (Exception $e) {
    error_log("Create address error: " . $e->getMessage());
    errorResponse('Failed to create address', 500);
}
