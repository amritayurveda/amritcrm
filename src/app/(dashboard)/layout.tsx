"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { useHydrated } from "@/lib/useHydrated";
import { api } from "@/lib/apiClient";

interface NavItem {
  href?: string;
  label: string;
  icon: string;
  perm?: string;
  superOnly?: boolean;
  popup?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", perm: "orders.view" },
  { href: "/orders", label: "Manage Orders", icon: "📦", perm: "orders.view" },
  { href: "/reports", label: "Reports", icon: "📈", perm: "reports.view" },
  { href: "/reports/sales", label: "Sales Report", icon: "💰", perm: "reports.view" },
  { href: "/incentive", label: "Incentive", icon: "🏆" },
  { href: "/courier-performance", label: "Courier Performance", icon: "🚚" },
  { href: "/call-monitoring", label: "Call Monitoring", icon: "📞" },
  { href: "/users", label: "Users & Access", icon: "👤", superOnly: true },
  { href: "/settings", label: "Settings", icon: "⚙️", superOnly: true },
  { href: "/system", label: "System Health", icon: "🩺", superOnly: true },
  { href: "/audit", label: "Audit Logs", icon: "📜", superOnly: true },
  { href: "/shiprocket", label: "Shiprocket", icon: "🚚", superOnly: true },
  { href: "/india-post", label: "India Post", icon: "📮", superOnly: true },
];

const DEALER_NAV: NavItem[] = [
  { href: "/settings#dealers", label: "Manage Dealer", icon: "🏪", superOnly: true },
  { href: "/dealer/payment-ledger", label: "Payment Ledger", icon: "🧾", superOnly: true },
  { href: "/dealer/cumulative-report", label: "Dealer Cumulative Report", icon: "📈", superOnly: true },
  { href: "/dealer/invoices", label: "Manage Invoice", icon: "📄", superOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout, can } = useAuth();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(true);
  const [dealerOpen, setDealerOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [modulePopup, setModulePopup] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => { setDark(localStorage.getItem("crm-dark-mode") === "true"); }, []);

  function toggleDarkMode() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("crm-dark-mode", String(next));
  }

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

  if (!hydrated) return null;
  if (!token || !user) return null;

  const isVisible = (n: NavItem) => {
    if (user.role === "SUPER_ADMIN") return true;
    if (n.superOnly) return false;
    return !n.perm || can(n.perm);
  };

  const visible = NAV.filter(isVisible);
  const visibleDealer = DEALER_NAV.filter(isVisible);

  const itemClass = (active = false, nested = false) =>
    "flex w-full items-center gap-3 rounded-xl text-left font-semibold transition relative whitespace-nowrap " +
    (nested ? "px-4 py-2.5 text-[13px] " : "px-4 py-3 text-[15px] ") +
    (active ? "bg-white/12 text-white shadow-sm" : "text-slate-200 hover:bg-white/8 hover:text-white");

  const renderItem = (n: NavItem, nested = false) => {
    const active = !!n.href && !n.href.includes("#") && pathname === n.href;
    const content = (
      <>
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r bg-emerald-400" />}
        <span className={nested ? "text-base w-5 text-center shrink-0" : "text-xl w-6 text-center shrink-0"}>{n.icon}</span>
        <span className="truncate">{n.label}</span>
      </>
    );

    if (n.href) {
      return (
        <Link key={n.label} href={n.href} className={itemClass(active, nested)} onClick={() => setOpen(false)}>
          {content}
        </Link>
      );
    }

    return (
      <button key={n.label} type="button" className={itemClass(false, nested)} onClick={() => setModulePopup(n.label)}>
        {content}
      </button>
    );
  };

  return (
    <div className={"h-screen flex bg-[#EEF2F7] overflow-hidden " + (dark ? "crm-dark" : "")}>
      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}

      <aside className={
        "w-72 shrink-0 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex flex-col overflow-hidden " +
        "fixed md:static inset-y-0 left-0 z-40 shadow-2xl md:shadow-none transition-transform duration-200 md:translate-x-0 " +
        (open ? "translate-x-0" : "-translate-x-full")
      }>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="font-extrabold text-lg leading-tight text-white whitespace-nowrap">Amrit Ayurveda</div>
            <div className="text-[11px] text-emerald-300 mt-1">CRM - Pure Ayurveda</div>
          </div>
          <button className="md:hidden text-slate-300 hover:text-white ml-3" onClick={() => setOpen(false)} aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto overscroll-contain">
          {renderItem(visible[0])}
          {renderItem(visible[1])}

          {visibleDealer.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setDealerOpen((v) => !v)}
                className={itemClass(pathname.startsWith("/dealer") || pathname === "/settings", false)}
              >
                <span className="text-xl w-6 text-center shrink-0">🏪</span>
                <span className="flex-1 text-left">Dealer Management</span>
                <span className={"text-xs transition-transform " + (dealerOpen ? "rotate-180" : "")}>⌄</span>
              </button>
              {dealerOpen && (
                <div className="ml-4 pl-2 border-l border-white/10 mt-1 space-y-1">
                  {visibleDealer.map((n) => renderItem(n, true))}
                </div>
              )}
            </div>
          )}

          {visible.slice(2).map((n) => renderItem(n))}
        </nav>

        <div className="border-t border-white/10 p-3 shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-emerald-500 text-white grid place-items-center font-bold shrink-0">
              {(user.name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-emerald-300">{user.role}</div>
            </div>
          </div>

          <button type="button" className="w-full mb-2 rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-left transition" onClick={toggleDarkMode}>
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button className="w-full mb-2 rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-left transition" onClick={() => { setPasswordMessage(""); setPasswordOpen(true); }}>
            🔐 Change Password
          </button>
          <button className="w-full rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300 hover:text-red-200 px-4 py-2 text-sm font-medium text-left transition" onClick={() => { logout(); router.replace("/login"); }}>
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

      {modulePopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="card p-5 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold">{modulePopup}</h2>
            <p className="text-sm text-slate-600">This option has been added to the CRM sidebar. Its dedicated module can be connected here without changing the rest of the CRM.</p>
            <div className="flex justify-end"><button type="button" className="btn btn-primary" onClick={() => setModulePopup(null)}>OK</button></div>
          </div>
        </div>
      )}

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
