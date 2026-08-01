/**
 * Build a research dossier for every shortlisted company.
 *
 * The point is the 25 minute rule: you cannot afford deep manual research on
 * every target, so the machine does the part that is mechanical (what they
 * build, what they run it on, whether they are spending money) and leaves you
 * the part that is not (the hook, the judgement call).
 *
 * The tech-stack detection is the highest-value piece. A job post will call
 * Elixir a "bonus" while the entire product runs on Phoenix LiveView, and only
 * the page source tells you that.
 *
 * Input:  scripts/contacts.json, scripts/scored-roles.json
 * Output: company/<slug>.md, one per company
 * Run:    node scripts/company-brief.mjs [--limit 12]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i > -1 ? Number(process.argv[i + 1]) : 12;
})();

const contacts = JSON.parse(readFileSync(new URL("./contacts.json", import.meta.url), "utf8"));
const scored = JSON.parse(readFileSync(new URL("./scored-roles.json", import.meta.url), "utf8"));
const roleByCompany = new Map();
for (const r of scored.roles) {
  if (!roleByCompany.has(r.company.toLowerCase())) roleByCompany.set(r.company.toLowerCase(), r);
}

const OUT = new URL("../company/", import.meta.url);
mkdirSync(OUT, { recursive: true });

/** Job boards and link shorteners are never the employer's own site. */
const NOT_THEIRS =
  /(weworkremotely|remotive|arbeitnow|himalayas|jobicy|remoteok|ycombinator|join\.com|dover\.com|zurl\.to|lever\.co|greenhouse|ashbyhq\.com\/|workable|bamboohr|zohorecruit|welcomekit|uctalent|linkedin|twitter|x\.com|github\.com)/i;

/**
 * Find the employer's real domain. The posting usually names it, either in the
 * apply link or as a "URL:" line that the boards inject.
 */
function resolveDomain(company, role, contactEmail) {
  const candidates = [];
  try {
    const h = new URL(role.url).hostname.replace(/^www\./, "");
    if (!NOT_THEIRS.test(h)) candidates.push(h);
  } catch {}
  // "team@sequentech.io" names the company even when no URL appears anywhere.
  if (contactEmail) {
    const h = contactEmail.split("@")[1]?.toLowerCase();
    if (h && !NOT_THEIRS.test(h) && !candidates.includes(h)) candidates.push(h);
  }
  for (const m of String(role.description ?? "").matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
    const h = m[1].replace(/^www\./, "").toLowerCase();
    if (!NOT_THEIRS.test(h) && !candidates.includes(h)) candidates.push(h);
  }
  // A domain echoing the company name is the safest of the candidates.
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return candidates.sort((a, b) => {
    const an = a.replace(/[^a-z0-9]/g, "").includes(slug.slice(0, 6)) ? -1 : 0;
    const bn = b.replace(/[^a-z0-9]/g, "").includes(slug.slice(0, 6)) ? -1 : 0;
    return an - bn;
  })[0] ?? null;
}

/**
 * What the product actually runs on. A job description states aspirations; the
 * page source states facts.
 */
