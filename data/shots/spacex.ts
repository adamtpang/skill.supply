import type { CompanyShots } from "./types";

const RETRIEVED = "2026-11-14";

const GLASSDOOR_TEST_TECHNICIAN =
  "https://www.glassdoor.com/Interview/SpaceX-Test-Technician-Interview-Questions-EI_IE40371.0,6_KO7,22.htm";

const GREENHOUSE_JOBS =
  "https://boards-api.greenhouse.io/v1/boards/spacex/jobs?content=true";

export const spacex: CompanyShots = {
  name: "SpaceX",
  slug: "spacex",
  board: {
    type: "greenhouse",
    url: "https://boards.greenhouse.io/spacex",
  },
  caveat:
    "These samples are self-reported and mostly not location-specific. Long-open postings at SpaceX are rolling requisitions, not one seat.",
  observations: [
    {
      id: "spacex-indeed-production-associate-interview-length",
      metric: "response_time_distribution",
      reportedAs: "interview process length",
      role: "Production Associate",
      location: "All sites",
      n: 23,
      sourceName: "Indeed",
      sourceUrl:
        "https://www.indeed.com/cmp/Spacex/interviews?fjobtitle=Production+Associate",
      retrieved: RETRIEVED,
      note: "Indeed reports interview process length. This is not a response rate.",
      buckets: [
        { label: "a day or two", percent: 39 },
        { label: "about a week", percent: 43 },
        { label: "about two weeks", percent: 13 },
        { label: "about a month", percent: 4 },
      ],
    },
    {
      id: "spacex-glassdoor-test-technician-days-to-hire",
      metric: "days_to_hire",
      role: "Test Technician",
      location: null,
      days: 8,
      n: 5,
      sourceName: "Glassdoor",
      sourceUrl: GLASSDOOR_TEST_TECHNICIAN,
      retrieved: RETRIEVED,
    },
    {
      id: "spacex-glassdoor-avionics-technician-days-to-hire",
      metric: "days_to_hire",
      role: "Avionics Technician",
      location: null,
      days: 5,
      n: 5,
      sourceName: "Glassdoor",
      sourceUrl:
        "https://www.glassdoor.com/Interview/SpaceX-Avionics-Technician-Interview-Questions-EI_IE40371.0,6_KO7,26.htm",
      retrieved: RETRIEVED,
    },
    {
      id: "spacex-glassdoor-launch-technician-days-to-hire",
      metric: "days_to_hire",
      role: "Launch Technician",
      location: null,
      days: 65,
      n: 4,
      sourceName: "Glassdoor",
      sourceUrl:
        "https://www.glassdoor.com/Interview/SpaceX-Launch-Technician-Interview-Questions-EI_IE40371.0,6_KO7,24.htm",
      retrieved: RETRIEVED,
    },
    {
      id: "spacex-glassdoor-propulsion-technician-days-to-hire",
      metric: "days_to_hire",
      role: "Propulsion Technician",
      location: null,
      days: 74,
      n: 5,
      sourceName: "Glassdoor",
      sourceUrl:
        "https://www.glassdoor.com/Interview/SpaceX-Propulsion-Technician-Interview-Questions-EI_IE40371.0,6_KO7,28.htm",
      retrieved: RETRIEVED,
    },
    {
      id: "spacex-glassdoor-software-engineer-days-to-hire",
      metric: "days_to_hire",
      role: "Software Engineer",
      location: null,
      days: 23,
      n: 159,
      sourceName: "Glassdoor",
      sourceUrl:
        "https://www.glassdoor.com/Interview/SpaceX-Software-Engineer-Interview-Questions-EI_IE40371.0,6_KO7,24.htm",
      retrieved: RETRIEVED,
    },
    {
      id: "spacex-glassdoor-all-roles-days-to-hire",
      metric: "days_to_hire",
      role: "All roles",
      location: null,
      days: 28,
      n: null,
      sourceName: "Glassdoor",
      sourceUrl: GLASSDOOR_TEST_TECHNICIAN,
      retrieved: RETRIEVED,
      note: "Company-wide average, published on the Test Technician interview page. Glassdoor does not give a sample size for it.",
    },
    {
      id: "spacex-gh-starlink-production-associate-open",
      metric: "posting_open_since",
      role: "Starlink Production Associate",
      location: "Bastrop, TX",
      firstPosted: "2026-08-11",
      postingUrl: "https://boards.greenhouse.io/spacex/jobs/8697970002?gh_jid=8697970002",
      n: null,
      sourceName: "SpaceX Greenhouse API",
      sourceUrl: GREENHOUSE_JOBS,
      retrieved: RETRIEVED,
    },
    {
      id: "spacex-gh-production-technician-starlink-open",
      metric: "posting_open_since",
      role: "Production Technician (Starlink)",
      location: "Bastrop, TX",
      firstPosted: "2026-08-07",
      postingUrl: "https://boards.greenhouse.io/spacex/jobs/8692396002?gh_jid=8692396002",
      n: null,
      sourceName: "SpaceX Greenhouse API",
      sourceUrl: GREENHOUSE_JOBS,
      retrieved: RETRIEVED,
    },
  ],
  openPostings: [
    {
      id: "spacex-gh-open-bastrop",
      location: "Bastrop, TX",
      count: 516,
      sourceName: "SpaceX Greenhouse API",
      sourceUrl: GREENHOUSE_JOBS,
      retrieved: RETRIEVED,
      note: "Live postings at this location on the retrieval date. Not a sample of applicants.",
    },
    {
      id: "spacex-gh-open-company",
      location: null,
      count: 2758,
      sourceName: "SpaceX Greenhouse API",
      sourceUrl: GREENHOUSE_JOBS,
      retrieved: RETRIEVED,
      note: "Live postings on the whole SpaceX board on the retrieval date. Not a sample of applicants.",
    },
  ],
};
