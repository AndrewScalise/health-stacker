import api from "./index";

// Register new user
export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Logout user
export const logout = async () => {
  const response = await api.get("/auth/logout");
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Update user details
export const updateUserDetails = async (userData) => {
  const response = await api.put("/auth/update-details", userData);
  return response.data;
};

// Update user password
export const updatePassword = async (passwordData) => {
  const response = await api.put("/auth/update-password", passwordData);
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token, password) => {
  const response = await api.put(`/auth/reset-password/${token}`, { password });
  return response.data;
};

// Verify email
export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
};
