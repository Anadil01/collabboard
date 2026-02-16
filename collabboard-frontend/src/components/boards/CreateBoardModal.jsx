import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBoardMember, createBoard } from "../../services/boards.api";

const WORKSPACES = ["Marketing Team", "Product Development", "General Operations", "Personal Space"];

export default function CreateBoardModal({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workspace, setWorkspace] = useState(WORKSPACES[0]);
  const [visibility, setVisibility] = useState("private");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState("");
  const [inviteNotice, setInviteNotice] = useState("");
  const qc = useQueryClient();

  const createMut = useMutation({
    mutationFn: async () => {
      const boardRes = await createBoard({
        title: title.trim(),
        description: description.trim()
      });
      const board = boardRes?.data;
      const boardId = board?._id;

      const failedInvites = [];
      if (boardId && invites.length) {
        await Promise.all(
          invites.map(async (email) => {
            try {
              await addBoardMember(boardId, email);
            } catch {
              failedInvites.push(email);
            }
          })
        );
      }

      return { failedInvites };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      setError("");
      if (result?.failedInvites?.length) {
        setInviteNotice(`Could not invite: ${result.failedInvites.join(", ")}`);
        return;
      }

      setTitle("");
      setDescription("");
      setInviteEmail("");
      setInvites([]);
      setInviteNotice("");
      onClose();
    },
    onError: (err) => {
      setError(err?.response?.data?.message || "Failed to create board.");
    }
  });

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Board title is required.");
      return;
    }
    setInviteNotice("");
    createMut.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
            <span className="text-xl text-[#2b8cee]">▦</span>
            Create new board
          </h2>
          <button className="text-slate-400 transition-colors hover:text-slate-600" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <form className="space-y-6 p-6" onSubmit={submit}>
          <div className="space-y-1.5">
            <label htmlFor="board-title" className="text-sm font-medium text-slate-700">
              Board Title
            </label>
            <input
              id="board-title"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]"
              placeholder="e.g., Q4 Marketing Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="board-description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="board-description"
              className="min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]"
              placeholder="Describe what this board is for..."
              value={description}
              maxLength={280}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-[11px] text-slate-400">{description.length}/280</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Workspace</label>
              <select
                className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
              >
                {WORKSPACES.map((ws) => (
                  <option key={ws}>{ws}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Visibility</label>
              <div className="flex h-[46px] rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium ${visibility === "private" ? "bg-white text-[#2b8cee] shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                  onClick={() => setVisibility("private")}
                >
                  <span>🔒</span>
                  Private
                </button>
                <button
                  type="button"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium ${visibility === "public" ? "bg-white text-[#2b8cee] shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                  onClick={() => setVisibility("public")}
                >
                  <span>🌐</span>
                  Public
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-slate-700">Invite team members</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">@</span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 outline-none transition-all focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]"
                  placeholder="Enter email address..."
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-200"
                onClick={() => {
                  if (!inviteEmail.trim()) return;
                  const email = inviteEmail.trim().toLowerCase();
                  if (!email || invites.includes(email)) return;
                  setInvites((prev) => [...prev, email]);
                  setInviteEmail("");
                }}
              >
                Add
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-3 overflow-hidden">
                {invites.slice(0, 3).map((email, idx) => (
                  <div
                    key={`${email}-${idx}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2b8cee]/15 text-xs font-semibold text-[#2b8cee] ring-2 ring-white"
                  >
                    {email.slice(0, 2).toUpperCase()}
                  </div>
                ))}
                {invites.length > 3 ? (
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2b8cee]/10 text-xs font-semibold text-[#2b8cee] ring-2 ring-white">
                    +{invites.length - 3}
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">
                {invites.length ? `${invites[0]} and ${Math.max(0, invites.length - 1)} others queued for invite` : "No invites yet"}
              </p>
            </div>
            {inviteNotice ? <p className="text-xs text-amber-600">{inviteNotice}</p> : null}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#2b8cee] px-8 py-2.5 font-semibold text-white shadow-lg shadow-[#2b8cee]/20 transition-all active:scale-95 hover:bg-[#2b8cee]/90"
            disabled={createMut.isPending}
            onClick={submit}
          >
            {createMut.isPending ? "Creating..." : "Create Board"}
          </button>
        </div>
      </div>
    </div>
  );
}