const STACK = [
  [/phx-|data-phx-|phoenix|liveview/i, "Phoenix LiveView (Elixir)"],
  [/__NEXT_DATA__|\/_next\/static/i, "Next.js (React)"],
  [/__NUXT__|\/_nuxt\//i, "Nuxt (Vue)"],
  [/csrf-param|rails-ujs|turbolinks|\/assets\/application-[a-f0-9]{8}/i, "Ruby on Rails"],
  [/csrfmiddlewaretoken|django/i, "Django (Python)"],
  [/laravel_session|livewire/i, "Laravel (PHP)"],
  [/wp-content|wp-includes/i, "WordPress"],
  [/data-svelte|\/_app\/immutable/i, "SvelteKit"],
  [/ng-version|angular/i, "Angular"],
  [/webflow/i, "Webflow"],
  [/cdn\.shopify|shopify/i, "Shopify"],
  [/framer\.com|framerusercontent/i, "Framer"],
];

/** Money and intent signals: who is paying to be found. */
const SIGNALS = [
  [/googleadservices|doubleclick|gtag\/js\?id=AW-/i, "running Google Ads, so there is an acquisition budget"],
  [/analytics\.ahrefs\.com/i, "paying for Ahrefs, so SEO is a deliberate channel"],
  [/hs-scripts\.com|hubspot/i, "HubSpot, so there is a sales motion"],
  [/intercom|crisp\.chat|drift\.com/i, "live chat support on the site"],
  [/segment\.com|analytics\.js/i, "Segment, so the data stack is deliberate"],
  [/posthog/i, "PostHog product analytics"],
  [/js\.stripe\.com|checkout\.stripe/i, "Stripe checkout, so they take money directly"],
  [/cloudflareinsights|cdn-cgi/i, "behind Cloudflare"],
  [/vercel|now\.sh/i, "deployed on Vercel"],
];

async function probe(domain) {
  const url = `https://${domain}`;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    const head = `${html}\n${[...res.headers].map(([k, v]) => `${k}: ${v}`).join("\n")}`;

    const pick = (re) => html.match(re)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
    return {
      ok: res.ok,
      status: res.status,
      title: pick(/<title[^>]*>([^<]+)<\/title>/i),
      description:
        pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) ??
        pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i),
      stack: STACK.filter(([re]) => re.test(head)).map(([, name]) => name),
      signals: SIGNALS.filter(([re]) => re.test(head)).map(([, name]) => name),
      // A careers or about path existing at all tells you how they think about hiring.
      paths: ["about", "team", "careers", "jobs", "blog", "pricing", "docs"].filter((p) =>
        new RegExp(`href=["'][^"']*/${p}\\b`, "i").test(html)
      ),
    };
  } catch (err) {
    return { ok: false, status: 0, error: err.message, stack: [], signals: [], paths: [] };
  }
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const targets = contacts.contacts.slice(0, LIMIT);
console.log(`Building briefs for ${targets.length} companies…\n`);

const index = [];
for (const t of targets) {
  const role = roleByCompany.get(t.company.toLowerCase());
  if (!role) continue;
  const domain = resolveDomain(t.company, role, t.contact.email);
  const site = domain ? await probe(domain) : null;

  const k = t.contact;
  const md = `# ${t.company}

> Research brief. Generated from the live posting and their own site.
> Everything marked "unknown" needs you, and is deliberately not guessed.

| | |
| --- | --- |
| **role** | ${role.title} |
| **fit** | ${role.fit100}/100 |
| **posting** | ${role.url} |
| **days open** | ${role.daysLive ?? "unknown"} |
| **site** | ${domain ? `https://${domain}` : "not resolved from the posting"} |
| **visa** | ${role.visa.status} — ${role.visa.note} |
| **send to** | ${k.email ? `${k.name ?? "shared inbox"} <${k.email}>` : "no published contact, apply via the posting"} |

## What they say they do

${site?.title ? `**${site.title}**` : "_site title not read_"}

${site?.description ?? "_no meta description published_"}

## What they actually run on

${site?.stack?.length ? site.stack.map((s) => `- ${s}`).join("\n") : "- not detected"}

${
  site?.stack?.length
    ? `> Compare this against the job description. When a posting calls a language a\n> "bonus" but the product is built on it, the posting is understating it.`
    : ""
}

## Money and intent signals

${site?.signals?.length ? site.signals.map((s) => `- ${s}`).join("\n") : "- none detected"}

## Where you overlap

${role.proof?.projects?.length ? `Proof from **${role.proof.projects.join("** and **")}**: ${role.proof.terms.join(", ")}` : "_weak overlap, think hard before spending time here_"}

## Where you do not

${role.gaps?.length ? role.gaps.map((g) => `- ${g}`).join("\n") : "- nothing flagged"}

## To answer yourself (the part no script can do)

- [ ] **The hook.** One specific, recent, checkable detail that proves you looked. Not "I love your mission."
- [ ] **Their hardest current problem**, in one sentence, in their words.
- [ ] **Who decides**, if the posting did not say. Founder at seed, Head of Eng at Series A. Never a recruiter.
- [ ] **Why you, specifically**, and not the other 200 applicants.
- [ ] **The disqualifier**, stated by you first if it exists. Do not make them find it.

## Draft opening line

_Write it here once you have the hook. The rest of the email is boilerplate you already have in APPLICATIONS.md._
`;

  const file = new URL(`./${slugify(t.company)}.md`, OUT);
  writeFileSync(file, md);
  index.push({ company: t.company, fit: role.fit100, domain, stack: site?.stack ?? [], ok: site?.ok });
  console.log(
    `  ${String(role.fit100).padStart(3)}  ${t.company.slice(0, 20).padEnd(22)}${(domain ?? "no domain").padEnd(26)}${
      site?.ok ? (site.stack[0] ?? "stack unknown") : `unreachable (${site?.status || site?.error || "?"})`
    }`
  );
}

console.log(`\nwrote ${index.length} briefs to company/`);
