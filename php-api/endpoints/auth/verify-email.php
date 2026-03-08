<?php
/**
 * Verify Email Endpoint
 * GET /api/auth/verify-email?token=xxx
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/mailer.php';

$token = $_GET['token'] ?? '';

if (empty($token)) {
    errorResponse('Verification token is required');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Find user with this token
    $stmt = $db->prepare("
        SELECT id, email, first_name, email_verified, email_verification_token, email_verification_expires
        FROM users
        WHERE email_verification_token = ?
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        errorResponse('Invalid or expired verification token', 400);
    }

    if ($user['email_verified']) {
        jsonResponse([
            'success' => true,
            'message' => 'Email is already verified',
            'already_verified' => true,
        ]);
        return;
    }

    // Check expiry
    if ($user['email_verification_expires'] && strtotime($user['email_verification_expires']) < time()) {
        errorResponse('Verification token has expired. Please request a new one.', 400);
    }

    // Mark email as verified
    $stmt = $db->prepare("
        UPDATE users 
        SET email_verified = 1, 
            email_verification_token = NULL, 
            email_verification_expires = NULL,
            updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);

    // Send welcome email
    $mailer = new Mailer();
    $mailer->sendWelcomeEmail($user['email'], $user['first_name']);

    // Generate tokens so user is logged in after verification
    $stmt = $db->prepare("
        SELECT id, email, first_name, last_name, role, avatar, 
               phone, bio, location, occupation, date_of_birth,
               tiktok, whatsapp, instagram, created_at, email_verified
        FROM users WHERE id = ?
    ");
    $stmt->execute([$user['id']]);
    $fullUser = $stmt->fetch();

    $tokens = JWT::generateTokenPair($fullUser['id'], $fullUser['email'], $fullUser['role']);

    jsonResponse([
        'success' => true,
        'message' => 'Email verified successfully',
        'user' => $fullUser,
        'tokens' => $tokens,
    ]);

} catch (Exception $e) {
    error_log("Email verification error: " . $e->getMessage());
    errorResponse('Verification failed', 500);
}
