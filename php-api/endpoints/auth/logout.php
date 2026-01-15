<?php
/**
 * Logout Endpoint
 * POST /api/auth/logout
 */

// In a more complete implementation, you would:
// 1. Store refresh tokens in database
// 2. Invalidate the token on logout

jsonResponse([
    'success' => true,
    'message' => 'Logged out successfully'
]);
