import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "sonner";
import * as authApi from "@/api/auth.api";
import {
  setToken,
  removeToken,
  setUser,
  removeUser,
  getToken,
  getUser,
} from "@/utils/auth";

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (token) {
        try {
          // Fetch current user data
          const response = await authApi.getCurrentUser();
          const userData = response.data;

          // Update state
          setCurrentUser(userData);
          setIsAuthenticated(true);
          setIsPremium(userData.subscriptionStatus === "premium");

          // Update stored user data
          setUser(userData);
        } catch (error) {
          console.error("Failed to get current user:", error);
          // Token might be invalid, clear auth state
          removeToken();
          removeUser();
          setIsAuthenticated(false);
          setIsPremium(false);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Register new user
  const register = async (userData) => {
    const response = await authApi.register(userData);

    // Most implementations won't auto-login after register (due to email verification)
    return response;
  };

  // Login user
  const login = async (email, password) => {
    const response = await authApi.login({ email, password });

    const { token, user: userData } = response;

    // Store auth data
    setToken(token);
    setUser(userData);

    // Update state
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setIsPremium(userData.subscriptionStatus === "premium");

    return response;
  };

  // Logout user
  const logout = async () => {
    try {
      // Call logout API (if backend needs to invalidate token)
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth state regardless of API success
      removeToken();
      removeUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsPremium(false);
      toast.success("Logged out successfully");
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    const response = await authApi.updateUserDetails(userData);

    const updatedUser = response.data;

    // Update stored user data and state
    setUser(updatedUser);
    setCurrentUser(updatedUser);

    return response;
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isPremium,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
