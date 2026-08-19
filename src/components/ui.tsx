import { useEffect, useRef, useState, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Inbox, Check, Copy } from "lucide-react";
import type { CandidateStatus, OfferStatus, PlanId } from "../lib/types";
import { OFFER_STATUS_META, STATUS_META } from "../lib/types";

// ─── Logo ────────────────────────────────────────────────────────────────────

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--color-cobalt-600)" />
      <path d="M20 40c-4-3-6-7-6-11a18 18 0 0 1 36 0c0 4-2 8-6 11" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M26 34l7 8 11-14" stroke="var(--color-cobalt-300)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 30, text = true, light = false }: { size?: number; text?: boolean; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <LogoMark size={size} />
      {text && (
        <span className={`font-display font-700 tracking-tight text-[19px] font-bold ${light ? "text-white" : "text-ink-900 dark:text-white"}`}>
          OfferFlow<span className="text-cobalt-500"> AI</span>
        </span>
      )}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";

export function Button({
  variant = "primary", size = "md", loading, icon, children, className = "", ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg"; loading?: boolean; icon?: ReactNode }) {
  const v: Record<BtnVariant, string> = {
    primary: "bg-cobalt-600 text-white hover:bg-cobalt-700 active:bg-cobalt-800 shadow-sm shadow-cobalt-600/25 disabled:bg-cobalt-600/50",
    secondary: "bg-ink-900 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-925 dark:hover:bg-ink-100",
    ghost: "text-ink-600 hover:bg-ink-900/6 dark:text-ink-300 dark:hover:bg-white/8 hover:text-ink-900 dark:hover:text-white",
    outline: "ring-1 ring-ink-300/80 dark:ring-white/15 text-ink-700 dark:text-ink-200 hover:bg-ink-900/5 dark:hover:bg-white/6 hover:ring-ink-400",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/25",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/25",
  };
  const s = { sm: "px-3 py-1.5 text-[13px] rounded-lg gap-1.5", md: "px-4 py-2.5 text-[14px] rounded-lg gap-2", lg: "px-6 py-3 text-[15px] rounded-xl gap-2" }[size];
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/60 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] ${v[variant]} ${s} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export function Badge({ className = "", children, dot }: { className?: string; children: ReactNode; dot?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ring-1 ring-inset whitespace-nowrap ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: CandidateStatus }) {
  const m = STATUS_META[status];
  return <Badge className={m.cls} dot={m.dot}>{m.label}</Badge>;
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const m = OFFER_STATUS_META[status];
  return <Badge className={m.cls}>{m.label}</Badge>;
}

export function PlanBadge({ plan }: { plan: PlanId }) {
  const cls = { starter: "bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-slate-500/25", business: "bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 ring-cobalt-500/25", enterprise: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/25" }[plan];
  return <Badge className={cls}>{plan === "starter" ? "Starter" : plan === "business" ? "Business" : "Enterprise"}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const label = { platform_admin: "Platform Admin", company_admin: "Company Admin", hr: "HR", hr_manager: "HR Manager" }[role] ?? role;
  return <Badge className="bg-ink-900/6 text-ink-600 dark:bg-white/10 dark:text-ink-200 ring-ink-900/10 dark:ring-white/15">{label}</Badge>;
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

const AV_COLORS = ["#2b4ed6", "#0d9488", "#b45309", "#7c3aed", "#e11d48", "#0369a1", "#4d7c0f", "#be185d"];
export function Avatar({ name, size = 36, color }: { name: string; size?: number; color?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const bg = color ?? AV_COLORS[(name.charCodeAt(0) + name.length) % AV_COLORS.length];
  return (
    <span className="inline-flex items-center justify-center rounded-full font-display font-bold text-white shrink-0 ring-2 ring-white/60 dark:ring-white/10" style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────

export function Progress({ value, className = "", barClass = "bg-cobalt-600", label }: { value: number; className?: string; barClass?: string; label?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-1.5 flex-1 rounded-full bg-ink-900/8 dark:bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      {label && <span className="text-[12px] font-bold tabular-nums text-ink-500 dark:text-ink-300 w-9 text-right">{value}%</span>}
    </div>
  );
}

// ─── Modal / Drawer ──────────────────────────────────────────────────────────

function useLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = "max-w-lg" }: { open: boolean; onClose: () => void; title?: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; width?: string }) {
  useLock(open);
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-[3px] animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${width} panel rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col animate-pop`}>
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-ink-900/8 dark:border-white/8">
            <div>
              <h3 className="font-display font-bold text-[17px] text-ink-900 dark:text-white">{title}</h3>
              {subtitle && <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-900/6 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-ink-900/8 dark:border-white/8 flex items-center justify-end gap-3 bg-ink-50/60 dark:bg-ink-925/60 rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function Drawer({ open, onClose, children, width = "max-w-2xl" }: { open: boolean; onClose: () => void; children: ReactNode; width?: string }) {
  useLock(open);
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className={`absolute right-0 top-0 bottom-0 w-full ${width} bg-white dark:bg-ink-900 shadow-2xl animate-slide-right overflow-y-auto ring-1 ring-ink-900/10 dark:ring-white/10`}>
        {children}
      </div>
    </div>,
    document.body
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number; icon?: ReactNode }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-ink-900/8 dark:border-white/8 -mb-px">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`relative flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${active === t.id ? "text-cobalt-700 dark:text-cobalt-300" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"}`}
        >
          {t.icon}
          {t.label}
          {typeof t.count === "number" && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${active === t.id ? "bg-cobalt-500/12 text-cobalt-700 dark:text-cobalt-300" : "bg-ink-900/6 dark:bg-white/10 text-ink-500 dark:text-ink-300"}`}>{t.count}</span>
          )}
          {active === t.id && <span className="absolute left-2 right-2 -bottom-px h-[2.5px] rounded-full bg-cobalt-600" />}
        </button>
      ))}
    </div>
  );
}

// ─── Form fields ─────────────────────────────────────────────────────────────

export function Field({ label, required, error, hint, children, className = "" }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="lbl">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error ? <p className="mt-1 text-[12px] font-medium text-rose-600 dark:text-rose-400">{error}</p> : hint ? <p className="mt-1 text-[12px] text-ink-400">{hint}</p> : null}
    </div>
  );
}

export function Input({ className = "", invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={`input-base ${invalid ? "ring-rose-400 focus:ring-rose-400" : ""} ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`input-base appearance-none bg-no-repeat bg-[right_0.9rem_center] bg-[length:14px] ${className}`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237b89ab' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`input-base min-h-[96px] ${className}`} {...rest} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-2.5 group" aria-pressed={checked}>
      <span className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ${checked ? "bg-cobalt-600" : "bg-ink-300 dark:bg-ink-700"}`}>
        <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`} />
      </span>
      {label && <span className="text-[13.5px] font-medium text-ink-700 dark:text-ink-200">{label}</span>}
    </button>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl bg-ink-900/5 dark:bg-white/6 ring-1 ring-ink-900/8 dark:ring-white/10 flex items-center justify-center text-ink-400 mb-4">
        {icon ?? <Inbox size={24} />}
      </div>
      <h4 className="font-display font-bold text-[16px] text-ink-800 dark:text-ink-100">{title}</h4>
      {body && <p className="text-[13.5px] text-ink-500 dark:text-ink-400 mt-1.5 max-w-sm">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-cobalt-500 ${className}`} />;
}

export function CopyButton({ text, label = "Copy", size = "sm" as const }: { text: string; label?: string; size?: "sm" | "md" }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size={size}
      icon={copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* noop */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

// ─── Reveal (scroll animation) ───────────────────────────────────────────────

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(22px)", transition: `opacity .65s ease ${delay}ms, transform .65s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Toast host ──────────────────────────────────────────────────────────────

export interface ToastItem { id: string; title: string; desc?: string; kind: "success" | "error" | "info" | "warning" }

export function ToastHost({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  const iconFor = { success: <Check size={15} />, error: <X size={15} />, info: <Check size={15} />, warning: <X size={15} /> };
  const colorFor = { success: "bg-emerald-600", error: "bg-rose-600", info: "bg-cobalt-600", warning: "bg-amber-500" };
  return createPortal(
    <div className="fixed bottom-5 right-5 z-[120] flex flex-col gap-2.5 w-[min(360px,calc(100vw-40px))]">
      {toasts.map((t) => (
        <div key={t.id} className="panel !rounded-xl flex items-start gap-3 px-4 py-3.5 animate-slide-right shadow-lg">
          <span className={`w-6 h-6 rounded-full ${colorFor[t.kind]} text-white flex items-center justify-center shrink-0 mt-0.5`}>{iconFor[t.kind]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-ink-900 dark:text-white">{t.title}</p>
            {t.desc && <p className="text-[12.5px] text-ink-500 dark:text-ink-400 mt-0.5 leading-snug">{t.desc}</p>}
          </div>
          <button onClick={() => onDismiss(t.id)} className="text-ink-300 hover:text-ink-600 dark:hover:text-white transition-colors" aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
