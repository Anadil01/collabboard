import { Link, useLocation } from "react-router-dom";

const PAGE_CONTENT = {
  "/privacy": {
    title: "Privacy Policy",
    text: "We store only the account and collaboration data needed to run your workspace. Your data is never sold."
  },
  "/terms": {
    title: "Terms of Service",
    text: "Use CollabBoard responsibly. You own your content and can request account deletion at any time."
  },
  "/help": {
    title: "Help Center",
    text: "Need support? Start with setup, board usage, and collaboration docs. For urgent issues contact support@collabboard.dev."
  },
  "/docs": {
    title: "Documentation",
    text: "API, architecture, and deployment docs are included in the project README and docs directory."
  },
  "/shortcuts": {
    title: "Keyboard Shortcuts",
    text: "Use search to find tasks quickly, drag cards across lists, and open cards for detailed editing."
  }
};

export default function InfoPages() {
  const { pathname } = useLocation();
  const page = PAGE_CONTENT[pathname] || {
    title: "Information",
    text: "This page is available in CollabBoard."
  };

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-3xl font-bold text-slate-800">{page.title}</h1>
        <p className="mb-6 text-slate-600">{page.text}</p>
        <div className="flex gap-3">
          <Link to="/" className="rounded-lg bg-[#2b8cee] px-4 py-2 text-sm font-semibold text-white">
            Back to home
          </Link>
          <Link to="/dashboard" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
