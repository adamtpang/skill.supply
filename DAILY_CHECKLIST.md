# Daily Checklist: 2026-08-12

## Backlog, click send on these

Can't report this. `jobs.md` does not exist in this environment. It is gitignored on purpose (`/jobs.md` in `.gitignore`, personal names and emails) and this scheduled run works from a fresh clone of the repo with no local state, so the file that would normally hold your real backlog was never here to read.

Same problem one layer down: `scripts/build-tracker.mjs` (which writes `jobs.md`) reads from `scripts/contacts.json`, `scripts/people.json`, `scripts/scored-roles.json`, `scripts/verified-people.json` and `scripts/warmth.json`. All five are also gitignored. None of them exist in this container either, so the tracker can't even be rebuilt here.

## Today's real funnel

Can't report this. `node scripts/diagnose-funnel.mjs` failed:

```
No jobs.md yet. Run: node scripts/build-tracker.mjs
```

It depends on the same missing `jobs.md`.

## Today's cadence

3 to 5 new personalized sends, source named/real-contact rows in jobs.md still not sent first, then the Anti Job Board drops.

## Note on why this is empty

This checklist runs as a scheduled cloud task, which starts from a clean git clone every time. Your job-search tracker and contact data are intentionally kept out of git (commit df20d30, "Stop tracking personal job-search data before going public") since they contain real names and emails. That means this automation structurally cannot see your real backlog or funnel numbers unless that data is made available to the container some other way, for example a private synced location this task can read, or running the checklist step locally instead of in the cloud. Until that's fixed, this file will report the same gap every day. Nothing above is fabricated.
