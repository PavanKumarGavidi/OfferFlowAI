import { useEffect, useState } from "react";
import { Building2, FileText, History, Mail, Pencil, Save, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import type { EmailTemplate, Role, User } from "../lib/types";
import { fmtDateTime, timeAgo } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Badge, Button, EmptyState, Field, Input, Modal, RoleBadge, Select, Tabs, Textarea } from "../components/ui";

// ─── Users panel ─────────────────────────────────────────────────────────────

function UsersPanel() {
  const { db, company, user, inviteUser, removeUser } = useStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", role: "hr" as Role });
  const [err, setErr] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<User | null>(null);
  const users = db.users.filter((u) => u.companyId === company?.id);

  const submit = () => {
    if (f.name.trim().length < 3 || !f.email.includes("@")) { setErr("Enter a valid name and email."); return; }
    const res = inviteUser({ name: f.name.trim(), email: f.email.trim(), role: f.role });
    if (res) { setErr(res); return; }
    setOpen(false); setF({ name: "", email: "", role: "hr" }); setErr("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13.5px] text-ink-500 dark:text-ink-400">{users.length} seat{users.length === 1 ? "" : "s"} in use · invites get a temporary password by email.</p>
        <Button icon={<UserPlus size={15} />} onClick={() => setOpen(true)}>Invite User</Button>
      </div>
      <div className="panel !rounded-xl divide-y divide-ink-900/5 dark:divide-white/5">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3.5 px-5 py-4">
            <Avatar name={u.name} size={38} color={u.color} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-ink-900 dark:text-white flex items-center gap-2">{u.name} {u.id === user?.id && <Badge className="bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 ring-cobalt-500/25">You</Badge>}</p>
              <p className="text-[12px] text-ink-400">{u.email} · joined {timeAgo(u.createdAt)}</p>
            </div>
            <RoleBadge role={u.role} />
            {u.id !== user?.id && (
              <button onClick={() => setConfirmRemove(u)} className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors" aria-label="Remove user"><Trash2 size={15} /></button>
            )}
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Invite a team member" subtitle="They'll receive an email with sign-in details."
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} icon={<UserPlus size={15} />}>Send Invite</Button>
        </>}>
        <div className="space-y-4">
          <Field label="Full Name" required><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Ravi Sharma" /></Field>
          <Field label="Email" required><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="ravi@company.com" /></Field>
          <Field label="Role" required>
            <Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
              <option value="hr">HR — manages candidates, review, documents</option>
              <option value="hr_manager">HR Manager — final approvals & offers</option>
            </Select>
          </Field>
          {err && <p className="text-[12.5px] font-semibold text-rose-600 dark:text-rose-400">{err}</p>}
        </div>
      </Modal>

      <Modal open={!!confirmRemove} onClose={() => setConfirmRemove(null)} title="Remove user?" width="max-w-md"
        footer={<>
          <Button variant="ghost" onClick={() => setConfirmRemove(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (confirmRemove) removeUser(confirmRemove.id); setConfirmRemove(null); }}>Remove</Button>
        </>}>
        <p className="text-[14px] text-ink-600 dark:text-ink-300"><span className="font-bold text-ink-900 dark:text-white">{confirmRemove?.name}</span> will immediately lose access to this workspace.</p>
      </Modal>
    </div>
  );
}

// ─── Settings page ───────────────────────────────────────────────────────────

