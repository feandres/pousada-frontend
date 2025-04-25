import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { getAuthStatus, logout } from '../utils/api';
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { isAuthenticated, user } = await getAuthStatus();
        setIsAuthenticated(isAuthenticated);
        setUser(user);
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = (user: User) => {
    setIsAuthenticated(true);
    setUser(user);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login', { replace: true });
      toast('Logged out successfully' );
    } catch (error) {
      console.error('Logout failed:', error);
      toast('Failed to log out' );
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout: handleLogout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};