import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle,
  Home,
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
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingBag, label: 'My Orders', path: '/dashboard/orders' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
];

const bottomMenuItems = [
  { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
  { icon: HelpCircle, label: 'Help & Support', path: '/dashboard/help' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
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
      {/* Back to Shop */}
      <div className="p-3">
        <button
          onClick={() => handleNav('/')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            'bg-muted/50 hover:bg-muted',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              Back to Shop
            </span>
          )}
        </button>
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

export function UserSidebar() {
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
          <span className="font-semibold">My Account</span>
        </div>
        <div className="h-14" /> {/* Spacer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetTitle className="px-4 pt-4 pb-2 text-lg font-semibold">My Account</SheetTitle>
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
              <span className="font-semibold text-lg">My Account</span>
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
