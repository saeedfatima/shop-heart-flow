import { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setIsConnected(response.ok);
    } catch {
      setIsConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Reset dismissed state when connection status changes
  useEffect(() => {
    if (isConnected) {
      setDismissed(false);
    }
  }, [isConnected]);

  // Don't show anything while initial check is in progress
  if (checking && isConnected === null) return null;
  
  // Don't show if connected or dismissed
  if (isConnected || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-2 flex items-center justify-center gap-3 text-sm",
        "bg-destructive text-destructive-foreground"
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>
        Backend server unavailable. Please ensure Django is running on localhost:8000
      </span>
      <button
        onClick={() => checkConnection()}
        className="ml-2 underline hover:no-underline"
      >
        Retry
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 p-1 hover:bg-destructive-foreground/10 rounded"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ConnectionStatus;
