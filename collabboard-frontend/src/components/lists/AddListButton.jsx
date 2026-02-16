import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createListApi } from "../../services/lists.api";
import Button from "../common/Button";

export default function AddListButton({ boardId }) {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const addMut = useMutation({
    mutationFn: () => createListApi({ boardId, title: title.trim() }),
    onSuccess: () => {
      setTitle("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["board", boardId] });
    }
  });

  return (
    <div className="w-80 shrink-0">
      {open ? (
        <div className="rounded-xl border border-slate-300/80 bg-[#f1f2f4] p-3 shadow-sm">
          <input
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            placeholder="New list"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={() => {
                setOpen(false);
                setTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="px-2 py-1 text-xs"
              disabled={addMut.isPending || !title.trim()}
              onClick={() => addMut.mutate()}
            >
              {addMut.isPending ? "Adding..." : "Create List"}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl bg-white/30 px-3 py-3 text-left text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/40"
          onClick={() => setOpen(true)}
        >
          <span className="text-lg">＋</span>
          <span>Add another list</span>
        </button>
      )}
    </div>
  );
}
