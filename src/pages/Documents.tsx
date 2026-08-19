import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import type { Candidate, CandidateDoc } from "../lib/types";
import { DOC_META, fmtDateTime } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Badge, EmptyState, Input, Select } from "../components/ui";
import { DocPreviewModal } from "../components/CandidateDrawer";

export default function Documents() {
  const { myCandidates } = useStore();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<{ doc: CandidateDoc; cand: Candidate } | null>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return myCandidates
      .flatMap((c) => c.docs.map((d) => ({ doc: d, cand: c })))
      .filter((r) => (status === "all" ? true : r.doc.status === status))
      .filter((r) => !query || r.cand.name.toLowerCase().includes(query) || (r.doc.fileName ?? "").toLowerCase().includes(query))
      .sort((a, b) => (b.doc.uploadedAt ?? "").localeCompare(a.doc.uploadedAt ?? ""));
  }, [myCandidates, status, q]);

  const counts = { all: myCandidates.length * 8, uploaded: 0, pending: 0, invalid: 0 };
  myCandidates.forEach((c) => c.docs.forEach((d) => { counts[d.status]++; }));

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candidate or file…" className="!pl-10" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[190px]">
          <option value="all">All documents ({counts.all})</option>
          <option value="uploaded">Uploaded ({counts.uploaded})</option>
          <option value="pending">Pending ({counts.pending})</option>
          <option value="invalid">Invalid ({counts.invalid})</option>
        </Select>
        <span className="flex-1" />
        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25">{counts.uploaded} uploaded</Badge>
        <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/25">{counts.pending} pending</Badge>
        <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25">{counts.invalid} invalid</Badge>
      </div>

      {rows.length === 0 ? (
        <div className="panel !rounded-xl"><EmptyState icon={<FileText size={24} />} title="No documents match" body="Documents appear here as soon as candidates upload them in their portal." /></div>
      ) : (
        <div className="panel !rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[820px]">
              <thead>
                <tr className="border-b border-ink-900/8 dark:border-white/8 bg-ink-50/70 dark:bg-ink-925/70">
                  {["Document", "Candidate", "File", "Size", "Uploaded", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-ink-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5 dark:divide-white/5">
                {rows.map(({ doc, cand }) => {
                  const meta = DOC_META.find((m) => m.type === doc.type);
                  return (
                    <tr key={cand.id + doc.type} className="hover:bg-cobalt-500/4 dark:hover:bg-cobalt-500/6 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${doc.status === "uploaded" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : doc.status === "invalid" ? "bg-rose-500/10 text-rose-500" : "bg-ink-900/5 dark:bg-white/6 text-ink-400"}`}>
                            <FileText size={16} />
                          </span>
                          <p className="text-[13px] font-bold text-ink-800 dark:text-ink-100">{meta?.label}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={cand.name} size={28} />
                          <div>
                            <p className="text-[13px] font-semibold text-ink-800 dark:text-ink-100">{cand.name}</p>
                            <p className="text-[11px] text-ink-400">{cand.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12.5px] text-ink-500 dark:text-ink-300">{doc.fileName ?? "—"}</td>
                      <td className="px-4 py-3 text-[12.5px] text-ink-500 dark:text-ink-300 tabular-nums">{doc.size ? `${Math.round(doc.size / 1024)} KB` : "—"}</td>
                      <td className="px-4 py-3 text-[12.5px] text-ink-400 whitespace-nowrap">{doc.uploadedAt ? fmtDateTime(doc.uploadedAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={doc.status === "uploaded" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25" : doc.status === "invalid" ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25" : "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20"}>
                          {doc.status === "uploaded" ? "Uploaded" : doc.status === "invalid" ? "Invalid" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {doc.status === "uploaded" && (
                          <button onClick={() => setPreview({ doc, cand })} className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 ring-1 ring-inset ring-cobalt-500/30 hover:bg-cobalt-500/8 transition-colors">Preview</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DocPreviewModal doc={preview?.doc ?? null} candidate={preview?.cand ?? null} open={!!preview} onClose={() => setPreview(null)} />
    </div>
  );
}
