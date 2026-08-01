/**
 * Find a named human at companies whose posting published no contact.
 *
 * Reply rate roughly septuples when an email is addressed to a person instead of
 * a form, so this script is worth more than any other in the pipeline. It reads
 * public about and team pages, which is where companies deliberately publish
 * this, and stops there.
 *
 * It does NOT guess email addresses. A bounced or wrong-person email is worse
 * than using the form, so unresolved companies stay unresolved.
 *
 * Input:  scripts/contacts.json, scripts/scored-roles.json
 * Output: scripts/people.json
 * Run:    node scripts/find-people.mjs [--limit 25]
 */
import { readFileSync, writeFileSync } from "node:fs";

const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i > -1 ? Number(process.argv[i + 1]) : 25;
})();

const contacts = JSON.parse(readFileSync(new URL("./contacts.json", import.meta.url), "utf8"));
const scored = JSON.parse(readFileSync(new URL("./scored-roles.json", import.meta.url), "utf8"));
const roleByCompany = new Map();
for (const r of scored.roles) {
  if (!roleByCompany.has(r.company.toLowerCase())) roleByCompany.set(r.company.toLowerCase(), r);
}

const NOT_THEIRS =
  /(weworkremotely|remotive|arbeitnow|himalayas|jobicy|remoteok|ycombinator|join\.com|dover\.com|zurl\.to|lever\.co|greenhouse|ashbyhq\.com\/|workable|bamboohr|zohorecruit|welcomekit|uctalent|linkedin|twitter|x\.com|notion\.site)/i;

/** Domains the posting did not carry, filled in by hand from the job text. */
const KNOWN = {
  "lemon.io": "lemon.io",
  zeitlabs: "zeitlabs.com",
  orbit: null, // German logistics OS, domain never stated in the posting
  samsara: "samsara.com",
  acme: null, // too generic to resolve safely
  dashdoc: "dashdoc.com",
  "proxify ab": "proxify.io",
  colonist: "colonist.io",
  clipster: null,
};

function resolveDomain(company, role, contactEmail) {
  const known = KNOWN[company.toLowerCase()];
  if (known !== undefined) return known;
  const candidates = [];
  try {
    const h = new URL(role.url).hostname.replace(/^www\./, "");
    if (!NOT_THEIRS.test(h)) candidates.push(h);
  } catch {}
  if (contactEmail) {
    const h = contactEmail.split("@")[1]?.toLowerCase();
    if (h && !NOT_THEIRS.test(h) && !candidates.includes(h)) candidates.push(h);
  }
  for (const m of String(role.description ?? "").matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
    const h = m[1].replace(/^www\./, "").toLowerCase();
    if (!NOT_THEIRS.test(h) && !candidates.includes(h)) candidates.push(h);
  }
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    candidates.sort(
      (a, b) =>
        (a.replace(/[^a-z0-9]/g, "").includes(slug.slice(0, 6)) ? -1 : 0) -
        (b.replace(/[^a-z0-9]/g, "").includes(slug.slice(0, 6)) ? -1 : 0)
    )[0] ?? null
  );
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

async function get(url) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Titles that mean this person can decide to hire an engineer. */
const DECIDER =
  /(co-?founder|founder|chief executive|ceo|chief technology|cto|chief product|cpo|vp of engineering|vp engineering|head of engineering|engineering manager|director of engineering|head of product|head of talent|head of people|technical lead|lead engineer)/i;

const NOT_NAME = new Set([
  "The", "Our", "Your", "Their", "This", "That", "And", "For", "With", "About",
  "Team", "Company", "Careers", "Contact", "Home", "Blog", "Pricing", "Login",
  "Chief", "Head", "Senior", "Lead", "Vice", "Get", "Read", "Learn", "See",
  "New", "All", "More", "Meet", "Join", "Why", "How", "What", "Who", "We",
]);

const plausibleName = (s) =>
  /^[A-Z][a-z'’-]{1,15}(?:\s+[A-Z][a-z'’.-]{1,20}){1,2}$/.test(s) &&
  !s.split(/\s+/).some((w) => NOT_NAME.has(w));

/**
 * A B2B homepage is mostly other people's names. Customer quotes carry a name
 * and a real title, which is exactly what this extractor looks for, so without
 * this filter a marketing testimonial becomes "the founder". That is how
 * Vidalytics came back as Frank Kern.
 */
function stripTestimonials(html) {
  return html
    .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, " ")
    .replace(/<figure[\s\S]*?<\/figure>/gi, " ")
    .replace(
      /<(section|div|ul)[^>]*(?:testimonial|review|quote|customer|logos?|press|case-stud|social-proof)[^>]*>[\s\S]{0,6000}?<\/\1>/gi,
      " "
    );
}

/**
 * If the person's title names a company, it has to be THIS company. "Founder
 * CEO, Frank Kern Inc" on vidalytics.com is a customer, not staff.
 */
function titleNamesAnotherCompany(title, company, domain) {
  if (!title) return false;
  const org = title.match(
    /\b(?:at|@|,|\|)\s*([A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3}(?:\s+(?:Inc|LLC|Ltd|Limited|Group|Corp|Initiative|Partners|Agency|Solutions|Media|Labs?))?)\s*$/
  )?.[1];
  if (!org) return false;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(company);
  const host = norm((domain ?? "").split(".")[0]);
  const seen = norm(org);
  return !(seen.includes(target.slice(0, 5)) || target.includes(seen.slice(0, 5)) ||
           seen.includes(host.slice(0, 5)) || host.includes(seen.slice(0, 5)));
}

