import api from "./index";

// Get subscription details
export const getSubscription = async () => {
  const response = await api.get("/subscription");
  return response.data;
};

// Create subscription
export const createSubscription = async (subscriptionData) => {
  const response = await api.post("/subscription", subscriptionData);
  return response.data;
};

// Update subscription
export const updateSubscription = async (planData) => {
  const response = await api.put("/subscription", planData);
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async () => {
  const response = await api.delete("/subscription");
  return response.data;
};

// Check premium access
export const checkPremiumAccess = async () => {
  const response = await api.get("/subscription/check-access");
  return response.data;
};
