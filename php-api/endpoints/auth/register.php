<?php
/**
 * Register Endpoint
 * POST /api/auth/register
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$data = getRequestBody();

// Validation
$errors = validateRequired($data, ['email', 'first_name', 'last_name', 'password', 'password_confirm']);

if (!empty($errors)) {
    validationError($errors);
}

$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$firstName = htmlspecialchars(trim($data['first_name']), ENT_QUOTES, 'UTF-8');
$lastName = htmlspecialchars(trim($data['last_name']), ENT_QUOTES, 'UTF-8');
$password = $data['password'];
$passwordConfirm = $data['password_confirm'];

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    errorResponse('Invalid email format');
}

// Password validation
if (strlen($password) < 8) {
    errorResponse('Password must be at least 8 characters');
}

if ($password !== $passwordConfirm) {
    errorResponse('Passwords do not match');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if email exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        errorResponse('Email already registered', 409);
    }
    
    // Create user
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("
        INSERT INTO users (email, password, first_name, last_name, role, created_at)
        VALUES (?, ?, ?, ?, 'user', NOW())
    ");
    $stmt->execute([$email, $hashedPassword, $firstName, $lastName]);
    
    $userId = $db->lastInsertId();
    
    // Get created user
    $stmt = $db->prepare("
        SELECT id, email, first_name, last_name, role, avatar, 
               phone, bio, location, occupation, date_of_birth,
               tiktok, whatsapp, instagram, created_at
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    // Generate tokens
    $tokens = JWT::generateTokenPair($user['id'], $user['email'], $user['role']);
    
    jsonResponse([
        'success' => true,
        'message' => 'Registration successful',
        'user' => $user,
        'tokens' => $tokens
    ], 201);
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    errorResponse('Registration failed', 500);
}
