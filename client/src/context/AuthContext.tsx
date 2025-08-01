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
      if (token && !user) {
        try {
          const currentUser = await authAPI.getUser();
          setUser(currentUser);
        } catch {
          // Token is invalid, clear storage
          clearAuth();
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
