<?php
/**
 * Update Address Endpoint
 * PUT /api/addresses/{id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$addressId = $GLOBALS['route_params']['id'] ?? null;

if (!$addressId) {
    errorResponse('Address ID required');
}

$data = getRequestBody();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if address belongs to user
    $stmt = $db->prepare("SELECT id FROM addresses WHERE id = ? AND user_id = ?");
    $stmt->execute([$addressId, $userId]);
    if (!$stmt->fetch()) {
        notFoundResponse('Address not found');
    }
    
    // Build update query
    $allowedFields = [
        'label', 'address_type', 'recipient_name', 'street_address',
        'apartment', 'city', 'state', 'postal_code', 'country', 'phone', 'is_default'
    ];
    
    $updates = [];
    $values = [];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            if ($field === 'is_default') {
                $values[] = $data[$field] ? 1 : 0;
            } else {
                $values[] = htmlspecialchars(trim($data[$field]), ENT_QUOTES, 'UTF-8');
            }
        }
    }
    
    if (empty($updates)) {
        errorResponse('No fields to update');
    }
    
    // If setting as default, unset other defaults
    if (!empty($data['is_default'])) {
        $stmt = $db->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?");
        $stmt->execute([$userId, $addressId]);
    }
    
    $values[] = $addressId;
    $values[] = $userId;
    
    $sql = "UPDATE addresses SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($values);
    
    // Return updated address
    $stmt = $db->prepare("SELECT * FROM addresses WHERE id = ?");
    $stmt->execute([$addressId]);
    $address = $stmt->fetch();
    $address['is_default'] = (bool)$address['is_default'];
    
    jsonResponse($address);
    
} catch (Exception $e) {
    error_log("Update address error: " . $e->getMessage());
    errorResponse('Failed to update address', 500);
}
