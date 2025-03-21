import api from "./index";

// Get analytics overview
export const getAnalyticsOverview = async () => {
  const response = await api.get("/analytics/overview");
  return response.data;
};

// Get habit analytics
export const getHabitAnalytics = async (habitId) => {
  const response = await api.get(`/analytics/habits/${habitId}`);
  return response.data;
};

// Export user data (premium feature)
export const exportUserData = async () => {
  const response = await api.get("/analytics/export");
  return response.data;
};
