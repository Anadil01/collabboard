import { api } from "./api";

export const createTaskApi = (data, config = {}) => api.post("/tasks", data, config);
export const getTaskApi = (id, config = {}) => api.get(`/tasks/${id}`, config);
export const updateTaskApi = (id, data, config = {}) => api.patch(`/tasks/${id}`, data, config);
export const deleteTaskApi = (id, config = {}) => api.delete(`/tasks/${id}`, config);
export const moveTaskApi = (payload, config = {}) => api.post("/tasks/move", payload, config);
export const getTasksApi = (params, config = {}) => api.get("/tasks", { ...config, params });
