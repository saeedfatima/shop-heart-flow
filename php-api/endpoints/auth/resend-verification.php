<?php
/**
 * Resend Verification Email Endpoint
 * POST /api/auth/resend-verification
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/mailer.php';

$data = getRequestBody();
$email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);

if (empty($email)) {
    errorResponse('Email is required');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("SELECT id, first_name, email_verified FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Don't reveal if email exists
        jsonResponse([
            'success' => true,
            'message' => 'If your email is registered, a verification link has been sent.',
        ]);
        return;
    }

    if ($user['email_verified']) {
        jsonResponse([
            'success' => true,
            'message' => 'Email is already verified.',
            'already_verified' => true,
        ]);
        return;
    }

    // Generate new token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $stmt = $db->prepare("
        UPDATE users 
        SET email_verification_token = ?, email_verification_expires = ?
        WHERE id = ?
    ");
    $stmt->execute([$token, $expires, $user['id']]);

    // Send email
    $mailer = new Mailer();
    $sent = $mailer->sendVerificationEmail($email, $user['first_name'], $token);

    if (!$sent) {
        error_log("Failed to send verification email to: $email");
    }

    jsonResponse([
        'success' => true,
        'message' => 'Verification email sent. Please check your inbox.',
    ]);

} catch (Exception $e) {
    error_log("Resend verification error: " . $e->getMessage());
    errorResponse('Failed to resend verification email', 500);
}
