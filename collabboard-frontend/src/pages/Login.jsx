import { useState } from "react";
import { loginApi } from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const pushToast = useUIStore((s) => s.pushToast);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await loginApi({ email, password });
      setAuth(res.data.token, res.data.user, remember);
      pushToast({ type: "success", message: "Welcome back. Signed in successfully." });
      nav("/dashboard", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to login. Please try again.";
      setError(message);
      pushToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] p-6 selection:bg-[#2b8cee]/30">
      <div className="mx-auto flex w-full max-w-md flex-col items-center pt-10">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2b8cee] text-white shadow-lg shadow-[#2b8cee]/20">
              ▦
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#2b8cee]/90">CollabBoard</span>
          </div>
          <p className="text-sm font-medium text-[#2b8cee]/60">Simplify your workflow.</p>
        </div>

        <div className="w-full rounded-xl border border-[#2b8cee]/5 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-10">
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-sm text-slate-500">Enter your credentials to access your workspace.</p>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Email Address
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-[#2b8cee]">
                  @
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#2b8cee] focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <a
                  className="text-xs font-semibold text-[#2b8cee] transition-colors hover:text-[#2b8cee]/80"
                  href="mailto:support@collabboard.dev?subject=Reset%20Password%20Request"
                >
                  Forgot password?
                </a>
              </div>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-[#2b8cee]">
                  *
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#2b8cee] focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#2b8cee] transition-colors focus:ring-[#2b8cee]"
              />
              <label className="ml-2 block cursor-pointer text-sm text-slate-600" htmlFor="remember">
                Remember this device
              </label>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#2b8cee] py-3.5 font-semibold text-white shadow-lg shadow-[#2b8cee]/25 transition-all hover:bg-[#2b8cee]/90 disabled:opacity-60"
            >
              <span>{submitting ? "Signing in..." : "Sign In"}</span>
              <span className="text-[18px] transition-transform group-hover:translate-x-1">→</span>
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-[#2b8cee] transition-colors hover:text-[#2b8cee]/80" to="/signup">
            Create an account
          </Link>
        </p>

        <div className="mt-12 flex justify-center gap-6">
          <Link className="text-xs text-slate-400 transition-colors hover:text-[#2b8cee]" to="/privacy">
            Privacy Policy
          </Link>
          <Link className="text-xs text-slate-400 transition-colors hover:text-[#2b8cee]" to="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs text-slate-400 transition-colors hover:text-[#2b8cee]" to="/help">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
