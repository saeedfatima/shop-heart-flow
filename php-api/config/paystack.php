<?php
/**
 * Paystack Configuration
 */

class PaystackConfig {
    // Test Secret Key from Paystack Dashboard
    // Replace with your real secret key in production .env or hardcoded here for testing
    public static $secret_key = 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    
    // Paystack API Base URL
    public static $api_url = 'https://api.paystack.co';
}
