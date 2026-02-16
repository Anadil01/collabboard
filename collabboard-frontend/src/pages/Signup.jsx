import { useState } from "react";
import { signupApi } from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";
import { Link, useNavigate } from "react-router-dom";

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { label: "Weak", color: "bg-red-500", textColor: "text-red-500", bars: 1 };
  }
  if (score <= 3) {
    return { label: "Moderate", color: "bg-amber-500", textColor: "text-amber-500", bars: 2 };
  }
  return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500", bars: 4 };
}

export default function Signup() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const pushToast = useUIStore((s) => s.pushToast);
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const strength = getPasswordStrength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      const message = "Password must be at least 8 characters.";
      setError(message);
      pushToast({ type: "error", message });
      return;
    }

    if (form.password !== form.confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      pushToast({ type: "error", message });
      return;
    }

    setSubmitting(true);

    try {
      const res = await signupApi({
        name: form.name,
        email: form.email,
        password: form.password
      });
      setAuth(res.data.token, res.data.user);
      pushToast({ type: "success", message: "Account created successfully." });
      nav("/dashboard", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to sign up. Please try again.";
      setError(message);
      pushToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f6f7f8] p-4 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#2b8cee] shadow-lg shadow-[#2b8cee]/20">
            <span className="text-2xl text-white">▦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CollabBoard</h1>
          <p className="mt-1 text-slate-500">Start collaborating with your team</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h2 className="mb-6 text-xl font-semibold">Create your account</h2>

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-transparent bg-[#f6f7f8] px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-transparent bg-[#f6f7f8] px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-transparent bg-[#f6f7f8] px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#2b8cee]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="pt-2">
                <div className="flex h-1.5 w-full gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${i < strength.bars ? strength.color : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className={`text-[10px] font-medium uppercase tracking-wider ${strength.textColor}`}>
                    {strength.label}
                  </p>
                  <p className="text-[10px] text-slate-400">Min. 8 characters</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-transparent bg-[#f6f7f8] px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-[#2b8cee] focus:ring-2 focus:ring-[#2b8cee]/20"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-[#2b8cee] py-3 font-semibold text-white shadow-lg shadow-[#2b8cee]/25 transition-all duration-200 hover:bg-[#2b8cee]/90 disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Get Started"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
            By signing up, you agree to our{" "}
            <Link className="text-[#2b8cee] hover:underline" to="/terms">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="text-[#2b8cee] hover:underline" to="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            className="font-semibold text-[#2b8cee] underline decoration-2 underline-offset-4 hover:opacity-90"
            to="/login"
          >
            Log in
          </Link>
        </p>
      </div>

      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 overflow-hidden opacity-10">
        <svg className="h-[600px] w-[600px] text-[#2b8cee]" fill="currentColor" viewBox="0 0 100 100">
          <rect x="10" y="10" width="30" height="30" rx="4" />
          <rect x="50" y="10" width="40" height="20" rx="4" />
          <rect x="10" y="50" width="20" height="40" rx="4" />
          <rect x="40" y="40" width="50" height="50" rx="4" />
        </svg>
      </div>
    </div>
  );
}
