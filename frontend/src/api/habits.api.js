import api from "./index";

// Get all habits
export const getHabits = async () => {
  const response = await api.get("/habits");
  return response.data;
};

// Get single habit
export const getHabit = async (id) => {
  const response = await api.get(`/habits/${id}`);
  return response.data;
};

// Create new habit
export const createHabit = async (habitData) => {
  const response = await api.post("/habits", habitData);
  return response.data;
};

// Update habit
export const updateHabit = async (id, habitData) => {
  const response = await api.put(`/habits/${id}`, habitData);
  return response.data;
};

// Delete habit
export const deleteHabit = async (id) => {
  const response = await api.delete(`/habits/${id}`);
  return response.data;
};

// Archive habit
export const archiveHabit = async (id) => {
  const response = await api.put(`/habits/${id}/archive`);
  return response.data;
};

// Unarchive habit
export const unarchiveHabit = async (id) => {
  const response = await api.put(`/habits/${id}/unarchive`);
  return response.data;
};

// Get habit check-ins
export const getHabitCheckins = async (id) => {
  const response = await api.get(`/habits/${id}/checkins`);
  return response.data;
};

// Create habit check-in
export const createCheckin = async (habitId, checkinData) => {
  const response = await api.post(`/habits/${habitId}/checkins`, checkinData);
  return response.data;
};

// Delete check-in
export const deleteCheckin = async (id) => {
  const response = await api.delete(`/checkins/${id}`);
  return response.data;
};
