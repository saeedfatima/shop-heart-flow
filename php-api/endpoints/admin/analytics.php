<?php
/**
 * Admin Analytics Endpoint
 * GET /api/admin/analytics
 * Returns detailed analytics data for charts and reports
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

JWT::requireAdmin();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // ---- Revenue by day (last 7 days) ----
    $stmt = $db->query("
        SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing', 'paid')
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $dailyRevenue = $stmt->fetchAll();
    
    // Fill in missing days
    $revenueByDay = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $dayName = date('D', strtotime($date));
        $found = false;
        foreach ($dailyRevenue as $row) {
            if ($row['date'] === $date) {
                $revenueByDay[] = ['day' => $dayName, 'date' => $date, 'revenue' => (float)$row['revenue']];
                $found = true;
                break;
            }
        }
        if (!$found) {
            $revenueByDay[] = ['day' => $dayName, 'date' => $date, 'revenue' => 0];
        }
    }
    
    // ---- Orders by status ----
    $stmt = $db->query("
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
    ");
    $statusRows = $stmt->fetchAll();
    $totalOrders = array_sum(array_column($statusRows, 'count'));
    
    $ordersByStatus = [];
    foreach ($statusRows as $row) {
        $ordersByStatus[] = [
            'status' => $row['status'],
            'count' => (int)$row['count'],
            'percentage' => $totalOrders > 0 ? round(((int)$row['count'] / $totalOrders) * 100, 1) : 0,
        ];
    }
    
    // ---- Top selling products (by quantity sold) ----
    $stmt = $db->query("
        SELECT p.id, p.name, SUM(oi.quantity) as total_sold, 
               SUM(oi.quantity * oi.price) as total_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('delivered', 'shipped', 'processing', 'paid')
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
    ");
    $topProducts = $stmt->fetchAll();
    
    $formattedTopProducts = array_map(function($p) {
        return [
            'id' => (int)$p['id'],
            'name' => $p['name'],
            'sales' => (int)$p['total_sold'],
            'revenue' => (float)$p['total_revenue'],
        ];
    }, $topProducts);
    
    // ---- Top categories (by revenue) ----
    $stmt = $db->query("
        SELECT c.name, COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('delivered', 'shipped', 'processing', 'paid')
        GROUP BY c.id
        ORDER BY total_revenue DESC
        LIMIT 5
    ");
    $topCategories = $stmt->fetchAll();
    
    $totalCategoryRevenue = array_sum(array_column($topCategories, 'total_revenue'));
    $formattedTopCategories = array_map(function($c) use ($totalCategoryRevenue) {
        return [
            'name' => $c['name'],
            'revenue' => (float)$c['total_revenue'],
            'percentage' => $totalCategoryRevenue > 0 
                ? round(((float)$c['total_revenue'] / $totalCategoryRevenue) * 100, 1) 
                : 0,
        ];
    }, $topCategories);
    
    // ---- Summary stats ----
    $stmt = $db->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'delivered'");
    $totalRevenue = (float)$stmt->fetchColumn();
    
    $stmt = $db->query("SELECT COUNT(*) FROM orders");
    $totalOrderCount = (int)$stmt->fetchColumn();
    
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    $totalCustomers = (int)$stmt->fetchColumn();
    
    // Conversion rate (orders / customers, simplified)
    $conversionRate = $totalCustomers > 0 
        ? round(($totalOrderCount / $totalCustomers) * 100, 1) 
        : 0;
    
    jsonResponse([
        'summary' => [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrderCount,
            'total_customers' => $totalCustomers,
            'conversion_rate' => $conversionRate,
        ],
        'revenue_by_day' => $revenueByDay,
        'orders_by_status' => $ordersByStatus,
        'top_products' => $formattedTopProducts,
        'top_categories' => $formattedTopCategories,
    ]);
    
} catch (Exception $e) {
    error_log("Admin analytics error: " . $e->getMessage());
    errorResponse('Failed to get analytics data', 500);
}
