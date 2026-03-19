<?php
/**
 * JWT Configuration and Helper Functions
 * Simple JWT implementation without external dependencies
 */

define('JWT_SECRET', 'your-super-secret-key-change-this-in-production-min-32-chars');
define('JWT_ACCESS_EXPIRY', 86400);      // 1 day in seconds
define('JWT_REFRESH_EXPIRY', 604800);    // 7 days in seconds

class JWT {
    private static function getHeaderCandidates() {
        $candidates = [
            'server.HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
            'server.REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
            'server.REDIRECT_REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'] ?? null,
            'server.X_HTTP_AUTHORIZATION' => $_SERVER['X-HTTP_AUTHORIZATION'] ?? null,
            'server.HTTP_X_AUTH_TOKEN' => $_SERVER['HTTP_X_AUTH_TOKEN'] ?? null,
            'server.Authorization' => $_SERVER['Authorization'] ?? null,
            'env.HTTP_AUTHORIZATION' => getenv('HTTP_AUTHORIZATION') ?: null,
            'env.REDIRECT_HTTP_AUTHORIZATION' => getenv('REDIRECT_HTTP_AUTHORIZATION') ?: null,
            'env.REDIRECT_REDIRECT_HTTP_AUTHORIZATION' => getenv('REDIRECT_REDIRECT_HTTP_AUTHORIZATION') ?: null,
            'env.HTTP_X_AUTH_TOKEN' => getenv('HTTP_X_AUTH_TOKEN') ?: null,
        ];

        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            $candidates['getallheaders.Authorization'] = $headers['Authorization'] ?? null;
            $candidates['getallheaders.authorization'] = $headers['authorization'] ?? null;
            $candidates['getallheaders.X-Auth-Token'] = $headers['X-Auth-Token'] ?? null;
            $candidates['getallheaders.x-auth-token'] = $headers['x-auth-token'] ?? null;
        }

        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $candidates['apache_request_headers.Authorization'] = $headers['Authorization'] ?? null;
            $candidates['apache_request_headers.authorization'] = $headers['authorization'] ?? null;
            $candidates['apache_request_headers.X-Auth-Token'] = $headers['X-Auth-Token'] ?? null;
            $candidates['apache_request_headers.x-auth-token'] = $headers['x-auth-token'] ?? null;
        }

        return $candidates;
    }

    private static function getTokenFromHeaderValue(?string $headerValue) {
        if (!is_string($headerValue)) {
            return '';
        }

        $headerValue = trim($headerValue);
        if ($headerValue === '') {
            return '';
        }

        if (stripos($headerValue, 'Bearer ') === 0) {
            return trim(substr($headerValue, 7));
        }

        return $headerValue;
    }

    /**
     * Read Authorization header across Apache, FastCGI, and cPanel environments
     */
    private static function getRequestToken() {
        foreach (self::getHeaderCandidates() as $header) {
            $token = self::getTokenFromHeaderValue($header);
            if ($token !== '') {
                return $token;
            }
        }

        return '';
    }

    public static function getAuthDebugInfo() {
        $candidateValues = self::getHeaderCandidates();
        $headerPresence = [];
        $resolvedSource = null;
        $token = '';

        foreach ($candidateValues as $source => $value) {
            $headerPresence[$source] = is_string($value) && trim($value) !== '';

            if ($resolvedSource === null) {
                $candidateToken = self::getTokenFromHeaderValue($value);
                if ($candidateToken !== '') {
                    $resolvedSource = $source;
                    $token = $candidateToken;
                }
            }
        }

        $payload = $token !== '' ? self::validate($token) : false;

        return [
            'header_presence' => $headerPresence,
            'resolved_source' => $resolvedSource,
            'token_present' => $token !== '',
            'token_length' => $token !== '' ? strlen($token) : 0,
            'token_fingerprint' => $token !== '' ? substr(hash('sha256', $token), 0, 16) : null,
            'token_valid' => $payload !== false,
            'payload' => $payload ? [
                'user_id' => $payload['user_id'] ?? null,
                'email' => $payload['email'] ?? null,
                'role' => $payload['role'] ?? null,
                'type' => $payload['type'] ?? null,
                'iat' => $payload['iat'] ?? null,
                'exp' => $payload['exp'] ?? null,
                'exp_iso' => isset($payload['exp']) ? gmdate('c', (int) $payload['exp']) : null,
            ] : null,
        ];
    }
    
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
        $token = self::getRequestToken();

        if ($token === '') {
            return null;
        }

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
        $token = self::getRequestToken();

        if ($token === '') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $payload = self::validate($token);
        
        if (!$payload || ($payload['type'] ?? '') !== 'access') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        if (($payload['role'] ?? '') !== 'admin') {
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
