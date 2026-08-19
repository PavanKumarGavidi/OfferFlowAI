import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Building2, CreditCard, FileText, HeartHandshake, LayoutDashboard, LogOut, Mail,
  Menu, Moon, RefreshCw, Settings, ShieldCheck, Sparkles, Stamp, Sun, Users, UsersRound, X, ChevronDown,
} from "lucide-react";
import type { Role } from "../lib/types";
import { timeAgo } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Badge, Logo, LogoMark, PlanBadge, RoleBadge } from "./ui";

export const NAV: { to: string; label: string; icon: typeof Bell; roles: Role[]; end?: boolean }[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["hr", "hr_manager", "company_admin"], end: true },
  { to: "/app/candidates", label: "Candidates", icon: Users, roles: ["hr", "company_admin"] },
  { to: "/app/documents", label: "Documents", icon: FileText, roles: ["hr", "company_admin"] },
  { to: "/app/approvals", label: "Review & Approvals", icon: Stamp, roles: ["hr", "hr_manager", "company_admin"] },
  { to: "/app/offers", label: "Offer Letters", icon: FileText, roles: ["hr", "hr_manager", "company_admin"] },
  { to: "/app/engagement", label: "Employee Engagement", icon: HeartHandshake, roles: ["hr", "hr_manager", "company_admin"] },
  { to: "/app/templates", label: "Email Templates", icon: Mail, roles: ["hr", "company_admin"] },
  { to: "/app/users", label: "Company Users", icon: UsersRound, roles: ["company_admin"] },
  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["company_admin"] },
  { to: "/app/billing", label: "Billing", icon: CreditCard, roles: ["company_admin"] },
  { to: "/app/admin", label: "Platform Admin", icon: ShieldCheck, roles: ["platform_admin"] },
];

const TITLES: [string, string][] = [
  ["/app/candidates", "Candidates"], ["/app/documents", "Documents"], ["/app/approvals", "Review & Approvals"],
  ["/app/offers", "Offer Letters"], ["/app/engagement", "Employee Engagement"], ["/app/templates", "Email Templates"],
  ["/app/users", "Company Users"], ["/app/settings", "Settings"], ["/app/billing", "Billing"], ["/app/admin", "Platform Admin"],
];

function useClickOutside(onOut: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOut(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onOut]);
  return ref;
}

