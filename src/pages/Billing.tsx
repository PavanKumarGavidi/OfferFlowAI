import { useState } from "react";
import { BadgeCheck, CreditCard, Lock, Sparkles } from "lucide-react";
import { fmtDate, PLANS } from "../lib/types";
import type { PlanId } from "../lib/types";
import { useStore } from "../lib/store";
import { Badge, Button, Modal, PlanBadge, Progress } from "../components/ui";

export default function Billing() {
  const { company, myCandidates, setPlan } = useStore();
  const [confirm, setConfirm] = useState<PlanId | null>(null);
  if (!company) return null;

  const cap = company.plan === "starter" ? 25 : company.plan === "business" ? 200 : 999;
  const used = myCandidates.length;
  const renewal = new Date(Date.now() + 18 * 86400000);
  const plan = PLANS.find((p) => p.id === company.plan);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display font-bold text-[22px] text-ink-900 dark:text-white tracking-tight">Billing & Plans</h2>
        <p className="text-[13.5px] text-ink-400 mt-0.5">Usage-based plans per workspace. Stripe checkout plugs in here — no real charge in the demo.</p>
      </div>

      {/* Current plan */}
      <div className="panel !rounded-xl p-6 grid md:grid-cols-3 gap-6">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Current plan</p>
          <div className="flex items-center gap-2.5 mt-2">
            <PlanBadge plan={company.plan} />
            {company.trial && <Badge className="bg-amber-400/15 text-amber-700 dark:text-amber-300 ring-amber-400/30">Trial · 9 days left</Badge>}
          </div>
          <p className="font-display font-bold text-[26px] text-ink-900 dark:text-white mt-2">
            {plan?.price ? `$${plan.price}` : "Custom"}<span className="text-[14px] text-ink-400 font-sans font-semibold"> / month</span>
          </p>
          <p className="text-[12.5px] text-ink-400 mt-1">{plan?.tagline}</p>
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Candidates this month</p>
          <p className="font-display font-bold text-[26px] text-ink-900 dark:text-white mt-2 tabular-nums">{used} <span className="text-[14px] text-ink-400 font-sans font-semibold">/ {cap === 999 ? "∞" : cap}</span></p>
          <Progress value={cap === 999 ? 8 : Math.round((used / cap) * 100)} className="mt-3" barClass="bg-emerald-500" />
          <p className="text-[12px] text-ink-400 mt-1.5">Unlimited on Enterprise.</p>
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Payment</p>
          <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-925 ring-1 ring-ink-900/8 dark:ring-white/10">
            <CreditCard size={20} className="text-cobalt-500" />
            <div>
              <p className="text-[13px] font-bold text-ink-800 dark:text-ink-100">Stripe (test mode)</p>
              <p className="text-[11.5px] text-ink-400">renews {fmtDate(renewal.toISOString())}</p>
            </div>
          </div>
          <p className="text-[12px] text-ink-400 mt-2 flex items-center gap-1.5"><Lock size={12} className="text-emerald-500" /> PCI-compliant — card data never touches our servers.</p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const current = p.id === company.plan;
          return (
            <div key={p.id} className={`relative panel !rounded-2xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${p.featured ? "ring-2 ring-cobalt-500/60" : ""}`}>
              {p.featured && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cobalt-600 text-white text-[11px] font-bold shadow-sm"><Sparkles size={11} /> Most popular</span>
              )}
              <p className="font-display font-bold text-[17px] text-ink-900 dark:text-white">{p.name}</p>
              <p className="text-[12.5px] text-ink-400 mt-0.5">{p.tagline}</p>
              <p className="font-display font-bold text-[30px] text-ink-900 dark:text-white mt-4">
                {p.price ? `$${p.price}` : "Custom"}{p.price && <span className="text-[13.5px] font-sans font-semibold text-ink-400"> /mo</span>}
              </p>
              <p className="text-[12.5px] font-bold text-cobalt-600 dark:text-cobalt-300 mt-1">{p.candidates}</p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink-600 dark:text-ink-300">
                    <BadgeCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6" variant={current ? "outline" : p.featured ? "primary" : "secondary"} disabled={current}
                onClick={() => (p.id === "enterprise" ? setConfirm("enterprise") : setConfirm(p.id))}>
                {current ? "Current Plan" : p.price ? "Switch to " + p.name : "Contact Sales"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Invoices */}
      <div className="panel !rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/8 dark:border-white/8">
          <h3 className="font-display font-bold text-[15.5px]">Invoice history</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-900/8 dark:border-white/8 bg-ink-50/70 dark:bg-ink-925/70">
              {["Date", "Description", "Amount", "Status"].map((h) => <th key={h} className="px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-wider text-ink-400">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5 dark:divide-white/5">
            {[
              ["2026-01-18", "Business plan — monthly", "$149.00", "Paid"],
              ["2025-12-18", "Business plan — monthly", "$149.00", "Paid"],
              ["2025-11-18", "Business plan — monthly", "$149.00", "Paid"],
            ].map(([d, desc, amt, st]) => (
              <tr key={d}>
                <td className="px-5 py-3 text-[13px] text-ink-600 dark:text-ink-300">{fmtDate(d)}</td>
                <td className="px-5 py-3 text-[13px] font-semibold text-ink-800 dark:text-ink-100">{desc}</td>
                <td className="px-5 py-3 text-[13px] font-bold text-ink-800 dark:text-ink-100 tabular-nums">{amt}</td>
                <td className="px-5 py-3"><Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25">{st}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm === "enterprise" ? "Contact sales" : `Switch to ${PLANS.find((p) => p.id === confirm)?.name}?`} width="max-w-md"
        footer={<>
          <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
          {confirm === "enterprise" ? (
            <Button onClick={() => { setConfirm(null); }}>Request a call</Button>
          ) : (
            <Button onClick={() => { if (confirm) setPlan(confirm); setConfirm(null); }}>Confirm switch</Button>
          )}
        </>}>
        <p className="text-[14px] text-ink-600 dark:text-ink-300">
          {confirm === "enterprise"
            ? "Our team will reach out within one business day to scope your rollout. No charge in this demo."
            : `Your workspace moves to the ${PLANS.find((p) => p.id === confirm)?.name} plan immediately. Stripe prorates the difference at the next renewal — simulated here.`}
        </p>
      </Modal>
    </div>
  );
}
