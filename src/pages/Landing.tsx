import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Check, ChevronDown, FileText, Link2, Lock, Mail, Moon, Play, ShieldCheck,
  Sparkles, Stamp, Sun, UserCheck, Users, Zap,
} from "lucide-react";
import { PLANS } from "../lib/types";
import { useStore } from "../lib/store";
import { Button, Logo, LogoMark, Reveal } from "../components/ui";

const STEPS = [
  { icon: UserCheck, title: "Candidate selected", body: "Recruiting is done. You already know who you're hiring." },
  { icon: Users, title: "HR creates candidate", body: "Name, role, salary, joining date — 60 seconds, no Excel." },
  { icon: Link2, title: "Secure link emailed", body: "A private, token-scoped onboarding portal — no logins for candidates." },
  { icon: FileText, title: "Info & documents in", body: "Validated forms, PAN/Aadhaar/IFSC checks, 8 documents collected." },
  { icon: Stamp, title: "Review & approval", body: "HR reviews, requests changes if needed, manager approves in one click." },
  { icon: Mail, title: "Offer auto-generated", body: "A branded PDF is built from your template and emailed instantly." },
  { icon: BadgeCheck, title: "Candidate responds", body: "Accept or reject from the portal. HR sees the status live." },
];

const FAQS = [
  { q: "Is OfferFlow AI an ATS?", a: "No — and that's the point. OfferFlow starts where your ATS stops: after the candidate is selected. It replaces the manual emails, sheets and chasing that happen between 'selected' and 'offer accepted'." },
  { q: "Do candidates need an account?", a: "No. Candidates get a unique, secure onboarding link. They see only their own information and documents — never your HR workspace." },
  { q: "How is multi-tenant isolation enforced?", a: "Every record carries a workspace ID and every query filters by it. Company A can never read Company B's candidates, documents, users or offers — it's enforced at the data layer, not just the UI." },
  { q: "Can we customise the offer letter?", a: "Yes. Company logo, signatory name, designation, terms & conditions and the email subject are all configurable per workspace. The letter is generated as a PDF automatically." },
  { q: "What about document security?", a: "Uploads are validated by type and size, stored encrypted, and accessible only to your workspace's HR roles. Every access and action lands in an audit log." },
  { q: "How does billing work?", a: "Plans are per workspace with monthly billing. Payment processing via Stripe is designed in — the demo runs without charging anything." },
];

function MiniMock() {
  const rows = [
    { n: "Sneha Iyer", r: "Data Analyst", s: "HR Review", cls: "bg-amber-500/12 text-amber-700 ring-amber-500/30", pct: 100 },
    { n: "Rohan Verma", r: "DevOps Engineer", s: "Approval", cls: "bg-purple-500/12 text-purple-700 ring-purple-500/30", pct: 100 },
    { n: "Diya Sharma", r: "Product Designer", s: "Offer Sent", cls: "bg-cobalt-500/12 text-cobalt-700 ring-cobalt-500/30", pct: 82 },
  ];
  return (
    <div className="relative">
      <div className="panel !rounded-2xl p-5 shadow-2xl shadow-cobalt-900/10 w-[min(400px,86vw)] animate-float-slow">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-bold text-[14px] text-ink-900 dark:text-white">Hiring pipeline</p>
          <span className="text-[11px] font-bold text-ink-400">Live · Acme Technologies</span>
        </div>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.n} className="p-3 rounded-xl bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/6 dark:ring-white/8">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0" style={{ background: ["#2b4ed6", "#7c3aed", "#0d9488"][i] }}>{r.n.split(" ").map((x) => x[0]).join("")}</span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-ink-900 dark:text-white truncate">{r.n}</p>
                    <p className="text-[10.5px] text-ink-400 truncate">{r.r}</p>
                  </div>
                </div>
                <span className={`text-[10.5px] font-bold px-2 py-1 rounded-full ring-1 ring-inset shrink-0 ${r.cls}`}>{r.s}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-ink-900/8 dark:bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${r.pct === 100 ? "bg-emerald-500" : "bg-cobalt-500"} animate-grow-x origin-left`} style={{ width: `${r.pct}%`, animationDelay: `${i * 200}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating offer card */}
      <div className="absolute -right-6 sm:-right-16 -top-10 w-52 letter-paper !rounded-xl p-4 rotate-3 animate-float hidden sm:block">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#2b4ed6]">
          <LogoMark size={20} />
          <p className="font-display font-bold text-[11px] text-[#101a40]">Offer · OF-2026-014</p>
        </div>
        <p className="text-[10.5px] text-[#39425c] mt-2 leading-relaxed">Dear <b>Diya Sharma</b>, congratulations — Product Designer, Design…</p>
        <p className="font-display italic text-[15px] text-[#2b4ed6] mt-2">Priya Deshmukh</p>
      </div>

      {/* Floating accepted toast */}
      <div className="absolute -left-4 sm:-left-14 -bottom-8 panel !rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-xl animate-float" style={{ animationDelay: "1.2s" }}>
        <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check size={14} /></span>
        <div>
          <p className="text-[12px] font-bold text-ink-900 dark:text-white">Offer accepted</p>
          <p className="text-[10.5px] text-ink-400">Aarav Mehta · just now</p>
        </div>
      </div>
    </div>
  );
}

