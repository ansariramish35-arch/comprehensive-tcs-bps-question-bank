import { useEffect, useRef, useState } from "react";
import { sections, sectionColors, type AttemptMap, type Question, type Section } from "../data";
import QuestionCard from "./QuestionCard";
import { cn } from "../utils/cn";

interface Part {
  section: Section;
  count: number;
  minutes: number;
}
interface MockConfig {
  id: string;
  name: string;
  tag: string;
  desc: string;
  parts: Part[];
  impOnly?: boolean;
}

const PRESETS: MockConfig[] = [
  {
    id: "full",
    name: "Full Mock · Real Exam Replica",
    tag: "80 Q · 65 MIN",
    desc: "Exact TCS BPS pattern — 26 Numerical (20 min) → 24 Verbal (20 min) → 30 Reasoning (25 min). Sections lock when time expires, just like TCS iON.",
    parts: [
      { section: sections[0], count: 26, minutes: 20 },
      { section: sections[1], count: 24, minutes: 20 },
      { section: sections[2], count: 30, minutes: 25 },
    ],
  },
  {
    id: "guaranteed",
    name: "Guaranteed Selection Drill",
    tag: "★ IMP ONLY",
    desc: "Only the starred exam-important questions — the archetypes TCS repeats every drive. Best use: the final week before your test.",
    parts: [
      { section: sections[0], count: 7, minutes: 5 },
      { section: sections[1], count: 6, minutes: 5 },
      { section: sections[2], count: 7, minutes: 5 },
    ],
    impOnly: true,
  },
  {
    id: "quick",
    name: "Quick 15 · Warm-up Sprint",
    tag: "15 Q · 12 MIN",
    desc: "A fast mixed sprint to start the day. Five questions from each section with a tight 48-second-per-question pace.",
    parts: [
      { section: sections[0], count: 5, minutes: 4 },
      { section: sections[1], count: 5, minutes: 4 },
      { section: sections[2], count: 5, minutes: 4 },
    ],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

interface Props {
  onFinish: (attempts: AttemptMap) => void;
  onExit: () => void;
}

export default function Mock({ onFinish, onExit }: Props) {
  const [phase, setPhase] = useState<"setup" | "run" | "results">("setup");
  const [cfg, setCfg] = useState<MockConfig | null>(null);
  const [qs, setQs] = useState<Question[]>([]);
  const [bounds, setBounds] = useState<{ start: number; end: number; part: Part }[]>([]);
  const [partIdx, setPartIdx] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [remaining, setRemaining] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const start = (c: MockConfig) => {
    const pool: Question[] = [];
    const bds: { start: number; end: number; part: Part }[] = [];
    let cursor = 0;
    c.parts.forEach((part) => {
      const base = part.section.units.flatMap((u) => u.qs);
      const poolSrc = c.impOnly ? base.filter((q) => q.imp) : base;
      const chosen = shuffle(poolSrc).slice(0, Math.min(part.count, poolSrc.length));
      pool.push(...chosen);
      bds.push({ start: cursor, end: cursor + chosen.length, part });
      cursor += chosen.length;
    });
    setCfg(c);
    setQs(pool);
    setBounds(bds);
    setPartIdx(0);
    setIdx(0);
    setAnswers({});
    setMarked({});
    setRemaining(c.parts[0].minutes * 60);
    setConfirming(false);
    setPhase("run");
    window.scrollTo({ top: 0 });
  };

  // countdown
  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // section auto-advance when clock hits zero
  useEffect(() => {
    if (phase !== "run" || !cfg || remaining !== 0) return;
    const next = partIdx + 1;
    if (next < cfg.parts.length) {
      setPartIdx(next);
      setIdx(bounds[next].start);
      setMarked({});
      setRemaining(cfg.parts[next].minutes * 60);
    } else {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase, cfg, partIdx, bounds]);

  const finish = () => {
    const attempts: AttemptMap = {};
    qs.forEach((q) => {
      const sel = answersRef.current[q.id];
      if (sel !== undefined) attempts[q.id] = { sel, ok: sel === q.a };
    });
    onFinish(attempts);
    setPhase("results");
    window.scrollTo({ top: 0 });
  };

  const advanceSection = () => {
    if (!cfg) return;
    const next = partIdx + 1;
    if (next < cfg.parts.length) {
      setPartIdx(next);
      setIdx(bounds[next].start);
      setMarked({});
      setRemaining(cfg.parts[next].minutes * 60);
      setConfirming(false);
    } else finish();
  };

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <div className="animate-fadeup mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss">Test centre</p>
            <h1 className="font-display text-3xl font-bold tracking-tight">Mock Tests</h1>
          </div>
          <button onClick={onExit} className="font-mono text-xs uppercase tracking-wider text-soft transition-colors hover:text-ink">
            ← Back to bank
          </button>
        </div>
        {PRESETS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => start(p)}
            className="group block w-full rounded-lg border border-line bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-moss hover:shadow-lg"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-lg font-bold">{p.name}</h3>
              <span className="rounded-sm bg-pine px-2 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-[#cfe6d8]">
                {p.tag}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-soft">{p.desc}</p>
            <span className="mt-3 inline-block font-display text-sm font-semibold text-moss transition-transform duration-200 group-hover:translate-x-1">
              Begin test →
            </span>
          </button>
        ))}
      </div>
    );
  }

  // ---------- RESULTS ----------
  if (phase === "results" && cfg) {
    const total = qs.length;
    const attemptedCount = qs.filter((q) => answers[q.id] !== undefined).length;
    const correctCount = qs.filter((q) => answers[q.id] !== undefined && answers[q.id] === q.a).length;
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    const verdict =
      pct >= 80
        ? { t: "SELECTION MATERIAL", c: "text-moss", m: "You're clearing the cut-off with a margin. Keep polishing starred questions and take one more full mock to lock consistency." }
        : pct >= 65
          ? { t: "LIKELY TO CLEAR", c: "text-gold", m: "Above the usual cut-off zone — but review every wrong answer below and re-solve those units before the real test." }
          : { t: "NEEDS WORK", c: "text-brick", m: "Below the expected cut-off. Go back to the unit Revision Notes, solve the starred questions twice, then re-attempt this mock." };
    const circumference = 2 * Math.PI * 54;

    return (
      <div className="animate-fadeup space-y-6">
        <div className="dark-panel rounded-xl p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#23443466" strokeWidth="9" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={pct >= 65 ? "#d9930f" : "#bf3f2c"}
                  strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                  style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold text-[#f2f7f3]">{pct}%</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8fb59d]">score</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8fb59d]">{cfg.name}</p>
              <h2 className={`font-display text-2xl font-bold ${verdict.c === "text-moss" ? "text-[#7fd6ae]" : verdict.c === "text-gold" ? "text-goldbright" : "text-[#f0a294]"}`}>
                {verdict.t}
              </h2>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-[#b9d0c0]">{verdict.m}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 font-mono text-[12px] text-[#9dbfa9] sm:justify-start">
                <span>✓ {correctCount} correct</span>
                <span>✗ {attemptedCount - correctCount} wrong</span>
                <span>○ {total - attemptedCount} unattempted</span>
              </div>
            </div>
          </div>
          {/* per-section bars */}
          <div className="mt-6 grid gap-3 border-t border-[#23443466] pt-5 sm:grid-cols-3">
            {bounds.map((b, i) => {
              const partQs = qs.slice(b.start, b.end);
              const got = partQs.filter((q) => answers[q.id] !== undefined && answers[q.id] === q.a).length;
              const p = partQs.length ? Math.round((got / partQs.length) * 100) : 0;
              const c = sectionColors[b.part.section.id];
              return (
                <div key={i} className="rounded-md bg-[#0e3125]/80 p-3.5">
                  <p className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-[#8fb59d]">
                    <span>{b.part.section.short}</span>
                    <span className="text-[#dcebe0]">{got}/{partQs.length}</span>
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#23443466]">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p}%`, background: c.hex }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setPhase("setup")} className="rounded-md bg-moss px-5 py-2.5 font-display text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
            Take another mock
          </button>
          <button onClick={onExit} className="rounded-md border border-line bg-card px-5 py-2.5 font-display text-sm font-semibold text-ink transition-all hover:border-moss hover:text-moss">
            Review weak units in bank
          </button>
        </div>

        <div>
          <h3 className="mb-3 font-display text-xl font-bold">Full Review — every question with solution</h3>
          <div className="space-y-4">
            {qs.map((q, i) => {
              const part = bounds.find((b) => i >= b.start && i < b.end)!;
              const sel = answers[q.id];
              return (
                <QuestionCard
                  key={q.id}
                  q={q}
                  index={i + 1}
                  color={sectionColors[part.part.section.id]}
                  attempt={sel !== undefined ? { sel, ok: sel === q.a } : { sel: -1, ok: false }}
                  reveal
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------- RUN ----------
  if (!cfg || !qs.length) return null;
  const part = cfg.parts[partIdx];
  const b = bounds[partIdx];
  const inPartIdx = idx - b.start;
  const q = qs[idx];
  const c = sectionColors[part.section.id];
  const answeredInPart = qs.slice(b.start, b.end).filter((x) => answers[x.id] !== undefined).length;
  const low = remaining <= 30;

  const pick = (i: number) => setAnswers((a) => ({ ...a, [q.id]: i }));

  return (
    <div className="animate-fadein">
      {/* exam top bar */}
      <div className="sticky top-[57px] z-30 -mx-4 mb-5 border-b border-line bg-card/95 px-4 py-2.5 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            {cfg.parts.map((p, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider",
                  i === partIdx ? "text-white" : "bg-paper text-faint",
                  i < partIdx && "opacity-60 line-through"
                )}
                style={i === partIdx ? { background: sectionColors[p.section.id].hex } : undefined}
              >
                {p.section.short} {i < partIdx ? "✓" : `${p.count}Q`}
              </span>
            ))}
          </div>
          <span className="font-mono text-[11px] text-soft">
            Q {inPartIdx + 1}/{b.end - b.start} · {answeredInPart} answered
          </span>
          <div className={cn("ml-auto flex items-center gap-1.5 font-mono text-lg font-semibold tabular-nums", low ? "animate-tickpulse text-brick" : "text-ink")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></svg>
            {fmt(remaining)}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.hex }} />
            <h2 className="font-display text-lg font-bold">{part.section.title}</h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">{part.minutes} min section</span>
          </div>
          <QuestionCard
            key={q.id}
            q={q}
            index={idx + 1}
            color={c}
            attempt={answers[q.id] !== undefined ? { sel: answers[q.id], ok: answers[q.id] === q.a } : undefined}
            onAnswer={(_qq, s) => pick(s)}
          />
          {answers[q.id] !== undefined && (
            <p className="rounded-md bg-goldlight/70 px-3.5 py-2 text-[12.5px] text-gold">
              Answer locked — study the solution now (that's how you learn), then move on. In the real TCS iON test you can switch your choice until you click Next.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIdx((i) => Math.max(b.start, i - 1))}
              disabled={idx === b.start}
              className="rounded-md border border-line bg-card px-4 py-2 font-display text-sm font-semibold transition-all enabled:hover:border-moss enabled:hover:text-moss disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
              className={cn(
                "rounded-md border px-4 py-2 font-display text-sm font-semibold transition-all",
                marked[q.id] ? "border-goldbright bg-goldlight text-gold" : "border-line bg-card text-soft hover:border-goldbright hover:text-gold"
              )}
            >
              {marked[q.id] ? "★ Marked for review" : "☆ Mark for review"}
            </button>
            <button
              onClick={() => (idx + 1 < b.end ? setIdx((i) => i + 1) : setConfirming(true))}
              className="rounded-md bg-moss px-5 py-2 font-display text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {idx + 1 < b.end ? "Next →" : "Finish section"}
            </button>
            <button onClick={() => setConfirming(true)} className="ml-auto font-mono text-[11px] uppercase tracking-wider text-soft underline-offset-2 transition-colors hover:text-brick hover:underline">
              Submit {part.section.short} early
            </button>
          </div>

          {confirming && (
            <div className="animate-fadein flex flex-wrap items-center gap-3 rounded-md border border-brick/40 bg-bricklight px-4 py-3">
              <p className="text-[13px] font-medium text-brick">
                Submit {part.section.title}? {b.end - b.start - answeredInPart} unanswered — you cannot return to this section.
              </p>
              <div className="ml-auto flex gap-2">
                <button onClick={() => setConfirming(false)} className="rounded-md border border-line bg-card px-3 py-1.5 text-xs font-semibold">Keep solving</button>
                <button onClick={advanceSection} className="rounded-md bg-brick px-3 py-1.5 text-xs font-semibold text-white">Submit section</button>
              </div>
            </div>
          )}
        </div>

        {/* palette */}
        <aside className="h-fit rounded-lg border border-line bg-card p-4 lg:sticky lg:top-[130px]">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Question palette</p>
          <div className="grid grid-cols-6 gap-1.5">
            {qs.slice(b.start, b.end).map((x, i) => {
              const state = i === inPartIdx ? "cur" : marked[x.id] ? "mark" : answers[x.id] !== undefined ? "ans" : "none";
              return (
                <button
                  key={x.id}
                  onClick={() => setIdx(b.start + i)}
                  title={`Question ${i + 1}`}
                  className={cn(
                    "flex h-8 items-center justify-center rounded font-mono text-[11px] font-semibold transition-all duration-150 hover:scale-110",
                    state === "cur" && "bg-ink text-white ring-2 ring-moss ring-offset-1",
                    state === "ans" && "bg-moss text-white",
                    state === "mark" && "bg-goldbright text-white",
                    state === "none" && "border border-line bg-paper text-soft hover:border-moss"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1.5 border-t border-line pt-3 font-mono text-[10px] text-soft">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-moss" /> answered</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-goldbright" /> marked for review</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-line bg-paper" /> not visited</li>
          </ul>
          <div className="mt-3 rounded-md bg-paper px-3 py-2 text-[11.5px] leading-relaxed text-soft">
            No negative marking — if time is running out, answer <b className="text-ink">every</b> remaining question, even by guess.
          </div>
        </aside>
      </div>
    </div>
  );
}
