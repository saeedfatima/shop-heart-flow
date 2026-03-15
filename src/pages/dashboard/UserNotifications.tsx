import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data until Backend API is ready
const mockNotifications = [
  {
    id: 1,
    title: "Order Shipped",
    message: "Your order #ORD-2024-001 has been shipped and is on its way to you.",
    type: "success",
    date: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "Support Ticket Updated",
    message: "An admin has responded to your ticket #TKT-001. Please check the Help & Support page.",
    type: "info",
    date: "1 day ago",
    read: true,
  },
  {
    id: 3,
    title: "Payment Failed",
    message: "Your recent payment for order #ORD-2024-002 was declined. Please update your payment method.",
    type: "error",
    date: "2 days ago",
    read: true,
  },
  {
    id: 4,
    title: "Flash Sale Starts Tomorrow!",
    message: "Get up to 50% off on selected items starting tomorrow at 10 AM.",
    type: "warning",
    date: "3 days ago",
    read: true,
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const UserNotifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Stay updated with your orders and account activity</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you when something interesting happens</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-colors ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}
            >
              <CardContent className="p-4 sm:p-6 flex gap-4">
                <div className="shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className={`text-base font-semibold ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {notification.date}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                    {notification.message}
                  </p>
                  
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 h-8 text-xs px-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default UserNotifications;
