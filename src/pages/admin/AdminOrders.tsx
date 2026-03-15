import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Eye, Edit, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { formatNaira } from "@/lib/currency";
import { adminService, Order } from "@/lib/apiServices";
import { toast } from "@/hooks/use-toast";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered": return <CheckCircle className="h-4 w-4" />;
    case "shipped": return <Truck className="h-4 w-4" />;
    case "processing": return <Clock className="h-4 w-4" />;
    case "cancelled": return <XCircle className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "pending": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-800";
  }
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      const { data, error } = await adminService.updateOrderStatus(orderId, newStatus);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from orders
  const orderStats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const OrderDetailsDialog = ({ order }: { order: Order }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Order Details - {order.order_number}</DialogTitle>
        <DialogDescription>
          Placed on {new Date(order.created_at).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium mb-1">Status</h4>
            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
              {getStatusIcon(order.status)}
              {order.status}
            </Badge>
          </div>
          <div className="text-right">
            <h4 className="font-medium mb-1">Total Amount</h4>
            <p className="font-bold text-lg">{formatNaira(order.total)}</p>
          </div>
        </div>

        {order.shipping_address && (
           <div>
            <h4 className="font-medium mb-2 border-b pb-2">Shipping Information</h4>
            <p className="text-sm font-medium">{order.shipping_address.recipient_name}</p>
            <p className="text-sm text-muted-foreground">
              {order.shipping_address.street_address}<br />
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
              {order.shipping_address.phone}
            </p>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2 border-b pb-2">Order Items</h4>
          <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex gap-3 items-center">
                   {item.product.image && (
                     <img 
                       src={item.product.image.startsWith('http') ? item.product.image : `http://localhost/api${item.product.image}`} 
                       alt={item.product.name}
                       className="w-10 h-10 object-cover rounded" 
                     />
                   )}
                   <div>
                     <p className="font-medium">{item.product.name}</p>
                     <p className="text-xs text-muted-foreground">
                       {item.quantity} x {formatNaira(item.price)}
                       {item.color ? ` • ${item.color}` : ''}
                       {item.size ? ` • ${item.size}` : ''}
                     </p>
                   </div>
                </div>
                <p className="font-medium">{formatNaira(item.quantity * item.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders Management</h1>
        <p className="text-muted-foreground">View and manage all customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : orderStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : orderStats.processing}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : orderStats.shipped}</p>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : orderStats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Manage and update order statuses</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>{formatNaira(order.total)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => handleStatusUpdate(order.id, value as Order['status'])}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            {updatingOrderId === order.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <OrderDetailsDialog order={order} />
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminOrders;
