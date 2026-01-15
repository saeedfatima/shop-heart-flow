<?php
/**
 * Health Check Endpoint
 * GET /api/health
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    jsonResponse([
        'status' => 'healthy',
        'database' => 'connected',
        'timestamp' => date('c')
    ]);
} catch (Exception $e) {
    jsonResponse([
        'status' => 'unhealthy',
        'database' => 'disconnected',
        'timestamp' => date('c')
    ], 503);
}
