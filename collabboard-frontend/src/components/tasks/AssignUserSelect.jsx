export default function AssignUserSelect({ members = [], value = [], onChange }) {
  const selected = new Set((value || []).map(String));

  const toggle = (userId) => {
    const id = String(userId);
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  if (!members.length) {
    return <p className="text-xs text-slate-500">No board members available.</p>;
  }

  return (
    <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-slate-200 bg-white p-1">
      {members.map((member) => {
        const id = String(member._id);
        const checked = selected.has(id);
        return (
          <label
            key={id}
            className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-slate-50"
          >
            <span className="truncate text-slate-700">{member.name || member.email}</span>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(id)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-[#2b8cee] focus:ring-[#2b8cee]"
            />
          </label>
        );
      })}
    </div>
  );
}