export function SettingsPage({ initialTab = "profile" }: { initialTab?: string }) {
  const { company, updateCompanyProfile, updateCompanySettings, db } = useStore();
  const [tab, setTab] = useState(initialTab);
  const [profile, setProfile] = useState({ name: "", website: "", address: "", contactEmail: "", contactPhone: "" });
  const [offer, setOffer] = useState({ hrName: "", hrDesignation: "", offerSubject: "", terms: "" });
  const [emailS, setEmailS] = useState({ senderName: "", senderEmail: "" });

  useEffect(() => {
    if (!company) return;
    setProfile({ name: company.name, website: company.website, address: company.address, contactEmail: company.contactEmail, contactPhone: company.contactPhone });
    setOffer({ hrName: company.settings.hrName, hrDesignation: company.settings.hrDesignation, offerSubject: company.settings.offerSubject, terms: company.settings.terms.join("\n") });
    setEmailS({ senderName: company.settings.senderName, senderEmail: company.settings.senderEmail });
  }, [company?.id]);

  if (!company) return null;
  const audits = db.audits.filter((a) => a.companyId === company.id);

  return (
    <div className="space-y-5 animate-fade-up">
      <Tabs
        tabs={[
          { id: "profile", label: "Company Profile", icon: <Building2 size={14} /> },
          { id: "offer", label: "Offer Letter", icon: <FileText size={14} /> },
          { id: "email", label: "Email", icon: <Mail size={14} /> },
          { id: "users", label: "Users", icon: <UsersRound size={14} /> },
          { id: "audit", label: "Audit Log", icon: <History size={14} /> },
        ]}
        active={tab} onChange={setTab}
      />

      {tab === "profile" && (
        <div className="panel !rounded-xl p-6 max-w-2xl animate-fade-in">
          <h3 className="font-display font-bold text-[16px] mb-4">Company Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Company Name" required><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
            <Field label="Website"><Input value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="company.com" /></Field>
            <Field label="Address" className="sm:col-span-2"><Textarea value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="min-h-[64px]" /></Field>
            <Field label="Contact Email"><Input value={profile.contactEmail} onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })} /></Field>
            <Field label="Contact Phone"><Input value={profile.contactPhone} onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })} /></Field>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[12.5px] text-ink-400">Shown on the letterhead of every offer letter.</p>
            <Button icon={<Save size={15} />} onClick={() => updateCompanyProfile(profile)}>Save Profile</Button>
          </div>
        </div>
      )}

      {tab === "offer" && (
        <div className="panel !rounded-xl p-6 max-w-2xl animate-fade-in">
          <h3 className="font-display font-bold text-[16px] mb-4">Offer Letter Settings</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="HR Name (signatory)" required><Input value={offer.hrName} onChange={(e) => setOffer({ ...offer, hrName: e.target.value })} /></Field>
            <Field label="HR Designation"><Input value={offer.hrDesignation} onChange={(e) => setOffer({ ...offer, hrDesignation: e.target.value })} /></Field>
            <Field label="Offer Email Subject" className="sm:col-span-2" hint="Use {{CompanyName}} placeholder"><Input value={offer.offerSubject} onChange={(e) => setOffer({ ...offer, offerSubject: e.target.value })} /></Field>
            <Field label="Terms & Conditions" className="sm:col-span-2" hint="One term per line — rendered as a numbered list on the letter.">
              <Textarea value={offer.terms} onChange={(e) => setOffer({ ...offer, terms: e.target.value })} className="min-h-[160px]" />
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button icon={<Save size={15} />} onClick={() => updateCompanySettings({ hrName: offer.hrName, hrDesignation: offer.hrDesignation, offerSubject: offer.offerSubject, terms: offer.terms.split("\n").map((t) => t.trim()).filter(Boolean) })}>Save Offer Settings</Button>
          </div>
        </div>
      )}

      {tab === "email" && (
        <div className="panel !rounded-xl p-6 max-w-2xl animate-fade-in">
          <h3 className="font-display font-bold text-[16px] mb-1">Email Settings</h3>
          <p className="text-[13px] text-ink-400 mb-4">Transactional emails (invites, offers, change requests) are sent from this identity. Delivery is simulated in the demo.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Sender Name"><Input value={emailS.senderName} onChange={(e) => setEmailS({ ...emailS, senderName: e.target.value })} /></Field>
            <Field label="Sender Email"><Input value={emailS.senderEmail} onChange={(e) => setEmailS({ ...emailS, senderEmail: e.target.value })} /></Field>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[12.5px] text-ink-400 flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> DKIM + SPF enforced in production (Resend).</p>
            <Button icon={<Save size={15} />} onClick={() => updateCompanySettings(emailS)}>Save Email Settings</Button>
          </div>
        </div>
      )}

      {tab === "users" && <UsersPanel />}

      {tab === "audit" && (
        <div className="panel !rounded-xl overflow-hidden animate-fade-in">
          {audits.length === 0 ? <EmptyState icon={<History size={22} />} title="No audit events" body="Every sensitive action is recorded here." /> : (
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-ink-900/8 dark:border-white/8 bg-ink-50/70 dark:bg-ink-925/70">
                  {["Actor", "Action", "Detail", "When"].map((h) => <th key={h} className="px-5 py-3 text-[11.5px] font-bold uppercase tracking-wider text-ink-400">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5 dark:divide-white/5">
                {audits.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 text-[13px] font-bold text-ink-800 dark:text-ink-100 whitespace-nowrap">{a.actor}</td>
                    <td className="px-5 py-3"><code className="text-[11.5px] font-bold bg-ink-900/5 dark:bg-white/8 px-2 py-1 rounded-md text-ink-600 dark:text-ink-300">{a.action}</code></td>
                    <td className="px-5 py-3 text-[13px] text-ink-600 dark:text-ink-300">{a.detail}</td>
                    <td className="px-5 py-3 text-[12px] text-ink-400 whitespace-nowrap">{fmtDateTime(a.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function UsersPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display font-bold text-[22px] text-ink-900 dark:text-white tracking-tight">Company Users</h2>
        <p className="text-[13.5px] text-ink-400 mt-0.5">Invite HR and HR Manager seats. Role-based access is enforced everywhere.</p>
      </div>
      <UsersPanel />
    </div>
  );
}

// ─── Email templates page ────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  onboarding_invite: "bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 ring-cobalt-500/25",
  offer: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25",
  changes_requested: "bg-orange-500/10 text-orange-700 dark:text-orange-300 ring-orange-500/25",
  system: "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20",
  wish: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25",
  invite_user: "bg-purple-500/10 text-purple-700 dark:text-purple-300 ring-purple-500/25",
};

export function TemplatesPage() {
  const { db, company, updateTemplate } = useStore();
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const templates = db.templates.filter((t) => t.companyId === company?.id);
  const emails = db.emails.filter((e) => e.companyId === company?.id).slice(0, 8);

  const openEdit = (t: EmailTemplate) => { setEditing(t); setSubject(t.subject); setBody(t.body); };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display font-bold text-[22px] text-ink-900 dark:text-white tracking-tight">Email Templates</h2>
        <p className="text-[13.5px] text-ink-400 mt-0.5">Placeholders like <code className="text-[12px] bg-ink-900/5 dark:bg-white/8 px-1.5 py-0.5 rounded">{"{{CandidateName}}"}</code> fill automatically when emails go out.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="panel !rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Mail size={16} /></span>
                <div>
                  <p className="text-[14.5px] font-bold text-ink-900 dark:text-white">{t.name}</p>
                  <p className="text-[12px] text-ink-400">{t.description}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" icon={<Pencil size={13} />} onClick={() => openEdit(t)}>Edit</Button>
            </div>
            <p className="mt-4 text-[13px] font-semibold text-ink-700 dark:text-ink-200 truncate">Subject: {t.subject}</p>
            <p className="mt-1.5 text-[12.5px] text-ink-500 dark:text-ink-400 line-clamp-3 whitespace-pre-line leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="panel !rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/8 dark:border-white/8">
          <h3 className="font-display font-bold text-[15.5px]">Recent email activity</h3>
          <p className="text-[12px] text-ink-400 mt-0.5">Simulated delivery log for this workspace.</p>
        </div>
        {emails.length === 0 ? <EmptyState icon={<Mail size={22} />} title="No emails sent yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[680px]">
              <tbody className="divide-y divide-ink-900/5 dark:divide-white/5">
                {emails.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3.5 w-[150px]">
                      <Badge className={TYPE_BADGE[e.type] ?? TYPE_BADGE.system}>{e.type.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-bold text-ink-800 dark:text-ink-100 truncate">{e.subject}</p>
                      <p className="text-[11.5px] text-ink-400">to {e.toName} · {e.to}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-ink-400 whitespace-nowrap text-right">{fmtDateTime(e.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit — ${editing?.name}`} subtitle="Changes apply to all future emails of this type." width="max-w-2xl"
        footer={<>
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button icon={<Save size={15} />} onClick={() => { if (editing) updateTemplate(editing.id, subject, body); setEditing(null); }}>Save Template</Button>
        </>}>
        <div className="space-y-4">
          <Field label="Subject" required><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Body" required hint="Available: {{CandidateName}} {{CompanyName}} {{Position}} {{HRName}} {{HRDesignation}} {{PortalLink}} {{ChangeNote}}">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[220px] font-mono text-[12.5px]" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
