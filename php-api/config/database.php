<?php
/**
 * Database Configuration
 * Works with XAMPP locally and cPanel in production
 */

class Database {
    // Local Development (XAMPP)
    private $host = 'localhost';
    private $db_name = 'shaheeda_ecommerce';
    private $username = 'root';
    private $password = '';
    
    // Production (cPanel) - Uncomment and update for deployment
    // private $host = 'localhost';
    // private $db_name = 'cpanelusername_shaheeda_ecommerce';
    // private $username = 'cpanelusername_dbuser';
    // private $password = 'your_secure_password';
    
    public $conn;
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch(PDOException $e) {
            // In production, log this error instead of displaying
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
        
        return $this->conn;
    }
}
