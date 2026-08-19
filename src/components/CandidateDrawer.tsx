import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, AlertCircle, Copy, Download, Eye, FileText, Mail, Pencil, Send, ShieldCheck,
  Stamp, ThumbsDown, Trash2, XCircle, Link2,
} from "lucide-react";
import type { Candidate } from "../lib/types";
import { computeProgress, DOC_META, fmtDate, fmtDateTime, fmtINR, isEmail, isPhone, portalLink } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Badge, Button, Drawer, EmptyState, Field, Input, Modal, Progress, StatusBadge, Tabs, Textarea, OfferStatusBadge } from "./ui";
import { OfferEmailModal, OfferLetterModal, OfferTrack } from "./OfferLetter";

// ─── Add / Edit candidate form ───────────────────────────────────────────────

export function CandidateFormModal({ open, onClose, candidate }: { open: boolean; onClose: () => void; candidate?: Candidate | null }) {
  const { addCandidate, updateCandidate } = useStore();
  const [f, setF] = useState({ name: "", email: "", phone: "", position: "", department: "", joiningDate: "", salary: "", reportingManager: "" });
  const [sendLink, setSendLink] = useState(true);
  const [errs, setErrs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrs({});
    setSendLink(true);
    setF(candidate
      ? { name: candidate.name, email: candidate.email, phone: candidate.phone, position: candidate.position, department: candidate.department, joiningDate: candidate.joiningDate, salary: String(candidate.salary), reportingManager: candidate.reportingManager }
      : { name: "", email: "", phone: "", position: "", department: "", joiningDate: "", salary: "", reportingManager: "" });
  }, [open, candidate]);

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = "Enter the candidate's full name.";
    if (!isEmail(f.email)) e.email = "Enter a valid email address.";
    if (!isPhone(f.phone)) e.phone = "Enter a 10-digit mobile number.";
    if (!f.position.trim()) e.position = "Position is required.";
    if (!f.department.trim()) e.department = "Department is required.";
    if (!f.joiningDate) e.joiningDate = "Select a joining date.";
    if (!f.salary || Number(f.salary) <= 0) e.salary = "Enter the annual salary.";
    if (!f.reportingManager.trim()) e.reportingManager = "Reporting manager is required.";
    setErrs(e);
    if (Object.keys(e).length) return;
    const data = { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), position: f.position.trim(), department: f.department.trim(), joiningDate: f.joiningDate, salary: Number(f.salary), reportingManager: f.reportingManager.trim() };
    if (candidate) updateCandidate(candidate.id, data);
    else addCandidate(data, sendLink);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={candidate ? "Edit Candidate" : "Add Candidate"} subtitle={candidate ? "Update the candidate's role details" : "Candidate already selected? Start their onboarding here."} width="max-w-2xl"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} icon={candidate ? <CheckCircle2 size={15} /> : <Send size={15} />}>{candidate ? "Save Changes" : sendLink ? "Add & Send Link" : "Add Candidate"}</Button>
      </>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" required error={errs.name}><Input value={f.name} invalid={!!errs.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Aarav Mehta" /></Field>
        <Field label="Email" required error={errs.email}><Input value={f.email} invalid={!!errs.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="candidate@email.com" /></Field>
        <Field label="Phone" required error={errs.phone}><Input value={f.phone} invalid={!!errs.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="10-digit mobile" /></Field>
        <Field label="Position" required error={errs.position}><Input value={f.position} invalid={!!errs.position} onChange={(e) => setF({ ...f, position: e.target.value })} placeholder="e.g. Frontend Engineer" /></Field>
        <Field label="Department" required error={errs.department}><Input value={f.department} invalid={!!errs.department} onChange={(e) => setF({ ...f, department: e.target.value })} placeholder="e.g. Engineering" /></Field>
        <Field label="Joining Date" required error={errs.joiningDate}><Input type="date" value={f.joiningDate} invalid={!!errs.joiningDate} onChange={(e) => setF({ ...f, joiningDate: e.target.value })} /></Field>
        <Field label="Annual Salary (₹)" required error={errs.salary}><Input type="number" value={f.salary} invalid={!!errs.salary} onChange={(e) => setF({ ...f, salary: e.target.value })} placeholder="e.g. 1200000" /></Field>
        <Field label="Reporting Manager" required error={errs.reportingManager}><Input value={f.reportingManager} invalid={!!errs.reportingManager} onChange={(e) => setF({ ...f, reportingManager: e.target.value })} placeholder="e.g. Nikhil Bansal" /></Field>
      </div>
      {!candidate && (
        <label className="mt-5 flex items-start gap-3 p-3.5 rounded-xl bg-cobalt-500/6 dark:bg-cobalt-500/10 ring-1 ring-cobalt-500/20 cursor-pointer">
          <input type="checkbox" checked={sendLink} onChange={(e) => setSendLink(e.target.checked)} className="mt-0.5 accent-[#2b4ed6] w-4 h-4" />
          <span>
            <span className="block text-[13.5px] font-bold text-ink-900 dark:text-white">Send secure onboarding link by email</span>
            <span className="block text-[12.5px] text-ink-500 dark:text-ink-300 mt-0.5">The candidate gets a private portal to fill their info and upload documents — no HR emails or sheets needed.</span>
          </span>
        </label>
      )}
    </Modal>
  );
}

