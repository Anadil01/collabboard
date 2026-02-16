import Badge from "../common/Badge";

export default function ListHeader({ title, count }) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <Badge className="rounded-full border border-slate-300 bg-slate-200/70 text-[10px] text-slate-600">{count}</Badge>
    </div>
  );
}
