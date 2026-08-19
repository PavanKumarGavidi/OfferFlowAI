import { useMemo, useState } from "react";
import { Cake, CalendarDays, Gift, PartyPopper, Sparkles } from "lucide-react";
import { daysUntil, festivalDateLabel, fmtDate } from "../lib/types";
import { useStore } from "../lib/store";
import { Avatar, Badge } from "../components/ui";

export default function Engagement() {
  const { db, company, toast } = useStore();
  const [wished, setWished] = useState<string[]>([]);

  const birthdays = useMemo(
    () => db.birthdays.filter((b) => b.companyId === company?.id).map((b) => ({ ...b, days: daysUntil(b.monthDay) })).sort((a, b) => a.days - b.days),
    [db.birthdays, company]
  );
  const festivals = useMemo(() => db.festivals.map((f) => ({ ...f, days: daysUntil(f.monthDay) })).sort((a, b) => a.days - b.days), [db.festivals]);

  const wish = (name: string, id: string) => {
    if (wished.includes(id)) return;
    setWished((w) => [...w, id]);
    toast(`Wish sent to ${name}`, "success", "A birthday email has been scheduled from your People team.");
  };

  const md = (s: string) => {
    const [m, d] = s.split("-").map(Number);
    return fmtDate(new Date(2024, m - 1, d).toISOString()).replace(" 2024", "");
  };

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Celebration banner */}
      <div className="relative overflow-hidden rounded-2xl bg-cobalt-700 text-white px-6 py-7 sm:px-8">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <svg className="absolute -right-6 -top-8 w-64 h-64 opacity-20" viewBox="0 0 200 200" fill="none">
          <circle cx="40" cy="60" r="5" fill="#8fabf7" /><circle cx="120" cy="30" r="4" fill="#fff" /><circle cx="170" cy="90" r="6" fill="#b9ccfb" />
          <circle cx="80" cy="140" r="4" fill="#fff" /><circle cx="150" cy="160" r="5" fill="#8fabf7" /><circle cx="30" cy="160" r="3" fill="#b9ccfb" />
          <path d="M60 90l8 8m50-40l-6 10m40 60l-10-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-cobalt-200"><PartyPopper size={15} /> Employee Engagement</p>
          <h2 className="font-display font-bold text-[26px] tracking-tight mt-2">Celebrate the people behind {company?.name ?? "your company"}</h2>
          <p className="text-[14px] text-cobalt-100 mt-1.5 max-w-xl">Birthdays and festivals, with countdowns — because onboarding shouldn't be the only moment people feel welcomed.</p>
        </div>
      </div>

      {/* Birthdays */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center"><Cake size={17} /></span>
          <div>
            <h3 className="font-display font-bold text-[18px] text-ink-900 dark:text-white tracking-tight">Upcoming Birthdays</h3>
            <p className="text-[12.5px] text-ink-400">Never miss a teammate's big day.</p>
          </div>
        </div>
        {birthdays.length === 0 ? (
          <div className="panel !rounded-xl p-6 text-center text-[13.5px] text-ink-400">No birthdays recorded yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {birthdays.map((b, i) => (
              <div key={b.id} className="panel !rounded-xl p-5 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="absolute top-0 left-0 right-0 h-1" style={{ background: b.color }} />
                <div className="flex items-center gap-3.5">
                  <Avatar name={b.name} size={46} color={b.color} />
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-bold text-ink-900 dark:text-white truncate">{b.name}</p>
                    <p className="text-[12px] text-ink-500 dark:text-ink-400 truncate">{b.designation} · {b.department}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-400 flex items-center gap-1.5"><Gift size={12} /> Birthday</p>
                    <p className="text-[14px] font-bold text-ink-800 dark:text-ink-100 mt-0.5">{md(b.monthDay)}</p>
                  </div>
                  <Badge className={b.days === 0 ? "bg-rose-500/12 text-rose-600 dark:text-rose-300 ring-rose-500/30" : "bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 ring-cobalt-500/25"}>
                    {b.days === 0 ? "Today! 🎂" : `in ${b.days} day${b.days === 1 ? "" : "s"}`}
                  </Badge>
                </div>
                <button
                  onClick={() => wish(b.name, b.id)}
                  disabled={wished.includes(b.id)}
                  className={`mt-4 w-full py-2.5 rounded-lg text-[13px] font-bold transition-all duration-150 ${wished.includes(b.id) ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/25" : "bg-ink-900 dark:bg-white text-white dark:text-ink-925 hover:bg-ink-800 dark:hover:bg-ink-100 active:scale-[0.98]"}`}
                >
                  {wished.includes(b.id) ? "✓ Wish sent" : "Wish Employee"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Festivals */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-9 h-9 rounded-xl bg-amber-500/12 text-amber-500 flex items-center justify-center"><CalendarDays size={17} /></span>
          <div>
            <h3 className="font-display font-bold text-[18px] text-ink-900 dark:text-white tracking-tight">Upcoming Festivals & Celebrations</h3>
            <p className="text-[12.5px] text-ink-400">Company-wide moments to look forward to.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {festivals.map((f, i) => (
            <div key={f.id} className="panel !rounded-xl overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div className="h-2" style={{ background: `linear-gradient(90deg, hsl(${f.hue} 75% 55%), hsl(${f.hue + 40} 75% 60%))` }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-[16.5px] text-ink-900 dark:text-white">{f.name}</p>
                    <p className="text-[12.5px] text-ink-400 mt-0.5 flex items-center gap-1.5"><CalendarDays size={12} /> {festivalDateLabel(f.monthDay)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold ring-1 ring-inset shrink-0"
                    style={{ background: `hsl(${f.hue} 80% 94% / .7)`, color: `hsl(${f.hue} 70% 38%)`, borderColor: `hsl(${f.hue} 60% 70%)` }}>
                    <Sparkles size={11} /> {f.days === 0 ? "Today!" : `${f.days}d to go`}
                  </span>
                </div>
                <p className="text-[13px] text-ink-500 dark:text-ink-300 mt-3 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