// ─── Document preview ────────────────────────────────────────────────────────

export function DocPreviewModal({ doc, candidate, open, onClose }: { doc: Candidate["docs"][number] | null; candidate: Candidate | null; open: boolean; onClose: () => void }) {
  const { toast } = useStore();
  const meta = doc ? DOC_META.find((m) => m.type === doc.type) : null;
  if (!doc || !candidate) return null;
  return (
    <Modal open={open} onClose={onClose} title={meta?.label ?? "Document"} subtitle={`${candidate.name} · uploaded ${fmtDateTime(doc.uploadedAt)}`} width="max-w-xl"
      footer={<>
        <Button variant="outline" icon={<Download size={15} />} onClick={() => toast("Download started", "info", "In production this streams the original file from encrypted storage.")}>Download</Button>
        <Button onClick={onClose}>Done</Button>
      </>}>
      <div className="rounded-xl bg-ink-100/70 dark:bg-ink-925 ring-1 ring-ink-900/8 dark:ring-white/10 p-8 flex flex-col items-center text-center">
        <span className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4"><FileText size={30} /></span>
        <p className="font-display font-bold text-[16px] text-ink-900 dark:text-white">{doc.fileName}</p>
        <p className="text-[12.5px] text-ink-400 mt-1">{((doc.size ?? 0) / 1024).toFixed(0)} KB · {doc.fileName?.split(".").pop()?.toUpperCase()} · encrypted at rest</p>
        <div className="mt-5 w-full space-y-2">
          {[92, 78, 85, 60].map((w, i) => <div key={i} className="h-2.5 rounded-full bg-ink-300/40 dark:bg-white/8" style={{ width: `${w}%` }} />)}
        </div>
        <p className="mt-5 text-[12px] text-ink-400 inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> Only HR of {candidate.companyId === "c_acme" ? "Acme Technologies" : "the company"} can access this file.</p>
      </div>
    </Modal>
  );
}

// ─── Main drawer ─────────────────────────────────────────────────────────────

