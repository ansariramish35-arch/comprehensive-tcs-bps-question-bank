import {
  examPattern,
  examDayRules,
  mostRepeated,
  sections,
  sectionColors,
  sources,
  stats,
  strategy,
  type AttemptMap,
} from "../data";

interface Props {
  attempts: AttemptMap;
  bookmarkCount: number;
  onOpenSection: (id: string) => void;
  onStartMock: () => void;
}

export default function Home({ attempts, bookmarkCount, onOpenSection, onStartMock }: Props) {
  const attempted = Object.values(attempts);
  const correct = attempted.filter((a) => a.ok).length;
  const acc = attempted.length ? Math.round((correct / attempted.length) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* ============ EXAM TICKET ============ */}
      <section className="animate-fadeup dark-panel perf-edge relative overflow-hidden rounded-xl p-6 text-[#e8f2ea] sm:p-9">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="stamp animate-stampin text-[11px] font-semibold text-goldbright">
                Guaranteed Selection
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8fb59d]">
                TCS iON · Written Test
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              TCS BPS
              <span className="block text-goldbright">Question Bank</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#b9d0c0]">
              <b className="text-[#e8f2ea]">{stats.total} exam-pattern MCQs</b> across all{" "}
              {stats.units} syllabus units — every PYQ archetype scraped from PrepInsta,
              HitBullseye, SkillVertex &amp; Scribd papers, each with a full solution and{" "}
              <b className="text-goldbright">{stats.imp} questions starred</b> as most likely to
              repeat.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartMock}
                className="rounded-md bg-goldbright px-5 py-2.5 font-display text-sm font-semibold tracking-wide text-pinedeep shadow-[0_4px_16px_-4px_rgba(217,147,15,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(217,147,15,0.7)] active:translate-y-0"
              >
                Start Full Mock — 80Q / 65 min
              </button>
              <button
                onClick={() => onOpenSection("num")}
                className="rounded-md border border-[#3d5c4a] px-5 py-2.5 font-display text-sm font-semibold tracking-wide text-[#cfe3d5] transition-all duration-200 hover:border-goldbright hover:text-goldbright"
              >
                Open the Bank →
              </button>
            </div>
          </div>

          {/* pattern card */}
          <div className="w-full max-w-sm shrink-0 rounded-lg border border-[#2c4a3a] bg-[#0e3125]/80 p-5">
            <p className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[#8fb59d]">
              <span>Admit-Card · Exam Pattern</span>
              <span className="text-goldbright">65 min</span>
            </p>
            <ul className="divide-y divide-[#23443466] text-sm">
              {sections.map((s) => {
                const c = sectionColors[s.id];
                return (
                  <li key={s.id} className="flex items-center gap-3 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.hex }} />
                    <span className="font-medium text-[#dcebe0]">{s.title}</span>
                    <span className="ml-auto font-mono text-[12px] text-[#9dbfa9]">
                      {s.examQs} Qs · {s.examMin} min
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 grid grid-cols-2 gap-x-4 border-t border-[#23443466] pt-3 font-mono text-[11px] text-[#8fb59d]">
              <p>TOTAL · 80 MCQ</p>
              <p className="text-right text-[#cfe3d5]">No negative marking</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ YOUR PROGRESS ============ */}
      <section className="animate-fadeup grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ animationDelay: "80ms" }}>
        {[
          { k: "Questions in bank", v: String(stats.total), sub: `across ${stats.units} units` },
          { k: "Attempted by you", v: `${attempted.length}`, sub: attempted.length ? `accuracy ${acc}%` : "start solving!" },
          { k: "Exam-Important ★", v: String(stats.imp), sub: `${stats.pyq} are real PYQs` },
          { k: "Your bookmarks", v: String(bookmarkCount), sub: "saved for revision" },
        ].map((s, i) => (
          <div
            key={s.k}
            className="rounded-lg border border-line bg-card px-4 py-3.5 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{s.k}</p>
            <p className={`mt-1 font-display text-3xl font-bold ${i === 2 ? "text-gold" : "text-ink"}`}>
              {s.v}
            </p>
            <p className="text-xs text-soft">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* ============ SECTION COVERAGE ============ */}
      <section className="animate-fadeup" style={{ animationDelay: "120ms" }}>
        <header className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss">Full syllabus · nothing left out</p>
            <h2 className="font-display text-2xl font-bold tracking-tight">Section-wise Coverage Matrix</h2>
          </div>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((s) => {
            const c = sectionColors[s.id];
            const qs = s.units.reduce((n, u) => n + u.qs.length, 0);
            const imp = s.units.reduce((n, u) => n + u.qs.filter((q) => q.imp).length, 0);
            return (
              <div key={s.id} className="group flex flex-col rounded-lg border border-line bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold" style={{ color: c.text }}>
                    {s.title}
                  </h3>
                  <span className="rounded-sm px-2 py-0.5 font-mono text-[11px] font-semibold" style={{ background: c.soft, color: c.text }}>
                    {s.examQs}Q · {s.examMin}m in exam
                  </span>
                </div>
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-paper">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.weight}%`, background: c.hex }} />
                </div>
                <ul className="mb-4 space-y-1.5">
                  {s.units.map((u) => (
                    <li key={u.id} className="flex items-baseline gap-2 text-[13px] text-soft">
                      <span className="font-mono text-[11px] font-semibold" style={{ color: c.hex }}>
                        {u.qs.length}
                      </span>
                      <span>{u.title}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                  <span className="font-mono text-[11px] text-faint">
                    {qs} Qs · {imp} starred ★
                  </span>
                  <button
                    onClick={() => onOpenSection(s.id)}
                    className="font-display text-[13px] font-semibold transition-colors hover:underline"
                    style={{ color: c.hex }}
                  >
                    Practice →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ MOST REPEATED ============ */}
      <section className="animate-fadeup grid gap-4 lg:grid-cols-5" style={{ animationDelay: "160ms" }}>
        <div className="rounded-lg border border-goldbright/40 bg-goldlight/60 p-5 lg:col-span-3">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Field intelligence</p>
          <h2 className="mb-4 font-display text-xl font-bold">10 Archetypes TCS Repeats Relentlessly</h2>
          <ol className="space-y-2">
            {mostRepeated.map((t, i) => (
              <li key={i} className="flex gap-3 text-[13.5px] leading-snug text-ink">
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-goldbright/90 font-mono text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
        </div>
        <div className="dark-panel rounded-lg p-5 text-[#dcebe0] lg:col-span-2">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8fb59d]">Read twice</p>
          <h2 className="mb-4 font-display text-xl font-bold text-[#f2f7f3]">Exam-Day Rules</h2>
          <ul className="space-y-3">
            {examDayRules.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-[#b9d0c0]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-goldbright" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ STRATEGY ============ */}
      <section className="animate-fadeup" style={{ animationDelay: "200ms" }}>
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-moss">5-week plan</p>
        <h2 className="mb-4 font-display text-2xl font-bold tracking-tight">From Zero to Offer Letter</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {strategy.map((p, i) => (
            <div key={i} className="relative rounded-lg border border-line bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-moss/50">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-moss">{p.phase}</span>
              <h3 className="mt-1 font-display text-[15px] font-bold leading-snug">{p.title}</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PATTERN DETAIL + SOURCES ============ */}
      <section className="animate-fadeup grid gap-4 lg:grid-cols-2" style={{ animationDelay: "240ms" }}>
        <div className="rounded-lg border border-line bg-card p-5">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-moss">At a glance</p>
          <h2 className="mb-3 font-display text-xl font-bold">Paper Structure</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {examPattern.map((r) => (
              <div key={r.label} className="flex flex-col border-b border-line/70 pb-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{r.label}</dt>
                <dd className="text-sm font-semibold text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-md bg-bricklight/70 px-3 py-2 text-[12px] leading-relaxed text-brick">
            <b>Heads-up:</b> some drives use a 50-question / 5-section variant that adds
            Quantitative Aptitude &amp; Data Interpretation. This bank's three core sections fully
            cover that variant too — DI/QA questions draw on the same Numerical units.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-card p-5">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-moss">Where the questions come from</p>
          <h2 className="mb-3 font-display text-xl font-bold">Source Papers &amp; Channels</h2>
          <ul className="space-y-2">
            {sources.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 rounded-md border border-line/70 px-3 py-2 text-[13px] text-ink transition-all duration-200 hover:border-moss hover:bg-mosslight/50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-moss">
                    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                  </svg>
                  <span className="truncate">{s.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] uppercase text-faint transition-colors group-hover:text-moss">open ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
