export default function Avatar({ name = "User", className = "" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#2b8cee]/15 text-xs font-bold text-[#2b8cee] ${className}`}>
      {initials}
    </div>
  );
}
