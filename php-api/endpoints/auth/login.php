<?php
/**
 * Login Endpoint
 * POST /api/auth/login
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$data = getRequestBody();

// Validation
$errors = validateRequired($data, ['email', 'password']);
if (!empty($errors)) {
    validationError($errors);
}

$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$password = $data['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    errorResponse('Invalid email format');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, email, password, first_name, last_name, role, avatar, 
               phone, bio, location, occupation, date_of_birth,
               tiktok, whatsapp, instagram, created_at
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        errorResponse('Invalid email or password', 401);
    }
    
    // Generate tokens
    $tokens = JWT::generateTokenPair($user['id'], $user['email'], $user['role']);
    
    // Remove password from response
    unset($user['password']);
    
    jsonResponse([
        'success' => true,
        'message' => 'Login successful',
        'user' => $user,
        'tokens' => $tokens
    ]);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    errorResponse('Login failed', 500);
}
