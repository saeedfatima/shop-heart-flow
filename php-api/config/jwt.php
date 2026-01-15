<?php
/**
 * JWT Configuration and Helper Functions
 * Simple JWT implementation without external dependencies
 */

define('JWT_SECRET', 'your-super-secret-key-change-this-in-production-min-32-chars');
define('JWT_ACCESS_EXPIRY', 86400);      // 1 day in seconds
define('JWT_REFRESH_EXPIRY', 604800);    // 7 days in seconds

class JWT {
    
    /**
     * Generate a JWT token
     */
    public static function generate($payload, $expiry = JWT_ACCESS_EXPIRY) {
        $header = self::base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiry;
        
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true)
        );
        
        return "$header.$payloadEncoded.$signature";
    }
    
    /**
     * Generate access and refresh token pair
     */
    public static function generateTokenPair($userId, $email, $role) {
        $accessPayload = [
            'user_id' => $userId,
            'email' => $email,
            'role' => $role,
            'type' => 'access'
        ];
        
        $refreshPayload = [
            'user_id' => $userId,
            'type' => 'refresh'
        ];
        
        return [
            'access' => self::generate($accessPayload, JWT_ACCESS_EXPIRY),
            'refresh' => self::generate($refreshPayload, JWT_REFRESH_EXPIRY)
        ];
    }
    
    /**
     * Validate and decode a JWT token
     */
    public static function validate($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );
        
        if (!hash_equals($expectedSignature, $signature)) {
            return false;
        }
        
        // Decode payload
        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        
        if (!$payloadData) {
            return false;
        }
        
        // Check expiration
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }
        
        return $payloadData;
    }
    
    /**
     * Get user ID from authorization header
     */
    public static function getUserIdFromRequest() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            return null;
        }
        
        $token = substr($authHeader, 7);
        $payload = self::validate($token);
        
        if (!$payload || ($payload['type'] ?? '') !== 'access') {
            return null;
        }
        
        return $payload['user_id'] ?? null;
    }
    
    /**
     * Require authentication - returns user ID or sends 401
     */
    public static function requireAuth() {
        $userId = self::getUserIdFromRequest();
        
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        
        return $userId;
    }
    
    /**
     * Require admin role
     */
    public static function requireAdmin() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        
        $token = substr($authHeader, 7);
        $payload = self::validate($token);
        
        if (!$payload || ($payload['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit;
        }
        
        return $payload['user_id'];
    }
    
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
