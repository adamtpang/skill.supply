# Shots data

One file per company. The page at `/shots` renders these files and does not fetch a board at request time.

## Add a company

1. Create `data/shots/<slug>.ts`.
2. Export a `CompanyShots` object (see `types.ts`).
3. Import it in `index.ts` and append it to `SHOTS`.
4. Keep every figure exactly as the source published it. If a source does not give a number, leave the field null and the page will show `unknown`. Do not average, interpolate, or copy a number from a different role, location, or source.

The next companies should come from Adam's Notion Job Tier List. After that, a Greenhouse or Ashby importer can write this same shape from the public board APIs. Do not add that fetch on the page.

## Company fields

- `name`, `slug`
- `board.type`: `greenhouse`, `ashby`, `lever`, or `other`
- `board.url`: the public careers board
- `observations`: sourced figures
- `openPostings`: optional counts of live postings on a snapshot
- `caveat`: optional, company-specific limit on how to read the figures

## Observation fields

Each observation is one sourced number.

- `metric`: `response_time_distribution`, `days_to_hire`, `posting_open_since`, or `pay`
- `role`: the role title, or `All roles` for a company-wide figure
- `location`: a string, or `null` when the source does not name one
- `n`: sample size, or `null` when it is missing or does not apply
- `sourceName`, `sourceUrl`, `retrieved` (`YYYY-MM-DD`)
- `note`: optional

Metric payloads:

- `response_time_distribution`: `reportedAs` is the source's own name (for example `interview process length`). `buckets` are `{ label, percent }` as published. Do not rescale shares that sum to something other than 100.
- `days_to_hire`: `days` is the published average. A company-wide figure uses `role: "All roles"` and is drawn as a reference line, not mixed into the role bars.
- `posting_open_since`: `firstPosted` (`YYYY-MM-DD`) and `postingUrl`. The page computes days open as whole UTC days from `firstPosted` to `retrieved`, and labels the bar `still open as of <retrieved>`. Store the first posted date, not a precomputed day count.
- `pay`: one published pay figure.
  - `kind`: `posted`, `estimate`, or `unknown`
  - `values`: `{ min, max, median, average, unit }` or `null`. `unit` is `hour` or `year`. Leave `average` null unless the source calls the number an average. Do not store a median you calculated, and do not convert an hourly figure into a yearly one.
  - `values: null` with `kind: "posted"` means the posting lists no pay. The page says `Posted: none listed`.
  - `level`: `L1`, `L2`, or `null`
  - `sameLocation`: `false` when the amount is for a different place than the role card. The page labels that `Other location: <place>`.
  - `verified`: `false` shows an Unverified badge. `sourceUrl` may be `null` when the page is gone.
  - `scope`: `role` for one role, or `company` for a company-level figure that must not be copied onto a posting.
  - A role with no `pay` observation renders `Pay: unknown`. Do not add a guessed amount to fill that gap.

`n` below 10 renders a Low confidence badge. Null `n` renders `n unknown` and does not get that badge.

## What an importer should write later

Greenhouse public board (`board.type: "greenhouse"`):

- Board URL: `https://boards.greenhouse.io/<token>`
- Jobs snapshot: `https://boards-api.greenhouse.io/v1/boards/<token>/jobs?content=true`
- One `posting_open_since` observation per job you keep: `role` from `title`, `location` from `location.name`, `postingUrl` from `absolute_url`, `sourceUrl` the API URL, `retrieved` the run date, `n` null.
- `firstPosted` is the calendar date of the field the payload actually uses for first posted (often `first_published`). If that field is absent, skip the observation. Do not substitute `updated_at`.
- `openPostings`: one row per location you count, plus one row with `location: null` for the board total. Same `sourceUrl` and `retrieved` as the snapshot.

Ashby public board (`board.type: "ashby"`):

- Jobs snapshot: `https://api.ashbyhq.com/posting-api/job-board/<slug>`
- `firstPosted` from `publishedAt`, `postingUrl` from `jobUrl` (or `applyUrl` if that is all the payload has), `location` from the location string. Same skip rule: no first posted date, no observation.

Interview and days-to-hire figures stay hand entered. Those APIs do not publish them.
