export default function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 ${className}`}>
      {children}
    </span>
  );
}
