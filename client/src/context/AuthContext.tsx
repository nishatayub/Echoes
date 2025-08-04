import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore, User } from '../stores/authStore';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, token, setUser, setToken, setLoading, clearAuth, loading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // If user exists but no token, clear inconsistent state
      if (user && !token) {
        console.warn('Inconsistent auth state detected: user exists but no token. Clearing auth.');
        clearAuth();
        setLoading(false);
        return;
      }
      
      // If token exists but no user, try to fetch user
      if (token && !user) {
        let retries = 3;
        let delay = 1000; // Start with 1 second delay
        
        while (retries > 0) {
          try {
            console.log(`Attempting to validate token... (${4 - retries}/3)`);
            const currentUser = await authAPI.getUser();
            setUser(currentUser);
            console.log('Token validation successful');
            break;
          } catch (error) {
            console.warn(`Token validation attempt ${4 - retries} failed:`, error);
            retries--;
            
            if (retries === 0) {
              // All retries failed, token is likely invalid
              console.warn('All token validation attempts failed. Clearing auth.');
              clearAuth();
            } else {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
            }
          }
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, [token, user, setUser, clearAuth, setLoading]);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authAPI.register(email, password, name);
    
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    clearAuth();
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
