import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  date_of_birth?: string;
  tiktok?: string;
  whatsapp?: string;
  instagram?: string;
  created_at: string;
  email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await api.get<any>('/auth/user');
      if (data) {
        // PHP returns user object directly, or wrapped in {success, user}
        const userData = data.user || data;
        if (userData?.id) {
          setUser(userData);
        }
      }
    } catch {
      // Server not available - silently fail
      console.log('Backend server not available');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await refreshUser();
        } catch {
          // Server not available - clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await api.login(email, password);
      
      if (data?.success) {
        setUser(data.user);
        return { success: true, message: data.message, user: data.user };
      }
      
      // Check if it's a network error
      if (error === 'Network error' || error?.includes('Cannot connect')) {
        return { success: false, message: 'Cannot connect to server. Please ensure the PHP backend is running at your configured URL' };
      }
      
      return { success: false, message: error || 'Login failed' };
    } catch {
      return { success: false, message: 'Cannot connect to server. Please ensure the PHP backend is running.' };
    }
  };

  const signup = async (signupData: SignupData) => {
    try {
      const { data, error } = await api.register({
        email: signupData.email,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        password: signupData.password,
        passwordConfirm: signupData.passwordConfirm,
      });
      
      if (data?.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      }
      
      if (error === 'Network error' || error?.includes('Cannot connect')) {
        return { success: false, message: 'Cannot connect to server. Please ensure the PHP backend is running.' };
      }
      
      return { success: false, message: error || 'Signup failed' };
    } catch {
      return { success: false, message: 'Cannot connect to server. Please ensure the PHP backend is running.' };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const { data, error } = await api.put<any>(
      '/auth/update-profile',
      profileData
    );
    
    if (data) {
      // PHP may return {success, user} or {success, message}
      const userData = data.user || data;
      if (userData?.id) {
        setUser(userData);
      }
      return { success: true, message: data.message || 'Profile updated' };
    }
    
    return { success: false, message: error || 'Update failed' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
