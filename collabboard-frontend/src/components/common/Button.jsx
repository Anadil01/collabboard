export default function Button({
  type = "button",
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  const styles = {
    primary: "bg-[#2b8cee] text-white hover:bg-[#2b8cee]/90",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${styles[variant] || styles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
