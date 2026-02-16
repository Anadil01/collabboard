import { useMemo, useState } from "react";
import { useUIStore } from "../../store/ui.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskApi, updateTaskApi, deleteTaskApi } from "../../services/tasks.api";
import { getActivities } from "../../services/activity.api";
import AssignUserSelect from "./AssignUserSelect";

export default function TaskModal({ boardId }) {
  const { taskModalOpen, activeTaskId, closeTaskModal } = useUIStore();
  const qc = useQueryClient();
  const [draftByTask, setDraftByTask] = useState({});
  const [commentInput, setCommentInput] = useState("");

  const { data } = useQuery({
    enabled: taskModalOpen && !!activeTaskId,
    queryKey: ["task", activeTaskId],
    queryFn: () => getTaskApi(activeTaskId).then((r) => r.data)
  });

  const { data: activityData } = useQuery({
    enabled: taskModalOpen && !!boardId,
    queryKey: ["activity", boardId, "taskModal"],
    queryFn: () => getActivities(boardId, 1, 50).then((r) => r.data)
  });

  const saveMut = useMutation({
    mutationFn: (payload) => updateTaskApi(activeTaskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      qc.invalidateQueries({ queryKey: ["task", activeTaskId] });
      closeTaskModal();
    }
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteTaskApi(activeTaskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      closeTaskModal();
    }
  });

  const boardCache = qc.getQueryData(["board", boardId]);
  const listName = useMemo(() => {
    const list = boardCache?.lists?.find((l) => String(l._id) === String(data?.listId));
    return list?.title || "List";
  }, [boardCache?.lists, data?.listId]);

  const activityItems = useMemo(() => {
    const items = activityData?.items || [];
    return items.filter((it) => String(it.taskId) === String(activeTaskId)).slice(0, 8);
  }, [activityData?.items, activeTaskId]);

  if (!taskModalOpen || !data) return null;

  const form = draftByTask[activeTaskId] || {
    title: data.title || "",
    description: data.description || "",
    label: data.label || "task",
    priority: data.priority || "medium",
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString().slice(0, 10) : "",
    assignedTo: (data.assignedTo || []).map((u) => String(u._id || u))
  };

  const setForm = (next) => {
    setDraftByTask((prev) => ({
      ...prev,
      [activeTaskId]: typeof next === "function" ? next(form) : next
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 p-2 text-slate-400 transition-colors hover:text-slate-600"
          onClick={closeTaskModal}
        >
          ✕
        </button>

        <header className="px-8 pb-4 pt-8">
          <div className="mb-2 flex items-center gap-3 text-sm font-medium text-[#2b8cee]">
            <span className="text-lg">▦</span>
            <span>Board / {boardCache?.board?.title || "Workspace"}</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-1 text-2xl text-slate-400">𝑇</span>
            <input
              className="w-full rounded p-1 text-3xl font-bold tracking-tight outline-none ring-[#2b8cee]/20 focus:ring-2"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <p className="ml-10 text-sm text-slate-500">
            in list <span className="underline">{listName}</span>
          </p>
        </header>

        <div className="flex flex-col gap-8 px-8 pb-8 md:flex-row">
          <div className="flex-grow space-y-8">
            <section>
              <div className="mb-4 flex items-center gap-4">
                <span className="text-slate-400">📝</span>
                <h3 className="text-lg font-semibold">Description</h3>
              </div>
              <div className="ml-10">
                <div className="min-h-[120px] rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all focus-within:ring-2 focus-within:ring-[#2b8cee]/30">
                  <div className="mb-3 flex gap-2 border-b border-slate-200 pb-2">
                    <button type="button" className="rounded p-1 transition-colors hover:bg-slate-200">B</button>
                    <button type="button" className="rounded p-1 transition-colors hover:bg-slate-200">I</button>
                    <button type="button" className="rounded p-1 transition-colors hover:bg-slate-200">•</button>
                    <button type="button" className="rounded p-1 transition-colors hover:bg-slate-200">🔗</button>
                  </div>
                  <textarea
                    className="min-h-[70px] w-full resize-none bg-transparent text-slate-700 outline-none"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">⏱</span>
                  <h3 className="text-lg font-semibold">Activity</h3>
                </div>
                <button type="button" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold hover:bg-slate-200">
                  Show Details
                </button>
              </div>

              <div className="ml-10 space-y-6">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b8cee]/15 text-xs font-bold text-[#2b8cee]">
                    ME
                  </div>
                  <div className="flex-grow">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[#2b8cee]"
                      placeholder="Write a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {activityItems.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#2b8cee]/10 text-[11px] font-bold text-[#2b8cee]">
                        {(item.userId?.name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm">
                          <span className="font-semibold">{item.userId?.name || "User"}</span>
                          <span className="ml-2 text-slate-500">{item.action?.replaceAll("_", " ")}</span>
                        </div>
                        {item.meta?.title ? (
                          <div className="mt-1 rounded-lg bg-slate-100 p-3 text-sm shadow-sm">
                            {item.meta.title}
                          </div>
                        ) : null}
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="w-full space-y-6 md:w-64">
            <div>
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Metadata</h4>
              <div className="space-y-4">
                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-600">Assignees</span>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {(boardCache?.board?.members || [])
                      .filter((m) => form.assignedTo?.includes(String(m._id)))
                      .slice(0, 4)
                      .map((member) => (
                        <div
                          key={String(member._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#2b8cee]/15 text-[10px] font-semibold text-[#2b8cee]"
                          title={member.name || member.email}
                        >
                          {(member.name || member.email || "U").slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                  </div>
                  <AssignUserSelect
                    members={boardCache?.board?.members || []}
                    value={form.assignedTo || []}
                    onChange={(assignedTo) => setForm((p) => ({ ...p, assignedTo }))}
                  />
                </div>

                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-600">Labels</span>
                  <div className="flex flex-wrap gap-1">
                    <select
                      className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium uppercase text-slate-700 outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                      value={form.label}
                      onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    >
                      <option value="task">Task</option>
                      <option value="feature">Feature</option>
                      <option value="design">Design</option>
                      <option value="bug">Bug</option>
                      <option value="system">System</option>
                    </select>
                    <select
                      className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium uppercase text-slate-700 outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-600">Due Date</span>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</h4>
              <div className="space-y-2">
                <button type="button" className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100">
                  ⧉ Duplicate Task
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100">
                  🗃 Archive
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                  onClick={() => deleteMut.mutate()}
                >
                  🗑 Delete Task
                </button>
              </div>
            </div>
          </aside>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between border-t border-slate-100 bg-white px-8 py-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-[12px]">☁</span>
            Last synced 2 minutes ago
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
              onClick={closeTaskModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#2b8cee] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2b8cee]/20 transition-all hover:bg-[#2b8cee]/90"
              disabled={saveMut.isPending}
              onClick={() => saveMut.mutate(form)}
            >
              {saveMut.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
