// ─── OfferFlow AI domain types ────────────────────────────────────────────────

export type Role = "platform_admin" | "company_admin" | "hr" | "hr_manager";

export type Session = { kind: "user"; userId: string } | null;

export type CandidateStatus =
  | "registration_pending"
  | "information_submitted"
  | "hr_review"
  | "approval_pending"
  | "approved"
  | "offer_generated"
  | "offer_sent"
  | "offer_viewed"
  | "accepted"
  | "rejected"
  | "changes_requested";

export type OfferStatus = "generated" | "sent" | "viewed" | "accepted" | "rejected";

export type DocType =
  | "resume"
  | "photo"
  | "pan"
  | "aadhaar"
  | "education"
  | "experience"
  | "address"
  | "bank";

export interface CandidateDoc {
  type: DocType;
  status: "pending" | "uploaded" | "invalid";
  fileName?: string;
  size?: number;
  uploadedAt?: string;
  error?: string;
}

export interface PersonalInfo {
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  mobile: string;
  currentAddress: string;
  permanentAddress: string;
  emergencyName: string;
  emergencyPhone: string;
}

export interface EmploymentInfo {
  previousEmployer: string;
  totalExperience: string;
}

export interface GovInfo {
  pan: string;
  aadhaar: string;
  passport: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface Offer {
  id: string;
  number: string;
  generatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  status: OfferStatus;
  rejectReason?: string;
}

export interface HistoryEvent {
  at: string;
  label: string;
  kind: "create" | "info" | "success" | "warning" | "danger";
}

export interface Candidate {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joiningDate: string;
  salary: number;
  reportingManager: string;
  status: CandidateStatus;
  token: string;
  createdAt: string;
  submittedAt?: string;
  agreed?: boolean;
  changeNote?: string;
  changeItems?: string[];
  profile: PersonalInfo;
  employment: EmploymentInfo;
  government: GovInfo;
  bank: BankInfo;
  docs: CandidateDoc[];
  offer?: Offer;
  history: HistoryEvent[];
}

export type PlanId = "starter" | "business" | "enterprise";

export interface Company {
  id: string;
  name: string;
  website: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logoColor: string;
  plan: PlanId;
  trial: boolean;
  active: boolean;
  createdAt: string;
  settings: {
    hrName: string;
    hrDesignation: string;
    offerSubject: string;
    terms: string[];
    senderName: string;
    senderEmail: string;
  };
}

export interface User {
  id: string;
  companyId: string | null;
  name: string;
  email: string;
  role: Role;
  password: string;
  verified: boolean;
  color: string;
  createdAt: string;
}

export type NotificationAudience = "hr" | "hr_manager" | "company_admin" | "candidate";

export interface AppNotification {
  id: string;
  companyId: string | null;
  candidateId?: string;
  audience: NotificationAudience;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "info" | "success" | "warning" | "danger";
}

export interface EmailLog {
  id: string;
  companyId: string | null;
  to: string;
  toName: string;
  subject: string;
  body: string;
  at: string;
  type: "onboarding_invite" | "changes_requested" | "offer" | "system" | "wish" | "invite_user";
}

export interface AuditLog {
  id: string;
  companyId: string | null;
  actor: string;
  action: string;
  detail: string;
  at: string;
}

export interface EmailTemplate {
  id: string;
  companyId: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
}

export interface Birthday {
  id: string;
  companyId: string;
  name: string;
  designation: string;
  department: string;
  monthDay: string; // MM-DD
  color: string;
}

export interface Festival {
  id: string;
  name: string;
  monthDay: string; // MM-DD
  desc: string;
  hue: number;
}

export interface DB {
  v: number;
  companies: Company[];
  users: User[];
  candidates: Candidate[];
  notifications: AppNotification[];
  emails: EmailLog[];
  audits: AuditLog[];
  templates: EmailTemplate[];
  birthdays: Birthday[];
  festivals: Festival[];
}

// ─── Display metadata ────────────────────────────────────────────────────────

export const STATUS_META: Record<CandidateStatus, { label: string; cls: string; dot: string }> = {
  registration_pending: { label: "Registration Pending", cls: "bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-slate-500/25", dot: "bg-slate-500" },
  information_submitted: { label: "Information Submitted", cls: "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/25", dot: "bg-sky-500" },
  hr_review: { label: "HR Review", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/25", dot: "bg-amber-500" },
  approval_pending: { label: "Approval Pending", cls: "bg-purple-500/10 text-purple-700 dark:text-purple-300 ring-purple-500/25", dot: "bg-purple-500" },
  approved: { label: "Approved", cls: "bg-teal-500/10 text-teal-700 dark:text-teal-300 ring-teal-500/25", dot: "bg-teal-500" },
  offer_generated: { label: "Offer Generated", cls: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-indigo-500/25", dot: "bg-indigo-500" },
  offer_sent: { label: "Offer Sent", cls: "bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 ring-cobalt-500/25", dot: "bg-cobalt-500" },
  offer_viewed: { label: "Offer Viewed", cls: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/25", dot: "bg-cyan-500" },
  accepted: { label: "Accepted", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25", dot: "bg-rose-500" },
  changes_requested: { label: "Changes Requested", cls: "bg-orange-500/10 text-orange-700 dark:text-orange-300 ring-orange-500/25", dot: "bg-orange-500" },
};

export const OFFER_STATUS_META: Record<OfferStatus, { label: string; cls: string }> = {
  generated: { label: "Generated", cls: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-indigo-500/25" },
  sent: { label: "Sent", cls: "bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 ring-cobalt-500/25" },
  viewed: { label: "Viewed", cls: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/25" },
  accepted: { label: "Accepted", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25" },
  rejected: { label: "Rejected", cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25" },
};

export const DOC_META: { type: DocType; label: string; hint: string }[] = [
  { type: "resume", label: "Resume / CV", hint: "PDF, JPG or PNG · max 5 MB" },
  { type: "photo", label: "Passport Photo", hint: "JPG or PNG · max 2 MB" },
  { type: "pan", label: "PAN Card", hint: "PDF, JPG or PNG · max 5 MB" },
  { type: "aadhaar", label: "Aadhaar Card", hint: "PDF, JPG or PNG · max 5 MB" },
  { type: "education", label: "Educational Certificates", hint: "PDF, JPG or PNG · max 5 MB" },
  { type: "experience", label: "Experience Letter", hint: "PDF, JPG or PNG · max 5 MB" },
  { type: "address", label: "Address Proof", hint: "PDF, JPG or PNG · max 5 MB" },
  { type: "bank", label: "Cancelled Cheque / Bank Proof", hint: "PDF, JPG or PNG · max 5 MB" },
];

export const PLANS: {
  id: PlanId;
  name: string;
  price: number | null;
  tagline: string;
  candidates: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    tagline: "For small companies getting started",
    candidates: "Up to 25 candidates / month",
    features: ["Secure candidate portal", "Document collection", "Offer letter generation", "Email notifications", "2 HR seats"],
  },
  {
    id: "business",
    name: "Business",
    price: 149,
    tagline: "For growing companies",
    candidates: "Up to 200 candidates / month",
    features: ["Everything in Starter", "Multi-step approval flow", "Employee engagement hub", "Custom email templates", "Audit logs", "10 HR seats"],
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    tagline: "For large organizations",
    candidates: "Unlimited candidates",
    features: ["Everything in Business", "SSO / SAML", "Dedicated workspace region", "Custom offer templates", "Priority support", "Unlimited seats"],
  },
];

export const PIPELINE_STAGES: { key: string; label: string; statuses: CandidateStatus[] }[] = [
  { key: "reg", label: "Registration Pending", statuses: ["registration_pending"] },
  { key: "info", label: "Information Submitted", statuses: ["information_submitted", "changes_requested"] },
  { key: "review", label: "HR Review", statuses: ["hr_review"] },
  { key: "approval", label: "Approval", statuses: ["approval_pending", "approved", "offer_generated"] },
  { key: "sent", label: "Offer Sent", statuses: ["offer_sent", "offer_viewed"] },
  { key: "done", label: "Accepted", statuses: ["accepted"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const uid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);

export const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const fmtDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

export const fmtINR = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);

export const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return fmtDate(iso);
};

export const daysUntil = (monthDay: string) => {
  const now = new Date();
  const [m, d] = monthDay.split("-").map(Number);
  let next = new Date(now.getFullYear(), m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (next < today) next = new Date(now.getFullYear() + 1, m - 1, d);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
};

export const festivalDateLabel = (monthDay: string) => {
  const now = new Date();
  const [m, d] = monthDay.split("-").map(Number);
  let next = new Date(now.getFullYear(), m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (next < today) next = new Date(now.getFullYear() + 1, m - 1, d);
  return next.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^\d{10}$/.test(v.replace(/[\s-]/g, ""));
export const isPAN = (v: string) => /^[A-Z]{5}\d{4}[A-Z]$/.test(v.trim().toUpperCase());
export const isAadhaar = (v: string) => /^\d{12}$/.test(v.replace(/\s/g, ""));
export const isIFSC = (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.trim().toUpperCase());
export const isAccount = (v: string) => /^\d{9,18}$/.test(v.replace(/\s/g, ""));

export const emptyCandidateForms = () => ({
  profile: { fullName: "", dob: "", gender: "", email: "", mobile: "", currentAddress: "", permanentAddress: "", emergencyName: "", emergencyPhone: "" } as PersonalInfo,
  employment: { previousEmployer: "", totalExperience: "" } as EmploymentInfo,
  government: { pan: "", aadhaar: "", passport: "" } as GovInfo,
  bank: { bankName: "", accountNumber: "", ifsc: "" } as BankInfo,
});

export const sectionStates = (c: Candidate) => {
  const p = c.profile;
  const profile = Object.values(p).every((v) => v.trim() !== "");
  const employment = c.employment.previousEmployer.trim() !== "" && c.employment.totalExperience.trim() !== "";
  const government = isPAN(c.government.pan) && isAadhaar(c.government.aadhaar);
  const bank = c.bank.bankName.trim() !== "" && isAccount(c.bank.accountNumber) && isIFSC(c.bank.ifsc);
  const docs = c.docs.every((d) => d.status === "uploaded");
  const declaration = !!c.agreed;
  return { profile, employment, government, bank, docs, declaration };
};

export const computeProgress = (c: Candidate) => {
  const p = c.profile;
  const prof = Object.values(p).filter((v) => v.trim() !== "").length / 9;
  const emp = [c.employment.previousEmployer, c.employment.totalExperience].filter((v) => v.trim() !== "").length / 2;
  const gov = [isPAN(c.government.pan), isAadhaar(c.government.aadhaar)].filter(Boolean).length / 2;
  const bank = [c.bank.bankName.trim() !== "", isAccount(c.bank.accountNumber), isIFSC(c.bank.ifsc)].filter(Boolean).length / 3;
  const docs = c.docs.filter((d) => d.status === "uploaded").length / Math.max(1, c.docs.length);
  const decl = c.agreed ? 1 : 0;
  return Math.round(((prof + emp + gov + bank + docs + decl) / 6) * 100);
};

export const portalLink = (token: string) =>
  `${window.location.origin}${window.location.pathname}#/portal/${token}`;

export const DEFAULT_TERMS = [
  "This offer is contingent upon successful verification of documents and references provided by you.",
  "Your employment will be governed by the company's policies, code of conduct and applicable laws.",
  "The initial probation period is six (6) months from the date of joining, extendable at the company's discretion.",
  "Compensation includes a fixed component and a variable component as detailed in Annexure A of the appointment letter.",
  "Either party may terminate the employment by giving thirty (30) days' notice or salary in lieu thereof.",
  "You shall maintain strict confidentiality of all proprietary information during and after your employment.",
  "This offer remains valid for seven (7) days from the date of issue, unless extended in writing.",
];
