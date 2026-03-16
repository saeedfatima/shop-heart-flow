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
  Activity,
  Megaphone,
  Store,
  MessageSquare,
  Menu,
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: MessageSquare, label: 'Tickets', path: '/admin/tickets'},
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Activity, label: 'Audit', path: '/admin/audit' },
];

const bottomMenuItems = [
  { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

function SidebarContent({ isCollapsed, onNavigate }: { isCollapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    const content = (
      <button
        onClick={() => handleNav(item.path)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-accent/50',
          active && 'bg-primary text-primary-foreground hover:bg-primary/90',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
            {item.label}
          </span>
        )}
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
    <>
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
        
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            'text-destructive hover:bg-destructive/10',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              Logout
            </span>
          )}
        </button>

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
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Store className="h-5 w-5 text-primary" />
          <span className="font-semibold">Admin Panel</span>
        </div>
        <div className="h-14" /> {/* Spacer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetTitle className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Admin Panel
            </SheetTitle>
            <SidebarContent isCollapsed={false} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: classic sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-card border-r border-border flex flex-col shrink-0"
    >
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
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <SidebarContent isCollapsed={isCollapsed} />
    </motion.aside>
  );
}
