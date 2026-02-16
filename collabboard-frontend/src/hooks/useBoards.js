import { useQuery } from "@tanstack/react-query";
import { getBoardFull, getBoards } from "../services/boards.api";

const objectIdRegex = /^[a-f\d]{24}$/i;

const normalizeBoard = (board) => {
  const rawId = board?._id ?? board?.id;
  const normalizedId = rawId ? String(rawId) : "";
  const isValid = objectIdRegex.test(normalizedId);

  return {
    ...board,
    _id: isValid ? normalizedId : ""
  };
};

export const useBoards = (page, search) =>
  useQuery({
    queryKey: ["boards", page, search],
    queryFn: () =>
      getBoards({ page, search }).then((r) => {
        const data = r.data || {};
        const boards = Array.isArray(data.boards) ? data.boards.map(normalizeBoard) : [];
        return { ...data, boards };
      })
  });

export const useBoard = (id) =>
  useQuery({
    queryKey: ["board", id],
    queryFn: () => getBoardFull(id).then((r) => r.data),
    enabled: Boolean(id)
  });
