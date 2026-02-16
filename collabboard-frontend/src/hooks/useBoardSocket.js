import { useEffect } from "react";
import { socket } from "../app/socket";
import { useQueryClient } from "@tanstack/react-query";

export const useBoardSocket = (boardId) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!boardId) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinBoard", boardId);

    const patchBoard = (updater) => {
      qc.setQueryData(["board", boardId], (old) => {
        if (!old) return old;
        return updater(old);
      });
    };
    const refreshActivity = () => qc.invalidateQueries({ queryKey: ["activity", boardId] });

    const onTaskCreated = (task) => {
      patchBoard((old) => {
        const exists = (old.tasks || []).some((item) => String(item._id) === String(task?._id));
        if (exists) return old;
        return { ...old, tasks: [...(old.tasks || []), task] };
      });
    };

    const onTaskUpdated = (task) => {
      patchBoard((old) => ({
        ...old,
        tasks: (old.tasks || []).map((item) =>
          String(item._id) === String(task?._id) ? { ...item, ...task } : item
        )
      }));
    };

    const onTaskDeleted = (task) => {
      patchBoard((old) => ({
        ...old,
        tasks: (old.tasks || []).filter((item) => String(item._id) !== String(task?._id))
      }));
    };

    const onListCreated = (list) => {
      patchBoard((old) => {
        const exists = (old.lists || []).some((item) => String(item._id) === String(list?._id));
        if (exists) return old;
        return { ...old, lists: [...(old.lists || []), list] };
      });
    };

    const onListUpdated = (list) => {
      patchBoard((old) => ({
        ...old,
        lists: (old.lists || []).map((item) =>
          String(item._id) === String(list?._id) ? { ...item, ...list } : item
        )
      }));
    };

    const onListDeleted = ({ listId }) => {
      patchBoard((old) => ({
        ...old,
        lists: (old.lists || []).filter((item) => String(item._id) !== String(listId)),
        tasks: (old.tasks || []).filter((task) => String(task.listId) !== String(listId))
      }));
    };

    const onListReordered = ({ orderedListIds }) => {
      if (!Array.isArray(orderedListIds) || !orderedListIds.length) return;
      patchBoard((old) => {
        const map = new Map((old.lists || []).map((list) => [String(list._id), list]));
        const lists = orderedListIds
          .map((id, idx) => {
            const list = map.get(String(id));
            if (!list) return null;
            return { ...list, order: idx + 1 };
          })
          .filter(Boolean);
        return { ...old, lists };
      });
    };

    socket.on("taskMoved", onTaskUpdated);
    socket.on("taskCreated", onTaskCreated);
    socket.on("taskUpdated", onTaskUpdated);
    socket.on("taskDeleted", onTaskDeleted);
    socket.on("listCreated", onListCreated);
    socket.on("listUpdated", onListUpdated);
    socket.on("listDeleted", onListDeleted);
    socket.on("listReordered", onListReordered);
    socket.on("activityCreated", refreshActivity);
    socket.on("activityCleared", refreshActivity);

    return () => {
      socket.off("taskMoved", onTaskUpdated);
      socket.off("taskCreated", onTaskCreated);
      socket.off("taskUpdated", onTaskUpdated);
      socket.off("taskDeleted", onTaskDeleted);
      socket.off("listCreated", onListCreated);
      socket.off("listUpdated", onListUpdated);
      socket.off("listDeleted", onListDeleted);
      socket.off("listReordered", onListReordered);
      socket.off("activityCreated", refreshActivity);
      socket.off("activityCleared", refreshActivity);
    };
  }, [boardId, qc]);
};
