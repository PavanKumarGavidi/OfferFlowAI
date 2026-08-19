import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppNotification, Candidate, Company, DB, EmailLog, HistoryEvent, Role, Session, User } from "./types";
import { computeProgress, isAccount, isAadhaar, isIFSC, isPAN, portalLink, sectionStates, uid } from "./types";
import { SEED_VERSION, seedDB } from "./seed";
import type { ToastItem } from "../components/ui";

const DB_KEY = "offerflow_db_v1";
const SESSION_KEY = "offerflow_session_v1";
const THEME_KEY = "of_theme";

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.v === SEED_VERSION) return parsed;
    }
  } catch { /* fall through */ }
  return seedDB();
}

function loadSession(): Session {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch { /* noop */ }
  return null;
}

type CandidateInput = Pick<Candidate, "name" | "email" | "phone" | "position" | "department" | "joiningDate" | "salary" | "reportingManager">;

interface Store {
  db: DB;
  session: Session;
  user: User | null;
  company: Company | null;
  myCandidates: Candidate[];
  myNotifs: AppNotification[];
  visibleNotifs: AppNotification[];
  dark: boolean;
  toggleTheme: () => void;
  toasts: ToastItem[];
  toast: (title: string, kind?: ToastItem["kind"], desc?: string) => void;
  dismissToast: (id: string) => void;
  verifyFlow: { email: string; code: string } | null;
  resetFlow: { email: string; code: string } | null;
  // auth
  login: (email: string, password: string) => string | null;
  loginDemo: (kind: "hr" | "hr_manager" | "company_admin" | "platform") => void;
  logout: () => void;
  signup: (d: { company: string; name: string; email: string; password: string }) => string | null;
  verifyEmail: (code: string) => boolean;
  requestReset: (email: string) => boolean;
  resetPassword: (code: string, pass: string) => boolean;
  // candidates
  addCandidate: (d: CandidateInput, sendLink: boolean) => Candidate | null;
  updateCandidate: (id: string, patch: Partial<CandidateInput>) => void;
  deleteCandidate: (id: string) => void;
  sendOnboarding: (id: string) => string;
  // portal (token scoped)
  portalCandidate: (token: string) => Candidate | null;
  saveSection: (token: string, section: "profile" | "employment" | "government" | "bank", values: Record<string, string>) => void;
  setAgreed: (token: string, agreed: boolean) => void;
  uploadDoc: (token: string, type: Candidate["docs"][number]["type"], fileName: string, size: number) => string | null;
  removeDoc: (token: string, type: Candidate["docs"][number]["type"]) => void;
  submitOnboarding: (token: string) => string | null;
  markOfferViewed: (token: string) => void;
  respondOffer: (token: string, accept: boolean, reason?: string) => void;
  // hr / manager actions
  requestChanges: (id: string, note: string, items: string[]) => void;
  submitForApproval: (id: string) => void;
  approveCandidate: (id: string) => void;
  rejectCandidate: (id: string, reason: string) => void;
  resendOfferEmail: (id: string) => void;
  markNotifsRead: () => void;
  // settings
  inviteUser: (d: { name: string; email: string; role: Role }) => string | null;
  removeUser: (id: string) => void;
  updateCompanyProfile: (patch: Partial<Company>) => void;
  updateCompanySettings: (patch: Partial<Company["settings"]>) => void;
  updateTemplate: (id: string, subject: string, body: string) => void;
  setPlan: (plan: Company["plan"]) => void;
  // platform admin
  setCompanyActive: (id: string, active: boolean) => void;
  setCompanyPlan: (id: string, plan: Company["plan"]) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export function usePageTitle(t: string) {
  useEffect(() => { document.title = `${t} · OfferFlow AI`; }, [t]);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadDB);
  const [session, setSession] = useState<Session>(loadSession);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [verifyFlow, setVerifyFlow] = useState<{ email: string; code: string } | null>(null);
  const [resetFlow, setResetFlow] = useState<{ email: string; code: string } | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const dbRef = useRef(db);
  dbRef.current = db;

