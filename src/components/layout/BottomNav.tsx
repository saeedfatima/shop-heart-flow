import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: ShoppingBag, label: 'Shop', path: '/shop' },
  { icon: ShoppingCart, label: 'Cart', path: '/cart' },
  { icon: User, label: 'Account', path: '/account' },
];

export function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();

  // Hide on dashboard/admin pages
  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')) {
    return null;
  }

  const getAccountPath = () => {
    if (!user) return '/auth';
    return user.role === 'admin' ? '/admin' : '/dashboard';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const path = item.label === 'Account' ? getAccountPath() : item.path;
          const isActive = location.pathname === path || 
            (item.label === 'Shop' && location.pathname.startsWith('/shop')) ||
            (item.label === 'Shop' && location.pathname.startsWith('/product'));

          return (
            <Link
              key={item.label}
              to={path}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label === 'Cart' && itemCount > 0 && (
                <span className="absolute -top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
