import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, getCurrentUser, LoginResponse, User as APIUser } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  skills?: string[];
  profilePhoto?: string;
  github?: string;
  linkedin?: string;
  leetcode?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert API user format to frontend User format
 */
const mapAPIUserToUser = (apiUser: APIUser | LoginResponse, token?: string): User => {
  return {
    id: apiUser._id,
    username: apiUser.username || apiUser.name || apiUser.email.split('@')[0],
    email: apiUser.email,
    bio: apiUser.bio,
    skills: apiUser.skills || [],
    profilePhoto: apiUser.avatar,
    github: apiUser.socialLinks?.github,
    linkedin: apiUser.socialLinks?.linkedin,
    role: apiUser.role,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verify token and load user on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('codevimarsh_token');
      const storedUser = localStorage.getItem('codevimarsh_user');
      
      if (storedToken) {
        setToken(storedToken);
        
        // Try to verify token and get current user
        const result = await getCurrentUser();
        if (result.success && result.user) {
          const mappedUser = mapAPIUserToUser(result.user);
          setUser(mappedUser);
          localStorage.setItem('codevimarsh_user', JSON.stringify(mappedUser));
        } else if (storedUser) {
          // Fallback to stored user if API call fails
          setUser(JSON.parse(storedUser));
        } else {
          // Token invalid, clear it
          localStorage.removeItem('codevimarsh_token');
          setToken(null);
        }
      } else if (storedUser) {
        // No token but user exists, clear it
        localStorage.removeItem('codevimarsh_user');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginUser({ email, password });
      
      if (result.success && result.data) {
        const mappedUser = mapAPIUserToUser(result.data, result.data.token);
        const userToken = result.data.token;
        
        setUser(mappedUser);
        setToken(userToken);
        localStorage.setItem('codevimarsh_token', userToken);
        localStorage.setItem('codevimarsh_user', JSON.stringify(mappedUser));
        
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

 const register = async (
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Register user - backend returns token in response
    const result = await registerUser({
      name: username,
      email,
      password,
    });

    if (result.success && result.user && result.token) {
      // Use token from register response - NO separate login call
      const userToken = result.token;
      const mappedUser = mapAPIUserToUser(result.user, userToken);

      setUser(mappedUser);
      setToken(userToken);

      localStorage.setItem('codevimarsh_token', userToken);
      localStorage.setItem('codevimarsh_user', JSON.stringify(mappedUser));

      return { success: true };
    }

    return { success: false, error: result.error || 'Registration failed' };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || 'Registration failed',
    };
  }
};


  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('codevimarsh_token');
    localStorage.removeItem('codevimarsh_user');
  };

  /**
   * Update user data locally (for optimistic updates)
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('codevimarsh_user', JSON.stringify(updatedUser));
    }
  };

  /**
   * Refresh user data from API
   */
  const refreshUser = async (): Promise<void> => {
    const result = await getCurrentUser();
    if (result.success && result.user) {
      const mappedUser = mapAPIUserToUser(result.user);
      setUser(mappedUser);
      localStorage.setItem('codevimarsh_user', JSON.stringify(mappedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
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
