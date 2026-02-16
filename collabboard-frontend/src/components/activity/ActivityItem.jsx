import { formatDateTime } from "../../utils/dateFormat";

const ACTION_TEXT = {
  task_created: "created a task",
  task_moved: "moved a task",
  task_deleted: "deleted a task",
  task_updated: "updated a task",
  list_created: "created a list",
  list_updated: "updated a list",
  list_deleted: "deleted a list",
  list_reordered: "reordered lists"
};

export default function ActivityItem({ item }) {
  return (
    <article className="relative border-l border-slate-200 pb-2 pl-7">
      <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#2b8cee]" />
      <div className="mb-1 flex items-start gap-2">
        <span className="text-xs font-semibold text-slate-900">{item.userId?.name || "User"}</span>
        <span className="mt-0.5 text-[10px] text-slate-500">{formatDateTime(item.createdAt)}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        {ACTION_TEXT[item.action] || item.action}
      </p>
    </article>
  );
}
