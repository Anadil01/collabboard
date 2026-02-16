import { api } from "./api";

export const getActivities = (boardId, page = 1, limit = 20) =>
  api.get("/activities", {
    params: { boardId, page, limit }
  });

export const clearActivities = (boardId, config = {}) =>
  api.delete("/activities", {
    ...config,
    params: { boardId }
  });
