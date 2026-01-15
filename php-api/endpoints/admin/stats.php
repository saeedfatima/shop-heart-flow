<?php
/**
 * Admin Dashboard Stats Endpoint
 * GET /api/admin/stats
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Total revenue (from delivered orders)
    $stmt = $db->query("
        SELECT COALESCE(SUM(total), 0) as total_revenue
        FROM orders 
        WHERE status = 'delivered'
    ");
    $totalRevenue = $stmt->fetchColumn();
    
    // Revenue change (compare this month to last month)
    $stmt = $db->query("
        SELECT COALESCE(SUM(total), 0) 
        FROM orders 
        WHERE status = 'delivered' 
        AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $thisMonthRevenue = $stmt->fetchColumn();
    
    $stmt = $db->query("
        SELECT COALESCE(SUM(total), 0) 
        FROM orders 
        WHERE status = 'delivered' 
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $lastMonthRevenue = $stmt->fetchColumn();
    
    $revenueChange = $lastMonthRevenue > 0 
        ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
        : 0;
    
    // Total orders
    $stmt = $db->query("SELECT COUNT(*) FROM orders");
    $totalOrders = $stmt->fetchColumn();
    
    // Orders this month vs last month
    $stmt = $db->query("
        SELECT COUNT(*) FROM orders 
        WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $thisMonthOrders = $stmt->fetchColumn();
    
    $stmt = $db->query("
        SELECT COUNT(*) FROM orders 
        WHERE created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $lastMonthOrders = $stmt->fetchColumn();
    
    $ordersChange = $lastMonthOrders > 0 
        ? round((($thisMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
        : 0;
    
    // Total products
    $stmt = $db->query("SELECT COUNT(*) FROM products");
    $totalProducts = $stmt->fetchColumn();
    
    // Products added this month
    $stmt = $db->query("
        SELECT COUNT(*) FROM products 
        WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $productsChange = $stmt->fetchColumn();
    
    // Total customers
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    $totalCustomers = $stmt->fetchColumn();
    
    // Customers this month vs last month
    $stmt = $db->query("
        SELECT COUNT(*) FROM users 
        WHERE role = 'user' 
        AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $thisMonthCustomers = $stmt->fetchColumn();
    
    $stmt = $db->query("
        SELECT COUNT(*) FROM users 
        WHERE role = 'user' 
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $lastMonthCustomers = $stmt->fetchColumn();
    
    $customersChange = $lastMonthCustomers > 0 
        ? round((($thisMonthCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100, 1)
        : 0;
    
    jsonResponse([
        'total_revenue' => (float)$totalRevenue,
        'revenue_change' => $revenueChange,
        'total_orders' => (int)$totalOrders,
        'orders_change' => $ordersChange,
        'total_products' => (int)$totalProducts,
        'products_change' => (int)$productsChange,
        'total_customers' => (int)$totalCustomers,
        'customers_change' => $customersChange
    ]);
    
} catch (Exception $e) {
    error_log("Admin stats error: " . $e->getMessage());
    errorResponse('Failed to get stats', 500);
}
