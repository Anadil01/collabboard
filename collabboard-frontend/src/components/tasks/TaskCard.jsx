import { useUIStore } from "../../store/ui.store";

const TAGS = [
  { id: "feature", label: "Feature", cls: "bg-blue-100 text-blue-600" },
  { id: "design", label: "Design", cls: "bg-purple-100 text-purple-600" },
  { id: "bug", label: "Bug", cls: "bg-orange-100 text-orange-600" },
  { id: "system", label: "System", cls: "bg-emerald-100 text-emerald-600" },
  { id: "task", label: "Task", cls: "bg-slate-100 text-slate-600" }
];

export default function TaskCard({
  task,
  dragDisabled = false,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging = false
}) {
  const openTask = useUIStore((s) => s.openTaskModal);
  const tag = TAGS.find((item) => item.id === String(task.label || "task")) || TAGS[TAGS.length - 1];
  const dueDate = task?.dueDate ? new Date(task.dueDate) : null;
  const dueText = dueDate ? dueDate.toLocaleDateString() : "";
  const isOverdue = dueDate ? dueDate < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  return (
    <article
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => openTask(task._id)}
      className={`group relative rounded-lg border border-slate-300/70 bg-white p-3 shadow-sm transition-all hover:border-slate-400 hover:shadow ${dragDisabled ? "cursor-default" : "cursor-grab"} ${isDragging ? "rotate-[1deg] ring-2 ring-[#2b8cee]/40" : ""}`}
    >
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-base text-slate-400">⋮⋮</span>
      </div>

      <div className="mb-2 flex gap-2">
        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-tight ${tag.cls}`}>
          {tag.label}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-tight ${
            task.priority === "urgent"
              ? "bg-red-100 text-red-700"
              : task.priority === "high"
                ? "bg-amber-100 text-amber-700"
                : task.priority === "low"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {task.priority || "medium"}
        </span>
      </div>

      <h4 className="mb-3 line-clamp-2 text-sm font-medium leading-tight text-slate-800">{task.title}</h4>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="flex items-center gap-1">
            <span className="text-xs">💬</span>
            <span className="text-[10px]">{task.description ? 1 : 0}</span>
          </div>
          {dueDate ? (
            <div className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${isOverdue ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>
              {dueText}
            </div>
          ) : null}
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
          {task.createdBy ? "U" : "•"}
        </div>
      </div>
    </article>
  );
}
