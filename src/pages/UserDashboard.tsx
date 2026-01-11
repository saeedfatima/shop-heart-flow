import { motion } from "framer-motion";
import { Link, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  ShoppingBag,
  ChevronRight,
  Calendar,
  CreditCard
} from "lucide-react";

// Import sub-pages
import UserOrders from "@/pages/dashboard/UserOrders";
import UserWishlist from "@/pages/dashboard/UserWishlist";
import UserAddresses from "@/pages/dashboard/UserAddresses";
import UserProfile from "@/pages/dashboard/UserProfile";
import UserPayments from "@/pages/dashboard/UserPayments";
import UserSettings from "@/pages/dashboard/UserSettings";

// Mock data
const mockRecentOrders = [
  { 
    id: "ORD-2024-001", 
    date: "Jan 15, 2024", 
    total: 299.99, 
    status: "delivered",
    items: 3,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"
  },
  { 
    id: "ORD-2024-002", 
    date: "Jan 10, 2024", 
    total: 159.50, 
    status: "shipped",
    items: 2,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100&h=100&fit=crop"
  },
  { 
    id: "ORD-2024-003", 
    date: "Jan 5, 2024", 
    total: 89.99, 
    status: "processing",
    items: 1,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100&h=100&fit=crop"
  },
];

const mockAddresses = [
  { 
    id: 1, 
    type: "Home", 
    address: "123 Main Street, Apt 4B", 
    city: "New York", 
    state: "NY", 
    zip: "10001",
    isDefault: true 
  },
  { 
    id: 2, 
    type: "Work", 
    address: "456 Business Ave, Suite 200", 
    city: "New York", 
    state: "NY", 
    zip: "10018",
    isDefault: false 
  },
];

const mockWishlist = [
  { id: 1, name: "Cashmere Sweater", price: 129.99, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop" },
  { id: 2, name: "Leather Boots", price: 189.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" },
  { id: 3, name: "Silk Scarf", price: 59.99, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=100&h=100&fit=crop" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

const DashboardOverview = () => {
  const { user } = useAuth();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-muted-foreground">Member since {user?.created_at}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Link to="/dashboard/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">My Orders</p>
                <p className="text-sm text-muted-foreground">Track & manage</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/dashboard/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Account</p>
                <p className="text-sm text-muted-foreground">Profile settings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/dashboard/wishlist">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Wishlist</p>
                <p className="text-sm text-muted-foreground">{mockWishlist.length} items</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/shop">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Shop Now</p>
                <p className="text-sm text-muted-foreground">Browse products</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </div>
              <Link to="/dashboard/orders">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg"
                >
                  <img 
                    src={order.image} 
                    alt="Order item"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{order.id}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {order.date}
                      </span>
                      <span>{order.items} item{order.items > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Saved Addresses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Saved Addresses</CardTitle>
              <Link to="/dashboard/addresses">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAddresses.map((address) => (
                <div key={address.id} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{address.type}</span>
                    {address.isDefault && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {address.address}, {address.city}, {address.state} {address.zip}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Payment Methods</p>
                  <p className="text-xs text-muted-foreground">•••• 4242</p>
                </div>
              </div>
              <Link to="/dashboard/profile">
                <Button variant="outline" className="w-full mt-2">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

const UserDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="wishlist" element={<UserWishlist />} />
            <Route path="addresses" element={<UserAddresses />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
