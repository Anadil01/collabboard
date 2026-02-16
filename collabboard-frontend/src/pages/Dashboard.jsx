import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBoards } from "../hooks/useBoards";
import useDebounce from "../hooks/useDebounce";
import { useBoardStore } from "../store/board.store";
import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";
import BoardCard from "../components/boards/BoardCard";
import CreateBoardModal from "../components/boards/CreateBoardModal";
import Button from "../components/common/Button";
import { PAGE_SIZE } from "../utils/constants";

function formatRelativeTime(isoString) {
  const time = new Date(isoString).getTime();
  if (!Number.isFinite(time)) return "just now";
  const diffMs = Date.now() - time;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const page = useBoardStore((s) => s.page);
  const setPage = useBoardStore((s) => s.setPage);
  const search = useBoardStore((s) => s.search);
  const setSearch = useBoardStore((s) => s.setSearch);
  const view = useBoardStore((s) => s.view);
  const setView = useBoardStore((s) => s.setView);
  const sort = useBoardStore((s) => s.sort);
  const setSort = useBoardStore((s) => s.setSort);
  const boardLayout = useBoardStore((s) => s.boardLayout);
  const setBoardLayout = useBoardStore((s) => s.setBoardLayout);
  const favorites = useBoardStore((s) => s.favorites);
  const toggleFavorite = useBoardStore((s) => s.toggleFavorite);
  const currentUser = useAuthStore((s) => s.user);
  const pushToast = useUIStore((s) => s.pushToast);
  const debouncedSearch = useDebounce(search, 350);
  const [createOpen, setCreateOpen] = useState(false);
  const [manageBoardId, setManageBoardId] = useState("");

  const { data, isLoading } = useBoards(page, debouncedSearch);
  const allBoards = useMemo(() => data?.boards || [], [data?.boards]);
  const meId = String(currentUser?.id || currentUser?._id || "");

  const recentIds = allBoards
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)
    .map((b) => String(b._id));

  const viewBoards = allBoards.filter((board) => {
    if (view === "favorites") return favorites.includes(String(board._id));
    if (view === "recent") return recentIds.includes(String(board._id));
    return true;
  });

  const boards = [...viewBoards].sort((a, b) => {
    if (sort === "name_asc") return (a.title || "").localeCompare(b.title || "");
    if (sort === "name_desc") return (b.title || "").localeCompare(a.title || "");
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / PAGE_SIZE));
  const totalMembers = boards.reduce((sum, b) => sum + (b.members?.length || 0), 0);
  const avgMembers = boards.length ? (totalMembers / boards.length).toFixed(1) : "0.0";

  const manageableBoards = useMemo(() => {
    return allBoards.filter((board) => {
      const ownerId = String(board?.createdBy || board?.owner || "");
      if (ownerId && ownerId === meId) return true;
      const memberRoles = board?.memberRoles || {};
      const role = memberRoles[meId];
      return role === "admin";
    });
  }, [allBoards, meId]);

  const selectedManageBoardId = useMemo(() => {
    if (!manageableBoards.length) return "";
    const preferred = String(manageBoardId || "");
    if (preferred && manageableBoards.some((board) => String(board._id) === preferred)) {
      return preferred;
    }
    return String(manageableBoards[0]._id);
  }, [manageBoardId, manageableBoards]);

  const recentInvites = useMemo(() => {
    if (!meId || !selectedManageBoardId) return [];
    const key = `recentBoardInvites:${meId}`;
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      items = [];
    }
    return items
      .filter((item) => String(item?.boardId) === String(selectedManageBoardId))
      .slice(0, 5);
  }, [meId, selectedManageBoardId]);

  useEffect(() => {
    if (!meId || !allBoards.length) return;
    const key = `seenMemberBoards:${meId}`;
    let seen = [];
    try {
      seen = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      seen = [];
    }

    const newlyJoined = allBoards.filter((board) => {
      const boardId = String(board?._id || board?.id || "");
      if (!boardId) return false;
      const ownerId = String(board?.createdBy || board?.owner || "");
      if (ownerId === meId) return false;
      return !seen.includes(boardId);
    });

    if (newlyJoined.length) {
      const boardNames = newlyJoined
        .slice(0, 2)
        .map((board) => board.title)
        .filter(Boolean)
        .join(", ");
      const extra = newlyJoined.length > 2 ? ` +${newlyJoined.length - 2} more` : "";
      pushToast({
        type: "success",
        message: `You were added to: ${boardNames}${extra}`
      });
    }

    const mergedSeen = Array.from(
      new Set([
        ...seen,
        ...allBoards.map((board) => String(board?._id || board?.id || "")).filter(Boolean)
      ])
    );
    localStorage.setItem(key, JSON.stringify(mergedSeen));
  }, [allBoards, meId, pushToast]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Your boards</h1>
          <p className="text-sm text-slate-500">Pick up where you left off and organize your workspace</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Boards</p>
            <p className="text-sm font-semibold text-slate-800">{data?.total || 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Favorites</p>
            <p className="text-sm font-semibold text-slate-800">{favorites.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Avg. members</p>
            <p className="text-sm font-semibold text-slate-800">{avgMembers}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex w-full flex-1 flex-col gap-3 md:max-w-2xl">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
              placeholder="Search boards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setView("all")} className={`rounded-full px-3 py-1 text-xs font-semibold ${view === "all" ? "bg-[#2b8cee] text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>All</button>
            <button type="button" onClick={() => setView("recent")} className={`rounded-full px-3 py-1 text-xs font-semibold ${view === "recent" ? "bg-[#2b8cee] text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>Recent</button>
            <button type="button" onClick={() => setView("favorites")} className={`rounded-full px-3 py-1 text-xs font-semibold ${view === "favorites" ? "bg-[#2b8cee] text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>Favorites</button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
            >
              <option value="updated_desc">Recently updated</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </select>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setBoardLayout("grid")}
                className={`rounded px-2 py-1 text-xs font-semibold ${boardLayout === "grid" ? "bg-[#2b8cee] text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setBoardLayout("list")}
                className={`rounded px-2 py-1 text-xs font-semibold ${boardLayout === "list" ? "bg-[#2b8cee] text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <span>＋</span>
            <span>Create Board</span>
          </Button>
        </div>
      </div>

      {manageableBoards.length ? (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Members management</h2>
            <p className="text-xs text-slate-500">Open a board member panel to invite, change roles, or remove users.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedManageBoardId}
              onChange={(e) => setManageBoardId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20 sm:max-w-sm"
            >
              {manageableBoards.map((board) => (
                <option key={board._id} value={board._id}>
                  {board.title}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={() => {
                if (!selectedManageBoardId) return;
                navigate(`/board/${selectedManageBoardId}?panel=members`);
              }}
            >
              Manage Members
            </Button>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Recently Invited</p>
            {recentInvites.length ? (
              <div className="space-y-1.5">
                {recentInvites.map((invite, idx) => (
                  <div key={`${invite.email}-${invite.invitedAt}-${idx}`} className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-xs">
                    <span className="truncate text-slate-700">{invite.email}</span>
                    <span className="ml-2 shrink-0 text-slate-500">{formatRelativeTime(invite.invitedAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No recent invites for this board yet.</p>
            )}
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading boards...</p>
      ) : boardLayout === "list" ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-6">Board</div>
            <div className="col-span-2">Members</div>
            <div className="col-span-3">Updated</div>
            <div className="col-span-1 text-right">Open</div>
          </div>
          {boards.map((b) => (
            <div key={b._id} className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
              <div className="col-span-6">
                <button
                  type="button"
                  onClick={() => toggleFavorite(b._id)}
                  className={`mr-2 ${favorites.includes(String(b._id)) ? "text-amber-500" : "text-slate-300 hover:text-amber-500"}`}
                  title="Toggle favorite"
                >
                  {favorites.includes(String(b._id)) ? "★" : "☆"}
                </button>
                <span className="font-medium text-slate-800">{b.title}</span>
              </div>
              <div className="col-span-2 text-slate-600">{b.members?.length || 0}</div>
              <div className="col-span-3 text-slate-500">{new Date(b.updatedAt).toLocaleString()}</div>
              <div className="col-span-1 text-right">
                <Link to={`/board/${b._id}`} className="text-[#2b8cee] hover:underline">Open</Link>
              </div>
            </div>
          ))}
          {boards.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">No boards found for current filters.</div>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="group flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 transition-colors hover:border-[#2b8cee]/50 hover:bg-[#2b8cee]/5"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-[#2b8cee] group-hover:text-white">
              ＋
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-[#2b8cee]">Add your first board</span>
          </button>

          {boards.map((b, i) => (
            <BoardCard
              key={b._id}
              board={b}
              index={i}
              isFavorite={favorites.includes(String(b._id))}
              onToggleFavorite={() => toggleFavorite(b._id)}
            />
          ))}
        </div>
      )}

      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
        <span className="text-sm text-slate-500">
          Showing {boards.length} boards in current view out of {data?.total || 0} total
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors enabled:hover:bg-slate-50 disabled:opacity-40"
          >
            ‹
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b8cee] text-sm font-bold text-white"
          >
            {page}
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors enabled:hover:bg-slate-50 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>

      <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Link to="/help" className="fixed bottom-6 right-6 z-50 rounded-full bg-[#2b8cee] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2b8cee]/25 transition hover:bg-[#1f7cda]">
        Help
      </Link>
    </div>
  );
}
