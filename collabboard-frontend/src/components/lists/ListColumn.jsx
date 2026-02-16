import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ListHeader from "./ListHeader";
import TaskCard from "../tasks/TaskCard";
import { createTaskApi } from "../../services/tasks.api";
import { updateListApi, deleteListApi } from "../../services/lists.api";
import { useUIStore } from "../../store/ui.store";
import ConfirmDialog from "../common/ConfirmDialog";

export default function ListColumn({
  list,
  tasks,
  boardId,
  dragDisabled = false,
  listDragHandleProps = {},
  canMoveLeft = false,
  canMoveRight = false,
  onMoveLeft,
  onMoveRight
}) {
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const qc = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);

  const createMut = useMutation({
    mutationFn: () =>
      createTaskApi({
        boardId,
        listId: list._id,
        title: title.trim(),
        description: ""
      }, { skipErrorToast: true }),
    onSuccess: () => {
      setTitle("");
      setAdding(false);
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      pushToast({ type: "success", message: "Task added." });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to add task" });
    }
  });

  const renameMut = useMutation({
    mutationFn: () => updateListApi(list._id, { title: listTitle.trim() }, { skipErrorToast: true }),
    onSuccess: () => {
      setEditOpen(false);
      setMenuOpen(false);
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      pushToast({ type: "success", message: `List renamed to "${listTitle.trim()}".` });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to rename list" });
    }
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteListApi(list._id, { skipErrorToast: true }),
    onSuccess: () => {
      setMenuOpen(false);
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      pushToast({ type: "success", message: `List "${list.title}" deleted.` });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to delete list" });
    }
  });

  return (
    <>
      <section className="flex h-full w-[280px] shrink-0 flex-col rounded-xl bg-[#f1f2f4] p-2 shadow-sm">
      <div className="mb-2 flex items-center justify-between px-1">
        {editOpen ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!listTitle.trim()) return;
                  renameMut.mutate();
                }
                if (e.key === "Escape") {
                  setEditOpen(false);
                  setListTitle(list.title);
                }
              }}
            />
            <button
              type="button"
              className="rounded bg-[#2b8cee] px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
              disabled={renameMut.isPending || !listTitle.trim()}
              onClick={() => renameMut.mutate()}
            >
              Save
            </button>
          </div>
        ) : (
          <div
            className={`flex-1 ${dragDisabled ? "cursor-default" : "cursor-grab"}`}
            {...listDragHandleProps}
          >
            <ListHeader title={list.title} count={tasks.length} />
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-300/60 hover:text-slate-700 disabled:opacity-40"
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            aria-label={`Move ${list.title} left`}
            title="Move left"
          >
            ←
          </button>
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-300/60 hover:text-slate-700 disabled:opacity-40"
            onClick={onMoveRight}
            disabled={!canMoveRight}
            aria-label={`Move ${list.title} right`}
            title="Move right"
          >
            →
          </button>
          <div className="relative">
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-300/60 hover:text-slate-700"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ⋯
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  setListTitle(list.title);
                  setEditOpen(true);
                  setMenuOpen(false);
                }}
              >
                Rename list
              </button>
              <button
                type="button"
                className="w-full rounded px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                disabled={deleteMut.isPending}
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmDeleteOpen(true);
                }}
              >
                {deleteMut.isPending ? "Deleting..." : "Delete list"}
              </button>
            </div>
          ) : null}
          </div>
        </div>
      </div>

      <Droppable droppableId={String(list._id)}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2"
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task._id}
                draggableId={String(task._id)}
                index={index}
                isDragDisabled={dragDisabled}
              >
                {(dragProvided, snapshot) => (
                  <TaskCard
                    task={task}
                    dragDisabled={dragDisabled}
                    innerRef={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    dragHandleProps={dragProvided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {adding ? (
              <div className="rounded-lg border border-slate-300 bg-white p-2">
                <input
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                  placeholder="Task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!title.trim()) return;
                      createMut.mutate();
                    }
                  }}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    onClick={() => {
                      setAdding(false);
                      setTitle("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-[#2b8cee] px-2 py-1 text-xs font-semibold text-white"
                    disabled={createMut.isPending || !title.trim()}
                    onClick={() => createMut.mutate()}
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-300/60 hover:text-slate-800"
                onClick={() => setAdding(true)}
              >
                <span>＋</span>
                <span>Add a card</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
      </section>
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete List"
        message={`Delete list "${list.title}" and all its tasks?`}
        confirmText="Delete"
        danger
        loading={deleteMut.isPending}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          deleteMut.mutate(undefined, {
            onSettled: () => setConfirmDeleteOpen(false)
          });
        }}
      />
    </>
  );
}
