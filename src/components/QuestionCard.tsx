import { useState } from "react";
import type { Attempt, Question } from "../data/types";
import { cn } from "../utils/cn";

const LETTERS = ["A", "B", "C", "D"];
const DIFF = { 1: "Easy", 2: "Moderate", 3: "Hard" } as const;

interface Props {
  q: Question;
  index: number;
  color: { hex: string; soft: string; text: string };
  unitTitle?: string;
  attempt?: Attempt;
  onAnswer?: (q: Question, sel: number) => void;
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
  reveal?: boolean; // read mode: show answer without interaction
}

export default function QuestionCard({
  q,
  index,
  color,
  unitTitle,
  attempt,
  onAnswer,
  bookmarked,
  onBookmark,
  reveal,
}: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const answered = attempt !== undefined ? attempt.sel : sel;
  const isAnswered = answered !== null && answered !== undefined;
  const correct = isAnswered ? answered === q.a : false;

  const pick = (i: number) => {
    if (isAnswered) return;
    setSel(i);
    onAnswer?.(q, i);
  };

  return (
    <article
      className="group relative animate-fadeup rounded-lg border border-line bg-card shadow-[0_1px_2px_rgba(23,37,28,0.05)] transition-shadow duration-300 hover:shadow-[0_6px_24px_-8px_rgba(23,37,28,0.25)]"
      style={{ borderLeft: `4px solid ${color.hex}` }}
    >
      {/* header strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line/70 px-4 py-2.5 sm:px-5">
        <span
          className="font-mono text-[11px] font-semibold tracking-wider"
          style={{ color: color.hex }}
        >
          Q{String(index).padStart(3, "0")}
        </span>
        {unitTitle && (
          <span className="rounded-sm bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-soft">
            {unitTitle}
          </span>
        )}
        <span
          className={cn(
            "rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            q.d === 1 && "bg-mosslight text-moss",
            q.d === 2 && "bg-goldlight text-gold",
            q.d === 3 && "bg-bricklight text-brick"
          )}
        >
          {DIFF[q.d]}
        </span>
        {q.src && (
          <span className="rounded-sm bg-pine px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-[#cfe6d8]">
            {q.src}
          </span>
        )}
        {q.imp && (
          <span className="inline-flex items-center gap-1 rounded-sm border border-goldbright/60 bg-goldlight px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.3l7.1-.7L12 2z" />
            </svg>
            Exam Important
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isAnswered && !reveal && (
            <span
              className={cn(
                "font-mono text-[10px] font-semibold uppercase tracking-wider",
                answered === -1 ? "text-faint" : correct ? "text-moss" : "text-brick"
              )}
            >
              {answered === -1 ? "— Skipped" : correct ? "✓ Correct" : "✗ Wrong"}
            </span>
          )}
          {onBookmark && (
            <button
              onClick={() => onBookmark(q.id)}
              title={bookmarked ? "Remove bookmark" : "Bookmark for revision"}
              aria-label="Bookmark question"
              className={cn(
                "rounded-md p-1.5 transition-all duration-200 hover:scale-110 active:scale-95",
                bookmarked
                  ? "bg-goldlight text-goldbright"
                  : "text-faint hover:bg-paper hover:text-gold"
              )}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* question text */}
      <div className="px-4 pt-3.5 sm:px-5">
        <p className="q-text text-[15px] font-medium leading-relaxed text-ink">
          {q.q}
        </p>
      </div>

      {/* options */}
      <div className="grid gap-2 px-4 py-3.5 sm:grid-cols-2 sm:px-5">
        {q.o.map((opt, i) => {
          const showState = isAnswered || reveal;
          const isCorrect = showState && i === q.a;
          const isWrongPick = showState && isAnswered && i === answered && i !== q.a;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={showState}
              className={cn(
                "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm leading-snug transition-all duration-200",
                !showState &&
                  "cursor-pointer border-line bg-card hover:-translate-y-0.5 hover:border-moss hover:bg-mosslight/60 hover:shadow-sm active:translate-y-0",
                isCorrect && "border-moss bg-mosslight font-medium text-pine",
                isWrongPick && "border-brick bg-bricklight text-brick",
                showState && !isCorrect && !isWrongPick && "border-line/60 bg-paper/50 text-faint"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[11px] font-semibold",
                  !showState && "border border-linedark bg-paper text-soft",
                  isCorrect && "bg-moss text-white",
                  isWrongPick && "bg-brick text-white",
                  showState && !isCorrect && !isWrongPick && "border border-line bg-paper text-faint"
                )}
              >
                {LETTERS[i]}
              </span>
              <span>{opt}</span>
              {isCorrect && <span className="ml-auto text-moss">✓</span>}
              {isWrongPick && <span className="ml-auto">✗</span>}
            </button>
          );
        })}
      </div>

      {/* explanation */}
      {(isAnswered || reveal) && (
        <div className="animate-fadein mx-4 mb-4 rounded-md border border-moss/25 bg-mosslight/50 px-3.5 py-2.5 sm:mx-5">
          <p className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-moss">
            Solution
          </p>
          <p className="text-[13.5px] leading-relaxed text-pine">{q.e}</p>
        </div>
      )}
    </article>
  );
}