  useEffect(() => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* noop */ } }, [db]);
  useEffect(() => { try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* noop */ } }, [session]);

  const toggleTheme = useCallback(() => {
    setDark((d) => {
      const nd = !d;
      document.documentElement.classList.toggle("dark", nd);
      try { localStorage.setItem(THEME_KEY, nd ? "dark" : "light"); } catch { /* noop */ }
      return nd;
    });
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((title: string, kind: ToastItem["kind"] = "success", desc?: string) => {
    const id = uid();
    setToasts((t) => [...t.slice(-3), { id, title, desc, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  }, []);

  const now = () => new Date().toISOString();
  const notif = (companyId: string | null, audience: AppNotification["audience"], title: string, body: string, kind: AppNotification["kind"], candidateId?: string): AppNotification =>
    ({ id: uid(), companyId, audience, candidateId, title, body, at: now(), read: false, kind });
  const email = (companyId: string | null, to: string, toName: string, subject: string, body: string, type: EmailLog["type"]): EmailLog =>
    ({ id: uid(), companyId, to, toName, subject, body, at: now(), type });
  const audit = (companyId: string | null, actor: string, action: string, detail: string) =>
    ({ id: uid(), companyId, actor, action, detail, at: now() });
  const histEv = (label: string, kind: HistoryEvent["kind"]): HistoryEvent => ({ at: now(), label, kind });

  const patchCandidate = (d: DB, id: string, fn: (c: Candidate) => Candidate): DB =>
    ({ ...d, candidates: d.candidates.map((c) => (c.id === id ? fn(c) : c)) });

  const user = useMemo(() => (session?.kind === "user" ? db.users.find((u) => u.id === session.userId) ?? null : null), [session, db.users]);
  const company = useMemo(() => (user?.companyId ? db.companies.find((c) => c.id === user.companyId) ?? null : null), [user, db.companies]);
  const myCandidates = useMemo(() => (company ? db.candidates.filter((c) => c.companyId === company.id) : []), [db.candidates, company]);
  const myNotifs = useMemo(() => (company ? db.notifications.filter((n) => n.companyId === company.id) : db.notifications.filter((n) => n.companyId === null)), [db.notifications, company]);
  const visibleNotifs = useMemo(() => {
    if (!user) return [];
    if (user.role === "company_admin") return myNotifs.filter((n) => ["hr", "hr_manager", "company_admin"].includes(n.audience));
    if (user.role === "platform_admin") return db.notifications.slice(0, 8);
    return myNotifs.filter((n) => n.audience === user.role);
  }, [myNotifs, user, db.notifications]);

  const renderTpl = (d: DB, companyId: string, key: string, vars: Record<string, string>, fallbackSubject: string, fallbackBody: string) => {
    const tpl = d.templates.find((t) => t.companyId === companyId && t.key === key);
    const fill = (s: string) => Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{{${k}}}`).join(v), s);
    return { subject: fill(tpl ? tpl.subject : fallbackSubject), body: fill(tpl ? tpl.body : fallbackBody) };
  };

  const store: Store = {
    db, session, user, company, myCandidates, myNotifs, visibleNotifs, dark, toggleTheme, toasts, toast, dismissToast, verifyFlow, resetFlow,

    login: (em, pass) => {
      const u = dbRef.current.users.find((x) => x.email.toLowerCase() === em.trim().toLowerCase());
      if (!u) return "No account found with this email.";
      if (u.password !== pass) return "Incorrect password. Try demo1234 for demo accounts.";
      setSession({ kind: "user", userId: u.id });
      toast(`Welcome back, ${u.name.split(" ")[0]}`, "success");
      return null;
    },

    loginDemo: (kind) => {
      const map = { hr: "u_priya", hr_manager: "u_arjun", company_admin: "u_kavita", platform: "u_root" };
      const u = dbRef.current.users.find((x) => x.id === map[kind]);
      if (u) { setSession({ kind: "user", userId: u.id }); toast(`Signed in as ${u.name}`, "info", "Demo workspace — all data is sample data."); }
    },

    logout: () => { setSession(null); toast("Signed out", "info"); },

    signup: ({ company: cname, name, email: em, password }) => {
      const d = dbRef.current;
      if (d.users.some((u) => u.email.toLowerCase() === em.trim().toLowerCase())) return "An account with this email already exists.";
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setVerifyFlow({ email: em.trim(), code });
      setDb((prev) => {
        const cid = "c_" + uid();
        const comp: Company = {
          id: cid, name: cname.trim(), website: "", address: "", contactEmail: em.trim(), contactPhone: "", logoColor: "#2b4ed6",
          plan: "starter", trial: true, active: true, createdAt: now(),
          settings: { hrName: name.trim(), hrDesignation: "HR Admin", offerSubject: "Congratulations! Your Offer from {{CompanyName}}", terms: ["This offer is contingent upon successful verification of documents and references.", "Employment is governed by company policies and applicable laws.", "This offer remains valid for seven (7) days from the date of issue."], senderName: cname.trim(), senderEmail: em.trim() },
        };
        const nu: User = { id: "u_" + uid(), companyId: cid, name: name.trim(), email: em.trim(), role: "company_admin", password, verified: false, color: "#2b4ed6", createdAt: now() };
        return { ...prev, companies: [...prev.companies, comp], users: [...prev.users, nu] };
      });
      return null;
    },

    verifyEmail: (code) => {
      if (!verifyFlow || code.trim() !== verifyFlow.code) return false;
      const u = dbRef.current.users.find((x) => x.email.toLowerCase() === verifyFlow.email.toLowerCase());
      if (!u) return false;
      setDb((prev) => ({ ...prev, users: prev.users.map((x) => (x.id === u.id ? { ...x, verified: true } : x)) }));
      setSession({ kind: "user", userId: u.id });
      setVerifyFlow(null);
      toast("Email verified", "success", "Your 14-day free trial has started.");
      return true;
    },

    requestReset: (em) => {
      const u = dbRef.current.users.find((x) => x.email.toLowerCase() === em.trim().toLowerCase());
      if (!u) return false;
      setResetFlow({ email: u.email, code: String(Math.floor(100000 + Math.random() * 900000)) });
      return true;
    },

    resetPassword: (code, pass) => {
      if (!resetFlow || code.trim() !== resetFlow.code) return false;
      const em = resetFlow.email;
      setDb((prev) => ({ ...prev, users: prev.users.map((x) => (x.email === em ? { ...x, password: pass } : x)) }));
      setResetFlow(null);
      toast("Password updated", "success", "Sign in with your new password.");
      return true;
    },

    addCandidate: (d, sendLink) => {
      if (!company || !user) return null;
      const cid = company.id;
      const token = "of_" + uid();
      const c: Candidate = {
        id: "cand_" + uid(), companyId: cid, ...d, status: "registration_pending", token, createdAt: now(),
        profile: { fullName: d.name, dob: "", gender: "", email: d.email, mobile: d.phone, currentAddress: "", permanentAddress: "", emergencyName: "", emergencyPhone: "" },
        employment: { previousEmployer: "", totalExperience: "" }, government: { pan: "", aadhaar: "", passport: "" }, bank: { bankName: "", accountNumber: "", ifsc: "" },
        docs: (["resume", "photo", "pan", "aadhaar", "education", "experience", "address", "bank"] as const).map((t) => ({ type: t, status: "pending" as const })),
        history: [histEv(`Candidate created by ${user.name}`, "create")],
      };
      setDb((prev) => {
        let next: DB = { ...prev, candidates: [c, ...prev.candidates] };
        if (sendLink) {
          const vars = { CandidateName: d.name, Position: d.position, CompanyName: company.name, HRName: company.settings.hrName, PortalLink: portalLink(token) };
          const m = renderTpl(prev, cid, "onboarding_invite", vars, "Welcome aboard! Complete your onboarding — {{CompanyName}}", "Dear {{CandidateName}},\n\nClick the secure link to complete your onboarding: {{PortalLink}}");
          next = {
            ...next,
            emails: [email(cid, d.email, d.name, m.subject, m.body, "onboarding_invite"), ...next.emails],
            notifications: [notif(cid, "candidate", "Welcome to OfferFlow", "Complete your onboarding information and upload the required documents.", "info", c.id), ...next.notifications],
            audits: [audit(cid, user.name, "candidate.create", `Created candidate ${d.name} (${d.position}) and sent onboarding link`), ...next.audits],
            candidates: next.candidates.map((x) => (x.id === c.id ? { ...x, history: [...x.history, histEv("Onboarding link sent via email", "info")] } : x)),
          };
        } else {
          next = { ...next, audits: [audit(cid, user.name, "candidate.create", `Created candidate ${d.name} (${d.position})`), ...next.audits] };
        }
        return next;
      });
      toast(sendLink ? "Candidate added — onboarding link emailed" : "Candidate added", "success", sendLink ? `Secure link sent to ${d.email}` : "Send the onboarding link whenever you're ready.");
      return c;
    },

    updateCandidate: (id, patch) => {
      setDb((prev) => patchCandidate(prev, id, (c) => ({ ...c, ...patch })));
      toast("Candidate updated", "success");
    },

    deleteCandidate: (id) => {
      const c = dbRef.current.candidates.find((x) => x.id === id);
      setDb((prev) => ({
        ...prev,
        candidates: prev.candidates.filter((x) => x.id !== id),
        audits: [audit(company?.id ?? null, user?.name ?? "System", "candidate.delete", `Deleted candidate ${c?.name ?? id}`), ...prev.audits],
      }));
      toast("Candidate deleted", "info");
    },

    sendOnboarding: (id) => {
      const c = dbRef.current.candidates.find((x) => x.id === id);
      if (!c || !company || !user) return "";
      const vars = { CandidateName: c.name, Position: c.position, CompanyName: company.name, HRName: company.settings.hrName, PortalLink: portalLink(c.token) };
      const m = renderTpl(dbRef.current, company.id, "onboarding_invite", vars, "Welcome aboard! Complete your onboarding — {{CompanyName}}", "Dear {{CandidateName}},\n\nClick the secure link to complete your onboarding: {{PortalLink}}");
      setDb((prev) => ({
        ...patchCandidate(prev, id, (x) => ({ ...x, history: [...x.history, histEv(`Onboarding link ${x.status === "registration_pending" ? "sent" : "re-sent"} via email`, "info")] })),
        emails: [email(company.id, c.email, c.name, m.subject, m.body, "onboarding_invite"), ...prev.emails],
        notifications: [notif(company.id, "candidate", "Welcome to OfferFlow", "Complete your onboarding information and upload the required documents.", "info", id), ...prev.notifications],
      }));
      toast("Onboarding link emailed", "success", `Sent to ${c.email}`);
      return portalLink(c.token);
    },

    portalCandidate: (token) => dbRef.current.candidates.find((c) => c.token === token) ?? null,

    saveSection: (token, section, values) => {
      setDb((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) => {
          if (c.token !== token) return c;
          const base = { ...c, [section]: { ...(c as never as Record<string, Record<string, string>>)[section], ...values } } as Candidate;
          if (c.status === "registration_pending") {
            base.status = "information_submitted";
            base.history = [...c.history, histEv("Candidate opened the portal and started the onboarding form", "info")];
          }
          return base;
        }),
      }));
    },

    setAgreed: (token, agreed) => {
      setDb((prev) => ({ ...prev, candidates: prev.candidates.map((c) => (c.token === token ? { ...c, agreed } : c)) }));
    },

    uploadDoc: (token, type, fileName, size) => {
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
      if (!["pdf", "jpg", "jpeg", "png"].includes(ext)) return "Unsupported file type. Upload PDF, JPG or PNG.";
      const max = type === "photo" ? 2 : 5;
      if (size > max * 1024 * 1024) return `File is too large. Maximum size is ${max} MB.`;
      setDb((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.token === token
            ? { ...c, docs: c.docs.map((d) => (d.type === type ? { type, status: "uploaded" as const, fileName, size, uploadedAt: now() } : d)) }
            : c
        ),
      }));
      return null;
    },

    removeDoc: (token, type) => {
      setDb((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) => (c.token === token ? { ...c, docs: c.docs.map((d) => (d.type === type ? { type, status: "pending" as const } : d)) } : c)),
      }));
    },

    submitOnboarding: (token) => {
      const c = dbRef.current.candidates.find((x) => x.token === token);
      if (!c) return "Link not found.";
      const s = sectionStates(c);
      if (Object.values(s).some((v) => !v)) return "Please complete every section, upload all required documents and accept the declaration.";
      const comp = dbRef.current.companies.find((x) => x.id === c.companyId);
      setDb((prev) => ({
        ...patchCandidate(prev, c.id, (x) => ({ ...x, status: "hr_review", submittedAt: now(), changeNote: undefined, changeItems: undefined, history: [...x.history, histEv("Onboarding information & documents submitted for HR review", "success")] })),
        notifications: [notif(c.companyId, "hr", "Onboarding submitted", `${c.name} submitted their information and documents. HR review is pending.`, "info", c.id), ...prev.notifications],
        emails: [email(c.companyId, comp?.contactEmail ?? "hr@company.com", "HR Team", `New submission: ${c.name} — ${c.position}`, `${c.name} has submitted their onboarding information and ${c.docs.filter((d) => d.status === "uploaded").length} documents. Open OfferFlow to review.`, "system"), ...prev.emails],
        audits: [audit(c.companyId, c.name, "candidate.submit", "Submitted onboarding information and documents"), ...prev.audits],
      }));
      return null;
    },

    markOfferViewed: (token) => {
      const c = dbRef.current.candidates.find((x) => x.token === token);
      if (!c?.offer || c.offer.status !== "sent") return;
      setDb((prev) => ({
        ...patchCandidate(prev, c.id, (x) => ({
          ...x, status: "offer_viewed",
          offer: x.offer ? { ...x.offer, status: "viewed", viewedAt: now() } : x.offer,
          history: [...x.history, histEv("Offer viewed by candidate", "info")],
        })),
        notifications: [notif(c.companyId, "hr", "Offer viewed", `${c.name} opened their offer letter — awaiting response.`, "info", c.id), ...prev.notifications],
      }));
    },

    respondOffer: (token, accept, reason) => {
      const found = dbRef.current.candidates.find((x) => x.token === token);
      if (!found || !found.offer) return;
      const c = found;
      const offerNo = found.offer.number;
      setDb((prev) => ({
        ...patchCandidate(prev, c.id, (x) => ({
          ...x, status: accept ? "accepted" : "rejected",
          offer: x.offer ? { ...x.offer, status: accept ? "accepted" : "rejected", respondedAt: now(), rejectReason: accept ? undefined : reason } : x.offer,
          history: [...x.history, histEv(accept ? `Offer ${x.offer?.number} accepted by candidate` : `Offer ${x.offer?.number} rejected by candidate`, accept ? "success" : "danger")],
        })),
        notifications: [
          notif(c.companyId, "hr", accept ? "Offer accepted" : "Offer rejected", `${c.name} ${accept ? `accepted offer ${offerNo}.` : `declined offer ${offerNo}.${reason ? " Reason: " + reason : ""}`}`, accept ? "success" : "danger", c.id),
          notif(c.companyId, "hr_manager", accept ? "Offer accepted" : "Offer rejected", `${c.name} ${accept ? "accepted" : "declined"} offer ${offerNo}.`, accept ? "success" : "danger", c.id),
          ...prev.notifications,
        ],
        emails: [email(c.companyId, "hr@company.com", "HR Team", `${c.name} ${accept ? "accepted" : "declined"} the offer`, `${c.name} has ${accept ? "accepted" : "declined"} offer ${offerNo} for ${c.position}.`, "system"), ...prev.emails],
        audits: [audit(c.companyId, c.name, accept ? "offer.accept" : "offer.reject", `${accept ? "Accepted" : "Rejected"} offer ${offerNo}`), ...prev.audits],
      }));
    },

    requestChanges: (id, note, items) => {
      const c = dbRef.current.candidates.find((x) => x.id === id);
      if (!c || !company || !user) return;
      const vars = { CandidateName: c.name, CompanyName: company.name, HRName: company.settings.hrName, ChangeNote: note };
      const m = renderTpl(dbRef.current, company.id, "changes_requested", vars, "Action needed: update your onboarding details — {{CompanyName}}", "Dear {{CandidateName}},\n\n{{ChangeNote}}");
      setDb((prev) => ({
        ...patchCandidate(prev, id, (x) => ({ ...x, status: "changes_requested", changeNote: note, changeItems: items, history: [...x.history, histEv(`Changes requested by ${user.name} — ${items.join(", ") || "general updates"}`, "warning")] })),
        notifications: [notif(company.id, "candidate", "Changes requested", `HR requested updates: ${items.join(", ") || note}`, "warning", id), ...prev.notifications],
        emails: [email(company.id, c.email, c.name, m.subject, m.body, "changes_requested"), ...prev.emails],
        audits: [audit(company.id, user.name, "review.request_changes", `Requested changes from ${c.name}: ${items.join(", ") || note}`), ...prev.audits],
      }));
      toast("Changes requested", "warning", `${c.name} has been notified by email.`);
    },

    submitForApproval: (id) => {
      const c = dbRef.current.candidates.find((x) => x.id === id);
      if (!c || !company || !user) return;
      setDb((prev) => ({
        ...patchCandidate(prev, id, (x) => ({ ...x, status: "approval_pending", history: [...x.history, histEv(`HR review completed by ${user.name} — forwarded for manager approval`, "info")] })),
        notifications: [notif(company.id, "hr_manager", "Approval required", `${c.name} (${c.position}) is waiting for your approval.`, "warning", id), ...prev.notifications],
        audits: [audit(company.id, user.name, "review.complete", `Forwarded ${c.name} for manager approval`), ...prev.audits],
      }));
      toast("Submitted for approval", "success", "The HR Manager has been notified.");
    },

    approveCandidate: (id) => {
      const c = dbRef.current.candidates.find((x) => x.id === id);
      if (!c || !company || !user) return;
      const count = dbRef.current.candidates.filter((x) => x.companyId === company.id && x.offer).length;
      const number = `OF-${new Date().getFullYear()}-${String(101 + count).padStart(3, "0")}`;
      const vars = { CandidateName: c.name, Position: c.position, CompanyName: company.name, HRName: company.settings.hrName, HRDesignation: company.settings.hrDesignation };
      const m = renderTpl(dbRef.current, company.id, "offer_released", vars, "Congratulations! Your Offer from {{CompanyName}}", "Dear {{CandidateName}},\n\nCongratulations! We are pleased to offer you the position of {{Position}} at {{CompanyName}}.\n\nPlease find your offer letter attached.");
      setDb((prev) => ({
        ...patchCandidate(prev, id, (x) => ({
          ...x, status: "offer_sent",
          offer: { id: "of_" + uid(), number, generatedAt: now(), sentAt: now(), status: "sent" },
          history: [...x.history, histEv(`Approved by ${user.name} (HR Manager)`, "success"), histEv(`Offer ${number} generated & emailed to candidate`, "success")],
        })),
        notifications: [notif(company.id, "candidate", "Offer letter released", `Your offer from ${company.name} is ready. Open your portal to view it.`, "success", id), ...prev.notifications],
        emails: [email(company.id, c.email, c.name, m.subject, m.body, "offer"), ...prev.emails],
        audits: [audit(company.id, user.name, "approval.grant", `Approved ${c.name} — offer ${number} generated & sent`), ...prev.audits],
      }));
      toast("Offer Generated Successfully", "success", `${number} has been emailed to ${c.name}.`);
    },

    rejectCandidate: (id, reason) => {
      const c = dbRef.current.candidates.find((x) => x.id === id);
      if (!c || !company || !user) return;
      setDb((prev) => ({
        ...patchCandidate(prev, id, (x) => ({ ...x, status: "rejected", history: [...x.history, histEv(`Rejected by ${user.name} — ${reason}`, "danger")] })),
        emails: [email(company.id, c.email, c.name, `Update on your application — ${company.name}`, `Dear ${c.name},\n\nThank you for your time and interest in ${company.name}. After careful consideration, we are unable to move forward with your candidature for ${c.position}.\n\nWe wish you the very best.` , "system"), ...prev.emails],
        audits: [audit(company.id, user.name, "approval.reject", `Rejected ${c.name} — ${reason}`), ...prev.audits],
      }));
      toast("Candidate rejected", "info", `${c.name} has been notified by email.`);
    },

    resendOfferEmail: (id) => {
      const c = dbRef.current.candidates.find((x) => x.id === id);
      if (!c || !company || !c.offer) return;
      const vars = { CandidateName: c.name, Position: c.position, CompanyName: company.name, HRName: company.settings.hrName, HRDesignation: company.settings.hrDesignation };
      const m = renderTpl(dbRef.current, company.id, "offer_released", vars, "Congratulations! Your Offer from {{CompanyName}}", "Dear {{CandidateName}},\n\nCongratulations! We are pleased to offer you the position of {{Position}} at {{CompanyName}}.");
      setDb((prev) => ({
        ...prev,
        emails: [email(company.id, c.email, c.name, m.subject, m.body, "offer"), ...prev.emails],
        candidates: prev.candidates.map((x) => (x.id === id && x.offer && x.offer.status === "generated" ? { ...x, status: "offer_sent" as const, offer: { ...x.offer, status: "sent" as const, sentAt: now() } } : x)),
      }));
      toast("Offer email re-sent", "success", `Delivered to ${c.email}`);
    },

    markNotifsRead: () => {
      if (!user) return;
      const audiences = user.role === "company_admin" ? ["hr", "hr_manager", "company_admin"] : [user.role];
      setDb((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.companyId === company?.id && audiences.includes(n.audience) ? { ...n, read: true } : n)),
      }));
    },

    inviteUser: ({ name, email: em, role }) => {
      if (!company || !user) return "Not allowed.";
      if (dbRef.current.users.some((u) => u.email.toLowerCase() === em.toLowerCase())) return "A user with this email already exists.";
      const nu: User = { id: "u_" + uid(), companyId: company.id, name, email: em, role, password: "welcome123", verified: true, color: "#0d9488", createdAt: now() };
      setDb((prev) => ({
        ...prev,
        users: [...prev.users, nu],
        emails: [email(company.id, em, name, `You've been invited to ${company.name} on OfferFlow AI`, `Hi ${name},\n\n${user.name} invited you to join ${company.name} on OfferFlow AI as ${role === "hr" ? "HR" : "HR Manager"}.\n\nTemporary password: welcome123`, "invite_user"), ...prev.emails],
        audits: [audit(company.id, user.name, "user.invite", `Invited ${name} (${em}) as ${role}`), ...prev.audits],
      }));
      toast("Invite sent", "success", `${name} has been emailed login details.`);
      return null;
    },

    removeUser: (id) => {
      const u = dbRef.current.users.find((x) => x.id === id);
      setDb((prev) => ({
        ...prev,
        users: prev.users.filter((x) => x.id !== id),
        audits: [audit(company?.id ?? null, user?.name ?? "System", "user.remove", `Removed user ${u?.name ?? id}`), ...prev.audits],
      }));
      toast("User removed", "info");
    },

    updateCompanyProfile: (patch) => {
      if (!company) return;
      setDb((prev) => ({ ...prev, companies: prev.companies.map((c) => (c.id === company.id ? { ...c, ...patch } : c)) }));
      toast("Company profile saved", "success");
    },

    updateCompanySettings: (patch) => {
      if (!company) return;
      setDb((prev) => ({ ...prev, companies: prev.companies.map((c) => (c.id === company.id ? { ...c, settings: { ...c.settings, ...patch } } : c)) }));
      toast("Settings saved", "success");
    },

    updateTemplate: (id, subject, body) => {
      setDb((prev) => ({ ...prev, templates: prev.templates.map((t) => (t.id === id ? { ...t, subject, body } : t)) }));
      toast("Template updated", "success");
    },

    setPlan: (plan) => {
      if (!company || !user) return;
      setDb((prev) => ({
        ...prev,
        companies: prev.companies.map((c) => (c.id === company.id ? { ...c, plan, trial: false } : c)),
        audits: [audit(company.id, user.name, "billing.plan_change", `Changed plan to ${plan}`), ...prev.audits],
      }));
      toast("Plan updated", "success", "Billing via Stripe will be enabled soon — no charge in demo.");
    },

    setCompanyActive: (id, active) => {
      setDb((prev) => ({ ...prev, companies: prev.companies.map((c) => (c.id === id ? { ...c, active } : c)), audits: [audit(null, user?.name ?? "Platform", "company.toggle", `${active ? "Activated" : "Suspended"} company ${id}`), ...prev.audits] }));
      toast(active ? "Company activated" : "Company suspended", active ? "success" : "warning");
    },

    setCompanyPlan: (id, plan) => {
      setDb((prev) => ({ ...prev, companies: prev.companies.map((c) => (c.id === id ? { ...c, plan, trial: false } : c)) }));
      toast("Plan updated", "success");
    },

    resetDemo: () => {
      localStorage.removeItem(DB_KEY);
      setDb(seedDB());
      setSession(null);
      toast("Demo data reset", "info", "All sample data has been restored.");
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

// convenience selectors used across pages
export const candidateProgress = (c: Candidate) => computeProgress(c);
