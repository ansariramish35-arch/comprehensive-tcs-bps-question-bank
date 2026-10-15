import { useEffect, useMemo, useState } from "react";
import {
  sections,
  sectionColors,
  stats,
  sources,
  type AttemptMap,
  type Unit,
} from "./data";
import Home from "./components/Home";
import Mock from "./components/Mock";
import QuestionCard from "./components/QuestionCard";
import { cn } from "./utils/cn";

type View = "home" | "bank" | "mock";
type Filter = "all" | "imp" | "bookmarked" | "unseen";

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [view, setView] = useState<View>("home");
  const [sectionId, setSectionId] = useState<string>("all");
  const [unitId, setUnitId] = useState<string>("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [reveal, setReveal] = useState(false);
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState<AttemptMap>(() => load("tcsbps-attempts", {}));
  const [bookmarks, setBookmarks] = useState<string[]>(() => load("tcsbps-bookmarks", []));

  useEffect(() => localStorage.setItem("tcsbps-attempts", JSON.stringify(attempts)), [attempts]);
  useEffect(() => localStorage.setItem("tcsbps-bookmarks", JSON.stringify(bookmarks)), [bookmarks]);

  const recordAttempt = (qid: string, sel: number, correctIdx: number) =>
    setAttempts((a) => ({ ...a, [qid]: { sel, ok: sel === correctIdx } }));

  const mergeAttempts = (extra: AttemptMap) => setAttempts((a) => ({ ...a, ...extra }));

  const toggleBookmark = (qid: string) =>
    setBookmarks((b) => (b.includes(qid) ? b.filter((x) => x !== qid) : [...b, qid]));

  const openSection = (id: string) => {
    setSectionId(id);
    setUnitId("all");
    setView("bank");
    window.scrollTo({ top: 0 });
  };

  // ---------- filtering ----------
  const visibleSections = useMemo(
    () => sections.filter((s) => sectionId === "all" || s.id === sectionId),
    [sectionId]
  );

  const term = search.trim().toLowerCase();
  const filteredUnits = useMemo(() => {
    const out: { section: (typeof sections)[number]; unit: Unit }[] = [];
    visibleSections.forEach((section) => {
      section.units.forEach((unit) => {
        if (unitId !== "all" && unit.id !== unitId) return;
        const qs = unit.qs.filter((q) => {
          if (filter === "imp" && !q.imp) return false;
          if (filter === "bookmarked" && !bookmarks.includes(q.id)) return false;
          if (filter === "unseen" && attempts[q.id] !== undefined) return false;
          if (term) {
            const hay = (q.q + " " + q.o.join(" ") + " " + q.e + " " + unit.title).toLowerCase();
            if (!hay.includes(term)) return false;
          }
          return true;
        });
        if (qs.length) out.push({ section, unit: { ...unit, qs } });
      });
    });
    return out;
  }, [visibleSections, unitId, filter, bookmarks, attempts, term]);

  const totalShown = filteredUnits.reduce((n, u) => n + u.unit.qs.length, 0);

  const NavTab = ({ id, label }: { id: View; label: string }) => (
    <button
      onClick={() => setView(id)}
      className={cn(
        "relative rounded-md px-3 py-1.5 font-display text-[13px] font-semibold tracking-wide transition-all duration-200",
        view === id ? "bg-pine text-[#e8f2ea]" : "text-soft hover:bg-mosslight hover:text-pine"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="graph-bg min-h-screen text-ink">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <button onClick={() => setView("home")} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-pine font-mono text-[11px] font-bold text-goldbright">
              BPS
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-[15px] font-bold tracking-tight">TCS BPS Question Bank</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
                {stats.total} MCQs · guaranteed selection
              </span>
            </span>
          </button>
          <nav className="ml-auto flex items-center gap-1">
            <NavTab id="home" label="Overview" />
            <NavTab id="bank" label="Question Bank" />
            <NavTab id="mock" label="Mock Tests" />
          </nav>
          <span className="stamp hidden text-[9px] font-semibold text-moss md:inline-block">
            Made by Ramish Ansari
          </span>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {view === "home" && (
          <Home
            attempts={attempts}
            bookmarkCount={bookmarks.length}
            onOpenSection={openSection}
            onStartMock={() => setView("mock")}
          />
        )}

        {view === "mock" && <Mock onFinish={mergeAttempts} onExit={() => setView("bank")} />}

        {view === "bank" && (
          <div className="animate-fadein">
            {/* toolbar */}
            <div className="sticky top-[57px] z-30 -mx-4 mb-5 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                {/* section tabs */}
                <div className="flex overflow-x-auto rounded-md border border-line bg-card p-1">
                  {[{ id: "all", title: "All", short: "All" }, ...sections].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSectionId(s.id);
                        setUnitId("all");
                      }}
                      className={cn(
                        "whitespace-nowrap rounded px-3 py-1.5 font-display text-[12.5px] font-semibold transition-all duration-200",
                        sectionId === s.id ? "text-white" : "text-soft hover:text-ink"
                      )}
                      style={sectionId === s.id ? { background: s.id === "all" ? "#17251c" : sectionColors[s.id as keyof typeof sectionColors].hex } : undefined}
                    >
                      {s.id === "all" ? `All (${stats.total})` : `${s.short} (${sections.find((x) => x.id === s.id)!.units.reduce((n, u) => n + u.qs.length, 0)})`}
                    </button>
                  ))}
                </div>

                {/* unit picker */}
                {sectionId !== "all" && (
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="max-w-[220px] rounded-md border border-line bg-card px-2.5 py-2 text-[12.5px] font-medium text-ink outline-none transition-colors focus:border-moss"
                  >
                    <option value="all">All units</option>
                    {sections
                      .find((s) => s.id === sectionId)!
                      .units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.title} ({u.qs.length})
                        </option>
                      ))}
                  </select>
                )}

                {/* search */}
                <div className="relative ml-auto min-w-[180px] flex-1 sm:max-w-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search questions, topics, options…"
                    className="w-full rounded-md border border-line bg-card py-2 pl-8 pr-3 text-[13px] outline-none transition-colors placeholder:text-faint focus:border-moss"
                  />
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: "all", label: "Everything" },
                    { id: "imp", label: "★ Exam Important" },
                    { id: "bookmarked", label: "Bookmarked" },
                    { id: "unseen", label: "Not attempted" },
                  ] as { id: Filter; label: string }[]
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider transition-all duration-200",
                      filter === f.id
                        ? f.id === "imp"
                          ? "border-goldbright bg-goldbright text-white"
                          : "border-pine bg-pine text-[#e8f2ea]"
                        : "border-line bg-card text-soft hover:border-pine hover:text-pine"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
                <span className="ml-1 font-mono text-[11px] text-faint">{totalShown} questions</span>
                <label className="ml-auto flex cursor-pointer select-none items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-soft">
                  <span>Read mode (reveal solutions)</span>
                  <button
                    role="switch"
                    aria-checked={reveal}
                    onClick={() => setReveal((r) => !r)}
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors duration-200",
                      reveal ? "bg-moss" : "bg-linedark"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
                        reveal ? "left-[18px]" : "left-0.5"
                      )}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* content */}
            {filteredUnits.length === 0 ? (
              <div className="rounded-lg border border-dashed border-linedark bg-card px-6 py-16 text-center">
                <p className="font-display text-lg font-bold">No questions match</p>
                <p className="mt-1 text-sm text-soft">Try clearing the search or switching the filter.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredUnits.map(({ section, unit }) => {
                  const c = sectionColors[section.id];
                  const attemptedInUnit = unit.qs.filter((q) => attempts[q.id] !== undefined).length;
                  const correctInUnit = unit.qs.filter((q) => attempts[q.id]?.ok).length;
                  const notesOpen = openNotes[unit.id];
                  return (
                    <section key={unit.id}>
                      {/* unit header */}
                      <div className="mb-3 rounded-lg border border-line bg-card p-4 sm:p-5" style={{ borderTop: `3px solid ${c.hex}` }}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: c.hex }}>
                            {section.short} · Unit
                          </span>
                          <h2 className="font-display text-lg font-bold leading-tight">{unit.title}</h2>
                          <span className="rounded-sm bg-paper px-1.5 py-0.5 font-mono text-[10px] text-soft">
                            {unit.qs.length} Qs · {unit.qs.filter((q) => q.imp).length} ★
                          </span>
                          <button
                            onClick={() => setOpenNotes((n) => ({ ...n, [unit.id]: !n[unit.id] }))}
                            className="ml-auto rounded-md border border-line px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-soft transition-all hover:border-moss hover:text-moss"
                          >
                            {notesOpen ? "Hide revision notes ▲" : "Revision notes ▼"}
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {unit.topics.map((t) => (
                            <span key={t} className="rounded-sm border border-line/80 bg-paper px-1.5 py-0.5 text-[10.5px] text-soft">
                              {t}
                            </span>
                          ))}
                        </div>
                        {attemptedInUnit > 0 && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(attemptedInUnit / unit.qs.length) * 100}%`, background: c.hex }} />
                            </div>
                            <span className="font-mono text-[10px] text-faint">
                              {attemptedInUnit}/{unit.qs.length} done · {correctInUnit} correct
                            </span>
                          </div>
                        )}
                        {notesOpen && (
                          <ul className="animate-fadein mt-3 space-y-1.5 rounded-md border-l-2 bg-paper/70 px-3.5 py-3" style={{ borderColor: c.hex }}>
                            {unit.note.map((n, i) => (
                              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-pine">
                                <span className="mt-0.5 font-mono text-[10px] font-bold" style={{ color: c.hex }}>▸</span>
                                {n}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {/* questions */}
                      <div className="space-y-3.5">
                        {unit.qs.map((q, i) => (
                          <QuestionCard
                            key={q.id}
                            q={q}
                            index={i + 1}
                            color={c}
                            attempt={attempts[q.id]}
                            onAnswer={(qq, s) => recordAttempt(qq.id, s, qq.a)}
                            bookmarked={bookmarks.includes(q.id)}
                            onBookmark={toggleBookmark}
                            reveal={reveal}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="dark-panel mt-12 border-t border-pine text-[#b9d0c0]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="font-display text-2xl font-bold text-[#f2f7f3]">
                Go clear that exam. <span className="text-goldbright">See you at the interview.</span>
              </p>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed">
                Compiled from public previous-year papers &amp; prep archives ({sources.length} sources linked on the Overview
                page). Question patterns follow the official TCS BPS syllabus; solutions are worked out step-by-step.
              </p>
            </div>
            <div className="shrink-0 text-left md:text-right">
              <span className="stamp animate-stampin border-goldbright text-sm font-bold text-goldbright">
                Made by Ramish Ansari
              </span>
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8fb59d]">
                Guaranteed Selection Question Bank · {new Date().getFullYear()}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#23443466] pt-5 font-mono text-[10.5px] uppercase tracking-wider text-[#6d937c]">
            <span>{stats.total} MCQs</span>
            <span>·</span>
            <span>{stats.units} syllabus units</span>
            <span>·</span>
            <span>{stats.imp} exam-important</span>
            <span>·</span>
            <span>{stats.pyq} previous-year questions</span>
            <span className="ml-auto normal-case tracking-normal">80 Q · 65 min · no negative marking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
