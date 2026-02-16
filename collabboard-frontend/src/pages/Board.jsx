import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import ListColumn from "../components/lists/ListColumn";
import AddListButton from "../components/lists/AddListButton";
import TaskModal from "../components/tasks/TaskModal";
import ActivitySidebar from "../components/activity/ActivitySidebar";
import Avatar from "../components/common/Avatar";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useBoardSocket } from "../hooks/useBoardSocket";
import { useSocketStore } from "../store/socket.store";
import { useUIStore } from "../store/ui.store";
import { useAuthStore } from "../store/auth.store";
import { moveTaskApi } from "../services/tasks.api";
import {
  addBoardMember,
  leaveBoard,
  removeBoardMember,
  transferBoardOwnership,
  updateBoardMemberRole
} from "../services/boards.api";
import { reorderListsApi } from "../services/lists.api";

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const connected = useSocketStore((s) => s.connected);
  const pushToast = useUIStore((s) => s.pushToast);
  const currentUser = useAuthStore((s) => s.user);
  const [query, setQuery] = useState("");
  const queryActive = query.trim().length > 0;
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [shareErr, setShareErr] = useState("");
  const [pendingRemove, setPendingRemove] = useState(null);
  const [nextOwnerId, setNextOwnerId] = useState("");
  const [labelFilter, setLabelFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["board", id],
    queryFn: () => api.get(`/boards/${id}/full`).then((r) => r.data)
  });

  const shouldOpenMembersPanel = searchParams.get("panel") === "members";
  const isShareOpen = shareOpen || shouldOpenMembersPanel;
  const closeSharePanel = () => {
    setShareOpen(false);
    if (!shouldOpenMembersPanel) return;
    const next = new URLSearchParams(searchParams);
    next.delete("panel");
    setSearchParams(next, { replace: true });
  };

  useBoardSocket(id);

  const moveTaskMut = useMutation({
    mutationFn: (payload) => moveTaskApi(payload),
    onMutate: async ({ taskId, toListId, toIndex, fromListId, fromIndex }) => {
      await qc.cancelQueries({ queryKey: ["board", id] });
      const prev = qc.getQueryData(["board", id]);

      qc.setQueryData(["board", id], (old) => {
        if (!old?.tasks?.length) return old;

        const tasks = old.tasks.map((task) => ({ ...task }));
        const movedTask = tasks.find((task) => String(task._id) === String(taskId));
        if (!movedTask) return old;

        const sourceTasks = tasks
          .filter((task) => String(task.listId) === String(fromListId))
          .sort((a, b) => a.order - b.order);
        const destinationTasks = tasks
          .filter((task) => String(task.listId) === String(toListId))
          .sort((a, b) => a.order - b.order);

        const [removed] = sourceTasks.splice(fromIndex, 1);
        if (!removed) return old;

        const destinationIndex = Math.max(0, Math.min(toIndex, destinationTasks.length));
        if (String(fromListId) === String(toListId)) {
          sourceTasks.splice(destinationIndex, 0, removed);
        } else {
          destinationTasks.splice(destinationIndex, 0, removed);
        }

        const orderMap = new Map();
        sourceTasks.forEach((task, idx) => {
          orderMap.set(String(task._id), { listId: fromListId, order: idx + 1 });
        });
        if (String(fromListId) !== String(toListId)) {
          destinationTasks.forEach((task, idx) => {
            orderMap.set(String(task._id), { listId: toListId, order: idx + 1 });
          });
        }

        return {
          ...old,
          tasks: tasks.map((task) => {
            const next = orderMap.get(String(task._id));
            if (!next) return task;
            return { ...task, listId: next.listId, order: next.order };
          })
        };
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        qc.setQueryData(["board", id], context.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["board", id] });
    }
  });

  const inviteMut = useMutation({
    mutationFn: (email) => addBoardMember(id, email),
    onSuccess: (_data, invitedEmail) => {
      setShareErr("");
      setShareMsg("Member invited successfully.");
      setShareEmail("");
      const meId = String(currentUser?.id || currentUser?._id || "");
      const boardId = String(id || "");
      if (meId && boardId && invitedEmail) {
        const key = `recentBoardInvites:${meId}`;
        let recent = [];
        try {
          recent = JSON.parse(localStorage.getItem(key) || "[]");
        } catch {
          recent = [];
        }
        recent.unshift({
          boardId,
          email: String(invitedEmail).toLowerCase(),
          invitedAt: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(recent.slice(0, 20)));
      }
      qc.invalidateQueries({ queryKey: ["board", id] });
    },
    onError: (err) => {
      setShareMsg("");
      setShareErr(err?.response?.data?.message || "Failed to invite member");
    }
  });

  const reorderListsMut = useMutation({
    mutationFn: (orderedListIds) =>
      reorderListsApi({ boardId: id, orderedListIds }, { skipErrorToast: true }),
    onMutate: async (orderedListIds) => {
      await qc.cancelQueries({ queryKey: ["board", id] });
      const prev = qc.getQueryData(["board", id]);

      qc.setQueryData(["board", id], (old) => {
        if (!old?.lists?.length) return old;
        const listById = new Map(old.lists.map((list) => [String(list._id), list]));
        const reordered = orderedListIds
          .map((listId, idx) => {
            const item = listById.get(String(listId));
            if (!item) return null;
            return { ...item, order: idx + 1 };
          })
          .filter(Boolean);

        return { ...old, lists: reordered };
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(["board", id], context.prev);
      pushToast({ type: "error", message: "Failed to reorder lists" });
    },
    onSuccess: () => {
      pushToast({ type: "success", message: "List order updated." });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["board", id] });
    }
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ memberId, role }) =>
      updateBoardMemberRole(id, memberId, role, { skipErrorToast: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", id] });
      pushToast({ type: "success", message: "Member role updated." });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to update role" });
    }
  });

  const removeMemberMut = useMutation({
    mutationFn: ({ memberId }) =>
      removeBoardMember(id, memberId, { skipErrorToast: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", id] });
      pushToast({ type: "success", message: "Member removed from board." });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to remove member" });
    }
  });

  const leaveBoardMut = useMutation({
    mutationFn: () => leaveBoard(id, { skipErrorToast: true }),
    onSuccess: () => {
      pushToast({ type: "success", message: "You left the board." });
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to leave board" });
    }
  });

  const transferOwnerMut = useMutation({
    mutationFn: ({ memberId }) =>
      transferBoardOwnership(id, memberId, { skipErrorToast: true }),
    onSuccess: () => {
      setNextOwnerId("");
      qc.invalidateQueries({ queryKey: ["board", id] });
      pushToast({ type: "success", message: "Ownership transferred." });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to transfer ownership" });
    }
  });

  const moveListByStep = (listId, step) => {
    const current = (data?.lists || []).slice().sort((a, b) => a.order - b.order);
    const fromIndex = current.findIndex((list) => String(list._id) === String(listId));
    if (fromIndex < 0) return;
    const toIndex = fromIndex + step;
    if (toIndex < 0 || toIndex >= current.length) return;

    const moved = [...current];
    const [removed] = moved.splice(fromIndex, 1);
    if (!removed) return;
    moved.splice(toIndex, 0, removed);

    reorderListsMut.mutate(moved.map((list) => String(list._id)));
  };

  const onDragEnd = (result) => {
    if (queryActive) return;
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "LIST") {
      const current = (data?.lists || []).slice().sort((a, b) => a.order - b.order);
      const moved = [...current];
      const [removed] = moved.splice(source.index, 1);
      if (!removed) return;
      moved.splice(destination.index, 0, removed);
      const orderedListIds = moved.map((list) => String(list._id));
      reorderListsMut.mutate(orderedListIds);
      return;
    }

    moveTaskMut.mutate({
      taskId: draggableId,
      toListId: destination.droppableId,
      toIndex: destination.index,
      fromListId: source.droppableId,
      fromIndex: source.index
    });
  };

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = data?.tasks || [];
    return list.filter((task) => {
      const matchesQuery = !q || `${task.title} ${task.description || ""}`.toLowerCase().includes(q);
      const matchesLabel = labelFilter === "all" || String(task.label || "task") === labelFilter;
      const matchesPriority = priorityFilter === "all" || String(task.priority || "medium") === priorityFilter;
      const due = task?.dueDate ? new Date(task.dueDate) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const matchesDue =
        dueFilter === "all"
        || (dueFilter === "none" && !due)
        || (dueFilter === "overdue" && due && due < today)
        || (dueFilter === "today" && due && due >= today && due < tomorrow)
        || (dueFilter === "upcoming" && due && due >= tomorrow);
      return matchesQuery && matchesLabel && matchesPriority && matchesDue;
    });
  }, [data?.tasks, dueFilter, labelFilter, priorityFilter, query]);

  if (isLoading) return <div className="text-sm text-slate-500">Loading board...</div>;
  if (!data?.board) return <div className="text-sm text-slate-500">Board not found.</div>;

  const { board, lists } = data;
  const members = board.members || [];
  const meId = String(currentUser?.id || currentUser?._id || "");
  const roleMap = board?.memberRoles || {};
  const ownerId = String(board?.createdBy || "");
  const getRole = (memberId) => {
    const idStr = String(memberId);
    if (idStr === ownerId) return "owner";
    return roleMap[idStr] || "member";
  };
  const myRole = getRole(meId);
  const canManageRoles = myRole === "owner";
  const canManageMembers = myRole === "owner" || myRole === "admin";

  return (
    <div className="flex h-[calc(100vh-6.5rem)] min-h-[620px] flex-col overflow-hidden rounded-xl border border-[#0c66e4]/30 bg-gradient-to-br from-[#0c66e4] via-[#1f7bd7] to-[#0747a6]">
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/20 bg-[#0c66e4]/40 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-2 text-sm font-medium">
            <span className="text-white/80">Boards</span>
            <span className="text-white/60">/</span>
            <span className="text-white">{board.title}</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/70">⌕</span>
            <input
              className="w-64 rounded-md border-none bg-white/20 py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-white/70 transition-all focus:bg-white/25 focus:ring-2 focus:ring-white/40"
              placeholder="Search tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            className="rounded-md bg-white/20 px-2 py-1.5 text-xs font-medium text-white outline-none ring-0 hover:bg-white/25"
            title="Filter by label"
          >
            <option value="all" className="text-slate-800">All labels</option>
            <option value="feature" className="text-slate-800">Feature</option>
            <option value="design" className="text-slate-800">Design</option>
            <option value="bug" className="text-slate-800">Bug</option>
            <option value="system" className="text-slate-800">System</option>
            <option value="task" className="text-slate-800">Task</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md bg-white/20 px-2 py-1.5 text-xs font-medium text-white outline-none ring-0 hover:bg-white/25"
            title="Filter by priority"
          >
            <option value="all" className="text-slate-800">All priority</option>
            <option value="low" className="text-slate-800">Low</option>
            <option value="medium" className="text-slate-800">Medium</option>
            <option value="high" className="text-slate-800">High</option>
            <option value="urgent" className="text-slate-800">Urgent</option>
          </select>
          <select
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
            className="rounded-md bg-white/20 px-2 py-1.5 text-xs font-medium text-white outline-none ring-0 hover:bg-white/25"
            title="Filter by due date"
          >
            <option value="all" className="text-slate-800">Any due</option>
            <option value="none" className="text-slate-800">No due date</option>
            <option value="overdue" className="text-slate-800">Overdue</option>
            <option value="today" className="text-slate-800">Due today</option>
            <option value="upcoming" className="text-slate-800">Upcoming</option>
          </select>
          <div className="mr-2 flex -space-x-2">
            {members.slice(0, 3).map((member, idx) => (
              <div key={member._id || idx} className="rounded-full border-2 border-[#0c66e4]">
                <Avatar name={member.name || "User"} />
              </div>
            ))}
            {members.length > 3 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0c66e4] bg-slate-200 text-[10px] font-bold text-slate-600">
                +{members.length - 3}
              </div>
            ) : null}
          </div>
          <button
            className="flex items-center gap-2 rounded-md bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/30"
            type="button"
            onClick={() => {
              setShareOpen(true);
              setShareMsg("");
              setShareErr("");
            }}
          >
            <span className="text-sm">＋</span>
            Share
          </button>
          <div className="h-6 w-px bg-white/30" />
          <button className="rounded-md p-1.5 text-white transition-colors hover:bg-white/20" type="button">⋯</button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board-lists" direction="horizontal" type="LIST">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex h-full items-start gap-6"
                >
                  {lists
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((list, index) => (
                      <Draggable
                        key={list._id}
                        draggableId={`list-${list._id}`}
                        index={index}
                        isDragDisabled={queryActive}
                      >
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={`transition-transform duration-150 ${
                              snapshot.isDragging ? "scale-[1.02] drop-shadow-lg" : ""
                            }`}
                          >
                            <ListColumn
                              list={list}
                              boardId={id}
                              dragDisabled={queryActive}
                              listDragHandleProps={dragProvided.dragHandleProps}
                              canMoveLeft={index > 0}
                              canMoveRight={index < lists.length - 1}
                              onMoveLeft={() => moveListByStep(list._id, -1)}
                              onMoveRight={() => moveListByStep(list._id, 1)}
                              tasks={filteredTasks
                                .filter((t) => String(t.listId) === String(list._id))
                                .sort((a, b) => a.order - b.order)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  <AddListButton boardId={id} />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <ActivitySidebar boardId={id} />
      </main>
      <div className="flex h-8 shrink-0 items-center gap-4 bg-[#0a59c9]/40 px-4 text-[11px] text-white/90 md:px-6">
        <span className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-white/50"}`} />
          {connected ? "Live sync on" : "Live sync off"}
        </span>
        {queryActive ? <span className="text-white/70">Clear search to drag cards</span> : null}
        <span className="text-white/70">All changes saved</span>
        <Link className="text-white/80 hover:text-white" to="/shortcuts">Keyboard Shortcuts</Link>
        <Link className="text-white/80 hover:text-white" to="/docs">Help & Docs</Link>
      </div>

      {isShareOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4"
          onClick={closeSharePanel}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Invite Member</h3>
            <p className="mb-3 text-sm text-slate-500">Invite by account email to join this board.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                placeholder="member@email.com"
              />
              <button
                type="button"
                disabled={!shareEmail.trim() || inviteMut.isPending}
                onClick={() => inviteMut.mutate(shareEmail.trim().toLowerCase())}
                className="rounded-lg bg-[#2b8cee] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {inviteMut.isPending ? "Inviting..." : "Invite"}
              </button>
            </div>
            {shareMsg ? <p className="mt-2 text-xs text-emerald-600">{shareMsg}</p> : null}
            {shareErr ? <p className="mt-2 text-xs text-red-600">{shareErr}</p> : null}
            <div className="mt-4 border-t border-slate-200 pt-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">Members</h4>
              <div className="max-h-56 space-y-2 overflow-auto pr-1">
                {members.map((member) => {
                  const memberId = String(member._id);
                  const role = getRole(memberId);
                  const isOwner = role === "owner";
                  const canEdit = canManageRoles && !isOwner && memberId !== meId;
                  const canRemove =
                    canManageMembers
                    && !isOwner
                    && memberId !== meId
                    && (myRole === "owner" || role === "member");

                  return (
                    <div key={memberId} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={member.name || "U"} className="h-7 w-7 text-[10px]" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{member.name || "User"}</p>
                          <p className="text-xs text-slate-500">{member.email || ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canEdit ? (
                          <select
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                            value={role}
                            disabled={updateRoleMut.isPending}
                            onChange={(e) => updateRoleMut.mutate({ memberId, role: e.target.value })}
                          >
                            <option value="member">member</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">
                            {role}
                          </span>
                        )}
                        {canRemove ? (
                          <button
                            type="button"
                            className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            onClick={() => setPendingRemove({ memberId, name: member.name || "User" })}
                            disabled={removeMemberMut.isPending}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!canManageRoles ? (
                <p className="mt-2 text-xs text-slate-500">Only the board owner can change member roles.</p>
              ) : null}
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">Ownership</h4>
              {myRole === "owner" ? (
                <div className="space-y-2">
                  <select
                    value={nextOwnerId}
                    onChange={(e) => setNextOwnerId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                  >
                    <option value="">Select new owner</option>
                    {members
                      .filter((member) => String(member._id) !== meId)
                      .map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name || member.email}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={!nextOwnerId || transferOwnerMut.isPending}
                    onClick={() => transferOwnerMut.mutate({ memberId: nextOwnerId })}
                    className="w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {transferOwnerMut.isPending ? "Transferring..." : "Transfer Ownership"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={leaveBoardMut.isPending}
                  onClick={() => leaveBoardMut.mutate()}
                  className="w-full rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-60"
                >
                  {leaveBoardMut.isPending ? "Leaving..." : "Leave Board"}
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" className="text-sm text-slate-600 hover:text-slate-800" onClick={closeSharePanel}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Remove Member"
        message={pendingRemove ? `Remove "${pendingRemove.name}" from this board?` : ""}
        confirmText="Remove"
        danger
        loading={removeMemberMut.isPending}
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (!pendingRemove?.memberId) return;
          removeMemberMut.mutate(
            { memberId: pendingRemove.memberId },
            { onSettled: () => setPendingRemove(null) }
          );
        }}
      />

      <TaskModal boardId={id} />
    </div>
  );
}
