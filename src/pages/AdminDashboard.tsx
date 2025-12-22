import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Mock data
const mockStats = {
  totalRevenue: 45231.89,
  revenueChange: 20.1,
  totalOrders: 2350,
  ordersChange: 15.3,
  totalProducts: 124,
  productsChange: 5.2,
  totalCustomers: 1893,
  customersChange: 12.5,
};

const mockRecentOrders = [
  { id: "ORD-001", customer: "John Doe", email: "john@example.com", total: 299.99, status: "delivered", date: "2024-01-15" },
  { id: "ORD-002", customer: "Jane Smith", email: "jane@example.com", total: 159.50, status: "shipped", date: "2024-01-14" },
  { id: "ORD-003", customer: "Bob Wilson", email: "bob@example.com", total: 89.99, status: "processing", date: "2024-01-14" },
  { id: "ORD-004", customer: "Alice Brown", email: "alice@example.com", total: 449.00, status: "pending", date: "2024-01-13" },
  { id: "ORD-005", customer: "Charlie Davis", email: "charlie@example.com", total: 199.99, status: "delivered", date: "2024-01-12" },
];

const mockProducts = [
  { id: "PRD-001", name: "Classic White Tee", category: "T-Shirts", price: 29.99, stock: 150, status: "active" },
  { id: "PRD-002", name: "Denim Jacket", category: "Outerwear", price: 89.99, stock: 45, status: "active" },
  { id: "PRD-003", name: "Summer Dress", category: "Dresses", price: 59.99, stock: 0, status: "out_of_stock" },
  { id: "PRD-004", name: "Leather Belt", category: "Accessories", price: 39.99, stock: 78, status: "active" },
  { id: "PRD-005", name: "Canvas Sneakers", category: "Footwear", price: 69.99, stock: 12, status: "low_stock" },
];

const mockCustomers = [
  { id: "USR-001", name: "John Doe", email: "john@example.com", orders: 12, spent: 1299.99, joined: "2023-06-15" },
  { id: "USR-002", name: "Jane Smith", email: "jane@example.com", orders: 8, spent: 849.50, joined: "2023-08-22" },
  { id: "USR-003", name: "Bob Wilson", email: "bob@example.com", orders: 5, spent: 429.99, joined: "2023-10-10" },
  { id: "USR-004", name: "Alice Brown", email: "alice@example.com", orders: 15, spent: 2150.00, joined: "2023-03-05" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800";
    case "shipped": return "bg-blue-100 text-blue-800";
    case "processing": return "bg-yellow-100 text-yellow-800";
    case "pending": return "bg-gray-100 text-gray-800";
    case "active": return "bg-green-100 text-green-800";
    case "out_of_stock": return "bg-red-100 text-red-800";
    case "low_stock": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const StatCard = ({ title, value, change, icon: Icon, prefix = "" }: { 
  title: string; 
  value: string | number; 
  change: number; 
  icon: React.ElementType;
  prefix?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span>{Math.abs(change)}% from last month</span>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard 
                title="Total Revenue" 
                value={mockStats.totalRevenue.toFixed(2)} 
                change={mockStats.revenueChange}
                icon={DollarSign}
                prefix="$"
              />
              <StatCard 
                title="Total Orders" 
                value={mockStats.totalOrders} 
                change={mockStats.ordersChange}
                icon={ShoppingCart}
              />
              <StatCard 
                title="Products" 
                value={mockStats.totalProducts} 
                change={mockStats.productsChange}
                icon={Package}
              />
              <StatCard 
                title="Customers" 
                value={mockStats.totalCustomers} 
                change={mockStats.customersChange}
                icon={Users}
              />
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList className="bg-card">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
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
                        <Input 
                          placeholder="Search orders..." 
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockRecentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell className="hidden md:table-cell">{order.email}</TableCell>
                            <TableCell>${order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{order.date}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>Manage your product inventory</CardDescription>
                      </div>
                      <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden md:table-cell">Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="hidden sm:table-cell">Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(product.status)}>
                                {product.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Customers Tab */}
              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle>Customers</CardTitle>
                    <CardDescription>View and manage customer accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead className="hidden sm:table-cell">Total Spent</TableHead>
                          <TableHead className="hidden lg:table-cell">Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.id}</TableCell>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                            <TableCell>{customer.orders}</TableCell>
                            <TableCell className="hidden sm:table-cell">${customer.spent.toFixed(2)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{customer.joined}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
