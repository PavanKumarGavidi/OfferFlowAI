import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle, ArrowRight, BadgeCheck, Briefcase, Building2, Check, CheckCircle2, ChevronLeft, CreditCard,
  FileText, Landmark, Link2, Lock, Mail, Pencil, ShieldCheck, Sparkles, Upload, User, X, XCircle,
} from "lucide-react";
import type { Candidate, DocType } from "../lib/types";
import { computeProgress, DOC_META, fmtDate, isAccount, isAadhaar, isEmail, isIFSC, isPAN, isPhone, sectionStates } from "../lib/types";
import { useStore } from "../lib/store";
import { Button, Field, Input, Logo, LogoMark, Modal, Progress, Select, Textarea } from "../components/ui";
import { OfferPaper, OfferTrack } from "../components/OfferLetter";

const STEPS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "bank", label: "Bank Details", icon: Landmark },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "declaration", label: "Declaration", icon: ShieldCheck },
  { id: "submit", label: "Submit", icon: CheckCircle2 },
];

function InvalidLink() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-50 dark:bg-ink-950 p-6 text-center">
      <Logo />
      <span className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mt-10"><XCircle size={30} /></span>
      <h1 className="font-display font-bold text-[24px] text-ink-900 dark:text-white mt-5">This onboarding link is invalid</h1>
      <p className="text-[14px] text-ink-500 dark:text-ink-400 mt-2 max-w-md">The link may have expired or been typed incorrectly. Please ask your HR contact to resend your secure onboarding link.</p>
      <p className="mt-6 text-[12px] text-ink-400 inline-flex items-center gap-1.5"><Lock size={13} /> Secure candidate access is token-scoped.</p>
    </div>
  );
}

function DocCard({ c, type }: { c: Candidate; type: DocType }) {
  const { uploadDoc, removeDoc, toast } = useStore();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const doc = c.docs.find((d) => d.type === type);
  const meta = DOC_META.find((m) => m.type === type);
  if (!doc || !meta) return null;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setTimeout(() => {
      const err = uploadDoc(c.token, type, file.name, file.size);
      setBusy(false);
      if (err) toast("Upload failed", "error", err);
      else toast(`${meta.label} uploaded`, "success");
    }, 900);
  };

  return (
    <div className={`panel !rounded-xl p-4 flex items-center gap-3.5 transition-all ${doc.status === "uploaded" ? "ring-emerald-500/30" : doc.status === "invalid" ? "ring-rose-500/35" : ""}`}>
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${doc.status === "uploaded" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : doc.status === "invalid" ? "bg-rose-500/10 text-rose-500" : "bg-cobalt-500/8 text-cobalt-500"}`}>
        {busy ? <span className="w-4 h-4 border-2 border-cobalt-500 border-t-transparent rounded-full animate-spin" /> : doc.status === "uploaded" ? <Check size={19} /> : <FileText size={19} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-ink-900 dark:text-white">{meta.label}</p>
        <p className="text-[11.5px] text-ink-400 truncate">
          {busy ? "Uploading & validating…" : doc.status === "uploaded" ? `${doc.fileName} · ${Math.round((doc.size ?? 0) / 1024)} KB` : doc.status === "invalid" ? doc.error : meta.hint}
        </p>
        <div className="mt-1.5">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${doc.status === "uploaded" ? "text-emerald-600 dark:text-emerald-400" : doc.status === "invalid" ? "text-rose-500" : "text-ink-400"}`}>
            {busy ? "Processing" : doc.status === "uploaded" ? "● Uploaded" : doc.status === "invalid" ? "● Invalid — replace file" : "○ Pending"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {doc.status === "uploaded" && (
          <>
            <button onClick={() => setPreview(true)} className="p-2 rounded-lg text-ink-400 hover:text-cobalt-600 hover:bg-cobalt-500/10 transition-colors" title="Preview"><FileText size={16} /></button>
            <button onClick={() => { removeDoc(c.token, type); toast("Document removed", "info"); }} className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors" title="Delete"><X size={16} /></button>
          </>
        )}
        <Button size="sm" variant={doc.status === "uploaded" ? "outline" : "primary"} loading={busy} icon={doc.status !== "uploaded" ? <Upload size={13} /> : <Pencil size={13} />} onClick={() => inputRef.current?.click()}>
          {doc.status === "uploaded" ? "Replace" : "Upload"}
        </Button>
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <Modal open={preview} onClose={() => setPreview(false)} title={meta.label} subtitle={`${doc.fileName} · uploaded ${doc.uploadedAt ? fmtDate(doc.uploadedAt) : ""}`} width="max-w-md">
        <div className="rounded-xl bg-ink-100/70 dark:bg-ink-925 ring-1 ring-ink-900/8 dark:ring-white/10 p-7 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><FileText size={26} /></span>
          <p className="font-display font-bold text-[15px] mt-3">{doc.fileName}</p>
          <p className="text-[12px] text-ink-400 mt-1">{doc.fileName?.split(".").pop()?.toUpperCase()} · stored securely · only {`your HR team`} can view</p>
          <div className="mt-4 space-y-2">{[90, 74, 82].map((w, i) => <div key={i} className="h-2.5 rounded-full bg-ink-300/40 dark:bg-white/8" style={{ width: `${w}%` }} />)}</div>
        </div>
      </Modal>
    </div>
  );
}

