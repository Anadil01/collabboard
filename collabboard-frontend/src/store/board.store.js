import { create } from "zustand";

const getFavoriteBoards = () => {
  try {
    return JSON.parse(localStorage.getItem("favoriteBoards") || "[]");
  } catch {
    return [];
  }
};

export const useBoardStore = create((set) => ({
  search: "",
  page: 1,
  view: "all",
  sort: "updated_desc",
  boardLayout: "grid",
  favorites: getFavoriteBoards(),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setView: (view) => set({ view, page: 1 }),
  setSort: (sort) => set({ sort }),
  setBoardLayout: (boardLayout) => set({ boardLayout }),
  toggleFavorite: (boardId) =>
    set((state) => {
      const id = String(boardId);
      const setFav = new Set((state.favorites || []).map(String));
      if (setFav.has(id)) setFav.delete(id);
      else setFav.add(id);
      const next = Array.from(setFav);
      localStorage.setItem("favoriteBoards", JSON.stringify(next));
      return { favorites: next };
    })
}));
