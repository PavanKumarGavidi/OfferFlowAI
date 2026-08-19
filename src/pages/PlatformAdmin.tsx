import { useMemo } from "react";
import { Building2, FileText, ShieldCheck, UserCheck, Users, Zap } from "lucide-react";
import type { PlanId } from "../lib/types";
import { fmtDate } from "../lib/types";
import { useStore } from "../lib/store";
import { Badge, PlanBadge, Select } from "../components/ui";

export default function PlatformAdmin() {
  const { db, setCompanyActive, setCompanyPlan } = useStore();

  const stats = useMemo(() => {
    const offers = db.candidates.filter((c) => c.offer).length;
    return [
      { label: "Total Companies", v: db.companies.length, icon: Building2, cls: "bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300" },
      { label: "Active Companies", v: db.companies.filter((c) => c.active).length, icon: UserCheck, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
      { label: "Trial Companies", v: db.companies.filter((c) => c.trial).length, icon: Zap, cls: "bg-amber-500/12 text-amber-600 dark:text-amber-300" },
      { label: "Total Users", v: db.users.filter((u) => u.companyId).length, icon: Users, cls: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
      { label: "Total Candidates", v: db.candidates.length, icon: Users, cls: "bg-purple-500/10 text-purple-600 dark:text-purple-300" },
      { label: "Offers Generated", v: offers, icon: FileText, cls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" },
    ];
  }, [db]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-cobalt-600 dark:text-cobalt-300 inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Platform administration</p>
          <h2 className="font-display font-bold text-[24px] text-ink-900 dark:text-white tracking-tight mt-1">OfferFlow AI — global operations</h2>
          <p className="text-[13.5px] text-ink-400 mt-1">Every company is a strictly isolated tenant: candidates, documents, users and offers never cross workspace boundaries.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stats.map((s) => (
          <div key={s.label} className="panel !rounded-xl p-4">
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.cls}`}><s.icon size={17} /></span>
            <p className="font-display font-bold text-[26px] text-ink-900 dark:text-white mt-2.5 tabular-nums leading-none">{s.v}</p>
            <p className="text-[12px] font-semibold text-ink-500 dark:text-ink-300 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="panel !rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/8 dark:border-white/8 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-[15.5px]">Companies</h3>
            <p className="text-[12px] text-ink-400 mt-0.5">Manage subscriptions and workspace access.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[880px]">
            <thead>
              <tr className="border-b border-ink-900/8 dark:border-white/8 bg-ink-50/70 dark:bg-ink-925/70">
                {["Company", "Plan", "Users", "Candidates", "Offers", "Created", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-wider text-ink-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5 dark:divide-white/5">
              {db.companies.map((c) => {
                const users = db.users.filter((u) => u.companyId === c.id).length;
                const cands = db.candidates.filter((x) => x.companyId === c.id);
                const offers = cands.filter((x) => x.offer).length;
                return (
                  <tr key={c.id} className="hover:bg-ink-50/60 dark:hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-display font-bold text-[12.5px]" style={{ background: c.logoColor }}>
                          {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                        <div>
                          <p className="text-[13.5px] font-bold text-ink-900 dark:text-white">{c.name}</p>
                          <p className="text-[11.5px] text-ink-400">{c.website || c.contactEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Select value={c.plan} onChange={(e) => setCompanyPlan(c.id, e.target.value as PlanId)} className="!py-1.5 !text-[12.5px] w-[120px]">
                          <option value="starter">Starter</option>
                          <option value="business">Business</option>
                          <option value="enterprise">Enterprise</option>
                        </Select>
                        {c.trial && <Badge className="bg-amber-400/15 text-amber-700 dark:text-amber-300 ring-amber-400/30">Trial</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-ink-700 dark:text-ink-200 tabular-nums">{users}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-ink-700 dark:text-ink-200 tabular-nums">{cands.length}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-ink-700 dark:text-ink-200 tabular-nums">{offers}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-ink-400 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={c.active ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25" : "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25"}>
                        {c.active ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setCompanyActive(c.id, !c.active)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold ring-1 ring-inset transition-colors ${c.active ? "text-rose-600 dark:text-rose-400 ring-rose-500/30 hover:bg-rose-500/8" : "text-emerald-600 dark:text-emerald-300 ring-emerald-500/30 hover:bg-emerald-500/8"}`}>
                        {c.active ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel !rounded-xl p-5 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><ShieldCheck size={18} /></span>
          <div>
            <p className="font-display font-bold text-[15px]">Tenant isolation is enforced at the data layer</p>
            <p className="text-[12.5px] text-ink-400">Every query filters by workspace ID — Acme Technologies can never read Nova Solutions' data.</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex gap-6 text-center">
          <div><p className="font-display font-bold text-[20px] tabular-nums">{db.emails.length}</p><p className="text-[11.5px] font-semibold text-ink-400">emails sent</p></div>
          <div><p className="font-display font-bold text-[20px] tabular-nums">{db.audits.length}</p><p className="text-[11.5px] font-semibold text-ink-400">audit events</p></div>
          <div><p className="font-display font-bold text-[20px] tabular-nums">{db.notifications.length}</p><p className="text-[11.5px] font-semibold text-ink-400">notifications</p></div>
        </div>
      </div>
    </div>
  );
}
