/**
 * Write the shortlist to jobs.md, preserving any status you have already set.
 *
 * The tracker is the file you actually work from, so a rerun must never wipe
 * your notes. Existing rows are matched by company and role, and their status,
 * date, and notes columns are carried across.
 *
 * Run: node scripts/build-tracker.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const TRACKER = new URL("../jobs.md", import.meta.url);
const data = JSON.parse(readFileSync(new URL("./scored-roles.json", import.meta.url), "utf8"));

/**
 * Decision-maker contacts, when find-contacts.mjs has been run. Optional so the
 * tracker still builds on a clean checkout.
 */
let contactByCompany = new Map();
try {
  const c = JSON.parse(readFileSync(new URL("./contacts.json", import.meta.url), "utf8"));
  contactByCompany = new Map(c.contacts.map((x) => [x.company.toLowerCase(), x.contact]));
} catch {
  /* not generated yet */
}

/**
 * Trust distance, the PayPal-mafia variable. A warm edge multiplies both the
 * ordering here and the expected reply rate in the funnel model, because a
 * known name skips the coldest stages of their filter.
 */
let warmthOf = new Map();
try {
  const w = JSON.parse(readFileSync(new URL("./warmth.json", import.meta.url), "utf8"));
  warmthOf = new Map(Object.entries(w.companies).map(([k, v]) => [k.toLowerCase(), v.level ?? v]));
} catch {
  /* optional */
}
const WARMTH_LABEL = { 2: "known", 1: "mutual", 0: "" };

/** Read back what the previous tracker knew, so a rerun does not erase it. */
function existingRows() {
  if (!existsSync(TRACKER)) return new Map();
  const rows = new Map();
  for (const line of readFileSync(TRACKER, "utf8").split("\n")) {
    if (!line.startsWith("|") || line.includes("---")) continue;
    const cells = line.split("|").map((c) => c.trim());
    // | # | status | company | role | fit | warmth | visa | open | send to | sent | notes |
    if (cells.length < 11) continue;
    const company = cells[3].replace(/\[|\]\(.*\)/g, "");
    const role = cells[4];
    if (!company || company === "company") continue;
    rows.set(`${company.toLowerCase()}|${role.toLowerCase()}`, {
      status: cells[2],
      sent: cells[10] ?? "",
      notes: cells[11] ?? "",
    });
  }
  return rows;
}

const prior = existingRows();
const esc = (s) => String(s ?? "").replace(/\|/g, "/").replace(/\n/g, " ").trim();

const VISA_LABEL = {
  "remote-anywhere": "anywhere",
  "confirm-before-applying": "ask first",
  "sponsorship-offered": "relocation",
  "work-authorization-required": "needs visa",
};

/**
 * Order by fit x trust, not fit alone. A warm mid-fit company beats a cold
 * high-fit one, which is the entire lesson of how the best teams hire.
 */
const withPriority = data.roles.map((r) => {
  const warmth = Number(warmthOf.get(r.company.toLowerCase()) ?? 0);
  return { ...r, warmth, priority: r.fit100 * (1 + warmth * 0.75) };
});
withPriority.sort((a, b) => b.priority - a.priority);
const roles = withPriority.slice(0, 80);
const carried = [];

const rows = roles.map((r, i) => {
  const key = `${r.company.toLowerCase()}|${r.title.toLowerCase()}`;
  const was = prior.get(key);
  if (was && was.status !== "not sent") carried.push(`${r.company}: ${was.status}`);
  const k = contactByCompany.get(r.company.toLowerCase());
  // Three states, not two: a verified name with no published address still lets
  // you address the application to a person, which is worth far more than "Hi there".
  const who = k?.email
    ? k.name
      ? `${esc(k.name)} \`${k.email}\``
      : `\`${k.email}\``
    : k?.name
      ? `${esc(k.name)} (no address)`
      : "via form";
  const age = r.daysLive != null ? `${r.daysLive}d` : "";
  return (
    `| ${i + 1} | ${was?.status ?? "not sent"} | [${esc(r.company)}](${r.url}) | ${esc(r.title)} | ` +
    `${r.fit100} | ${WARMTH_LABEL[r.warmth] ?? ""} | ${VISA_LABEL[r.visa.status]} | ${age} | ${who} | ${was?.sent ?? ""} | ${was?.notes ?? esc(r.salary ?? "")} |`
  );
});

const anywhere = roles.filter((r) => r.visa.status === "remote-anywhere");
const ask = roles.filter((r) => r.visa.status === "confirm-before-applying");

const md = `# Job tracker

Generated ${data.generatedAt.slice(0, 10)} from ${data.count} live postings that survived the
UTC+8 filter. Nothing here has been submitted. Every row links to the real posting.

Rerun with \`node scripts/build-tracker.mjs\` after a fresh hunt. Your status, sent
date, and notes are preserved across reruns.

**Status values:** not sent, drafted, sent, replied, interviewing, offer, rejected, closed

## Shortlist

| # | status | company | role | fit | warmth | visa | open | send to | sent | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

## Visa reality check

- **${anywhere.length} roles hire from anywhere.** No visa, no sponsorship. You invoice as a
  Malaysian contractor or go through an employer of record. Apply to these first.
- **${ask.length} roles do not say.** Open with one line asking whether they can engage a
  contractor outside their own country. If the answer is no, you lost a sentence, not a week.
- Roles needing local work authorization were filtered out before this list. They are
  not a remote job with extra steps, they are a relocation.

## What each column means

- **fit** is 0 to 100, weighted for speed to a first paycheck rather than prestige:
  40 percent evidence you can prove you have done the work, 35 percent how fast the
  employer is likely to decide, 25 percent timezone overlap. Roles that cannot hire
  from Malaysia are multiplied down, not averaged down, so they sink rather than hide.
- **visa** is read from the posting's own stated location and timezone, not inferred
  from the word "remote".
- **open** is how many days the role has been live. Past about three weeks the
  employer's pipeline is not working, which means less competition and more
  flexibility on the requirement list. Ignore it for Lemon.io and Proxify, whose
  listings are permanent by design.
- **send to** is the decision maker where the posting published one. "via form"
  means no contact was published, so do not guess at an address.
- **warmth** is trust distance, set by hand in scripts/warmth.json: "known"
  means someone there knows you by name, "mutual" means a real shared context
  exists, blank means cold. Rows are ordered by fit x warmth, because a warm
  edge skips the coldest stages of their filter. Warm an edge (a merged PR, an
  NS intro), update the file, rerun.

## Pipeline

| stage | count |
| --- | --- |
| not sent | ${rows.filter((r) => r.includes("| not sent |")).length} |
| in flight | ${carried.length} |
`;

writeFileSync(TRACKER, md);

console.log(`Wrote jobs.md with ${rows.length} roles.`);
console.log(`  ${anywhere.length} hire from anywhere, ${ask.length} need a one-line check.`);
if (carried.length) console.log(`  carried forward: ${carried.join(", ")}`);
else console.log(`  no prior statuses to carry forward.`);
