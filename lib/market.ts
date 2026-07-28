/**
 * The job market meta. Real numbers from public labor-market research, with the
 * date and source on every figure, because a career product that guesses at the
 * market is worse than one that says nothing.
 *
 * Sources: Indeed Hiring Lab, US Labor Market Snapshot (June 2026) and the
 * June 2026 jobs report analysis. BLS payroll and unemployment via the same.
 */

export const MARKET_AS_OF = "June 2026";

export const HEADLINE = {
  verdict: "Slack water",
  line: "The tide is not moving. Few workers are being pulled into new jobs, and few are being pushed out of old ones.",
};

export type Stat = { value: string; label: string; note: string };

export const STATS: Stat[] = [
  {
    value: "101.0",
    label: "Job Postings Index",
    note: "Barely above the February 2020 baseline of 100, and down 3.7% year over year",
  },
  {
    value: "+57k",
    label: "June payrolls",
    note: "Well below expectations, and April plus May were revised down by 74,000 combined",
  },
  {
    value: "1.0",
    label: "Openings per unemployed worker",
    note: "Down from about 1.2 in 2019. One opening for every seeker, not a seller's market",
  },
  {
    value: "4.2%",
    label: "Unemployment",
    note: "It fell, but because the labor force shrank, not because hiring picked up",
  },
];

export type Tier = "S" | "A" | "B" | "C" | "D";

export type Sector = {
  name: string;
  index: number;
  tier: Tier;
  read: string;
};

/** Postings index by sector, where 100 = February 2020. Roughly half of all sectors sit below it. */
export const SECTORS: Sector[] = [
  {
    name: "Production & manufacturing",
    index: 115,
    tier: "A",
    read: "The strongest board in the market, and almost nobody in tech is looking at it.",
  },
  {
    name: "Healthcare",
    index: 112,
    tier: "A",
    read: "Structural demand that does not care about the tech cycle.",
  },
  {
    name: "Loading & stocking",
    index: 107,
    tier: "B",
    read: "Above baseline, low barrier, real hiring volume.",
  },
  {
    name: "Human resources",
    index: 93,
    tier: "C",
    read: "Below baseline. The people who do the hiring are themselves not being hired.",
  },
  {
    name: "Software development",
    index: 73,
    tier: "D",
    read: "27% below pre-pandemic. Generic engineering is the hardest board in the market right now.",
  },
  {
    name: "Marketing & data analysis",
    index: 70,
    tier: "D",
    read: "Down roughly 30% or more. Do not fight here without a specific edge.",
  },
];

/** The one line on the chart that is going up. */
export const RISING = {
  value: "5.9%",
  label: "of all postings now mention AI",
  note: "An all-time high, up from a prior peak of 3.3% in 2022. It is the only meaningful thing rising while everything else flattens.",
};

export type Play = { title: string; body: string };

/** What the data actually implies for a person trying to get hired. */
export const PLAYS: Play[] = [
  {
    title: "Volume is the losing move, mathematically",
    body: "One opening per unemployed worker and hiring near 11-year lows means applications are competing against a fixed, small number of slots. Sending more of them does not create slots. This is why auto-apply tools produce nothing.",
  },
  {
    title: "Few people quit, so few backfills open",
    body: "The quits rate has sat at or below 2% for nearly a year. Most openings now come from new work, not from someone leaving. That rewards people who can name a problem a company already has, instead of waiting for a vacancy.",
  },
  {
    title: "AI is the only rising tide, so ride it explicitly",
    body: "AI mentions in postings nearly doubled off their 2022 peak. The same person is worth more when positioned as AI-native than as a generalist, and it is the one framing where demand is expanding rather than contracting.",
  },
  {
    title: "Switching is the only raise, and almost nobody is switching",
    body: "Posted wage growth is 2.4% against 3.5% inflation, so staying put is a real pay cut. The frozen market means less competition for the people who do move deliberately, with proof in hand.",
  },
];

export const SOURCES = [
  {
    name: "Indeed Hiring Lab, US Labor Market Snapshot",
    url: "https://www.hiringlab.org/2026/07/23/us-labor-market-snapshot-june-2026/",
  },
  {
    name: "Indeed Hiring Lab, June 2026 jobs report: an unmoving tide",
    url: "https://www.hiringlab.org/2026/07/02/june-2026-jobs-report-an-unmoving-tide/",
  },
];

export const TIER_LABEL: Record<Tier, string> = {
  S: "Best board to play",
  A: "Strong, above baseline",
  B: "Playable",
  C: "Contested",
  D: "Hardest board",
};
