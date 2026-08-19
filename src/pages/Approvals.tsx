import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileCheck2, FileText, ShieldCheck, Stamp, UserCheck } from "lucide-react";
import type { Candidate } from "../lib/types";
import { computeProgress, fmtDateTime, fmtINR } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, EmptyState, Progress, StatusBadge } from "../components/ui";
import CandidateDrawer from "../components/CandidateDrawer";

function QueueCard({ c, actionLabel, onOpen, icon }: { c: Candidate; actionLabel: string; onOpen: () => void; icon: React.ReactNode }) {
  const uploaded = c.docs.filter((d) => d.status === "uploaded").length;
  return (
    <div className="panel !rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Avatar name={c.name} size={44} />
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-ink-900 dark:text-white">{c.name}</p>
          <p className="text-[12.5px] text-ink-500 dark:text-ink-400">{c.position} · {c.department} · {fmtINR(c.salary)}/yr</p>
          <p className="text-[11.5px] text-ink-400 mt-0.5">Submitted {fmtDateTime(c.submittedAt ?? c.createdAt)} · {uploaded}/8 documents</p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:w-[240px]">
        <Progress value={computeProgress(c)} className="flex-1" barClass="bg-emerald-500" />
        <StatusBadge status={c.status} />
      </div>
      <button onClick={onOpen} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ink-900 dark:bg-white text-white dark:text-ink-925 text-[13.5px] font-bold hover:bg-ink-800 dark:hover:bg-ink-100 transition-colors shrink-0">
        {icon} {actionLabel} <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default function Approvals() {
  const { myCandidates, user } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  const hrQueue = useMemo(() => myCandidates.filter((c) => c.status === "hr_review").sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")), [myCandidates]);
  const mgrQueue = useMemo(() => myCandidates.filter((c) => c.status === "approval_pending").sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")), [myCandidates]);
  const changesPending = useMemo(() => myCandidates.filter((c) => c.status === "changes_requested"), [myCandidates]);

  const isHR = user?.role === "hr" || user?.role === "company_admin";
  const isMgr = user?.role === "hr_manager" || user?.role === "company_admin";

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Flow strip */}
      <div className="panel !rounded-xl p-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] font-semibold text-ink-500 dark:text-ink-300">
        <span className="inline-flex items-center gap-1.5"><FileCheck2 size={14} className="text-sky-500" /> Info submitted</span>
        <ArrowRight size={13} className="text-ink-300" />
        <span className={`inline-flex items-center gap-1.5 ${isHR ? "text-amber-600 dark:text-amber-300" : ""}`}><FileText size={14} className="text-amber-500" /> HR Review</span>
        <ArrowRight size={13} className="text-ink-300" />
        <span className={`inline-flex items-center gap-1.5 ${isMgr ? "text-purple-600 dark:text-purple-300" : ""}`}><UserCheck size={14} className="text-purple-500" /> Manager Approval</span>
        <ArrowRight size={13} className="text-ink-300" />
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Offer generated & emailed automatically</span>
      </div>

      {isHR && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-[19px] text-ink-900 dark:text-white tracking-tight">HR Review Queue</h2>
              <p className="text-[13px] text-ink-400 mt-0.5">Verify information & documents, then request changes or forward for approval.</p>
            </div>
            <span className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-400/15 text-amber-700 dark:text-amber-300">{hrQueue.length} pending</span>
          </div>
          {hrQueue.length === 0 ? (
            <div className="panel !rounded-xl"><EmptyState icon={<CheckCircle2 size={22} />} title="No submissions waiting" body="When a candidate submits their onboarding information, it lands here for review." /></div>
          ) : (
            hrQueue.map((c) => <QueueCard key={c.id} c={c} actionLabel="Review Submission" icon={<FileText size={15} />} onOpen={() => setOpenId(c.id)} />)
          )}
          {changesPending.length > 0 && (
            <div className="panel !rounded-xl p-4">
              <p className="text-[13px] font-bold text-ink-700 dark:text-ink-200 mb-2.5">Waiting on candidate re-submission ({changesPending.length})</p>
              <div className="flex flex-wrap gap-2">
                {changesPending.map((c) => (
                  <button key={c.id} onClick={() => setOpenId(c.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/8 ring-1 ring-orange-500/25 text-[12.5px] font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-500/15 transition-colors">
                    <Avatar name={c.name} size={22} /> {c.name} · {c.changeItems?.join(", ") || "updates requested"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {isMgr && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-[19px] text-ink-900 dark:text-white tracking-tight">Pending Manager Approvals</h2>
              <p className="text-[13px] text-ink-400 mt-0.5">Approving instantly generates the offer letter PDF and emails it to the candidate.</p>
            </div>
            <span className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg bg-purple-400/15 text-purple-700 dark:text-purple-300">{mgrQueue.length} pending</span>
          </div>
          {mgrQueue.length === 0 ? (
            <div className="panel !rounded-xl"><EmptyState icon={<Stamp size={22} />} title="Nothing to approve" body="HR-reviewed candidates appear here for your final approval." /></div>
          ) : (
            mgrQueue.map((c) => <QueueCard key={c.id} c={c} actionLabel="Review & Decide" icon={<Stamp size={15} />} onOpen={() => setOpenId(c.id)} />)
          )}
        </section>
      )}

      <CandidateDrawer candidateId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
