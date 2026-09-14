"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { useHydrated } from "@/lib/useHydrated";
import { api } from "@/lib/apiClient";

interface NavItem { href: string; label: string; icon: string; perm?: string; superOnly?: boolean; }
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", perm: "orders.view" },
  { href: "/orders", label: "Manage Orders", icon: "📦", perm: "orders.view" },
  { href: "/settings#dealers", label: "Dealer Management", icon: "🏪", superOnly: true },
  { href: "/reports", label: "Reports", icon: "📈", perm: "reports.view" },
  { href: "/reports/sales", label: "Sales Report", icon: "💰", perm: "reports.view" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout, can } = useAuth();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => { setDark(localStorage.getItem("crm-dark-mode") === "true"); }, []);

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    if (fields.get("newPassword") !== fields.get("confirmPassword")) {
      setPasswordMessage("New passwords do not match");
      return;
    }
    setPasswordBusy(true);
    setPasswordMessage("");
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: fields.get("currentPassword"),
        newPassword: fields.get("newPassword"),
      });
      setPasswordOpen(false);
      logout();
      router.replace("/login");
    } catch (err: any) {
      setPasswordMessage(err.message || "Password change failed");
    } finally {
      setPasswordBusy(false);
    }
  }

  useEffect(() => { if (hydrated && !token) router.replace("/login"); }, [hydrated, token, router]);
  useEffect(() => { setOpen(false); }, [pathname]);

  if (!hydrated) return null;
  if (!token || !user) return null;

  // Super Admin must always see the complete owner menu. Other roles still follow permissions.
  const visible = NAV.filter((n) => {
    if (user.role === "SUPER_ADMIN") return true;
    if (n.superOnly) return false;
    return !n.perm || can(n.perm);
  });

  return (
    <div className={"h-screen flex bg-[#EEF2F7] overflow-hidden " + (dark ? "crm-dark" : "")}>
      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}

      <aside className={
        "w-72 shrink-0 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex flex-col overflow-hidden " +
        "fixed md:static inset-y-0 left-0 z-40 shadow-2xl md:shadow-none transition-transform duration-200 md:translate-x-0 " +
        (open ? "translate-x-0" : "-translate-x-full")
      }>
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="font-extrabold text-xl leading-tight text-white whitespace-nowrap">Amrit Ayurveda</div>
            <div className="text-xs text-emerald-300 mt-1">CRM - Pure Ayurveda</div>
          </div>
          <button className="md:hidden text-slate-300 hover:text-white ml-3" onClick={() => setOpen(false)} aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto overscroll-contain">
          {visible.map((n) => {
            const active = !n.href.includes("#") && pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition relative whitespace-nowrap " +
                  (active ? "bg-white/12 text-white shadow-sm" : "text-slate-200 hover:bg-white/8 hover:text-white")
                }
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r bg-emerald-400" />}
                <span className="text-xl w-6 text-center shrink-0">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 shrink-0 bg-slate-900/30">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500 text-white grid place-items-center font-bold shrink-0">
              {(user.name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <div className="text-[11px] text-emerald-300">{user.role}</div>
            </div>
          </div>

          <button
            className="w-full mb-2 rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-left transition"
            onClick={() => { setPasswordMessage(""); setPasswordOpen(true); }}
          >
            🔐 Change Password
          </button>
          <button
            className="w-full rounded-xl bg-white/5 hover:bg-red-500/20 text-red-300 hover:text-red-200 px-4 py-2.5 text-sm font-medium text-left transition"
            onClick={() => { logout(); router.replace("/login"); }}
          >
            ↪ Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0 overscroll-contain">
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 shadow-md">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-white p-1">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <span className="font-bold">Amrit Ayurveda</span>
        </div>
        {children}
      </main>

      {passwordOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="password-title">
          <form onSubmit={changePassword} className="card p-5 w-full max-w-md space-y-4">
            <h2 id="password-title" className="text-lg font-bold">Change Password</h2>
            <p className="text-sm">Enter your current password. After saving, sign in with your new password.</p>
            <label className="block">Current password<input autoFocus required name="currentPassword" type="password" autoComplete="current-password" className="input" /></label>
            <label className="block">New password<input required minLength={10} maxLength={72} name="newPassword" type="password" autoComplete="new-password" className="input" /></label>
            <label className="block">Confirm new password<input required minLength={10} maxLength={72} name="confirmPassword" type="password" autoComplete="new-password" className="input" /></label>
            {passwordMessage && <p role="alert" className="text-red-600">{passwordMessage}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" disabled={passwordBusy} onClick={() => setPasswordOpen(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={passwordBusy}>{passwordBusy ? "Saving..." : "Save password"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
