import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle, Clock, FileCheck2, FileText, Mail, Send, Stamp, UserPlus, Users, XCircle } from "lucide-react";
import type { CandidateStatus } from "../lib/types";
import { fmtDate, fmtINR, PIPELINE_STAGES, STATUS_META } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Button, EmptyState, Progress, StatusBadge } from "../components/ui";

export default function Dashboard() {
  const { myCandidates, user, company } = useStore();
  const nav = useNavigate();

  const count = (...s: CandidateStatus[]) => myCandidates.filter((c) => s.includes(c.status)).length;

  const stats = useMemo(() => ([
    { label: "Total Candidates", value: myCandidates.length, icon: Users, cls: "bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300", sub: "in this workspace" },
    { label: "Pending Registration", value: count("registration_pending"), icon: Clock, cls: "bg-slate-500/10 text-slate-600 dark:text-slate-300", sub: "links sent, not started" },
    { label: "Information Submitted", value: count("information_submitted"), icon: FileCheck2, cls: "bg-sky-500/10 text-sky-600 dark:text-sky-300", sub: "filling their forms" },
    { label: "Pending HR Review", value: count("hr_review"), icon: FileText, cls: "bg-amber-500/12 text-amber-600 dark:text-amber-300", sub: "waiting on you", action: "/app/approvals" },
    { label: "Pending Approval", value: count("approval_pending"), icon: Stamp, cls: "bg-purple-500/10 text-purple-600 dark:text-purple-300", sub: "with HR Manager", action: "/app/approvals" },
    { label: "Offers Generated", value: myCandidates.filter((c) => c.offer).length, icon: FileText, cls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300", sub: "auto-generated PDFs" },
    { label: "Offers Sent", value: count("offer_sent", "offer_viewed"), icon: Send, cls: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300", sub: "awaiting response" },
    { label: "Offers Accepted", value: count("accepted"), icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", sub: "ready to join" },
    { label: "Offers Rejected", value: count("rejected"), icon: XCircle, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-300", sub: "declined or rejected" },
  ]), [myCandidates]);

  const maxStage = Math.max(1, ...PIPELINE_STAGES.map((s) => count(...s.statuses)));
  const recent = useMemo(() => [...myCandidates].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), [myCandidates]);

  const docsPending = myCandidates.filter((c) => ["information_submitted", "registration_pending", "changes_requested"].includes(c.status) && c.docs.some((d) => d.status !== "uploaded"));
  const reviewPending = myCandidates.filter((c) => c.status === "hr_review");
  const approvalPending = myCandidates.filter((c) => c.status === "approval_pending");

  const offersTotal = myCandidates.filter((c) => c.offer).reduce((a, c) => a + c.salary, 0);

  const tasks = [
    { label: "Candidate documents pending", count: docsPending.length, icon: AlertCircle, cls: "text-orange-500", names: docsPending.slice(0, 3).map((c) => c.name), to: "/app/documents" },
    { label: "HR reviews pending", count: reviewPending.length, icon: FileText, cls: "text-amber-500", names: reviewPending.slice(0, 3).map((c) => c.name), to: "/app/approvals" },
    { label: "Manager approvals pending", count: approvalPending.length, icon: Stamp, cls: "text-purple-500", names: approvalPending.slice(0, 3).map((c) => c.name), to: "/app/approvals" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-cobalt-600 dark:text-cobalt-300">Good to see you, {user?.name.split(" ")[0]} 👋</p>
          <h2 className="font-display font-bold text-[26px] tracking-tight text-ink-900 dark:text-white mt-1">
            {company?.name} — hiring pipeline
          </h2>
          <p className="text-[13.5px] text-ink-500 dark:text-ink-400 mt-1">
            {myCandidates.filter((c) => c.offer).length} offers generated · {fmtINR(offersTotal)} total offer value · everything after selection, automated.
          </p>
        </div>
        {(user?.role === "hr" || user?.role === "company_admin") && (
          <Button icon={<UserPlus size={16} />} onClick={() => nav("/app/candidates?new=1")}>Add Candidate</Button>
        )}
      </div>

      {/* Stat grid — 9 tiles, first spans 2 on xl for rhythm */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {stats.map((s, i) => (
          <button key={s.label} onClick={() => s.action && nav(s.action)}
            className={`panel !rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${s.action ? "cursor-pointer ring-amber-400/40" : "cursor-default"} ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}
            style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center justify-between">
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.cls}`}><s.icon size={17} /></span>
              {s.value > 0 && s.action && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
            <p className="font-display font-bold text-[28px] leading-none text-ink-900 dark:text-white mt-3 tabular-nums">{s.value}</p>
            <p className="text-[12.5px] font-semibold text-ink-600 dark:text-ink-300 mt-1.5">{s.label}</p>
            <p className="text-[11.5px] text-ink-400">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Pipeline */}
        <div className="lg:col-span-3 panel !rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-[16px] text-ink-900 dark:text-white">Candidate Pipeline</h3>
              <p className="text-[12.5px] text-ink-400 mt-0.5">Selection → onboarding → approval → offer</p>
            </div>
            <button onClick={() => nav("/app/candidates")} className="text-[12.5px] font-bold text-cobalt-600 dark:text-cobalt-300 inline-flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight size={13} /></button>
          </div>
          <div className="space-y-3.5">
            {PIPELINE_STAGES.map((s, i) => {
              const n = count(...s.statuses);
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-5 text-[11px] font-bold text-ink-300 dark:text-ink-500 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px] font-semibold text-ink-700 dark:text-ink-200 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STATUS_META[s.statuses[0]].dot}`} />
                        {s.label}
                      </p>
                      <span className="text-[12.5px] font-bold tabular-nums text-ink-500 dark:text-ink-300">{n}</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink-900/6 dark:bg-white/8 overflow-hidden">
                      <div className={`h-full rounded-full origin-left animate-grow-x ${STATUS_META[s.statuses[0]].dot}`} style={{ width: `${(n / maxStage) * 100}%`, animationDelay: `${i * 90}ms` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-ink-900/6 dark:border-white/6 flex items-center gap-2 text-[12px] text-ink-400">
            <CheckCircle2 size={14} className="text-emerald-500" />
            {myCandidates.length > 0 ? `${Math.round((count("accepted") / myCandidates.length) * 100)}% of candidates convert to accepted offers.` : "Add candidates to see conversion."}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {/* Pending tasks */}
          <div className="panel !rounded-xl p-5">
            <h3 className="font-display font-bold text-[16px] text-ink-900 dark:text-white mb-4">Pending Tasks</h3>
            {tasks.every((t) => t.count === 0) ? (
              <EmptyState icon={<CheckCircle2 size={22} />} title="All clear" body="No pending reviews, approvals or missing documents." />
            ) : (
              <div className="space-y-2.5">
                {tasks.map((t) => (
                  <button key={t.label} onClick={() => nav(t.to)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/6 dark:ring-white/8 hover:ring-cobalt-400/50 transition-all text-left group">
                    <t.icon size={17} className={t.cls} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-ink-800 dark:text-ink-100">{t.label}</p>
                      <p className="text-[11.5px] text-ink-400 truncate">{t.count > 0 ? t.names.join(", ") : "None right now"}</p>
                    </div>
                    <span className={`text-[12px] font-bold px-2 py-1 rounded-lg ${t.count > 0 ? "bg-amber-400/15 text-amber-700 dark:text-amber-300" : "bg-ink-900/5 dark:bg-white/8 text-ink-400"}`}>{t.count}</span>
                    <ArrowRight size={14} className="text-ink-300 group-hover:text-cobalt-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent candidates */}
          <div className="panel !rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-[16px] text-ink-900 dark:text-white">Recent Candidates</h3>
              <button onClick={() => nav("/app/candidates")} className="text-[12.5px] font-bold text-cobalt-600 dark:text-cobalt-300 inline-flex items-center gap-1 hover:gap-2 transition-all">All <ArrowRight size={13} /></button>
            </div>
            {recent.length === 0 ? (
              <EmptyState title="No candidates yet" body="Add your first selected candidate to begin." />
            ) : (
              <div className="divide-y divide-ink-900/5 dark:divide-white/5">
                {recent.map((c) => (
                  <button key={c.id} onClick={() => nav(`/app/candidates/${c.id}`)} className="w-full flex items-center gap-3 py-2.5 text-left group">
                    <Avatar name={c.name} size={34} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-ink-900 dark:text-white truncate group-hover:text-cobalt-600 dark:group-hover:text-cobalt-300 transition-colors">{c.name}</p>
                      <p className="text-[11.5px] text-ink-400 truncate">{c.position} · joins {fmtDate(c.joiningDate)}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer activity strip */}
      <div className="panel !rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center"><Mail size={18} /></span>
            <div>
              <p className="font-display font-bold text-[15px] text-ink-900 dark:text-white">Automated email activity</p>
              <p className="text-[12.5px] text-ink-400">Every step emails the right person — no manual follow-ups.</p>
            </div>
          </div>
          <div className="flex-1" />
          {[
            { k: "Invites sent", v: myCandidates.length },
            { k: "Submissions", v: myCandidates.filter((c) => c.submittedAt).length },
            { k: "Offers emailed", v: myCandidates.filter((c) => c.offer?.sentAt).length },
            { k: "Accepted", v: count("accepted") },
          ].map((x) => (
            <div key={x.k} className="text-center">
              <p className="font-display font-bold text-[22px] text-ink-900 dark:text-white tabular-nums">{x.v}</p>
              <p className="text-[11.5px] font-semibold text-ink-400">{x.k}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
