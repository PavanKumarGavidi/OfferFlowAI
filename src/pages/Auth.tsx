import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, MailCheck, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useStore } from "../lib/store";
import { Button, Field, Input, Logo, LogoMark } from "../components/ui";

type Mode = "login" | "signup" | "verify" | "forgot" | "reset";

const DEMO_ACCOUNTS = [
  { kind: "hr" as const, label: "HR Demo", desc: "Candidates, documents, review", icon: UserRound },
  { kind: "hr_manager" as const, label: "HR Manager Demo", desc: "Approvals & offer letters", icon: ShieldCheck },
  { kind: "company_admin" as const, label: "Company Admin", desc: "Settings, users, billing", icon: KeyRound },
  { kind: "platform" as const, label: "Platform Admin", desc: "SaaS-wide console", icon: Sparkles },
];

export default function Auth() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { login, loginDemo, signup, verifyEmail, requestReset, resetPassword, verifyFlow, resetFlow, toast } = useStore();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [f, setF] = useState({ company: "", name: "", email: "", password: "" });
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const afterLogin = (role?: string) => nav(role === "platform_admin" ? "/app/admin" : "/app");

  const doLogin = () => {
    setErr("");
    if (!f.email || !f.password) { setErr("Enter your email and password."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = login(f.email, f.password);
      setLoading(false);
      if (res) { setErr(res); return; }
      afterLogin(res === null && f.email === "admin@offerflow.ai" ? "platform_admin" : undefined);
    }, 450);
  };

  const doSignup = () => {
    setErr("");
    if (f.company.trim().length < 2) { setErr("Enter your company name."); return; }
    if (f.name.trim().length < 3) { setErr("Enter your full name."); return; }
    if (!f.email.includes("@")) { setErr("Enter a valid work email."); return; }
    if (f.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    const res = signup(f);
    if (res) { setErr(res); return; }
    setMode("verify");
    toast("Verification email sent", "info", "Check the demo inbox below for your code.");
  };

  const doVerify = () => {
    setErr("");
    if (!verifyEmail(code)) { setErr("That code doesn't match. Check the demo inbox."); return; }
    afterLogin();
  };

  const doForgot = () => {
    setErr("");
    if (!requestReset(f.email)) { setErr("No account found with this email."); return; }
    setMode("reset");
    toast("Reset email sent", "info", "Your code is in the demo inbox below.");
  };

  const doReset = () => {
    setErr("");
    if (f.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (!resetPassword(code, f.password)) { setErr("That code doesn't match. Check the demo inbox."); return; }
    setMode("login");
  };

  const DemoInbox = ({ codeValue }: { codeValue?: string }) =>
    codeValue ? (
      <div className="mt-4 p-4 rounded-xl bg-amber-400/10 ring-1 ring-amber-400/30">
        <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5"><MailCheck size={14} /> Demo inbox (email delivery simulated)</p>
        <p className="text-[13px] text-ink-600 dark:text-ink-300 mt-1.5">Your verification code is <span className="font-display font-bold text-[18px] tracking-[0.2em] text-ink-900 dark:text-white">{codeValue}</span></p>
      </div>
    ) : null;

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr] bg-ink-50 dark:bg-ink-950">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-925 text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cobalt-600/20 blur-3xl" />
        <button onClick={() => nav("/")} className="relative w-fit"><Logo light /></button>
        <div className="relative max-w-md">
          <p className="font-display text-[30px] font-bold leading-snug tracking-tight">
            "OfferFlow replaced four spreadsheets and a folder of email templates. Our offers now go out the same day a manager approves."
          </p>
          <div className="flex items-center gap-3 mt-6">
            <span className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-[13px]">MK</span>
            <div>
              <p className="text-[13.5px] font-bold">Meera Krishnan</p>
              <p className="text-[12px] text-ink-300">Head of People, Nova Solutions</p>
            </div>
          </div>
          <div className="mt-10 space-y-3">
            {["Secure onboarding links", "Document collection with validation", "One-click approvals & offer letters"].map((x, i) => (
              <div key={x} className="flex items-center gap-3 text-[13.5px] font-semibold text-ink-200">
                <span className="w-6 h-6 rounded-md bg-cobalt-500/25 text-cobalt-300 flex items-center justify-center text-[11px] font-bold">{i + 1}</span>
                {x}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-[12px] text-ink-400 flex items-center gap-2"><LogoMark size={16} /> From Candidate Selection to Offer Letter — Automated.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">
          <button onClick={() => nav("/")} className="lg:hidden mb-8"><Logo /></button>
          <button onClick={() => nav("/")} className="hidden lg:inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-400 hover:text-ink-700 dark:hover:text-white transition-colors mb-8">
            <ArrowLeft size={15} /> Back to website
          </button>

          <h1 className="font-display font-bold text-[26px] tracking-tight text-ink-900 dark:text-white">
            {mode === "login" && "Sign in to your workspace"}
            {mode === "signup" && "Start your free trial"}
            {mode === "verify" && "Verify your email"}
            {mode === "forgot" && "Reset your password"}
            {mode === "reset" && "Choose a new password"}
          </h1>
          <p className="text-[13.5px] text-ink-500 dark:text-ink-400 mt-1.5">
            {mode === "login" && "Welcome back — your pipeline missed you."}
            {mode === "signup" && "14 days free. Your company gets an isolated workspace."}
            {mode === "verify" && "We emailed a 6-digit code to your inbox."}
            {mode === "forgot" && "Enter your account email and we'll send a reset code."}
            {mode === "reset" && "Enter the code from your email and a new password."}
          </p>

          <div className="mt-7 space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Company Name" required><Input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="e.g. Acme Technologies" /></Field>
                <Field label="Your Full Name" required><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Kavita Nair" /></Field>
              </>
            )}
            {(mode === "login" || mode === "signup" || mode === "forgot") && (
              <Field label="Work Email" required><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@company.com" /></Field>
            )}
            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <Field label={mode === "reset" ? "New Password" : "Password"} required><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? doLogin() : doSignup())} /></Field>
            )}
            {(mode === "verify" || mode === "reset") && (
              <Field label="6-digit code" required><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 482913" maxLength={6} className="font-display tracking-[0.3em] text-center text-[18px]" /></Field>
            )}
            {mode === "reset" && <DemoInbox codeValue={resetFlow?.code} />}
            {mode === "verify" && <DemoInbox codeValue={verifyFlow?.code} />}

            {err && <p className="text-[13px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/8 ring-1 ring-rose-500/20 rounded-lg px-3.5 py-2.5">{err}</p>}

            {mode === "login" && (
              <>
                <Button className="w-full" size="lg" loading={loading} onClick={doLogin} icon={<ArrowRight size={16} />}>Sign In</Button>
                <div className="flex items-center justify-between text-[13px]">
                  <button onClick={() => setMode("forgot")} className="font-semibold text-cobalt-600 dark:text-cobalt-300 hover:underline">Forgot password?</button>
                  <button onClick={() => setMode("signup")} className="font-semibold text-ink-500 hover:text-ink-900 dark:hover:text-white transition-colors">Create account →</button>
                </div>
              </>
            )}
            {mode === "signup" && <Button className="w-full" size="lg" onClick={doSignup} icon={<ArrowRight size={16} />}>Create Workspace</Button>}
            {mode === "verify" && (
              <>
                <Button className="w-full" size="lg" onClick={doVerify} icon={<MailCheck size={16} />}>Verify & Continue</Button>
                <button onClick={() => setMode("signup")} className="w-full text-center text-[13px] font-semibold text-ink-400 hover:text-ink-700 dark:hover:text-white transition-colors">Use a different email</button>
              </>
            )}
            {mode === "forgot" && (
              <>
                <Button className="w-full" size="lg" onClick={doForgot} icon={<MailCheck size={16} />}>Send Reset Code</Button>
                <button onClick={() => setMode("login")} className="w-full text-center text-[13px] font-semibold text-ink-400 hover:text-ink-700 dark:hover:text-white transition-colors">Back to sign in</button>
              </>
            )}
            {mode === "reset" && (
              <>
                <Button className="w-full" size="lg" onClick={doReset}>Update Password</Button>
                <button onClick={() => setMode("login")} className="w-full text-center text-[13px] font-semibold text-ink-400 hover:text-ink-700 dark:hover:text-white transition-colors">Back to sign in</button>
              </>
            )}
          </div>

          {/* Demo access */}
          {mode === "login" && (
            <div className="mt-8 rounded-2xl ring-1 ring-cobalt-500/25 bg-cobalt-500/5 p-5">
              <p className="text-[13px] font-bold text-ink-900 dark:text-white flex items-center gap-2"><Sparkles size={14} className="text-cobalt-500" /> Explore the demo — no account needed</p>
              <p className="text-[12px] text-ink-500 dark:text-ink-400 mt-1">One-click into Acme Technologies' sample workspace.</p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS.map((d) => (
                  <button key={d.kind} onClick={() => { loginDemo(d.kind); afterLogin(d.kind === "platform" ? "platform_admin" : undefined); }}
                    className="text-left p-3 rounded-xl bg-white dark:bg-ink-900 ring-1 ring-ink-900/10 dark:ring-white/12 hover:ring-cobalt-500/60 hover:-translate-y-0.5 transition-all duration-150 group">
                    <d.icon size={16} className="text-cobalt-500" />
                    <p className="text-[12.5px] font-bold text-ink-900 dark:text-white mt-1.5 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-300 transition-colors">{d.label}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">{d.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-cobalt-500/15">
                <p className="text-[11.5px] font-bold text-ink-500 dark:text-ink-300">Candidate portal demos (no HR login):</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => nav("/portal/demo-kabir-2mn5")} className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-ink-900/5 dark:bg-white/8 ring-1 ring-ink-900/10 dark:ring-white/12 text-ink-600 dark:text-ink-200 hover:ring-cobalt-500/50 transition-colors">Onboarding form · 75%</button>
                  <button onClick={() => nav("/portal/demo-diya-4hd8")} className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-emerald-500/10 ring-1 ring-emerald-500/25 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 transition-colors">Offer letter · accept/reject</button>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-ink-400">All demo data is sample data. Password for manual sign-in: demo1234.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
