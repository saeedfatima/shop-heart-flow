import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tag,
  MessageSquare,
  Bell,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
];

const bottomMenuItems = [
  { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    const content = (
      <button
        onClick={() => navigate(item.path)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-accent/50',
          active && 'bg-primary text-primary-foreground hover:bg-primary/90',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-card border-r border-border flex flex-col shrink-0"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Store className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Admin Panel</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 space-y-1">
        <Separator className="mb-3" />
        {bottomMenuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            'text-destructive hover:bg-destructive/10',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User Profile */}
        <Separator className="my-3" />
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-muted/50',
            isCollapsed && 'justify-center p-2'
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