function OfferStage({ c }: { c: Candidate }) {
  const { db, respondOffer, markOfferViewed } = useStore();
  const [confirm, setConfirm] = useState<"accept" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const company = db.companies.find((x) => x.id === c.companyId);
  const offer = c.offer;

  useEffect(() => {
    if (offer?.status === "sent") markOfferViewed(c.token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer?.status]);

  if (!company || !offer) return null;
  const done = offer.status === "accepted" || offer.status === "rejected";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-up">
      <div className={`panel !rounded-2xl p-6 ${done ? (offer.status === "accepted" ? "!ring-emerald-500/40" : "!ring-rose-500/40") : ""}`}>
        {done ? (
          <div className="text-center py-4">
            <span className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${offer.status === "accepted" ? "bg-emerald-500/12 text-emerald-500" : "bg-rose-500/12 text-rose-500"}`}>
              {offer.status === "accepted" ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
            </span>
            <h2 className="font-display font-bold text-[24px] text-ink-900 dark:text-white mt-4">
              {offer.status === "accepted" ? "Offer accepted — welcome aboard!" : "Offer declined"}
            </h2>
            <p className="text-[14px] text-ink-500 dark:text-ink-400 mt-2 max-w-md mx-auto">
              {offer.status === "accepted"
                ? `${company.name} has been notified. Your HR team will reach out with joining formalities before ${fmtDate(c.joiningDate)}.`
                : `${company.name} has been notified of your decision${reason ? ` with your feedback` : ""}. We wish you the very best.`}
            </p>
            {offer.respondedAt && <p className="text-[12px] text-ink-400 mt-3">Responded on {fmtDate(offer.respondedAt)}</p>}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5"><Sparkles size={14} /> Your offer is ready</p>
                <h2 className="font-display font-bold text-[24px] text-ink-900 dark:text-white mt-1">Congratulations, {c.name.split(" ")[0]}!</h2>
                <p className="text-[13.5px] text-ink-500 dark:text-ink-400 mt-1">{company.name} is offering you the {c.position} role. Review your letter below.</p>
              </div>
              <OfferTrack offer={offer} />
            </div>
          </>
        )}
      </div>

      <OfferPaper company={company} candidate={c} />

      {!done && (
        <div className="panel !rounded-2xl p-5 flex flex-wrap items-center gap-3 sticky bottom-4 shadow-xl">
          <p className="text-[13px] text-ink-500 dark:text-ink-400 flex-1 min-w-[200px]">By accepting, you confirm the details above are correct. This offer is valid for 7 days.</p>
          <Button variant="outline" className="!text-rose-600 dark:!text-rose-400 !ring-rose-500/30 hover:!bg-rose-500/8" icon={<X size={15} />} onClick={() => setConfirm("reject")}>Reject Offer</Button>
          <Button variant="success" size="lg" icon={<Check size={17} />} onClick={() => setConfirm("accept")}>Accept Offer</Button>
        </div>
      )}

      <Modal open={confirm === "accept"} onClose={() => setConfirm(null)} title="Accept this offer?" width="max-w-md"
        footer={<>
          <Button variant="ghost" onClick={() => setConfirm(null)}>Not yet</Button>
          <Button variant="success" icon={<Check size={15} />} onClick={() => { respondOffer(c.token, true); setConfirm(null); }}>Yes, I accept</Button>
        </>}>
        <p className="text-[14px] text-ink-600 dark:text-ink-300">You're accepting the position of <span className="font-bold text-ink-900 dark:text-white">{c.position}</span> at <span className="font-bold text-ink-900 dark:text-white">{company.name}</span>, joining on {fmtDate(c.joiningDate)}. {company.name} will be notified immediately.</p>
      </Modal>
      <Modal open={confirm === "reject"} onClose={() => setConfirm(null)} title="Reject this offer?" width="max-w-md"
        footer={<>
          <Button variant="ghost" onClick={() => setConfirm(null)}>Keep reviewing</Button>
          <Button variant="danger" icon={<X size={15} />} onClick={() => { respondOffer(c.token, false, reason.trim() || undefined); setConfirm(null); }}>Reject offer</Button>
        </>}>
        <p className="text-[14px] text-ink-600 dark:text-ink-300">This lets {company.name} know you won't be joining. Optionally share why — it helps them improve.</p>
        <div className="mt-4">
          <Field label="Reason (optional)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Accepted another offer closer to home." /></Field>
        </div>
      </Modal>
    </div>
  );
}

export default function CandidatePortal() {
  const { token } = useParams();
  const { portalCandidate, db, saveSection, setAgreed, submitOnboarding, toast } = useStore();
  const c = useMemo(() => (token ? portalCandidate(token) : null), [token, db.candidates]);
  const [step, setStep] = useState("profile");
  const [stepErr, setStepErr] = useState("");

  const company = c ? db.companies.find((x) => x.id === c.companyId) : null;
  const notice = c ? db.notifications.find((n) => n.candidateId === c.id && n.audience === "candidate" && !n.read && n.kind !== "info") : null;

  if (!token || !c || !company) return <InvalidLink />;

  const hasOffer = !!c.offer && ["offer_generated", "offer_sent", "offer_viewed", "accepted", "rejected"].includes(c.status);
  const inReview = ["hr_review", "approval_pending", "approved", "offer_generated"].includes(c.status) && !hasOffer;
  const progress = computeProgress(c);
  const s = sectionStates(c);
  const stepIdx = STEPS.findIndex((x) => x.id === step);

  const validateStep = (id: string): string => {
    if (id === "profile") {
      const p = c.profile;
      if (Object.values(p).some((v) => !v.trim())) return "Please fill every field in Personal Information.";
      if (!isEmail(p.email)) return "Email address looks invalid.";
      if (!isPhone(p.mobile)) return "Mobile number must be 10 digits.";
      if (!isPhone(p.emergencyPhone)) return "Emergency contact number must be 10 digits.";
      if (!isPAN(c.government.pan)) return "PAN must match format ABCDE1234F.";
      if (!isAadhaar(c.government.aadhaar)) return "Aadhaar must be 12 digits.";
    }
    if (id === "employment") {
      if (!c.employment.previousEmployer.trim() || !c.employment.totalExperience.trim()) return "Previous employer and total experience are required.";
    }
    if (id === "bank") {
      if (!c.bank.bankName.trim()) return "Bank name is required.";
      if (!isAccount(c.bank.accountNumber)) return "Account number must be 9–18 digits.";
      if (!isIFSC(c.bank.ifsc)) return "IFSC must match format HDFC0001207.";
    }
    if (id === "documents") {
      const pending = c.docs.filter((d) => d.status !== "uploaded").length;
      if (pending > 0) return `${pending} document${pending === 1 ? "" : "s"} still need uploading.`;
    }
    if (id === "declaration") {
      if (!c.agreed) return "Please accept the declaration to continue.";
    }
    return "";
  };

  const goNext = () => {
    const err = validateStep(step);
    setStepErr(err);
    if (err) { toast("Almost there", "warning", err); return; }
    setStep(STEPS[Math.min(stepIdx + 1, STEPS.length - 1)].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const doSubmit = () => {
    const err = submitOnboarding(c.token);
    if (err) { toast("Cannot submit yet", "error", err); setStepErr(err); return; }
    setStep("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const input = (section: "profile" | "employment" | "government" | "bank", field: string, value: string) =>
    saveSection(c.token, section, { [field]: value });

  if (hasOffer || step === "done" || inReview) {
    if (!hasOffer) {
      return (
        <PortalFrame c={c} company={company.name}>
          <div className="max-w-xl mx-auto text-center py-14 animate-fade-up">
            <span className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/12 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={30} /></span>
            <h2 className="font-display font-bold text-[26px] text-ink-900 dark:text-white mt-5">Information submitted successfully</h2>
            <p className="text-[14px] text-ink-500 dark:text-ink-400 mt-2.5">Our HR team has been notified and will review your details and documents. You'll receive an email if anything needs updating — and your offer letter the moment it's approved.</p>
            <div className="mt-8 panel !rounded-xl p-5 text-left space-y-2.5">
              {[["HR reviews your submission", "Usually within 1–2 business days"], ["HR Manager approves", "Your details go for final sign-off"], ["Offer letter emailed", "Generated automatically, straight to your inbox"]].map(([t, d], i) => (
                <div key={t} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <div><p className="text-[13.5px] font-bold text-ink-800 dark:text-ink-100">{t}</p><p className="text-[12px] text-ink-400">{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </PortalFrame>
      );
    }
    return (
      <PortalFrame c={c} company={company.name}>
        <OfferStage c={c} />
      </PortalFrame>
    );
  }

  return (
    <PortalFrame c={c} company={company.name}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="animate-fade-up">
          <h1 className="font-display font-bold text-[28px] tracking-tight text-ink-900 dark:text-white">Welcome to OfferFlow AI</h1>
          <p className="text-[14px] text-ink-500 dark:text-ink-400 mt-1.5">Complete your onboarding information and upload the required documents for <span className="font-bold text-ink-800 dark:text-ink-100">{company.name}</span> · {c.position}.</p>
          <div className="mt-4 panel !rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[12.5px] font-bold text-ink-600 dark:text-ink-300">Profile Completion: <span className="text-cobalt-600 dark:text-cobalt-300">{progress}%</span></p>
              <Progress value={progress} className="mt-2" barClass={progress === 100 ? "bg-emerald-500" : "bg-cobalt-600"} />
            </div>
            <span className="text-[12px] font-bold text-ink-400 whitespace-nowrap">{c.docs.filter((d) => d.status === "uploaded").length}/8 docs</span>
          </div>
        </div>

        {c.status === "changes_requested" && (
          <div className="mt-4 rounded-xl bg-orange-500/8 ring-1 ring-orange-500/30 p-4 flex items-start gap-3 animate-fade-up">
            <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13.5px] font-bold text-orange-700 dark:text-orange-300">HR requested a few changes{c.changeItems?.length ? `: ${c.changeItems.join(", ")}` : ""}</p>
              {c.changeNote && <p className="text-[13px] text-ink-600 dark:text-ink-300 mt-1">"{c.changeNote}"</p>}
              <p className="text-[12px] text-ink-400 mt-1.5">Update the highlighted items below and resubmit — everything else stays as-is.</p>
            </div>
          </div>
        )}
        {notice && c.status !== "changes_requested" && (
          <div className="mt-4 rounded-xl bg-cobalt-500/8 ring-1 ring-cobalt-500/25 p-4 flex items-start gap-3 animate-fade-up">
            <Mail size={17} className="text-cobalt-500 shrink-0 mt-0.5" />
            <div><p className="text-[13.5px] font-bold text-cobalt-700 dark:text-cobalt-300">{notice.title}</p><p className="text-[13px] text-ink-600 dark:text-ink-300 mt-0.5">{notice.body}</p></div>
          </div>
        )}

        {/* Step rail */}
        <div className="mt-7 flex gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((st, i) => {
            const active = st.id === step;
            const complete = i < stepIdx || (st.id === "profile" && s.profile && s.government) || (st.id === "employment" && s.employment) || (st.id === "bank" && s.bank) || (st.id === "documents" && s.docs) || (st.id === "declaration" && s.declaration);
            return (
              <button key={st.id} onClick={() => i < stepIdx && setStep(st.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] font-bold whitespace-nowrap ring-1 ring-inset transition-all ${active ? "bg-cobalt-600 text-white ring-cobalt-600 shadow-sm shadow-cobalt-600/30" : complete ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25" : "bg-white dark:bg-ink-900 text-ink-400 ring-ink-900/10 dark:ring-white/12"}`}>
                {complete && !active ? <Check size={13} /> : <st.icon size={13} />}
                {st.label}
              </button>
            );
          })}
        </div>

        {stepErr && step !== "profile" && (
          <p className="mt-4 text-[13px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/8 ring-1 ring-rose-500/20 rounded-lg px-3.5 py-2.5">{stepErr}</p>
        )}

        {/* Step content */}
        <div className="mt-5 space-y-5" key={step}>
          {step === "profile" && (
            <div className="space-y-5 animate-fade-in">
              <section className="panel !rounded-xl p-6">
                <h2 className="font-display font-bold text-[17px] text-ink-900 dark:text-white">Personal Information</h2>
                <p className="text-[12.5px] text-ink-400 mt-0.5 mb-5">Auto-saved as you type.</p>
                {stepErr && <p className="mb-4 text-[13px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/8 ring-1 ring-rose-500/20 rounded-lg px-3.5 py-2.5">{stepErr}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name" required><Input value={c.profile.fullName} onChange={(e) => input("profile", "fullName", e.target.value)} /></Field>
                  <Field label="Date of Birth" required><Input type="date" value={c.profile.dob} onChange={(e) => input("profile", "dob", e.target.value)} /></Field>
                  <Field label="Gender" required>
                    <Select value={c.profile.gender} onChange={(e) => input("profile", "gender", e.target.value)}>
                      <option value="">Select…</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
                    </Select>
                  </Field>
                  <Field label="Email" required error={c.profile.email && !isEmail(c.profile.email) ? "Invalid email format" : undefined}><Input value={c.profile.email} onChange={(e) => input("profile", "email", e.target.value)} /></Field>
                  <Field label="Mobile Number" required error={c.profile.mobile && !isPhone(c.profile.mobile) ? "Must be 10 digits" : undefined}><Input value={c.profile.mobile} onChange={(e) => input("profile", "mobile", e.target.value)} placeholder="10-digit number" /></Field>
                  <Field label="Emergency Contact Name" required><Input value={c.profile.emergencyName} onChange={(e) => input("profile", "emergencyName", e.target.value)} /></Field>
                  <Field label="Emergency Contact Number" required error={c.profile.emergencyPhone && !isPhone(c.profile.emergencyPhone) ? "Must be 10 digits" : undefined}><Input value={c.profile.emergencyPhone} onChange={(e) => input("profile", "emergencyPhone", e.target.value)} /></Field>
                  <Field label="Current Address" required className="sm:col-span-2"><Textarea value={c.profile.currentAddress} onChange={(e) => input("profile", "currentAddress", e.target.value)} className="min-h-[70px]" /></Field>
                  <Field label="Permanent Address" required className="sm:col-span-2"><Textarea value={c.profile.permanentAddress} onChange={(e) => input("profile", "permanentAddress", e.target.value)} className="min-h-[70px]" /></Field>
                </div>
              </section>
              <section className="panel !rounded-xl p-6">
                <h2 className="font-display font-bold text-[17px] text-ink-900 dark:text-white">Government Information</h2>
                <p className="text-[12.5px] text-ink-400 mt-0.5 mb-5">Used for payroll & statutory compliance. Encrypted at rest.</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="PAN" required error={c.government.pan && !isPAN(c.government.pan) ? "Format: ABCDE1234F" : undefined}>
                    <Input value={c.government.pan} onChange={(e) => input("government", "pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" className="uppercase" />
                  </Field>
                  <Field label="Aadhaar" required error={c.government.aadhaar && !isAadhaar(c.government.aadhaar) ? "Must be 12 digits" : undefined}>
                    <Input value={c.government.aadhaar} onChange={(e) => input("government", "aadhaar", e.target.value)} placeholder="12-digit number" />
                  </Field>
                  <Field label="Passport Number (optional)">
                    <Input value={c.government.passport} onChange={(e) => input("government", "passport", e.target.value)} placeholder="Optional" />
                  </Field>
                </div>
              </section>
            </div>
          )}

          {step === "employment" && (
            <section className="panel !rounded-xl p-6 animate-fade-in">
              <h2 className="font-display font-bold text-[17px] text-ink-900 dark:text-white">Employment Information</h2>
              <p className="text-[12.5px] text-ink-400 mt-0.5 mb-5">Your role details as shared by HR.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Position"><Input value={c.position} disabled className="opacity-70" /></Field>
                <Field label="Department"><Input value={c.department} disabled className="opacity-70" /></Field>
                <Field label="Joining Date"><Input value={fmtDate(c.joiningDate)} disabled className="opacity-70" /></Field>
                <Field label="Reporting Manager"><Input value={c.reportingManager} disabled className="opacity-70" /></Field>
                <Field label="Previous Employer" required hint="Enter 'Fresher' if this is your first job."><Input value={c.employment.previousEmployer} onChange={(e) => input("employment", "previousEmployer", e.target.value)} placeholder="e.g. Flipkart / Fresher" /></Field>
                <Field label="Total Experience" required><Input value={c.employment.totalExperience} onChange={(e) => input("employment", "totalExperience", e.target.value)} placeholder="e.g. 4.5 years" /></Field>
              </div>
              <p className="mt-4 text-[12px] text-ink-400 flex items-center gap-1.5"><Lock size={12} /> Contact HR if any locked detail above is incorrect.</p>
            </section>
          )}

          {step === "bank" && (
            <section className="panel !rounded-xl p-6 animate-fade-in">
              <h2 className="font-display font-bold text-[17px] text-ink-900 dark:text-white flex items-center gap-2"><CreditCard size={18} className="text-cobalt-500" /> Bank Details</h2>
              <p className="text-[12.5px] text-ink-400 mt-0.5 mb-5">For salary credits. Verified only by authorised HR staff.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Bank Name" required><Input value={c.bank.bankName} onChange={(e) => input("bank", "bankName", e.target.value)} placeholder="e.g. HDFC Bank" /></Field>
                <Field label="Account Number" required error={c.bank.accountNumber && !isAccount(c.bank.accountNumber) ? "9–18 digits" : undefined}><Input value={c.bank.accountNumber} onChange={(e) => input("bank", "accountNumber", e.target.value)} placeholder="e.g. 50100234567890" /></Field>
                <Field label="IFSC Code" required error={c.bank.ifsc && !isIFSC(c.bank.ifsc) ? "Format: HDFC0001207" : undefined}><Input value={c.bank.ifsc} onChange={(e) => input("bank", "ifsc", e.target.value.toUpperCase())} placeholder="e.g. HDFC0001207" className="uppercase" /></Field>
              </div>
            </section>
          )}

          {step === "documents" && (
            <div className="animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-semibold text-ink-500 dark:text-ink-400">All 8 documents are required. PDF, JPG or PNG — validated on upload.</p>
              </div>
              {DOC_META.map((m) => <DocCard key={m.type} c={c} type={m.type} />)}
            </div>
          )}

          {step === "declaration" && (
            <section className="panel !rounded-xl p-6 animate-fade-in">
              <h2 className="font-display font-bold text-[17px] text-ink-900 dark:text-white">Declaration</h2>
              <div className="mt-4 rounded-xl bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/8 dark:ring-white/10 p-5 text-[13.5px] text-ink-600 dark:text-ink-300 leading-relaxed space-y-2.5">
                <p>I hereby declare that all the information furnished above and the documents uploaded by me are true, complete and correct to the best of my knowledge.</p>
                <p>I understand that in the event of any information being found false or incorrect, my candidature or employment is liable to be terminated without notice.</p>
                <p>I consent to {company.name} verifying the information and documents provided, and to processing my personal data for onboarding purposes.</p>
              </div>
              <label className="mt-5 flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={!!c.agreed} onChange={(e) => setAgreed(c.token, e.target.checked)} className="mt-0.5 w-4.5 h-4.5 accent-[#2b4ed6] w-[18px] h-[18px]" />
                <span className="text-[14px] font-semibold text-ink-700 dark:text-ink-200 group-hover:text-ink-900 dark:group-hover:text-white transition-colors">I accept the declaration and authorise verification of my details.</span>
              </label>
            </section>
          )}

          {step === "submit" && (
            <section className="panel !rounded-xl p-6 animate-fade-in">
              <h2 className="font-display font-bold text-[17px] text-ink-900 dark:text-white">Review & Submit</h2>
              <p className="text-[12.5px] text-ink-400 mt-0.5 mb-5">Everything below is editable until HR begins their review.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ["Profile", s.profile && s.government, "profile"], ["Employment", s.employment, "employment"],
                  ["Bank Details", s.bank, "bank"], ["Documents (8/8)", s.docs, "documents"], ["Declaration", s.declaration, "declaration"],
                ].map(([label, ok, st]) => (
                  <button key={label as string} onClick={() => setStep(st as string)} className={`flex items-center justify-between p-3.5 rounded-xl ring-1 ring-inset transition-all hover:-translate-y-0.5 text-left ${ok ? "ring-emerald-500/25 bg-emerald-500/4 hover:ring-emerald-500/50" : "ring-rose-500/25 bg-rose-500/4 hover:ring-rose-500/50"}`}>
                    <span className={`inline-flex items-center gap-2.5 text-[13.5px] font-bold ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                      {ok ? <BadgeCheck size={17} /> : <AlertCircle size={17} />} {label as string}
                    </span>
                    <span className={`text-[11.5px] font-bold px-2 py-1 rounded-full ${ok ? "bg-emerald-500/10" : "bg-rose-500/10"} ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>{ok ? "Complete" : "Fix"}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-cobalt-500/6 ring-1 ring-cobalt-500/20 p-4 text-[13px] text-ink-600 dark:text-ink-300">
                Submitting notifies the HR team at {company.name} immediately. You'll receive email updates at every step — review, approval and your offer letter.
              </div>
            </section>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <Button variant="ghost" icon={<ChevronLeft size={15} />} disabled={stepIdx === 0} onClick={() => { setStepErr(""); setStep(STEPS[stepIdx - 1].id); }}>Back</Button>
            {step === "submit" ? (
              <Button size="lg" variant="success" icon={<ArrowRight size={16} />} onClick={doSubmit}>Submit for HR Review</Button>
            ) : (
              <Button size="lg" icon={<ArrowRight size={16} />} onClick={goNext}>Save & Continue</Button>
            )}
          </div>
        </div>
      </div>
    </PortalFrame>
  );
}

function PortalFrame({ c, company, children }: { c: Candidate; company: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md border-b border-ink-900/8 dark:border-white/8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Logo size={26} />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-900/5 dark:bg-white/8 text-[11.5px] font-bold text-ink-500 dark:text-ink-300">
            <Building2 size={12} /> {company}
          </span>
          <span className="flex-1" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/12 text-amber-700 dark:text-amber-300 text-[11px] font-bold ring-1 ring-inset ring-amber-400/30">Demo environment</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold ring-1 ring-inset ring-emerald-500/25">
            <Lock size={11} /> Secure link · {c.name}
          </span>
        </div>
      </header>
      {children}
      <footer className="max-w-5xl mx-auto px-6 py-8 text-[12px] text-ink-400 flex flex-wrap items-center gap-x-2 gap-y-1">
        <LogoMark size={15} /> Powered by OfferFlow AI · Your data is visible only to {company}'s HR team · <span className="inline-flex items-center gap-1"><Link2 size={11} /> token-scoped access</span>
      </footer>
    </div>
  );
}
