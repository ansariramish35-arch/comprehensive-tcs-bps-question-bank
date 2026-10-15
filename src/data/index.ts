import type { Question, Section } from "./types";
import { numericalUnits } from "./numerical";
import { verbalUnits } from "./verbal";
import { reasoningUnits } from "./reasoning";

export type { AttemptMap, Question, Section, Unit } from "./types";

function assignUnits(units: Section["units"]): void {
  units.forEach((u) => u.qs.forEach((q) => (q.u = u.id)));
}

assignUnits(numericalUnits);
assignUnits(verbalUnits);
assignUnits(reasoningUnits);

export const sections: Section[] = [
  {
    id: "num",
    title: "Numerical Ability",
    short: "Numerical",
    examQs: 26,
    examMin: 20,
    weight: 35,
    units: numericalUnits,
  },
  {
    id: "ver",
    title: "Verbal Ability",
    short: "Verbal",
    examQs: 24,
    examMin: 20,
    weight: 30,
    units: verbalUnits,
  },
  {
    id: "rea",
    title: "Reasoning Ability",
    short: "Reasoning",
    examQs: 30,
    examMin: 25,
    weight: 35,
    units: reasoningUnits,
  },
];

export const sectionColors: Record<
  Section["id"],
  { hex: string; soft: string; text: string }
> = {
  num: { hex: "#0e7a4e", soft: "#e2f0e7", text: "#0c3b2c" },
  ver: { hex: "#a96a14", soft: "#f7ecd7", text: "#6d4408" },
  rea: { hex: "#2e5f8e", soft: "#e4ecf5", text: "#1e4265" },
};

export const allQuestions: Question[] = sections.flatMap((s) =>
  s.units.flatMap((u) => u.qs)
);

export const questionById = new Map(allQuestions.map((q) => [q.id, q]));

export const stats = {
  total: allQuestions.length,
  imp: allQuestions.filter((q) => q.imp).length,
  pyq: allQuestions.filter((q) => q.src && q.src.startsWith("PYQ")).length,
  units: sections.reduce((n, s) => n + s.units.length, 0),
};

export const examPattern = [
  { label: "Total Questions", value: "80 MCQs" },
  { label: "Total Duration", value: "65 minutes" },
  { label: "Negative Marking", value: "None" },
  { label: "Platform", value: "TCS iON" },
  { label: "Sections", value: "3 (section-wise timing)" },
  { label: "Difficulty", value: "Easy – Moderate" },
  { label: "Suggested Cut-off", value: "≈ 65–70%" },
  { label: "Calculator", value: "On-screen only" },
];

export const examDayRules = [
  "The test runs on the TCS iON platform — sections are individually timed; when a section's clock hits zero it auto-submits.",
  "There is NO negative marking — never leave a question blank. An educated guess costs nothing.",
  "Rough work happens on the ON-SCREEN virtual pad; the proctor camera watches your eyes, so keep your gaze on the screen.",
  "You cannot return to a previous section once you move ahead — finish all attempts before switching.",
  "ID proof + hall ticket mandatory; report 45 minutes early. Rough paper is NOT supplied.",
];

export const strategy = [
  {
    phase: "Phase 1 · Weeks 1–2",
    title: "Cover every unit once",
    body: "Work through the Revision Notes under each unit, then solve the Easy + Moderate questions. Accuracy over speed — target 85% correct in this phase.",
  },
  {
    phase: "Phase 2 · Weeks 3–4",
    title: "Hammer the starred questions",
    body: "Filter the bank to ★ Exam-Important only and solve them twice. These mirror the most-repeated TCS BPS archetypes. Re-attempt every question you got wrong.",
  },
  {
    phase: "Phase 3 · Week 5",
    title: "Full mocks, real clock",
    body: "Take the 80-question / 65-minute mock at least 3 times. Budget: Numerical ≤ 46 s/question, Verbal ≤ 50 s, Reasoning ≤ 50 s. Review every error the same day.",
  },
  {
    phase: "Phase 4 · Last 48 hours",
    title: "Notes only, no new questions",
    body: "Re-read formulas, idioms, one-word substitutes, coding tricks and calendar rules. Sleep 7+ hours — a fresh brain is worth 5 extra marks.",
  },
];

export const sources = [
  { name: "PrepInsta — TCS BPS Placement Papers", url: "https://prepinsta.com/tcs-bps/placement-paper/" },
  { name: "PrepInsta — TCS BPS Numerical Ability", url: "https://prepinsta.com/tcs-bps/numerical-ability/" },
  { name: "HitBullseye — TCS Aptitude Questions", url: "https://cpt.hitbullseye.com/TCS-Aptitude-Questions.php" },
  { name: "SkillVertex — TCS BPS Previous Year Paper", url: "https://www.skillvertex.com/blog/tcs-bps-previous-year-paper-pdf-download/" },
  { name: "Scribd — TCS BPS Hiring Sample Question Paper", url: "https://www.scribd.com/document/950819374/Tcs-Bps-Hiring-Sample-Question-Paper" },
  { name: "YouTube — TCS BPS Preparation Playlist", url: "https://www.youtube.com/playlist?list=PLCVRCLNdg3_t2dUlCBRro2gdOAi0FE7Yo" },
];

export const mostRepeated = [
  "Percentages ↔ Profit-Loss chain problems (SP of x = CP of y)",
  "Trains: platform/pole crossing & opposite-direction relative speed",
  "Unit digit of powers & divisibility by 9 and 11",
  "Boats & streams (downstream/upstream averages)",
  "Coding by letter positions (A=1…Z=26) and number-codes",
  "Blood relations: 'only son/daughter of my grandfather/mother'",
  "Direction + shadow puzzles (morning/evening sun)",
  "Clock angle formula |30H − 5.5M| and day-of-week odd days",
  "Spotting errors: 'one of the + plural', prefer/senior + TO",
  "Syllogisms with two 'some' premises (conclusion traps)",
];
