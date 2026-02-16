import { api } from "./api";

export const createBoard = (payload, config = {}) => {
  const body = typeof payload === "string"
    ? { title: payload }
    : payload;
  return api.post("/boards", body, config);
};

export const getBoards = (params, config = {}) =>
  api.get("/boards", { ...config, params });

export const getBoardFull = (id, config = {}) =>
  api.get(`/boards/${id}/full`, config);

export const addBoardMember = (boardId, email, config = {}) =>
  api.post(`/boards/${boardId}/members`, { email }, config);

export const updateBoardMemberRole = (boardId, memberId, role, config = {}) =>
  api.patch(`/boards/${boardId}/members/${memberId}/role`, { role }, config);

export const removeBoardMember = (boardId, memberId, config = {}) =>
  api.delete(`/boards/${boardId}/members/${memberId}`, config);

export const leaveBoard = (boardId, config = {}) =>
  api.post(`/boards/${boardId}/leave`, {}, config);

export const transferBoardOwnership = (boardId, memberId, config = {}) =>
  api.patch(`/boards/${boardId}/owner`, { memberId }, config);

export const deleteBoard = (boardId, config = {}) =>
  api.delete(`/boards/${boardId}`, config);
