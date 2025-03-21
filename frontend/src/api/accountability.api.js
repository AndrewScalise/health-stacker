import api from "./index";

// Get all accountability groups
export const getGroups = async () => {
  const response = await api.get("/accountability");
  return response.data;
};

// Get single group
export const getGroup = async (id) => {
  const response = await api.get(`/accountability/${id}`);
  return response.data;
};

// Create new group
export const createGroup = async (groupData) => {
  const response = await api.post("/accountability", groupData);
  return response.data;
};

// Update group
export const updateGroup = async (id, groupData) => {
  const response = await api.put(`/accountability/${id}`, groupData);
  return response.data;
};

// Delete group
export const deleteGroup = async (id) => {
  const response = await api.delete(`/accountability/${id}`);
  return response.data;
};

// Generate invite code
export const generateInvite = async (id) => {
  const response = await api.put(`/accountability/${id}/invite`);
  return response.data;
};

// Join group with code
export const joinGroup = async (code) => {
  const response = await api.post(`/accountability/join/${code}`);
  return response.data;
};

// Leave group
export const leaveGroup = async (id) => {
  const response = await api.put(`/accountability/${id}/leave`);
  return response.data;
};

// Add habit to group
export const addHabitToGroup = async (groupId, habitId) => {
  const response = await api.put(
    `/accountability/${groupId}/habits/${habitId}`
  );
  return response.data;
};

// Remove habit from group
export const removeHabitFromGroup = async (groupId, habitId) => {
  const response = await api.delete(
    `/accountability/${groupId}/habits/${habitId}`
  );
  return response.data;
};

// Get group messages
export const getGroupMessages = async (id) => {
  const response = await api.get(`/accountability/${id}/messages`);
  return response.data;
};

// Add message to group
export const addMessage = async (groupId, content) => {
  const response = await api.post(`/accountability/${groupId}/messages`, {
    content,
  });
  return response.data;
};
