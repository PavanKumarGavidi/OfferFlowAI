import { useMemo, useState } from "react";
import { CheckCircle2, Eye, FileText, Mail, Send, XCircle } from "lucide-react";
import type { Candidate } from "../lib/types";
import { fmtDate, fmtINR } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Button, EmptyState, OfferStatusBadge } from "../components/ui";
import { OfferEmailModal, OfferLetterModal, OfferTrack } from "../components/OfferLetter";

export default function Offers() {
  const { myCandidates, resendOfferEmail } = useStore();
  const [letterFor, setLetterFor] = useState<Candidate | null>(null);
  const [emailFor, setEmailFor] = useState<Candidate | null>(null);

  const withOffers = useMemo(
    () => myCandidates.filter((c) => c.offer).sort((a, b) => (b.offer?.generatedAt ?? "").localeCompare(a.offer?.generatedAt ?? "")),
    [myCandidates]
  );

  const by = (s: string) => withOffers.filter((c) => c.offer?.status === s).length;
  const chips = [
    { label: "Generated", v: withOffers.length, cls: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-indigo-500/25" },
    { label: "Sent", v: by("sent"), cls: "bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 ring-cobalt-500/25" },
    { label: "Viewed", v: by("viewed"), cls: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/25" },
    { label: "Accepted", v: by("accepted"), cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25" },
    { label: "Rejected", v: by("rejected"), cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25" },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-[22px] text-ink-900 dark:text-white tracking-tight">Offer Letters</h2>
          <p className="text-[13.5px] text-ink-400 mt-0.5">Every offer is generated automatically from your template the moment a manager approves.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c.label} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ring-1 ring-inset ${c.cls}`}>{c.v} {c.label}</span>
          ))}
        </div>
      </div>

      {withOffers.length === 0 ? (
        <div className="panel !rounded-xl">
          <EmptyState icon={<FileText size={24} />} title="No offer letters yet" body="Approve a candidate in Review & Approvals — the offer letter generates and emails itself." />
        </div>
      ) : (
        <div className="space-y-3">
          {withOffers.map((c) => (
            <div key={c.id} className="panel !rounded-xl p-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3.5 lg:w-[280px] min-w-0">
                <Avatar name={c.name} size={42} />
                <div className="min-w-0">
                  <p className="text-[14.5px] font-bold text-ink-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-[12px] text-ink-400 truncate">{c.position} · {c.department}</p>
                </div>
              </div>
              <div className="lg:w-[150px]">
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-400">Offer</p>
                <p className="text-[13.5px] font-bold text-ink-800 dark:text-ink-100">{c.offer?.number}</p>
                <p className="text-[11.5px] text-ink-400">{fmtDate(c.offer?.generatedAt)}</p>
              </div>
              <div className="lg:w-[130px]">
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-400">Salary</p>
                <p className="text-[13.5px] font-bold text-ink-800 dark:text-ink-100">{fmtINR(c.salary)}</p>
                <p className="text-[11.5px] text-ink-400">joins {fmtDate(c.joiningDate)}</p>
              </div>
              <div className="flex-1 min-w-[240px]">
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-400 mb-1.5">Tracking</p>
                {c.offer && <OfferTrack offer={c.offer} />}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.offer && <OfferStatusBadge status={c.offer.status} />}
                <Button size="sm" variant="outline" icon={<Eye size={14} />} onClick={() => setLetterFor(c)}>Letter</Button>
                <Button size="sm" variant="outline" icon={<Mail size={14} />} onClick={() => setEmailFor(c)}>Email</Button>
                {c.offer && ["sent", "viewed"].includes(c.offer.status) && (
                  <Button size="sm" variant="ghost" icon={<Send size={14} />} onClick={() => resendOfferEmail(c.id)}>Resend</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel !rounded-xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-ink-500 dark:text-ink-300">
        <span className="inline-flex items-center gap-1.5 font-semibold"><CheckCircle2 size={14} className="text-emerald-500" /> PDF stored securely per tenant</span>
        <span className="inline-flex items-center gap-1.5 font-semibold"><Mail size={14} className="text-cobalt-500" /> Emailed automatically after approval</span>
        <span className="inline-flex items-center gap-1.5 font-semibold"><XCircle size={14} className="text-rose-500" /> Candidate can accept or reject from their portal</span>
      </div>

      <OfferLetterModal candidate={letterFor} open={!!letterFor} onClose={() => setLetterFor(null)} />
      <OfferEmailModal candidate={emailFor} open={!!emailFor} onClose={() => setEmailFor(null)} onViewLetter={() => { setLetterFor(emailFor); setEmailFor(null); }} />
    </div>
  );
}