const kindCls = { info: "bg-cobalt-500/12 text-cobalt-600 dark:text-cobalt-300", success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300", warning: "bg-amber-500/15 text-amber-600 dark:text-amber-300", danger: "bg-rose-500/12 text-rose-600 dark:text-rose-300" };

export default function Shell() {
  const { user, company, visibleNotifs, markNotifsRead, logout, dark, toggleTheme, resetDemo, db } = useStore();
  const [mobileNav, setMobileNav] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const bellRef = useClickOutside(() => setBellOpen(false));
  const userRef = useClickOutside(() => setUserOpen(false));

  useEffect(() => { setMobileNav(false); }, [loc.pathname]);

  const items = useMemo(() => NAV.filter((n) => user && n.roles.includes(user.role)), [user]);
  const unread = visibleNotifs.filter((n) => !n.read).length;
  const title = TITLES.find(([p]) => loc.pathname.startsWith(p))?.[1] ?? "Dashboard";

  const companyUsers = company ? db.users.filter((u) => u.companyId === company.id) : [];
  const pendingReview = company ? db.candidates.filter((c) => c.companyId === company.id && c.status === "hr_review").length : 0;
  const pendingApproval = company ? db.candidates.filter((c) => c.companyId === company.id && c.status === "approval_pending").length : 0;

  if (!user) return null;

  const SidebarInner = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center justify-between border-b border-ink-900/8 dark:border-white/8">
        <button onClick={() => nav("/app")}><Logo size={28} /></button>
        <button className="lg:hidden p-1.5 text-ink-400" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button>
      </div>

      {company && (
        <div className="mx-4 mt-4 px-3.5 py-3 rounded-xl bg-ink-900/4 dark:bg-white/5 ring-1 ring-ink-900/8 dark:ring-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-[13px]" style={{ background: company.logoColor }}>
              {company.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-ink-900 dark:text-white truncate">{company.name}</p>
              <PlanBadge plan={company.plan} />
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map((n) => {
          const count = n.to === "/app/approvals" ? (user.role === "hr_manager" ? pendingApproval : user.role === "company_admin" ? pendingReview + pendingApproval : pendingReview) : 0;
          return (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all duration-150 ${isActive ? "bg-cobalt-600 text-white shadow-sm shadow-cobalt-600/30" : "text-ink-500 dark:text-ink-300 hover:bg-ink-900/5 dark:hover:bg-white/6 hover:text-ink-900 dark:hover:text-white"}`}>
              <n.icon size={17} className="shrink-0" />
              <span className="flex-1">{n.label}</span>
              {count > 0 && <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/90 text-ink-950">{count}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-ink-900/8 dark:border-white/8">
        <div className="flex items-center gap-2.5 px-2">
          <Avatar name={user.name} size={34} color={user.color} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-ink-900 dark:text-white truncate">{user.name}</p>
            <p className="text-[11.5px] text-ink-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] flex-col bg-white dark:bg-ink-900 border-r border-ink-900/8 dark:border-white/8 z-40">
        {SidebarInner}
      </aside>

      {/* Mobile sidebar */}
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink-950/50 animate-fade-in" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-ink-900 shadow-2xl animate-fade-in">{SidebarInner}</aside>
        </div>
      )}

      <div className="lg:pl-[248px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md border-b border-ink-900/8 dark:border-white/8 flex items-center gap-3 px-4 sm:px-6">
          <button className="lg:hidden p-2 -ml-1 text-ink-500 hover:text-ink-900 dark:hover:text-white" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20} /></button>
          <h1 className="font-display font-bold text-[17px] text-ink-900 dark:text-white tracking-tight">{title}</h1>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-400/12 text-amber-700 dark:text-amber-300 text-[11.5px] font-bold ring-1 ring-inset ring-amber-400/30">
              <Sparkles size={12} /> Demo data
            </span>

            <button onClick={toggleTheme} className="p-2.5 rounded-lg text-ink-500 dark:text-ink-300 hover:bg-ink-900/6 dark:hover:bg-white/8 hover:text-ink-900 dark:hover:text-white transition-colors" aria-label="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative" ref={bellRef}>
              <button onClick={() => setBellOpen((v) => !v)} className="relative p-2.5 rounded-lg text-ink-500 dark:text-ink-300 hover:bg-ink-900/6 dark:hover:bg-white/8 hover:text-ink-900 dark:hover:text-white transition-colors" aria-label="Notifications">
                <Bell size={18} />
                {unread > 0 && <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-ink-900">{unread}</span>}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-[min(360px,calc(100vw-32px))] panel !rounded-xl overflow-hidden animate-slide-down shadow-xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-900/8 dark:border-white/8">
                    <p className="font-display font-bold text-[14px]">Notifications</p>
                    {unread > 0 && <button onClick={markNotifsRead} className="text-[12px] font-semibold text-cobalt-600 dark:text-cobalt-300 hover:underline">Mark all read</button>}
                  </div>
                  <div className="max-h-[340px] overflow-y-auto">
                    {visibleNotifs.length === 0 && <p className="px-4 py-8 text-center text-[13px] text-ink-400">You're all caught up.</p>}
                    {visibleNotifs.slice(0, 10).map((n) => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 border-b border-ink-900/5 dark:border-white/5 last:border-0 ${n.read ? "opacity-60" : ""}`}>
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${kindCls[n.kind]}`}><Bell size={14} /></span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-ink-900 dark:text-white flex items-center gap-2">{n.title}{!n.read && <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500" />}</p>
                          <p className="text-[12.5px] text-ink-500 dark:text-ink-400 leading-snug mt-0.5">{n.body}</p>
                          <p className="text-[11px] text-ink-400 mt-1">{timeAgo(n.at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userRef}>
              <button onClick={() => setUserOpen((v) => !v)} className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-ink-900/6 dark:hover:bg-white/8 transition-colors">
                <Avatar name={user.name} size={30} color={user.color} />
                <ChevronDown size={14} className="text-ink-400 hidden sm:block" />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-64 panel !rounded-xl overflow-hidden animate-slide-down shadow-xl">
                  <div className="px-4 py-3.5 border-b border-ink-900/8 dark:border-white/8">
                    <p className="text-[14px] font-bold text-ink-900 dark:text-white">{user.name}</p>
                    <p className="text-[12px] text-ink-400 mb-2">{user.email}</p>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="p-1.5">
                    {company && (
                      <p className="px-2.5 py-2 text-[12.5px] text-ink-500 dark:text-ink-300 flex items-center gap-2"><Building2 size={14} /> {company.name} · {companyUsers.length} user{companyUsers.length === 1 ? "" : "s"}</p>
                    )}
                    <button onClick={() => { setUserOpen(false); resetDemo(); nav("/auth"); }} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-ink-600 dark:text-ink-200 hover:bg-ink-900/5 dark:hover:bg-white/8 transition-colors">
                      <RefreshCw size={14} /> Reset demo data
                    </button>
                    <button onClick={() => { logout(); nav("/auth"); }} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/8 transition-colors">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1240px] w-full mx-auto">
          <Outlet />
        </main>

        <footer className="px-6 py-4 text-[12px] text-ink-400 border-t border-ink-900/6 dark:border-white/6 flex items-center gap-2">
          <LogoMark size={16} /> OfferFlow AI · Tenant-isolated demo workspace {company ? `· ${company.name}` : ""} · All data is sample data
        </footer>
      </div>
    </div>
  );
}