function ScreenMock({ kind }: { kind: string }) {
  if (kind === "dashboard") {
    return (
      <div className="panel !rounded-2xl overflow-hidden text-left">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-900/8 dark:border-white/8">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[11px] font-bold text-ink-400">app.offerflow.ai/dashboard — Acme Technologies</span>
        </div>
        <div className="p-5 grid grid-cols-4 gap-3">
          {[["9", "Candidates", "#2b4ed6"], ["1", "HR Review", "#f59e0b"], ["1", "Approval", "#7c3aed"], ["2", "Offers out", "#0ea5e9"]].map(([v, l, c]) => (
            <div key={l as string} className="rounded-xl bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/6 dark:ring-white/8 p-3">
              <p className="font-display font-bold text-[22px] leading-none" style={{ color: c as string }}>{v}</p>
              <p className="text-[10.5px] font-semibold text-ink-400 mt-1">{l}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 space-y-2.5">
          {[["Registration Pending", 12, "#94a3b8"], ["Information Submitted", 34, "#0ea5e9"], ["HR Review", 22, "#f59e0b"], ["Approval", 45, "#7c3aed"], ["Offer Sent", 62, "#2b4ed6"], ["Accepted", 88, "#10b981"]].map(([l, w, c], i) => (
            <div key={l as string} className="flex items-center gap-3">
              <span className="text-[10.5px] font-semibold text-ink-400 w-32 shrink-0">{l}</span>
              <div className="h-2 flex-1 rounded-full bg-ink-900/6 dark:bg-white/8 overflow-hidden">
                <div className="h-full rounded-full origin-left animate-grow-x" style={{ width: `${w}%`, background: c as string, animationDelay: `${i * 100}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "review") {
    return (
      <div className="panel !rounded-2xl overflow-hidden text-left">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-900/8 dark:border-white/8">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[11px] font-bold text-ink-400">Candidate review — Sneha Iyer</span>
        </div>
        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            {[["Full Name", "Sneha Iyer"], ["PAN", "BXTP****91F ✓"], ["Aadhaar", "•••• •••• 7742 ✓"], ["Bank · IFSC", "HDFC0001207 ✓"]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between p-2.5 rounded-lg bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/6 dark:ring-white/8">
                <span className="text-[11px] font-semibold text-ink-400">{k}</span>
                <span className="text-[11.5px] font-bold text-ink-800 dark:text-ink-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5 content-start">
            {["Resume", "PAN Card", "Aadhaar", "Certificates", "Exp. Letter", "Bank Proof"].map((d) => (
              <div key={d} className="p-2.5 rounded-lg bg-emerald-500/6 ring-1 ring-emerald-500/20 flex items-center gap-2">
                <Check size={12} className="text-emerald-500 shrink-0" />
                <span className="text-[11px] font-bold text-ink-700 dark:text-ink-200 truncate">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2.5">
          <span className="px-3.5 py-2 rounded-lg ring-1 ring-ink-300/70 dark:ring-white/15 text-[11.5px] font-bold text-ink-500">Request Changes</span>
          <span className="px-3.5 py-2 rounded-lg bg-cobalt-600 text-white text-[11.5px] font-bold">Submit for Approval</span>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl">
      <div className="letter-paper p-6 text-left">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#2b4ed6]">
          <div className="flex items-center gap-2"><LogoMark size={24} /><p className="font-display font-bold text-[13px] text-[#101a40]">Acme Technologies</p></div>
          <p className="text-[10px] font-bold text-[#5a688c]">Ref: OF-2026-014</p>
        </div>
        <p className="font-display font-bold text-[14px] text-[#101a40] mt-4">Subject: Offer of Employment — Product Designer</p>
        <p className="text-[11px] text-[#39425c] mt-2 leading-relaxed">Dear Diya Sharma, congratulations! We are delighted to offer you the position of Product Designer in our Design department…</p>
        <div className="mt-3 rounded-lg ring-1 ring-[#d3daea] divide-y divide-[#e7ecf6]">
          {[["Annual Compensation", "₹14,50,000"], ["Date of Joining", "2 Mar 2026"], ["Reporting Manager", "Ritika Chandra"]].map(([k, v]) => (
            <div key={k} className="flex justify-between px-3 py-1.5 text-[10.5px]"><span className="font-bold text-[#39425c]">{k}</span><span className="font-semibold text-[#1c2438]">{v}</span></div>
          ))}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <p className="font-display italic text-[17px] text-[#2b4ed6]">Priya Deshmukh</p>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 rounded-full px-2 py-0.5">✓ Digitally signed</span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const nav = useNavigate();
  const { loginDemo, dark, toggleTheme } = useStore();
  const [faq, setFaq] = useState<number | null>(0);
  const [screen, setScreen] = useState("dashboard");

  const demo = () => { loginDemo("hr"); nav("/app"); };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 overflow-x-clip">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-ink-50/85 dark:bg-ink-950/85 backdrop-blur-md border-b border-ink-900/8 dark:border-white/8">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-semibold text-ink-500 dark:text-ink-300 ml-6">
            <a href="#how" className="hover:text-ink-900 dark:hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-ink-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-ink-900 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-ink-900 dark:hover:text-white transition-colors">FAQ</a>
          </nav>
          <span className="flex-1" />
          <button onClick={toggleTheme} className="p-2 rounded-lg text-ink-500 dark:text-ink-300 hover:bg-ink-900/6 dark:hover:bg-white/8 transition-colors" aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => nav("/auth")}>Sign in</Button>
          <Button size="sm" onClick={() => nav("/auth?mode=signup")}>Start Free Trial</Button>
        </div>
      </header>

      {/* Hero — split, product-first */}
      <section className="relative">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(700px_360px_at_78%_18%,rgba(43,78,214,0.13),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 sm:pt-24 pb-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt-500/8 ring-1 ring-inset ring-cobalt-500/25 text-[12.5px] font-bold text-cobalt-700 dark:text-cobalt-300">
              <Sparkles size={13} /> Post-selection HR automation
            </p>
            <h1 className="font-display font-bold text-[40px] sm:text-[54px] leading-[1.04] tracking-tight text-ink-900 dark:text-white mt-5">
              Automate your HR process <span className="relative whitespace-nowrap">after selection<svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none"><path d="M3 9C60 3 240 3 297 8" stroke="var(--color-cobalt-500)" strokeWidth="5" strokeLinecap="round" opacity="0.55" /></svg></span>
            </h1>
            <p className="font-display text-[17px] font-semibold text-cobalt-700 dark:text-cobalt-300 mt-5">From Candidate Selection to Offer Letter — Automated.</p>
            <p className="text-[16px] text-ink-500 dark:text-ink-300 mt-3 max-w-xl leading-relaxed">
              Collect candidate information, manage documents, streamline approvals, and automatically send professional offer letters — all from one simple platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button size="lg" onClick={() => nav("/auth?mode=signup")} icon={<ArrowRight size={17} />}>Start Free Trial</Button>
              <Button size="lg" variant="outline" onClick={demo} icon={<Play size={16} />}>Try Demo</Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] font-semibold text-ink-400">
              <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> 14-day free trial</span>
              <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><Lock size={13} className="text-emerald-500" /> Tenant-isolated</span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end animate-fade-up" style={{ animationDelay: "150ms" }}>
            <MiniMock />
          </div>
        </div>

        {/* trusted by */}
        <div className="relative border-y border-ink-900/6 dark:border-white/6 bg-white/60 dark:bg-ink-900/40">
          <div className="max-w-6xl mx-auto px-5 py-6 flex flex-wrap items-center gap-x-10 gap-y-3">
            <span className="text-[11.5px] font-bold uppercase tracking-widest text-ink-400">Trusted by people teams at</span>
            {["Acme Technologies", "Nova Solutions", "BrightLabs", "Quantico", "Helix Systems"].map((n) => (
              <span key={n} className="font-display font-bold text-[15px] text-ink-300 dark:text-ink-600 hover:text-ink-500 dark:hover:text-ink-400 transition-colors cursor-default">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
        <Reveal>
          <p className="text-[13px] font-bold uppercase tracking-widest text-cobalt-600 dark:text-cobalt-300">How it works</p>
          <h2 className="font-display font-bold text-[30px] sm:text-[38px] tracking-tight text-ink-900 dark:text-white mt-2 max-w-2xl">The entire post-selection journey, on rails</h2>
          <p className="text-[15px] text-ink-500 dark:text-ink-300 mt-3 max-w-2xl">One linear flow. Zero chasing. Every step notifies the right person automatically.</p>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.slice(0, 4).map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="panel !rounded-xl p-5 h-full relative group hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <span className="absolute top-4 right-4 font-display font-bold text-[34px] text-ink-900/6 dark:text-white/6 leading-none">{i + 1}</span>
                <span className="w-10 h-10 rounded-xl bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><s.icon size={18} /></span>
                <h3 className="font-display font-bold text-[16px] text-ink-900 dark:text-white mt-4">{s.title}</h3>
                <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-1.5 leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          {STEPS.slice(4).map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="panel !rounded-xl p-5 h-full relative group hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <span className="absolute top-4 right-4 font-display font-bold text-[34px] text-ink-900/6 dark:text-white/6 leading-none">{i + 5}</span>
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center"><s.icon size={18} /></span>
                <h3 className="font-display font-bold text-[16px] text-ink-900 dark:text-white mt-4">{s.title}</h3>
                <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-1.5 leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="bg-white dark:bg-ink-900/50 border-y border-ink-900/6 dark:border-white/6 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <p className="text-[13px] font-bold uppercase tracking-widest text-cobalt-600 dark:text-cobalt-300">Features</p>
            <h2 className="font-display font-bold text-[30px] sm:text-[38px] tracking-tight text-ink-900 dark:text-white mt-2 max-w-2xl">Everything between "selected" and "signed"</h2>
          </Reveal>
          <div className="mt-10 grid lg:grid-cols-3 gap-4">
            <Reveal className="lg:col-span-2">
              <div className="panel !rounded-2xl p-7 h-full">
                <div className="grid sm:grid-cols-2 gap-7 items-center h-full">
                  <div>
                    <span className="w-10 h-10 rounded-xl bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Lock size={18} /></span>
                    <h3 className="font-display font-bold text-[20px] text-ink-900 dark:text-white mt-4">Secure candidate portal</h3>
                    <p className="text-[13.5px] text-ink-500 dark:text-ink-400 mt-2 leading-relaxed">A token-scoped link — no logins. Guided steps for personal, employment, government and bank details with live validation for PAN, Aadhaar and IFSC.</p>
                    <ul className="mt-4 space-y-2 text-[13px] font-semibold text-ink-600 dark:text-ink-300">
                      {["Progress tracking per section", "Upload, preview & replace documents", "Declaration & e-consent built in"].map((x) => (
                        <li key={x} className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/8 dark:ring-white/10 p-4">
                    <p className="text-[11.5px] font-bold text-ink-400 mb-3">Profile Completion: 75%</p>
                    <div className="h-2 rounded-full bg-ink-900/8 dark:bg-white/10 overflow-hidden mb-4"><div className="h-full w-3/4 rounded-full bg-cobalt-500 animate-grow-x origin-left" /></div>
                    {["Full Name — Sneha Iyer", "PAN — BXTPX4491F", "Aadhaar — verified", "Bank — HDFC ••••2207"].map((x) => (
                      <div key={x} className="flex items-center gap-2 py-1.5 text-[12px] font-semibold text-ink-600 dark:text-ink-300 border-b border-ink-900/5 dark:border-white/5 last:border-0"><Check size={13} className="text-emerald-500" /> {x}</div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="panel !rounded-2xl p-7 h-full bg-cobalt-700 !ring-0 text-white relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative">
                  <span className="w-10 h-10 rounded-xl bg-white/12 text-white flex items-center justify-center"><Mail size={18} /></span>
                  <h3 className="font-display font-bold text-[20px] mt-4">Offer letters that write themselves</h3>
                  <p className="text-[13.5px] text-cobalt-100 mt-2 leading-relaxed">Approval triggers a branded PDF — logo, salary, terms, signature — and emails it with one click of the candidate's accept button.</p>
                  <div className="mt-5 rounded-lg bg-white/10 ring-1 ring-white/15 p-3.5 text-[12px] font-semibold">
                    <p className="text-cobalt-200 text-[10.5px] uppercase tracking-wider font-bold mb-1.5">Email sent automatically</p>
                    "Congratulations! Your Offer from Acme Technologies" — with View & Download buttons.
                  </div>
                </div>
              </div>
            </Reveal>
            {([
              [Stamp, "Two-step approvals", "HR reviews, then the HR Manager approves, rejects or requests changes — with full context."],
              [FileText, "Document vault", "8 required documents validated by type and size, stored encrypted per tenant."],
              [Zap, "Emails on autopilot", "Invite, change requests, offer release, acceptance — every step emails the right person."],
              [ShieldCheck, "True multi-tenant SaaS", "Workspace-level isolation on every record. Company A never sees Company B."],
              [Users, "Roles that make sense", "Company Admin, HR, HR Manager — each sees exactly their slice of the flow."],
              [BadgeCheck, "Live offer tracking", "Generated → Sent → Viewed → Accepted. HR always knows where every offer stands."],
            ] as const).map(([Icon, t, b], i) => (
              <Reveal key={t as string} delay={i * 60}>
                <div className="panel !rounded-2xl p-6 h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <span className="w-9 h-9 rounded-lg bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Icon size={17} /></span>
                  <h3 className="font-display font-bold text-[16px] text-ink-900 dark:text-white mt-3.5">{t as string}</h3>
                  <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-1.5 leading-relaxed">{b as string}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-widest text-cobalt-600 dark:text-cobalt-300">Product</p>
              <h2 className="font-display font-bold text-[30px] sm:text-[38px] tracking-tight text-ink-900 dark:text-white mt-2">A quick look inside</h2>
            </div>
            <div className="flex gap-2 p-1 rounded-xl bg-ink-900/5 dark:bg-white/6">
              {[["dashboard", "Dashboard"], ["review", "Candidate review"], ["letter", "Offer letter"]].map(([k, l]) => (
                <button key={k} onClick={() => setScreen(k)} className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${screen === k ? "bg-white dark:bg-ink-800 text-ink-900 dark:text-white shadow-sm" : "text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-white"}`}>{l}</button>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 max-w-3xl mx-auto" key={screen}>
            <div className="animate-pop"><ScreenMock kind={screen} /></div>
          </div>
        </Reveal>
      </section>

      {/* Benefits band */}
      <section className="bg-ink-925 dark:bg-ink-925 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-6xl mx-auto px-5 py-18 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="font-display font-bold text-[30px] sm:text-[38px] tracking-tight leading-tight">Stop doing offer logistics by hand</h2>
            <p className="text-[15px] text-ink-300 mt-4 max-w-lg leading-relaxed">HR teams lose days per hire to document chasing, formatting letters and status emails. OfferFlow hands all of it to the workflow.</p>
            <ul className="mt-7 space-y-3.5">
              {["Every document collected before day one — no joining-day surprises", "One audit trail from selection to acceptance", "Candidates feel looked after, not processed", "Works alongside your ATS — it never replaces it"].map((x) => (
                <li key={x} className="flex items-start gap-3 text-[14px] font-medium text-ink-100"><BadgeCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" /> {x}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-4">
              {[["6 hrs", "saved per hire, on average"], ["0", "chasing emails to send"], ["100%", "of actions audit-logged"], ["7 days", "average selection → offer time"]].map(([v, l], i) => (
                <div key={l} className={`rounded-2xl p-6 ring-1 ring-white/10 bg-white/4 ${i % 2 === 1 ? "translate-y-4" : ""}`}>
                  <p className="font-display font-bold text-[34px] text-cobalt-300 leading-none">{v}</p>
                  <p className="text-[13px] font-semibold text-ink-300 mt-2.5">{l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[13px] font-bold uppercase tracking-widest text-cobalt-600 dark:text-cobalt-300">Pricing</p>
            <h2 className="font-display font-bold text-[30px] sm:text-[38px] tracking-tight text-ink-900 dark:text-white mt-2">Simple plans that scale with your hiring</h2>
            <p className="text-[15px] text-ink-500 dark:text-ink-300 mt-3">Per workspace, per month. Stripe-ready billing — switch anytime.</p>
          </div>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <div className={`panel !rounded-2xl p-7 h-full flex flex-col relative ${p.featured ? "ring-2 ring-cobalt-500/60 shadow-xl shadow-cobalt-500/10" : ""}`}>
                {p.featured && <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-cobalt-600 text-white text-[11px] font-bold">Most popular</span>}
                <p className="font-display font-bold text-[18px] text-ink-900 dark:text-white">{p.name}</p>
                <p className="text-[12.5px] text-ink-400 mt-0.5">{p.tagline}</p>
                <p className="font-display font-bold text-[34px] text-ink-900 dark:text-white mt-5">{p.price ? `$${p.price}` : "Custom"}{p.price && <span className="text-[13px] font-sans font-semibold text-ink-400"> /mo</span>}</p>
                <p className="text-[12.5px] font-bold text-cobalt-600 dark:text-cobalt-300 mt-1">{p.candidates}</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink-600 dark:text-ink-300"><Check size={15} className="text-emerald-500 shrink-0 mt-0.5" /> {f}</li>)}
                </ul>
                <Button className="mt-7" variant={p.featured ? "primary" : "outline"} onClick={() => nav("/auth?mode=signup")}>
                  {p.price ? "Start free trial" : "Contact sales"}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white dark:bg-ink-900/50 border-y border-ink-900/6 dark:border-white/6 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <p className="text-[13px] font-bold uppercase tracking-widest text-cobalt-600 dark:text-cobalt-300">Testimonials</p>
            <h2 className="font-display font-bold text-[30px] sm:text-[38px] tracking-tight text-ink-900 dark:text-white mt-2">People teams feel the difference in week one</h2>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {[
              { q: "We used to lose two days per hire to document follow-ups. Now candidates upload everything themselves and I just review. The offer letter literally emails itself.", n: "Meera Krishnan", r: "Head of People, Nova Solutions", c: "#0d9488" },
              { q: "The approval flow ended our version-control nightmare. One status, one owner, one audit trail — from submission to signature.", n: "Daniel Fernandes", r: "HR Lead, Nova Solutions", c: "#2b4ed6" },
              { q: "Candidates keep telling us onboarding felt premium. That matters — the offer experience is the first real touch of your culture.", n: "Sara Khan", r: "People Ops, BrightLabs", c: "#b45309" },
            ].map((t, i) => (
              <Reveal key={t.n} delay={i * 100}>
                <figure className={`panel !rounded-2xl p-7 h-full flex flex-col ${i === 1 ? "md:-translate-y-3" : ""}`}>
                  <svg width="30" height="24" viewBox="0 0 30 24" className="text-cobalt-300"><path d="M0 24V14.6C0 6.9 4.5 1.6 12.2 0l1.6 3.8c-4.4 1.4-6.6 4-6.8 7.6H12V24H0Zm18 0V14.6C18 6.9 22.5 1.6 30.2 0l1.6 3.8c-4.4 1.4-6.6 4-6.8 7.6H30V24H18Z" fill="currentColor" transform="scale(0.9)" /></svg>
                  <blockquote className="text-[14.5px] text-ink-700 dark:text-ink-200 leading-relaxed mt-4 flex-1">{t.q}</blockquote>
                  <figcaption className="flex items-center gap-3 mt-6">
                    <span className="w-10 h-10 rounded-full text-white font-bold text-[13px] flex items-center justify-center" style={{ background: t.c }}>{t.n.split(" ").map((x) => x[0]).join("")}</span>
                    <div>
                      <p className="text-[13.5px] font-bold text-ink-900 dark:text-white">{t.n}</p>
                      <p className="text-[12px] text-ink-400">{t.r}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-20 sm:py-24">
        <Reveal>
          <p className="text-[13px] font-bold uppercase tracking-widest text-cobalt-600 dark:text-cobalt-300 text-center">FAQ</p>
          <h2 className="font-display font-bold text-[30px] sm:text-[38px] tracking-tight text-ink-900 dark:text-white mt-2 text-center">Questions, answered</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <div className={`panel !rounded-xl overflow-hidden transition-shadow ${faq === i ? "shadow-md" : ""}`}>
                <button onClick={() => setFaq(faq === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-display font-bold text-[15px] text-ink-900 dark:text-white">{f.q}</span>
                  <ChevronDown size={18} className={`text-ink-400 transition-transform duration-200 shrink-0 ${faq === i ? "rotate-180 text-cobalt-500" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-out ${faq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[14px] text-ink-500 dark:text-ink-300 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-cobalt-700 px-7 py-14 sm:px-14 text-center">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cobalt-500/30 blur-3xl" />
            <div className="relative">
              <h2 className="font-display font-bold text-[30px] sm:text-[40px] text-white tracking-tight leading-tight max-w-2xl mx-auto">Your next hire deserves a better "yes"</h2>
              <p className="text-[15px] text-cobalt-100 mt-4 max-w-xl mx-auto">Start free for 14 days. Or explore the live demo workspace — no account needed.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                <Button size="lg" variant="secondary" className="!bg-white !text-cobalt-700 hover:!bg-cobalt-50" onClick={() => nav("/auth?mode=signup")} icon={<ArrowRight size={17} />}>Start Free Trial</Button>
                <Button size="lg" variant="ghost" className="!text-white ring-1 ring-white/30 hover:!bg-white/10" onClick={demo} icon={<Play size={16} />}>Try Demo</Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-900/8 dark:border-white/8 bg-white dark:bg-ink-900/60">
        <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="text-[13px] text-ink-400 mt-4 max-w-xs leading-relaxed">From candidate selection to offer letter — automated. Built for modern people teams.</p>
            <p className="text-[12px] text-ink-400 mt-5 inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> SOC 2-ready · GDPR-friendly</p>
          </div>
          {[
            ["Product", ["How it works", "Features", "Pricing", "Demo"]],
            ["Company", ["About", "Careers", "Blog", "Contact"]],
            ["Legal", ["Privacy", "Terms", "Security", "DPA"]],
          ].map(([h, links]) => (
            <div key={h as string}>
              <p className="font-display font-bold text-[13.5px] text-ink-900 dark:text-white">{h as string}</p>
              <ul className="mt-4 space-y-2.5">
                {(links as string[]).map((l) => (
                  <li key={l}><a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] text-ink-400 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-900/6 dark:border-white/6">
          <div className="max-w-6xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-400">
            <span className="inline-flex items-center gap-2"><LogoMark size={16} /> © 2026 OfferFlow AI. All rights reserved.</span>
            <span>Not an ATS — the missing layer after selection.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
