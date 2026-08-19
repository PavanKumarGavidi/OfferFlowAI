import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Eye, Mail, Pencil, Search, Send, Trash2, UserPlus, Users } from "lucide-react";
import type { Candidate, CandidateStatus } from "../lib/types";
import { fmtDate, fmtINR, portalLink, STATUS_META } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Button, EmptyState, Input, Modal, Progress, Select, StatusBadge } from "../components/ui";
import CandidateDrawer, { CandidateFormModal } from "../components/CandidateDrawer";

const ALL_STATUSES = Object.keys(STATUS_META) as CandidateStatus[];

export default function Candidates() {
  const { myCandidates, user, sendOnboarding, deleteCandidate, toast } = useStore();
  const nav = useNavigate();
  const params = useParams();
  const [search, setSearch] = useSearchParams();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(search.get("new") === "1");
  const [editTarget, setEditTarget] = useState<Candidate | null>(null);
  const [delTarget, setDelTarget] = useState<Candidate | null>(null);

  const openId = params.id ?? null;

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return [...myCandidates]
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) => !query || [c.name, c.email, c.position, c.department].some((v) => v.toLowerCase().includes(query)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [myCandidates, q, status]);

  const isHR = user?.role === "hr" || user?.role === "company_admin";

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, position…" className="!pl-10" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[200px]">
          <option value="all">All statuses ({myCandidates.length})</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label} ({myCandidates.filter((c) => c.status === s).length})</option>
          ))}
        </Select>
        <span className="flex-1" />
        {isHR && <Button icon={<UserPlus size={16} />} onClick={() => setAddOpen(true)}>Add Candidate</Button>}
      </div>

      {list.length === 0 ? (
        <div className="panel !rounded-xl">
          <EmptyState
            icon={<Users size={24} />}
            title={myCandidates.length === 0 ? "No candidates yet" : "No candidates match your filters"}
            body={myCandidates.length === 0 ? "Add a selected candidate and OfferFlow will handle everything from the secure onboarding link to the offer letter." : "Try a different search term or status."}
            action={myCandidates.length === 0 && isHR ? <Button icon={<UserPlus size={15} />} onClick={() => setAddOpen(true)}>Add your first candidate</Button> : undefined}
          />
        </div>
      ) : (
        <div className="panel !rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="border-b border-ink-900/8 dark:border-white/8 bg-ink-50/70 dark:bg-ink-925/70">
                  {["Candidate", "Position", "Joining", "Salary", "Profile", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-ink-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5 dark:divide-white/5">
                {list.map((c) => {
                  const pct = Math.round((c.docs.filter((d) => d.status === "uploaded").length / 8) * 50 + (c.submittedAt ? 50 : (c.status === "registration_pending" ? 0 : 25)));
                  return (
                    <tr key={c.id} className="group hover:bg-cobalt-500/4 dark:hover:bg-cobalt-500/6 transition-colors cursor-pointer" onClick={() => nav(`/app/candidates/${c.id}`)}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} size={36} />
                          <div>
                            <p className="text-[13.5px] font-bold text-ink-900 dark:text-white group-hover:text-cobalt-700 dark:group-hover:text-cobalt-300 transition-colors">{c.name}</p>
                            <p className="text-[11.5px] text-ink-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-semibold text-ink-700 dark:text-ink-200">{c.position}</p>
                        <p className="text-[11.5px] text-ink-400">{c.department}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-ink-600 dark:text-ink-300 whitespace-nowrap">{fmtDate(c.joiningDate)}</td>
                      <td className="px-4 py-3.5 text-[13px] font-semibold text-ink-700 dark:text-ink-200 whitespace-nowrap">{fmtINR(c.salary)}</td>
                      <td className="px-4 py-3.5 w-[130px]"><Progress value={pct} label barClass={pct === 100 ? "bg-emerald-500" : "bg-cobalt-500"} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button title="View" onClick={() => nav(`/app/candidates/${c.id}`)} className="p-2 rounded-lg text-ink-400 hover:text-cobalt-600 hover:bg-cobalt-500/10 transition-colors"><Eye size={15} /></button>
                          {isHR && ["registration_pending", "changes_requested", "information_submitted"].includes(c.status) && (
                            <button title="Send / resend onboarding link" onClick={() => { sendOnboarding(c.id); toast("Link ready", "info", portalLink(c.token)); }} className="p-2 rounded-lg text-ink-400 hover:text-cobalt-600 hover:bg-cobalt-500/10 transition-colors"><Send size={15} /></button>
                          )}
                          {isHR && <button title="Edit" onClick={() => setEditTarget(c)} className="p-2 rounded-lg text-ink-400 hover:text-cobalt-600 hover:bg-cobalt-500/10 transition-colors"><Pencil size={15} /></button>}
                          {isHR && <button title="Delete" onClick={() => setDelTarget(c)} className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"><Trash2 size={15} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[12px] text-ink-400 flex items-center gap-1.5"><Mail size={13} /> Sending a link emails the candidate a private, token-scoped onboarding portal.</p>

      <CandidateFormModal open={addOpen} onClose={() => { setAddOpen(false); if (search.get("new")) { setSearch({}, { replace: true }); } }} />
      <CandidateFormModal open={!!editTarget} onClose={() => setEditTarget(null)} candidate={editTarget} />
      <CandidateDrawer candidateId={openId} onClose={() => nav("/app/candidates")} />

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Delete candidate?" width="max-w-md"
        footer={<>
          <Button variant="ghost" onClick={() => setDelTarget(null)}>Cancel</Button>
          <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => { if (delTarget) deleteCandidate(delTarget.id); setDelTarget(null); }}>Delete</Button>
        </>}>
        <p className="text-[14px] text-ink-600 dark:text-ink-300">This permanently removes <span className="font-bold text-ink-900 dark:text-white">{delTarget?.name}</span> and all their documents.</p>
      </Modal>
    </div>
  );
}
