import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LoginRequest, LoginResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string; role: string } | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
  tokenExpiration: number | null;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiration, setTokenExpiration] = useState<number | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('tokenExp');
    setIsAuthenticated(false);
    setUser(null);
    setTokenExpiration(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await apiService.refreshToken();
      const expirationTime = Date.now() + response.expiresIn;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('tokenExp', expirationTime.toString());
      setTokenExpiration(expirationTime);
    } catch (error) {
      console.error('Falha ao renovar token:', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    const storedExp = localStorage.getItem('tokenExp');

    if (token) {
      setIsAuthenticated(true);
      setUser({ username: storedUsername || 'Admin', role: 'ADMIN' });
      if (storedExp) {
        setTokenExpiration(parseInt(storedExp));
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response: LoginResponse = await apiService.login(credentials);
      const expirationTime = Date.now() + response.expiresIn;
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('username', credentials.username);
      localStorage.setItem('tokenExp', expirationTime.toString());
      
      setIsAuthenticated(true);
      setUser({ username: credentials.username, role: 'ADMIN' });
      setTokenExpiration(expirationTime);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    tokenExpiration,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