/** Pull people out of a page, however it is marked up. */
function extractPeople(rawHtml, company, domain) {
  const html = stripTestimonials(rawHtml);
  const found = new Map();
  const add = (name, title, how) => {
    if (!plausibleName(name)) return;
    if (titleNamesAnotherCompany(title, company, domain)) return;
    const key = name.toLowerCase();
    if (!found.has(key) || (title && !found.get(key).title)) {
      found.set(key, { name, title: title?.replace(/\s+/g, " ").trim().slice(0, 60) ?? null, how });
    }
  };

  // 1. JSON-LD Person entries: the most reliable when present.
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (node) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) return node.forEach(walk);
        if (node["@type"] === "Person" && node.name) add(node.name, node.jobTitle, "schema.org");
        for (const v of Object.values(node)) walk(v);
      };
      walk(JSON.parse(m[1]));
    } catch {}
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  // 2. Adjacent tags: <h3>Name</h3><p>CTO</p>, the standard team-card shape.
  for (const m of text.matchAll(
    /<(h[1-6]|strong|b|div|span|p)[^>]*>\s*([A-Z][^<>{}]{2,40}?)\s*<\/\1>\s*(?:<[^>]+>\s*){0,3}([^<>{}]{2,60}?)\s*</gi
  )) {
    if (DECIDER.test(m[3])) add(m[2].trim(), m[3].trim(), "team card");
  }

  // 3. Flat text: "Jane Doe, Co-Founder and CTO" or "Jane Doe - Head of Engineering".
  const flat = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  for (const m of flat.matchAll(
    /([A-Z][a-z'’-]{1,15}(?:\s+[A-Z][a-z'’.-]{1,20}){1,2})\s*[,\-–—|(]\s*((?:co-?founder|founder|chief [a-z]+ officer|ceo|cto|cpo|vp of engineering|head of [a-z]+|engineering manager|lead engineer)[^.,|)]{0,30})/gi
  )) {
    add(m[1].trim(), m[2].trim(), "inline text");
  }
  // 4. Reversed: "CTO Jane Doe" / "Founder & CEO, Jane Doe".
  for (const m of flat.matchAll(
    /((?:co-?founder|founder|ceo|cto|head of engineering)[^.,|)]{0,20})[,:\s]+([A-Z][a-z'’-]{1,15}(?:\s+[A-Z][a-z'’.-]{1,20}){1,2})/gi
  )) {
    add(m[2].trim(), m[1].trim(), "inline text");
  }

  return [...found.values()];
}

const PATHS = ["", "/about", "/about-us", "/team", "/our-team", "/company", "/people", "/leadership", "/who-we-are"];

async function findAt(domain, company) {
  const all = new Map();
  const pagesRead = [];
  for (const p of PATHS) {
    const html = await get(`https://${domain}${p}`);
    if (!html) continue;
    pagesRead.push(p || "/");
    for (const person of extractPeople(html, company, domain)) {
      const key = person.name.toLowerCase();
      if (!all.has(key) || (person.title && !all.get(key).title)) all.set(key, { ...person, page: p || "/" });
    }
    // A page that already yielded a decider is enough; stop burning requests.
    // Only stop early on a dedicated team page. The homepage is the noisiest
    // surface, so a hit there is worth confirming against /about or /team.
    if (p && [...all.values()].some((x) => x.title && DECIDER.test(x.title))) break;
  }
  return { people: [...all.values()], pagesRead };
}

/* --------------------------------- run ----------------------------------- */

const viaForm = contacts.contacts.filter((c) => !c.contact.email).slice(0, LIMIT);
console.log(`Looking for a named human at ${viaForm.length} companies…\n`);

const out = [];
for (const c of viaForm) {
  const role = roleByCompany.get(c.company.toLowerCase());
  const domain = role ? resolveDomain(c.company, role, null) : null;
  if (!domain) {
    console.log(`  ${String(c.fit).padStart(3)}  ${c.company.slice(0, 20).padEnd(22)}no domain resolved`);
    out.push({ company: c.company, fit: c.fit, domain: null, people: [] });
    continue;
  }
  const { people, pagesRead } = await findAt(domain, c.company);
  const deciders = people.filter((p) => p.title && DECIDER.test(p.title));
  const best = deciders[0] ?? null;
  out.push({ company: c.company, fit: c.fit, domain, people: deciders.length ? deciders : people, pagesRead });
  console.log(
    `  ${String(c.fit).padStart(3)}  ${c.company.slice(0, 20).padEnd(22)}${domain.padEnd(24)}` +
      (best ? `${best.name} — ${best.title}` : people.length ? `${people.length} names, no clear decider` : "nothing published")
  );
}

writeFileSync(
  new URL("./people.json", import.meta.url),
  JSON.stringify({ generatedAt: new Date().toISOString(), companies: out }, null, 2)
);

const hit = out.filter((o) => o.people.some((p) => p.title && DECIDER.test(p.title)));
console.log(`\nFound a decision maker at ${hit.length} of ${viaForm.length}.`);
console.log(`No email addresses were guessed. wrote scripts/people.json`);
