import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "../../store/ui.store";
import { clearActivities, getActivities } from "../../services/activity.api";
import ActivityItem from "./ActivityItem";

export default function ActivitySidebar({ boardId }) {
  const open = useUIStore((s) => s.activityOpen);
  const pushToast = useUIStore((s) => s.pushToast);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["activity", boardId],
    queryFn: () => getActivities(boardId).then((r) => r.data),
    enabled: open && Boolean(boardId)
  });

  const clearMut = useMutation({
    mutationFn: () => clearActivities(boardId, { skipErrorToast: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activity", boardId] });
      pushToast({ type: "success", message: "Activity feed cleared." });
    },
    onError: (err) => {
      pushToast({ type: "error", message: err?.response?.data?.message || "Failed to clear activity" });
    }
  });

  if (!open) return null;

  const items = data?.items || [];

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 bg-white xl:flex">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <h2 className="flex items-center gap-2 font-bold text-slate-800">
          <span className="text-sm">⏱</span>
          Activity Feed
        </h2>
        <button
          type="button"
          className="text-xs font-semibold text-[#2b8cee] hover:underline disabled:opacity-60"
          disabled={clearMut.isPending || !items.length}
          onClick={() => clearMut.mutate()}
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {items.map((item) => (
          <ActivityItem key={item._id} item={item} />
        ))}
      </div>

      <div className="flex flex-col gap-3 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
          <span>Active Sessions</span>
          <span className="text-emerald-500">Live</span>
        </div>
        <div className="text-xs text-slate-500">Realtime activity is synced for this board.</div>
      </div>
    </aside>
  );
}
