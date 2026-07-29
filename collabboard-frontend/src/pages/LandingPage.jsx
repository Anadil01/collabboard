import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";


export default function LandingPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        hero.style.setProperty("--scrollY", `${window.scrollY}px`);
        rafId = null;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="scroll-smooth bg-[#f6f7f8] text-slate-900 antialiased selection:bg-[#2b8cee]/30">
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          transition: opacity 700ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .hero-orbit {
          transform: translate3d(0, calc(var(--scrollY, 0px) * 0.18), 0);
        }
        .hero-orbit-slow {
          transform: translate3d(0, calc(var(--scrollY, 0px) * 0.08), 0);
        }
        .hero-float {
          animation: float 8s ease-in-out infinite;
        }
        .hero-float-delayed {
          animation: float 10s ease-in-out infinite;
          animation-delay: -2s;
        }
        .gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 14s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate3d(0, -6px, 0); }
          50% { transform: translate3d(0, 8px, 0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <nav className="sticky top-0 z-50 w-full border-b border-[#2b8cee]/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2b8cee]">
              <span className="text-white">▦</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CollabBoard</span>
          </Link>

          <div className="hidden items-center space-x-10 text-sm font-medium text-slate-600 md:flex">
            
            <Link className="transition-colors hover:text-[#2b8cee]" to="/pricing">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                <span className="hidden text-sm text-slate-600 md:inline">Hi, {user?.name || "Member"}</span>
                <Link className="px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-[#2b8cee]" to="/dashboard">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-[#2b8cee]" to="/login">
                  Login
                </Link>
                <Link className="rounded-lg bg-[#2b8cee] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2b8cee]/20 transition-all active:scale-95 hover:bg-[#2b8cee]/90" to="/signup">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative overflow-hidden px-6 pb-16 pt-20">
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[#2b8cee]/20 blur-3xl hero-orbit" />
        <div className="pointer-events-none absolute -bottom-24 left-[-5%] h-64 w-64 rounded-full bg-[#0ea5e9]/20 blur-3xl hero-orbit" />
        <div className="pointer-events-none absolute left-[5%] top-[10%] h-52 w-52 rounded-full bg-[#38bdf8]/20 blur-3xl hero-orbit-slow" />
        <div className="pointer-events-none absolute left-1/2 top-12 h-40 w-40 -translate-x-1/2 rounded-full border border-[#2b8cee]/30 hero-float" />
        <div className="pointer-events-none absolute left-[18%] top-24 h-24 w-24 rounded-2xl border border-[#2b8cee]/20 rotate-6 hero-float-delayed" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full bg-[#2b8cee]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2b8cee]" data-reveal style={{ transitionDelay: "80ms" }}>
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#2b8cee]" />
            v2.0 is now live
          </div>

          <h1 className="reveal mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-7xl" data-reveal style={{ transitionDelay: "160ms" }}>
            Collaborate in Real-Time, <span className="text-[#2b8cee]">Without the Noise.</span>
          </h1>

          <p className="reveal mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-600" data-reveal style={{ transitionDelay: "240ms" }}>
            The all-in-one workspace for teams to manage projects, documents, and workflows with Trello&#39;s
            simplicity and Notion&#39;s power.
          </p>

          <div className="reveal flex flex-col items-center justify-center gap-4 sm:flex-row" data-reveal style={{ transitionDelay: "320ms" }}>
            <Link className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b8cee] px-8 py-4 font-bold text-white shadow-xl shadow-[#2b8cee]/25 transition-all hover:shadow-[#2b8cee]/40 sm:w-auto" to={token ? "/dashboard" : "/signup"}>
              Start for Free <span>→</span>
            </Link>
            <a
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
              href="#features"
            >
              <span className="text-[#2b8cee]">▶</span> Watch Demo
            </a>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">
          <div className="reveal group relative overflow-hidden rounded-2xl bg-slate-200 p-2 shadow-2xl" data-reveal style={{ transitionDelay: "200ms" }}>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#2b8cee]/10 to-transparent" />
            <div className="overflow-hidden rounded-xl border border-white/20 bg-white">
              <div className="flex h-10 items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-4 h-6 w-64 rounded-md bg-slate-100" />
              </div>

              <div className="grid h-[500px] grid-cols-12 gap-6 p-6">
                <div className="col-span-3 space-y-6">
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-[#2b8cee]/20" />
                      <div className="h-3 w-20 rounded bg-slate-200" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-slate-100" />
                      <div className="h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>

                <div className="col-span-9 grid grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-500">To Do</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold">3</span>
                    </div>
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="h-2 w-full rounded bg-[#2b8cee]/20" />
                      <div className="h-3 w-3/4 rounded bg-slate-100" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2">
                          <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-300" />
                          <div className="h-6 w-6 rounded-full border-2 border-white bg-[#2b8cee]/40" />
                        </div>
                        <div className="h-3 w-8 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-500">In Progress</span>
                      <span className="rounded bg-[#2b8cee]/10 px-2 py-0.5 text-[10px] font-bold text-[#2b8cee]">1</span>
                    </div>
                    <div className="space-y-3 rounded-lg border-2 border-[#2b8cee]/40 bg-white p-4 shadow-sm">
                      <div className="h-2 w-full rounded bg-emerald-400/20" />
                      <div className="h-4 w-full rounded bg-slate-100" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">📎</span>
                        <div className="h-2 w-10 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 opacity-50">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-500">Done</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold">12</span>
                    </div>
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                      <span className="text-slate-300">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="reveal mb-10 text-center text-sm font-bold uppercase tracking-widest text-slate-400" data-reveal>
            Trusted by the world&#39;s most innovative teams
          </p>
          <div className="reveal flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale contrast-125" data-reveal>
            <div className="h-8 w-24 rounded-md bg-slate-400" />
            <div className="h-6 w-32 rounded-md bg-slate-400" />
            <div className="h-7 w-28 rounded-md bg-slate-400" />
            <div className="h-6 w-36 rounded-md bg-slate-400" />
            <div className="h-8 w-20 rounded-md bg-slate-400" />
          </div>
        </div>
      </div>

      <section className="bg-white px-6 py-24" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <h2 className="reveal mb-6 text-3xl font-extrabold text-slate-900 md:text-5xl" data-reveal>
              Designed for the way you work
            </h2>
            <p className="reveal text-lg text-slate-600" data-reveal>
              Everything you need to ship products faster and keep your team aligned.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="reveal group rounded-2xl bg-[#f6f7f8] p-8 transition-all duration-300 hover:bg-[#2b8cee]" data-reveal>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2b8cee]/10 transition-colors group-hover:bg-white/20">
                <span className="text-3xl text-[#2b8cee] group-hover:text-white">↻</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900 group-hover:text-white">Real-time Sync</h3>
              <p className="leading-relaxed text-slate-600 group-hover:text-white/80">
                Every cursor move and keystroke is synced instantly. No more refreshing or merge conflicts.
              </p>
            </div>

            <div className="reveal group rounded-2xl bg-[#f6f7f8] p-8 transition-all duration-300 hover:bg-[#2b8cee]" data-reveal>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2b8cee]/10 transition-colors group-hover:bg-white/20">
                <span className="text-3xl text-[#2b8cee] group-hover:text-white">▦</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900 group-hover:text-white">Modular Blocks</h3>
              <p className="leading-relaxed text-slate-600 group-hover:text-white/80">
                Mix and match boards, docs, and tables. Build the perfect workspace that fits your unique process.
              </p>
            </div>

            <div className="reveal group rounded-2xl bg-[#f6f7f8] p-8 transition-all duration-300 hover:bg-[#2b8cee]" data-reveal>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2b8cee]/10 transition-colors group-hover:bg-white/20">
                <span className="text-3xl text-[#2b8cee] group-hover:text-white">💬</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900 group-hover:text-white">Team Chat</h3>
              <p className="leading-relaxed text-slate-600 group-hover:text-white/80">
                Keep discussions where the work happens. Context-aware threads directly on tasks and documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-24" id="pricing">
        <div className="pointer-events-none absolute inset-0 bg-[#2b8cee]" />
        <div className="pointer-events-none absolute inset-0 gradient-shift bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-white/5 to-transparent" />
        <div className="reveal relative z-10 mx-auto max-w-5xl rounded-[2.5rem] border border-white/20 bg-white/10 p-12 text-center backdrop-blur-xl md:p-20" data-reveal>
          <h2 className="mb-8 text-4xl font-extrabold text-white md:text-6xl">Ready to transform how your team works?</h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-white/80">
            Join 10,000+ teams who are already building faster with CollabBoard.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link className="w-full rounded-xl bg-white px-10 py-5 text-lg font-bold text-[#2b8cee] shadow-2xl transition-transform hover:scale-105 sm:w-auto" to="/signup">
              Get Started for Free
            </Link>
            <a
              className="w-full rounded-xl border-2 border-white/40 bg-transparent px-10 py-5 text-center text-lg font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
              href="mailto:sales@collabboard.dev"
            >
              Contact Sales
            </a>
          </div>
          <p className="mt-8 text-sm font-medium text-white/60">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-20" id="resources">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mb-16 grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5" data-reveal>
            <div className="col-span-2 lg:col-span-2">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2b8cee]">
                  <span className="text-sm text-white">▦</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">CollabBoard</span>
              </div>
              <p className="mb-6 max-w-xs leading-relaxed text-slate-500">
                Making team collaboration seamless, beautiful, and incredibly fast. The future of work is collaborative.
              </p>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-[#2b8cee] hover:text-white">
                  🌐
                </div>
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-[#2b8cee] hover:text-white">
                  @
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-slate-900">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#features">Kanban Boards</a></li>
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#features">Shared Docs</a></li>
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#pricing">Time Tracking</a></li>
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#features">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-slate-900">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#resources">About Us</a></li>
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#enterprise">Careers</a></li>
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#resources">Blog</a></li>
                <li><a className="transition-colors hover:text-[#2b8cee]" href="#enterprise">Press</a></li>
              </ul>
            </div>

            <div id="enterprise">
              <h4 className="mb-6 font-bold text-slate-900">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link className="transition-colors hover:text-[#2b8cee]" to="/help">Help Center</Link></li>
                <li><Link className="transition-colors hover:text-[#2b8cee]" to="/docs">Security</Link></li>
                <li><Link className="transition-colors hover:text-[#2b8cee]" to="/contact">Contact </Link></li>
                <li><Link className="transition-colors hover:text-[#2b8cee]" to="/docs">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row">
            <p className="text-sm text-slate-400">© 2026 CollabBoard SaaS Inc. All rights reserved.</p>
            <div className="flex gap-8 text-sm text-slate-400">
              <Link className="hover:text-slate-600" to="/privacy">Privacy Policy</Link>
              <Link className="hover:text-slate-600" to="/terms">Terms of Service</Link>
              <Link className="hover:text-slate-600" to="/refunds">Refund Policy</Link>
              <Link className="hover:text-slate-600" to="/shipping">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
