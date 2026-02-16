import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f1f2f4]">
      <Topbar />
      <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
