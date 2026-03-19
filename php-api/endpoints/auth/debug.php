<?php
/**
 * Temporary Auth Debug Endpoint
 * GET /api/auth/debug
 *
 * Remove this endpoint after production auth troubleshooting is complete.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$debug = JWT::getAuthDebugInfo();

$userRecord = null;
if (!empty($debug['payload']['user_id'])) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        $stmt = $db->prepare("
            SELECT id, email, role, first_name, last_name, created_at
            FROM users
            WHERE id = ?
        ");
        $stmt->execute([$debug['payload']['user_id']]);
        $user = $stmt->fetch();

        if ($user) {
            $userRecord = [
                'id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
                'name' => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
                'created_at' => $user['created_at'],
            ];
        }
    } catch (Exception $e) {
        $userRecord = [
            'error' => 'Failed to query user record',
            'message' => $e->getMessage(),
        ];
    }
}

jsonResponse([
    'success' => true,
    'warning' => 'Temporary debug endpoint. Remove after troubleshooting.',
    'timestamp' => gmdate('c'),
    'request' => [
        'method' => $_SERVER['REQUEST_METHOD'] ?? null,
        'uri' => $_SERVER['REQUEST_URI'] ?? null,
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? null,
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? null,
    ],
    'auth' => $debug,
    'database_user' => $userRecord,
]);
