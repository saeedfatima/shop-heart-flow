import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { formatNaira } from "@/lib/currency";
import { orderService, addressService, wishlistService, Order, Address, WishlistItem } from "@/lib/apiServices";
import { 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  ShoppingBag,
  ChevronRight,
  Calendar,
  CreditCard,
  Loader2
} from "lucide-react";

// Import sub-pages
import UserOrders from "@/pages/dashboard/UserOrders";
import UserWishlist from "@/pages/dashboard/UserWishlist";
import UserAddresses from "@/pages/dashboard/UserAddresses";
import UserProfile from "@/pages/dashboard/UserProfile";
import UserPayments from "@/pages/dashboard/UserPayments";
import UserSettings from "@/pages/dashboard/UserSettings";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost';

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
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, addressesData, wishlistData] = await Promise.all([
          orderService.getAll(),
          addressService.getAll(),
          wishlistService.getAll(),
        ]);
        setRecentOrders(ordersData.slice(0, 3));
        setAddresses(addressesData.slice(0, 2));
        setWishlistCount(wishlistData.length);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
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
            <AvatarImage src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`) : undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-muted-foreground">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
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
                <p className="text-sm text-muted-foreground">
                  {loading ? '...' : `${wishlistCount} items`}
                </p>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2" />
                  <p>No orders yet. Start shopping!</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span>{order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNaira(order.total)}</p>
                    </div>
                  </div>
                ))
              )}
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
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{address.label}</span>
                      {address.is_default && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {address.street_address}, {address.city}, {address.state} {address.postal_code}
                    </p>
                  </div>
                ))
              )}
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
                  <p className="text-xs text-muted-foreground">Manage your cards</p>
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
