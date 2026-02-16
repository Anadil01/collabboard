import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar from "../common/Avatar";
import { deleteBoard } from "../../services/boards.api";
import { useUIStore } from "../../store/ui.store";
import { useAuthStore } from "../../store/auth.store";
import ConfirmDialog from "../common/ConfirmDialog";

const gradients = [
  "from-blue-400 to-[#2b8cee]",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-indigo-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-slate-400 to-slate-600"
];

export default function BoardCard({
  board,
  index = 0,
  isFavorite = false,
  onToggleFavorite
}) {
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const boardId = String(board?._id || board?.id || "");
  const members = board.members || [];
  const visibleMembers = members.slice(0, 3);
  const extra = Math.max(0, members.length - visibleMembers.length);
  const pushToast = useUIStore((s) => s.pushToast);
  const currentUser = useAuthStore((s) => s.user);
  const meId = String(currentUser?.id || currentUser?._id || "");
  const createdBy = String(board?.createdBy || board?.owner || "");
  const memberRoles = board?.memberRoles || {};
  const role = meId === createdBy ? "owner" : (memberRoles[meId] || "member");
  const canDeleteBoard = role === "owner" || role === "admin";
  const summary = (board?.description || "").trim()
    || `${members.length || 1} member${(members.length || 1) === 1 ? "" : "s"} collaborating on this board.`;
  const removeBoardFromCache = () => {
    qc.setQueriesData({ queryKey: ["boards"] }, (old) => {
      if (!old || !Array.isArray(old.boards)) return old;
      const nextBoards = old.boards.filter((item) => String(item?._id || item?.id) !== boardId);
      const removed = nextBoards.length !== old.boards.length;
      return {
        ...old,
        boards: nextBoards,
        total: typeof old.total === "number" && removed ? Math.max(0, old.total - 1) : old.total
      };
    });
  };
  const deleteMut = useMutation({
    mutationFn: () => deleteBoard(boardId, { skipErrorToast: true }),
    onSuccess: () => {
      removeBoardFromCache();
      qc.invalidateQueries({ queryKey: ["boards"] });
      pushToast({ type: "success", message: `Board "${board.title}" deleted.` });
    },
    onError: (err) => {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      const isHtmlResponse = typeof responseData === "string" && responseData.includes("<!DOCTYPE");
      const requestBase = err?.config?.baseURL || "";
      const requestPath = err?.config?.url || "";
      const requestUrl = `${requestBase}${requestPath}`;

      console.error("Delete board error:", err?.response?.status, err?.response?.data || err?.message);
      const notFoundByApi = status === 404
        && typeof responseData === "object"
        && /not found/i.test(String(responseData?.message || ""));

      if (notFoundByApi) {
        removeBoardFromCache();
        qc.invalidateQueries({ queryKey: ["boards"] });
        pushToast({ type: "success", message: "Board already removed. Refreshed board list." });
        return;
      }

      if (status === 404 && isHtmlResponse) {
        pushToast({
          type: "error",
          message: `Delete endpoint not found at ${requestUrl}. Restart backend and ensure latest server code is running.`
        });
        return;
      }
      pushToast({
        type: "error",
        message:
          err?.response?.data?.message
          || `Failed to delete board (${status || "network"}) [id: ${boardId || "missing"}] [url: ${requestUrl || "unknown"}]`
      });
    }
  });

  const onDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!boardId) {
      pushToast({ type: "error", message: "Board id missing. Please refresh and try again." });
      return;
    }
    if (!canDeleteBoard) {
      pushToast({ type: "error", message: "Only owner/admin can delete this board." });
      return;
    }
    setConfirmOpen(true);
  };

  const onFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite();
  };

  return (
    <>
      <Link
        to={boardId ? `/board/${boardId}` : "/dashboard"}
        className="group overflow-hidden rounded-xl border border-slate-300/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(9,30,66,0.18)]"
      >
        <div className={`relative h-20 bg-gradient-to-r ${gradients[index % gradients.length]}`}>
          <button
            type="button"
            className="absolute right-2 top-2 rounded-md bg-black/10 p-1.5 text-white transition-colors hover:bg-black/20"
            onClick={(e) => e.preventDefault()}
          >
            ⋯
          </button>
          {canDeleteBoard ? (
            <button
              type="button"
              className="absolute left-2 top-2 rounded-md bg-black/10 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-600"
              onClick={onDelete}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "..." : "Delete"}
            </button>
          ) : null}
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[15px] font-semibold text-slate-800 transition-colors group-hover:text-[#2b8cee]">
              {board.title}
            </h3>
            <button
              type="button"
              onClick={onFavorite}
              className={`rounded p-1 text-sm ${isFavorite ? "text-amber-500" : "text-slate-300 hover:text-amber-500"}`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          </div>

          <p className="mb-5 line-clamp-2 text-xs text-slate-500">{summary}</p>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {visibleMembers.map((member, idx) => (
                <div key={member._id || `${member}-${idx}`} className="rounded-full border-2 border-white bg-white">
                  <Avatar name={member?.name || "AR"} className="h-7 w-7 text-[10px]" />
                </div>
              ))}
              {extra > 0 ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500">
                  +{extra}
                </div>
              ) : null}
            </div>

            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <span>◷</span>
              Updated {new Date(board.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Board"
        message={`Delete board "${board.title}"? This cannot be undone.`}
        confirmText="Delete"
        danger
        loading={deleteMut.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteMut.mutate(undefined, {
            onSettled: () => setConfirmOpen(false)
          });
        }}
      />
    </>
  );
}
