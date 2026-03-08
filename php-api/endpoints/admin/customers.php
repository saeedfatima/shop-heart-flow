<?php
/**
 * Admin Customers List Endpoint
 * GET /api/admin/customers
 * Returns all customers with order stats for admin management
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all non-admin users with order stats
    $stmt = $db->query("
        SELECT u.id, u.email, u.first_name, u.last_name, u.avatar, u.phone,
               u.created_at,
               COUNT(DISTINCT o.id) as orders_count,
               COALESCE(SUM(o.total), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'user'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ");
    $customers = $stmt->fetchAll();
    
    $formattedCustomers = [];
    foreach ($customers as $customer) {
        $ordersCount = (int)$customer['orders_count'];
        $totalSpent = (float)$customer['total_spent'];
        
        // Determine status
        $createdAt = new DateTime($customer['created_at']);
        $now = new DateTime();
        $daysSinceJoined = $now->diff($createdAt)->days;
        
        if ($daysSinceJoined <= 30) {
            $status = 'new';
        } elseif ($totalSpent >= 100000 || $ordersCount >= 10) {
            $status = 'vip';
        } elseif ($ordersCount === 0 && $daysSinceJoined > 90) {
            $status = 'inactive';
        } else {
            $status = 'active';
        }
        
        $formattedCustomers[] = [
            'id' => (int)$customer['id'],
            'name' => trim($customer['first_name'] . ' ' . $customer['last_name']),
            'email' => $customer['email'],
            'avatar' => $customer['avatar'],
            'phone' => $customer['phone'],
            'orders' => $ordersCount,
            'spent' => $totalSpent,
            'joined' => $customer['created_at'],
            'status' => $status,
        ];
    }
    
    // Calculate stats
    $totalCustomers = count($formattedCustomers);
    
    // New this month
    $stmt = $db->query("
        SELECT COUNT(*) FROM users 
        WHERE role = 'user' 
        AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $newThisMonth = (int)$stmt->fetchColumn();
    
    // Average orders per customer
    $avgOrders = $totalCustomers > 0 
        ? round(array_sum(array_column($formattedCustomers, 'orders')) / $totalCustomers, 1)
        : 0;
    
    // Average customer value
    $avgValue = $totalCustomers > 0
        ? round(array_sum(array_column($formattedCustomers, 'spent')) / $totalCustomers, 2)
        : 0;
    
    jsonResponse([
        'customers' => $formattedCustomers,
        'stats' => [
            'total_customers' => $totalCustomers,
            'new_this_month' => $newThisMonth,
            'avg_orders' => $avgOrders,
            'avg_value' => $avgValue,
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Admin customers error: " . $e->getMessage());
    errorResponse('Failed to get customers', 500);
}
