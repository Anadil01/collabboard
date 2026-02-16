import { api } from "./api";

export const createListApi = (data, config = {}) => api.post("/lists", data, config);
export const updateListApi = (id, data, config = {}) => api.patch(`/lists/${id}`, data, config);
export const deleteListApi = (id, config = {}) => api.delete(`/lists/${id}`, config);
export const reorderListsApi = (data, config = {}) => api.patch("/lists/reorder", data, config);
