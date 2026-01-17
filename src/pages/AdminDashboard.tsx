import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate, Routes, Route } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { formatNaira, formatAdminCurrency } from "@/lib/currency";
import { adminService, Order } from "@/lib/apiServices";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";

// Import sub-pages
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";

interface AdminStats {
  total_revenue: number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  total_products: number;
  products_change: number;
  total_customers: number;
  customers_change: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "pending": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "out_of_stock": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "low_stock": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

const StatCard = ({ title, value, change, icon: Icon, showDual = false, nairaValue, loading = false }: { 
  title: string; 
  value: string | number; 
  change: number; 
  icon: React.ElementType;
  showDual?: boolean;
  nairaValue?: number;
  loading?: boolean;
}) => {
  const dualCurrency = nairaValue ? formatAdminCurrency(nairaValue) : null;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : showDual && dualCurrency ? (
          <div>
            <div className="text-2xl font-bold">{dualCurrency.naira}</div>
            <div className="text-sm text-muted-foreground">{dualCurrency.usd}</div>
          </div>
        ) : (
          <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        )}
        <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, ordersData] = await Promise.all([
          adminService.getStats(),
          adminService.getOrders(),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5)); // Get first 5 orders
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback mock data if API fails
  const displayStats = stats || {
    total_revenue: 0,
    revenue_change: 0,
    total_orders: 0,
    orders_change: 0,
    total_products: 0,
    products_change: 0,
    total_customers: 0,
    customers_change: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, {user?.first_name}! Here's what's happening with your store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Total Revenue" 
          value="" 
          change={displayStats.revenue_change} 
          icon={DollarSign} 
          showDual={true} 
          nairaValue={displayStats.total_revenue} 
          loading={loading}
        />
        <StatCard 
          title="Total Orders" 
          value={displayStats.total_orders} 
          change={displayStats.orders_change} 
          icon={ShoppingCart} 
          loading={loading}
        />
        <StatCard 
          title="Products" 
          value={displayStats.total_products} 
          change={displayStats.products_change} 
          icon={Package} 
          loading={loading}
        />
        <StatCard 
          title="Customers" 
          value={displayStats.total_customers} 
          change={displayStats.customers_change} 
          icon={Users} 
          loading={loading}
        />
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="bg-card">
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Manage and track customer orders</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search orders..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders
                      .filter(order => 
                        order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{formatNaira(order.total)}</TableCell>
                          <TableCell><Badge className={getStatusColor(order.status)}>{order.status}</Badge></TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
