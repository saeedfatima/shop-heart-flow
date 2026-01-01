import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for testing
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+1 234 567 890',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    phone: '+1 987 654 321',
    createdAt: '2024-06-20',
  },
];

// Mock credentials (password for all: "password123")
const mockCredentials: Record<string, string> = {
  'admin@example.com': 'password123',
  'user@example.com': 'password123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mockAuthUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedEmail = email.toLowerCase();
    
    // Check credentials
    if (mockCredentials[normalizedEmail] === password) {
      const foundUser = mockUsers.find(u => u.email === normalizedEmail);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('mockAuthUser', JSON.stringify(foundUser));
        return { success: true, message: 'Login successful!' };
      }
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; message: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedEmail = data.email.toLowerCase();

    // Check if user already exists
    if (mockCredentials[normalizedEmail]) {
      return { success: false, message: 'An account with this email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: normalizedEmail,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Add to mock data
    mockUsers.push(newUser);
    mockCredentials[normalizedEmail] = data.password;

    // Auto login
    setUser(newUser);
    localStorage.setItem('mockAuthUser', JSON.stringify(newUser));

    return { success: true, message: 'Account created successfully!' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockAuthUser');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('mockAuthUser', JSON.stringify(updatedUser));
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