const histCls = { create: "bg-cobalt-500", info: "bg-sky-500", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-rose-500" };

export default function CandidateDrawer({ candidateId, onClose, initialTab }: { candidateId: string | null; onClose: () => void; initialTab?: string }) {
  const { db, user, sendOnboarding, deleteCandidate, requestChanges, submitForApproval, approveCandidate, rejectCandidate, resendOfferEmail, toast } = useStore();
  const candidate = useMemo(() => db.candidates.find((c) => c.id === candidateId) ?? null, [db.candidates, candidateId]);
  const [tab, setTab] = useState(initialTab ?? "overview");
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Candidate["docs"][number] | null>(null);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");

  useEffect(() => { setTab(initialTab ?? "overview"); setNote(""); setItems([]); setReason(""); }, [candidateId, initialTab]);

  if (!candidate || !user) return null;
  const isHR = user.role === "hr" || user.role === "company_admin";
  const isMgr = user.role === "hr_manager" || user.role === "company_admin";
  const progress = computeProgress(candidate);
  const link = portalLink(candidate.token);

  const infoRow = (label: string, value?: string) => (
    <div>
      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`text-[13.5px] font-medium mt-0.5 ${value ? "text-ink-900 dark:text-white" : "text-ink-400 italic"}`}>{value || "Not provided"}</p>
    </div>
  );

  return (
    <Drawer open={!!candidateId} onClose={onClose} width="max-w-3xl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/92 dark:bg-ink-900/92 backdrop-blur-md border-b border-ink-900/8 dark:border-white/8">
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-start gap-4">
            <Avatar name={candidate.name} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display font-bold text-[19px] text-ink-900 dark:text-white tracking-tight">{candidate.name}</h2>
                <StatusBadge status={candidate.status} />
              </div>
              <p className="text-[13.5px] text-ink-500 dark:text-ink-400 mt-0.5">{candidate.position} · {candidate.department} · joins {fmtDate(candidate.joiningDate)}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-ink-400 hover:bg-ink-900/6 dark:hover:bg-white/8 hover:text-ink-800 dark:hover:text-white" aria-label="Close"><XCircle size={20} /></button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Progress value={progress} className="flex-1" barClass={progress === 100 ? "bg-emerald-500" : "bg-cobalt-600"} />
            <span className="text-[12px] font-bold text-ink-500 dark:text-ink-300">Profile {progress}%</span>
          </div>

          <div className="mt-4">
            <Tabs
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "forms", label: "Information" },
                { id: "documents", label: "Documents", count: candidate.docs.filter((d) => d.status === "uploaded").length },
                { id: "timeline", label: "Timeline" },
                ...(candidate.offer ? [{ id: "offer", label: "Offer" }] : []),
              ]}
              active={tab} onChange={setTab}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {tab === "overview" && (
          <div className="space-y-5 animate-fade-in">
            <div className="panel !rounded-xl p-5 grid sm:grid-cols-3 gap-4">
              {infoRow("Email", candidate.email)}
              {infoRow("Phone", candidate.phone)}
              {infoRow("Annual Salary", fmtINR(candidate.salary))}
              {infoRow("Reporting Manager", candidate.reportingManager)}
              {infoRow("Created", fmtDate(candidate.createdAt))}
              {infoRow("Submitted", candidate.submittedAt ? fmtDateTime(candidate.submittedAt) : "")}
            </div>
            <div className="panel !rounded-xl p-5">
              <p className="font-display font-bold text-[14px] mb-3 flex items-center gap-2"><Link2 size={15} className="text-cobalt-500" /> Secure onboarding link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate text-[12.5px] bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/10 dark:ring-white/10 rounded-lg px-3 py-2 text-ink-500 dark:text-ink-300">{link}</code>
                <Button variant="outline" size="sm" icon={<Copy size={13} />} onClick={async () => { try { await navigator.clipboard.writeText(link); } catch { /* */ } toast("Link copied", "info"); }}>Copy</Button>
                <Button size="sm" icon={<Send size={13} />} onClick={() => sendOnboarding(candidate.id)}>{candidate.status === "registration_pending" ? "Send" : "Resend"} Email</Button>
              </div>
              <p className="text-[12px] text-ink-400 mt-2">Token-scoped — the candidate sees only their own data, never the HR workspace.</p>
            </div>
            {candidate.changeNote && (
              <div className="rounded-xl bg-orange-500/8 ring-1 ring-orange-500/25 p-4">
                <p className="text-[13px] font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2"><AlertCircle size={15} /> Changes requested from candidate</p>
                <p className="text-[13px] text-ink-600 dark:text-ink-300 mt-1.5">{candidate.changeNote}</p>
                {candidate.changeItems && candidate.changeItems.length > 0 && <p className="text-[12px] text-ink-500 dark:text-ink-400 mt-1.5">Items: {candidate.changeItems.join(", ")}</p>}
              </div>
            )}
          </div>
        )}

        {tab === "forms" && (
          <div className="space-y-5 animate-fade-in">
            {([
              ["Personal Information", [["Full Name", candidate.profile.fullName], ["Date of Birth", candidate.profile.dob], ["Gender", candidate.profile.gender], ["Email", candidate.profile.email], ["Mobile", candidate.profile.mobile], ["Current Address", candidate.profile.currentAddress], ["Permanent Address", candidate.profile.permanentAddress], ["Emergency Contact", candidate.profile.emergencyName ? `${candidate.profile.emergencyName} · ${candidate.profile.emergencyPhone}` : ""]]],
              ["Government IDs", [["PAN", candidate.government.pan], ["Aadhaar", candidate.government.aadhaar], ["Passport (optional)", candidate.government.passport]]],
              ["Employment", [["Position", candidate.position], ["Department", candidate.department], ["Joining Date", fmtDate(candidate.joiningDate)], ["Previous Employer", candidate.employment.previousEmployer], ["Total Experience", candidate.employment.totalExperience]]],
              ["Bank Details", [["Bank Name", candidate.bank.bankName], ["Account Number", candidate.bank.accountNumber ? "••••" + candidate.bank.accountNumber.slice(-4) : ""], ["IFSC", candidate.bank.ifsc]]],
            ] as [string, [string, string][]][]).map(([title, rows]) => (
              <div key={title} className="panel !rounded-xl p-5">
                <p className="font-display font-bold text-[14px] mb-3">{title}</p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5">{rows.map(([l, v]) => infoRow(l, v))}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "documents" && (
          <div className="grid sm:grid-cols-2 gap-3 animate-fade-in">
            {candidate.docs.map((d) => {
              const meta = DOC_META.find((m) => m.type === d.type);
              return (
                <div key={d.type} className="panel !rounded-xl p-4 flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${d.status === "uploaded" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : d.status === "invalid" ? "bg-rose-500/10 text-rose-500" : "bg-ink-900/5 dark:bg-white/6 text-ink-400"}`}>
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-ink-900 dark:text-white truncate">{meta?.label}</p>
                    <p className="text-[11.5px] text-ink-400 truncate">{d.status === "uploaded" ? d.fileName : d.status === "invalid" ? d.error ?? "Invalid file" : "Pending upload"}</p>
                  </div>
                  <Badge className={d.status === "uploaded" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25" : d.status === "invalid" ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25" : "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20"}>
                    {d.status === "uploaded" ? "Uploaded" : d.status === "invalid" ? "Invalid" : "Pending"}
                  </Badge>
                  {d.status === "uploaded" && (
                    <button onClick={() => setPreviewDoc(d)} className="p-2 rounded-lg text-ink-400 hover:text-cobalt-600 hover:bg-cobalt-500/8 transition-colors" aria-label="Preview"><Eye size={16} /></button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "timeline" && (
          <div className="animate-fade-in">
            <ol className="relative border-l-2 border-ink-900/8 dark:border-white/10 ml-2 space-y-5 py-1">
              {[...candidate.history].reverse().map((h, i) => (
                <li key={i} className="ml-5 relative">
                  <span className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-ink-900 ${histCls[h.kind]}`} />
                  <p className="text-[13.5px] font-semibold text-ink-800 dark:text-ink-100">{h.label}</p>
                  <p className="text-[12px] text-ink-400 mt-0.5">{fmtDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {tab === "offer" && candidate.offer && (
          <div className="space-y-4 animate-fade-in">
            <div className="panel !rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-display font-bold text-[16px] text-ink-900 dark:text-white">{candidate.offer.number}</p>
                  <p className="text-[12.5px] text-ink-400 mt-0.5">Generated {fmtDateTime(candidate.offer.generatedAt)} · {fmtINR(candidate.salary)} / year</p>
                </div>
                <OfferStatusBadge status={candidate.offer.status} />
              </div>
              <div className="mt-4"><OfferTrack offer={candidate.offer} /></div>
              {candidate.offer.rejectReason && <p className="mt-3 text-[13px] text-rose-600 dark:text-rose-400">Reason: {candidate.offer.rejectReason}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button icon={<Eye size={15} />} onClick={() => setLetterOpen(true)}>View Offer Letter</Button>
              <Button variant="outline" icon={<Mail size={15} />} onClick={() => setEmailOpen(true)}>View Email</Button>
              <Button variant="outline" icon={<Send size={15} />} onClick={() => resendOfferEmail(candidate.id)}>Resend Email</Button>
            </div>
          </div>
        )}

        {/* Contextual action bar */}
        <div className="sticky bottom-0 -mx-6 mt-8 px-6 py-4 bg-white/95 dark:bg-ink-900/95 backdrop-blur border-t border-ink-900/8 dark:border-white/8 flex flex-wrap items-center gap-2.5">
          {isHR && candidate.status === "hr_review" && (
            <>
              <Button variant="outline" icon={<Pencil size={15} />} onClick={() => setChangesOpen(true)}>Request Changes</Button>
              <Button icon={<Stamp size={15} />} onClick={() => { submitForApproval(candidate.id); }}>Submit for Approval</Button>
            </>
          )}
          {isMgr && candidate.status === "approval_pending" && (
            <>
              <Button variant="outline" icon={<Pencil size={15} />} onClick={() => setChangesOpen(true)}>Request Changes</Button>
              <Button variant="danger" icon={<ThumbsDown size={15} />} onClick={() => setRejectOpen(true)}>Reject</Button>
              <Button variant="success" icon={<CheckCircle2 size={15} />} onClick={() => { approveCandidate(candidate.id); onClose(); }}>Approve & Generate Offer</Button>
            </>
          )}
          {isHR && candidate.status === "registration_pending" && (
            <Button icon={<Send size={15} />} onClick={() => sendOnboarding(candidate.id)}>Send Onboarding Link</Button>
          )}
          {isHR && candidate.status === "changes_requested" && (
            <p className="text-[13px] text-ink-500 dark:text-ink-300 flex items-center gap-2"><AlertCircle size={15} className="text-orange-500" /> Waiting for the candidate to resubmit.</p>
          )}
          <span className="flex-1" />
          {isHR && (
            <>
              <Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>Edit</Button>
              <Button variant="ghost" size="sm" className="!text-rose-600 dark:!text-rose-400 hover:!bg-rose-500/8" icon={<Trash2 size={14} />} onClick={() => setDelOpen(true)}>Delete</Button>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CandidateFormModal open={editOpen} onClose={() => setEditOpen(false)} candidate={candidate} />
      <OfferLetterModal candidate={candidate} open={letterOpen} onClose={() => setLetterOpen(false)} />
      <OfferEmailModal candidate={candidate} open={emailOpen} onClose={() => setEmailOpen(false)} onViewLetter={() => { setEmailOpen(false); setLetterOpen(true); }} />
      <DocPreviewModal doc={previewDoc} candidate={candidate} open={!!previewDoc} onClose={() => setPreviewDoc(null)} />

      <Modal open={changesOpen} onClose={() => setChangesOpen(false)} title="Request Changes" subtitle={`${candidate.name} will be notified by email and their portal will reopen.`}
        footer={<>
          <Button variant="ghost" onClick={() => setChangesOpen(false)}>Cancel</Button>
          <Button variant="danger" disabled={!note.trim()} onClick={() => { requestChanges(candidate.id, note.trim(), items); setChangesOpen(false); }}>Send Request</Button>
        </>}>
        <p className="lbl">Which items need updating?</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {[...DOC_META.map((m) => m.label), "Personal Information", "Bank Details"].map((label) => (
            <button key={label} onClick={() => setItems((p) => p.includes(label) ? p.filter((x) => x !== label) : [...p, label])}
              className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold ring-1 ring-inset transition-colors ${items.includes(label) ? "bg-orange-500/12 text-orange-700 dark:text-orange-300 ring-orange-500/30" : "bg-ink-900/4 dark:bg-white/5 text-ink-500 dark:text-ink-300 ring-ink-900/10 dark:ring-white/12 hover:ring-ink-300"}`}>
              {label}
            </button>
          ))}
        </div>
        <Field label="Note to candidate" required>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Your PAN card scan is blurry — please upload a clearer copy." />
        </Field>
      </Modal>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Candidate" subtitle="The candidate will be notified by email. This can't be undone."
        footer={<>
          <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="danger" disabled={!reason.trim()} onClick={() => { rejectCandidate(candidate.id, reason.trim()); setRejectOpen(false); onClose(); }}>Reject Candidate</Button>
        </>}>
        <Field label="Reason" required><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Headcount freeze for this quarter." /></Field>
      </Modal>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title="Delete candidate?" width="max-w-md"
        footer={<>
          <Button variant="ghost" onClick={() => setDelOpen(false)}>Cancel</Button>
          <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => { deleteCandidate(candidate.id); setDelOpen(false); onClose(); }}>Delete Permanently</Button>
        </>}>
        <p className="text-[14px] text-ink-600 dark:text-ink-300">This permanently removes <span className="font-bold text-ink-900 dark:text-white">{candidate.name}</span>, their documents and offer history from your workspace.</p>
      </Modal>
    </Drawer>
  );
}
