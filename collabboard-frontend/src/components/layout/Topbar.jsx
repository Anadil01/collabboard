import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import Button from "../common/Button";
import Avatar from "../common/Avatar";

export default function Topbar() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b8cee] text-white">
              ▦
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">CollabBoard</span>
          </Link>

          <div className="hidden items-center gap-2 text-sm md:flex">
            <Link className="rounded-md px-2 py-1 font-medium text-slate-700 transition-colors hover:bg-slate-100" to="/dashboard">
              Boards
            </Link>
            <Link className="rounded-md px-2 py-1 font-medium text-slate-600 transition-colors hover:bg-slate-100" to="/docs">
              Templates
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100" type="button">🔔</button>
          <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100" type="button">⚙</button>
          <div className="mx-1 h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-2 rounded-full py-1 pl-2 pr-1 transition-colors hover:bg-slate-100">
            <span className="hidden text-sm font-medium sm:block">{user?.name || "Alex Rivera"}</span>
            <Avatar name={user?.name || "Alex Rivera"} />
          </div>
          <Button variant="danger" className="px-3 py-1.5" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
