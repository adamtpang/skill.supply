/**
 * Find the decision maker for each shortlisted role.
 *
 * The expensive way to do this is a contact database. The cheap way is to read
 * the posting, because founder-written job posts routinely sign themselves:
 * "Hi I'm Devin", "reach out to team@", "email shvilesh@". Those are the seed
 * stage roles, which are also the fastest yes, so the free path covers exactly
 * the half of the list that matters most.
 *
 * Anything this cannot resolve is reported as unresolved rather than guessed. A
 * wrong name in a cold email is worse than no name.
 *
 * Input:  scripts/scored-roles.json
 * Output: scripts/contacts.json
 * Run:    node scripts/find-contacts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("./scored-roles.json", import.meta.url), "utf8"));

/**
 * Hand-verified people override anything parsed out of a page. The scraper
 * cannot tell a founder from a customer testimonial, so its output is a lead to
 * check, never an answer. This file is the answer.
 */
let verified = new Map();
try {
  const v = JSON.parse(readFileSync(new URL("./verified-people.json", import.meta.url), "utf8"));
  verified = new Map(v.people.map((p) => [p.company.toLowerCase(), p]));
} catch {
  /* optional */
}

/** Words that follow "with the" or "report to the" and are not anybody's name. */
const NOT_A_NAME = new Set([
  "the", "to", "with", "our", "a", "an", "and", "for", "without", "your", "their",
  "his", "her", "its", "as", "at", "by", "from", "name", "this", "that", "you",
  "we", "us", "i", "am", "is", "are", "be", "been", "hiring", "join", "work",
  "working", "report", "reporting", "directly", "team", "company", "startup",
]);

const looksLikeName = (s) =>
  typeof s === "string" && /^[A-Z][a-z]{1,}(\s[A-Z][a-z]+)?$/.test(s) && !NOT_A_NAME.has(s.toLowerCase());

/** Addresses that are real inboxes, not tracking pixels or vendor noise. */
function emailsIn(text) {
  const found = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [];
  return [
    ...new Set(
      found.filter((e) => !/example\.|sentry|\.png|\.jpg|\.gif|noreply|no-reply|wixpress|sentry\.io/i.test(e))
    ),
  ];
}

/**
 * How to address the opening line. A named founder gets "Hi Devin"; a shared
 * inbox gets no salutation at all, which reads better than "Hi there".
 */
function resolveContact(job) {
  const text = `${job.description ?? ""}`;
  const emails = emailsIn(text);

  // "Hi I'm Devin" / "I'm Ketan, Head of Engineering" is the strongest signal:
  // the person who wrote the post is the person who decides.
  // Note the apostrophe class: founders type in editors that curl the quote,
  // and matching only U+0027 silently missed them.
  const selfIntro = text.match(
    /\b(?:Hi,?\s*I['’]?m|Hello,?\s*I['’]?m|I['’]m|My name is|This is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/
  );
  const self = looksLikeName(selfIntro?.[1]) ? selfIntro[1] : null;

  // "Ketan, Head of Engineering" style.
  const titled = [...text.matchAll(/\b([A-Z][a-z]+)\s*,?\s+(?:the\s+)?(founder|co-?founder|CEO|CTO|Head of Engineering|VP of Engineering)\b/gi)]
    .map((m) => ({ name: m[1], title: m[2] }))
    .find((m) => looksLikeName(m.name));

  let name = self ?? titled?.name ?? null;
  let title = titled?.title ?? (self ? "writer of the posting" : null);

  // Prefer a personal address over a shared one when both appear.
  const personal = emails.find((e) => name && e.toLowerCase().startsWith(name.toLowerCase().split(" ")[0]));
  const email = personal ?? emails[0] ?? null;

  /**
   * A personal-looking address carries the name: "shvilesh@logen.io" means you
   * open with "Hi Shvilesh". Only do this for a single alphabetic local part, so
   * shared inboxes like team@, jobs@, or hiring+hn@ never become a salutation.
   */
  const SHARED = /^(team|jobs?|hiring|careers?|recruiting|hello|hi|info|contact|apply|hr|people|talent|admin|support|founders?)$/i;
  if (!name && email) {
    const local = email.split("@")[0];
    if (/^[a-zA-Z]{3,}$/.test(local) && !SHARED.test(local)) {
      name = local[0].toUpperCase() + local.slice(1).toLowerCase();
      title = "inferred from the email address";
    }
  }

  let confidence = "none";
  if (name && email) confidence = "high";
  else if (name || email) confidence = "medium";

  return {
    name,
    title,
    email,
    otherEmails: emails.filter((e) => e !== email),
    confidence,
    salutation: name ? `Hi ${name.split(" ")[0]},` : null,
    /** Where to send it when no address was published. */
    fallback: email ? null : `apply through the posting: ${job.url}`,
  };
}

const seen = new Set();
const contacts = [];
for (const role of data.roles) {
  const key = role.company.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  let contact = resolveContact(role);
  // A verified human beats anything the posting did or did not publish.
  const v = verified.get(key);
  if (v) {
    contact = {
      ...contact,
      name: v.name,
      title: v.title,
      email: v.email ?? contact.email,
      confidence: v.email ?? contact.email ? "high" : "name-only",
      salutation: `Hi ${v.name.split(" ")[0]},`,
      verifiedFrom: v.source,
      context: v.context,
      fallback: v.email ?? contact.email ? null : `no address published; address the application to ${v.name} and reach them on LinkedIn`,
    };
  }
  contacts.push({
    company: role.company,
    title: role.title,
    fit: role.fit100,
    url: role.url,
    visa: role.visa.status,
    daysLive: role.daysLive ?? null,
    contact,
  });
}

contacts.sort((a, b) => b.fit - a.fit);
writeFileSync(
  new URL("./contacts.json", import.meta.url),
  JSON.stringify({ generatedAt: data.generatedAt, count: contacts.length, contacts }, null, 2)
);

const named = contacts.filter((c) => c.contact.confidence !== "none");
console.log(`Resolved a contact for ${named.length} of ${contacts.length} companies, free.\n`);
for (const c of contacts.slice(0, 20)) {
  const k = c.contact;
  const who = k.name ? `${k.name}${k.title ? ` (${k.title})` : ""}` : "";
  const line = [who, k.email].filter(Boolean).join("  ") || "no published contact, apply via the form";
  console.log(`${String(c.fit).padStart(3)}  ${c.company.slice(0, 20).padEnd(22)}${k.confidence.padEnd(8)}${line}`);
}
console.log(`\nwrote scripts/contacts.json`);
