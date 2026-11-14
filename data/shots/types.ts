// Contract for sourced hiring evidence on /shots.
// An importer (Greenhouse, Ashby, or a hand entry from the Job Tier List)
// should write this shape and nothing derived: no averages, no filled gaps.

export const BOARD_TYPES = ["greenhouse", "ashby", "lever", "other"] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

export const METRICS = [
  "response_time_distribution",
  "days_to_hire",
  "posting_open_since",
] as const;
export type Metric = (typeof METRICS)[number];

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

export type Observation =
  | ResponseTimeObservation
  | DaysToHireObservation
  | PostingOpenObservation;

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
