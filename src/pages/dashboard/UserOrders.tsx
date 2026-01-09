import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Eye, Calendar, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatNaira } from "@/lib/currency";

const mockOrders = [
  { 
    id: "ORD-2024-001", 
    date: "Jan 15, 2024", 
    total: 299.99, 
    status: "delivered",
    items: [
      { name: "Classic White Tee", quantity: 2, price: 29.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop" },
      { name: "Denim Jacket", quantity: 1, price: 89.99, image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=100&h=100&fit=crop" },
    ],
    tracking: "1Z999AA10123456784"
  },
  { 
    id: "ORD-2024-002", 
    date: "Jan 10, 2024", 
    total: 159.50, 
    status: "shipped",
    items: [
      { name: "Summer Dress", quantity: 1, price: 59.99, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100&h=100&fit=crop" },
      { name: "Leather Belt", quantity: 1, price: 39.99, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop" },
    ],
    tracking: "1Z999AA10123456785"
  },
  { 
    id: "ORD-2024-003", 
    date: "Jan 5, 2024", 
    total: 89.99, 
    status: "processing",
    items: [
      { name: "Canvas Sneakers", quantity: 1, price: 69.99, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100&h=100&fit=crop" },
    ],
    tracking: null
  },
  { 
    id: "ORD-2024-004", 
    date: "Dec 28, 2023", 
    total: 249.99, 
    status: "delivered",
    items: [
      { name: "Cashmere Sweater", quantity: 1, price: 129.99, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop" },
      { name: "Silk Scarf", quantity: 2, price: 59.99, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=100&h=100&fit=crop" },
    ],
    tracking: "1Z999AA10123456786"
  },
  { 
    id: "ORD-2024-005", 
    date: "Dec 20, 2023", 
    total: 189.99, 
    status: "cancelled",
    items: [
      { name: "Leather Boots", quantity: 1, price: 189.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" },
    ],
    tracking: null
  },
];

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
    case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

const UserOrders = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">View and track all your orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-secondary/30 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle className="text-base">{order.id}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {order.date}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                  <span className="font-semibold">{formatNaira(order.total)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatNaira(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t">
                {order.tracking && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tracking: </span>
                    <span className="font-mono">{order.tracking}</span>
                  </div>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Buy Again
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default UserOrders;
