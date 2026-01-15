<?php
/**
 * Create Payment Method Endpoint
 * POST /api/payment-methods/create
 * 
 * NOTE: In production, use a payment processor like Stripe
 * This is a simplified implementation for demo purposes
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$userId = JWT::requireAuth();
$data = getRequestBody();

$errors = validateRequired($data, ['card_number', 'expiry_month', 'expiry_year', 'cvv', 'cardholder_name']);
if (!empty($errors)) {
    validationError($errors);
}

// Basic validation
$cardNumber = preg_replace('/\D/', '', $data['card_number']);
if (strlen($cardNumber) < 13 || strlen($cardNumber) > 19) {
    errorResponse('Invalid card number');
}

$expiryMonth = intval($data['expiry_month']);
$expiryYear = intval($data['expiry_year']);

if ($expiryMonth < 1 || $expiryMonth > 12) {
    errorResponse('Invalid expiry month');
}

// Check if card is expired
$now = new DateTime();
$expiry = DateTime::createFromFormat('Y-m-d', "$expiryYear-$expiryMonth-01");
if ($expiry < $now) {
    errorResponse('Card has expired');
}

// Determine card type
$cardType = 'other';
if (preg_match('/^4/', $cardNumber)) {
    $cardType = 'visa';
} elseif (preg_match('/^5[1-5]/', $cardNumber)) {
    $cardType = 'mastercard';
} elseif (preg_match('/^3[47]/', $cardNumber)) {
    $cardType = 'amex';
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // If this is set as default, unset other defaults
    if (!empty($data['is_default'])) {
        $stmt = $db->prepare("UPDATE payment_methods SET is_default = 0 WHERE user_id = ?");
        $stmt->execute([$userId]);
    }
    
    // Store only last 4 digits (never store full card number!)
    $lastFour = substr($cardNumber, -4);
    
    $stmt = $db->prepare("
        INSERT INTO payment_methods (
            user_id, card_type, last_four, expiry_month, expiry_year,
            cardholder_name, is_default, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $userId,
        $cardType,
        $lastFour,
        $expiryMonth,
        $expiryYear,
        htmlspecialchars(trim($data['cardholder_name']), ENT_QUOTES, 'UTF-8'),
        !empty($data['is_default']) ? 1 : 0
    ]);
    
    $methodId = $db->lastInsertId();
    
    $stmt = $db->prepare("SELECT * FROM payment_methods WHERE id = ?");
    $stmt->execute([$methodId]);
    $method = $stmt->fetch();
    $method['is_default'] = (bool)$method['is_default'];
    
    // Remove user_id from response
    unset($method['user_id']);
    
    jsonResponse($method, 201);
    
} catch (Exception $e) {
    error_log("Create payment method error: " . $e->getMessage());
    errorResponse('Failed to add payment method', 500);
}
