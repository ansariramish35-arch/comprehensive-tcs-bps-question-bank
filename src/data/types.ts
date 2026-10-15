export type Difficulty = 1 | 2 | 3;

export interface Question {
  id: string;
  u: string; // unit id
  q: string;
  o: string[]; // 4 options
  a: number; // correct option index
  e: string; // explanation
  d: Difficulty;
  imp?: boolean; // exam-important (likely to be repeated)
  src?: string; // source tag
}

export interface Unit {
  id: string;
  title: string;
  topics: string[];
  note: string[]; // quick revision notes / formulas
  qs: Question[];
}

export interface Section {
  id: "num" | "ver" | "rea";
  title: string;
  short: string;
  examQs: number; // questions in real exam
  examMin: number; // minutes in real exam
  weight: number; // perceived weightage
  units: Unit[];
}

export interface Attempt {
  sel: number;
  ok: boolean;
}

export type AttemptMap = Record<string, Attempt>;
