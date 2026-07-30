export type OfficialCareer = {
  name: string;
  aliases: string[];
  url: string;
};

// Verified official career destinations for large employers whose proprietary
// or Workday-backed boards cannot be normalized through the public ATS APIs.
export const OFFICIAL_CAREERS: OfficialCareer[] = [
  {
    name: "NVIDIA",
    aliases: ["nvidia", "nvda"],
    url: "https://www.nvidia.com/en-us/about-nvidia/careers/",
  },
  {
    name: "Apple",
    aliases: ["apple", "aapl"],
    url: "https://jobs.apple.com/en-us/search",
  },
  {
    name: "Google",
    aliases: ["google", "alphabet", "goog", "googl"],
    url: "https://www.google.com/about/careers/applications/jobs/results/",
  },
  {
    name: "Microsoft",
    aliases: ["microsoft", "msft"],
    url: "https://jobs.careers.microsoft.com/global/en/search",
  },
  {
    name: "Amazon",
    aliases: ["amazon", "amzn"],
    url: "https://www.amazon.jobs/en/search",
  },
  {
    name: "Tesla",
    aliases: ["tesla", "tsla"],
    url: "https://www.tesla.com/careers/search/",
  },
  {
    name: "Netflix",
    aliases: ["netflix", "nflx"],
    url: "https://www.jobs.netflix.com/",
  },
  {
    name: "Oracle",
    aliases: ["oracle", "orcl"],
    url: "https://careers.oracle.com/en/sites/jobsearch/jobs",
  },
  {
    name: "JPMorgan Chase",
    aliases: ["jpmorgan", "jp morgan", "jpmorgan chase", "chase", "jpm"],
    url: "https://careers.jpmorgan.com/us/en/search-results",
  },
  {
    name: "Walmart",
    aliases: ["walmart", "wmt"],
    url: "https://careers.walmart.com/",
  },
];

export function findOfficialCareer(input: string): OfficialCareer | null {
  const query = normalize(input);
  if (!query) return null;
  return (
    OFFICIAL_CAREERS.find((career) =>
      career.aliases.some((alias) => normalize(alias) === query)
    ) ?? null
  );
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}
