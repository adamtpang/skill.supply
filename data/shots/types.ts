// Contract for sourced hiring evidence on /shots.
// An importer (Greenhouse, Ashby, or a hand entry from the Job Tier List)
// should write this shape and nothing derived: no averages, no filled gaps.

export const BOARD_TYPES = ["greenhouse", "ashby", "lever", "other"] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

export const METRICS = [
  "response_time_distribution",
  "days_to_hire",
  "posting_open_since",
  "pay",
] as const;
export type Metric = (typeof METRICS)[number];

export const PAY_KINDS = ["posted", "estimate", "unknown"] as const;
export type PayKind = (typeof PAY_KINDS)[number];

export const PAY_UNITS = ["hour", "year"] as const;
export type PayUnit = (typeof PAY_UNITS)[number];

/**
 * Amounts as published. One unit per figure. Do not convert hour to year,
 * and do not fill median from min and max or from an average.
 */
export type PayValues = {
  min: number | null;
  max: number | null;
  median: number | null;
  /** Set only when the source publishes an average. Never a stand-in for median. */
  average: number | null;
  unit: PayUnit;
};

/** One published share. Do not renormalize these to 100. */
export type DistributionBucket = {
  label: string;
  percent: number;
};

type Sourced = {
  id: string;
  /** Role title, or "All roles" for a company-wide figure. */
  role: string;
  /** Null when the source does not name a location. */
  location: string | null;
  /** Null when sample size is missing, or when a sample does not apply. */
  n: number | null;
  sourceName: string;
  sourceUrl: string;
  /** Calendar date the figure was retrieved, YYYY-MM-DD. */
  retrieved: string;
  note?: string;
};

export type ResponseTimeObservation = Sourced & {
  metric: "response_time_distribution";
  /** Render this label. It is the source's name for the distribution. */
  reportedAs: string;
  buckets: DistributionBucket[];
};

export type DaysToHireObservation = Sourced & {
  metric: "days_to_hire";
  days: number;
};

export type PostingOpenObservation = Sourced & {
  metric: "posting_open_since";
  /** First posted date from the source, YYYY-MM-DD. Days open are computed at render. */
  firstPosted: string;
  /** Public posting. sourceUrl is where the first posted date was read. */
  postingUrl: string;
};

export type PayObservation = {
  id: string;
  metric: "pay";
  /** Role this card belongs to. A company-level figure uses the source's title, not a posting title. */
  role: string;
  kind: PayKind;
  /** Null when the source gives no amount, including a posting that lists no pay. */
  values: PayValues | null;
  /** L1, L2, or null when the source names no level. */
  level: string | null;
  location: string | null;
  /**
   * False when the amount is for a different place than the role card.
   * The page then labels it "Other location: <place>".
   */
  sameLocation: boolean;
  /** False renders an Unverified badge. */
  verified: boolean;
  /** role: this posting or role. company: do not treat it as one posting's pay. */
  scope: "role" | "company";
  sourceName: string;
  /** Null when the source page is gone. */
  sourceUrl: string | null;
  retrieved: string;
  n: number | null;
  note?: string;
};

export type Observation =
  | ResponseTimeObservation
  | DaysToHireObservation
  | PostingOpenObservation
  | PayObservation;

/** A count of live postings on a board snapshot. Not a sample of applicants. */
export type OpenPostingsCount = {
  id: string;
  /** Null means the whole board. */
  location: string | null;
  count: number;
  sourceName: string;
  sourceUrl: string;
  retrieved: string;
  note?: string;
};

export type CompanyShots = {
  name: string;
  slug: string;
  board: {
    type: BoardType;
    url: string;
  };
  observations: Observation[];
  openPostings: OpenPostingsCount[];
  /** Company-specific limit on how to read the figures. Optional. */
  caveat?: string;
};
