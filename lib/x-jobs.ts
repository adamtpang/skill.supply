import { getSql } from "@/lib/db";
import { compFor, placesFor, rejectReason, tagsFor } from "@/lib/x-jobs-filter";

export { TAGS } from "@/lib/x-jobs-filter";

/**
 * The X jobs board: once a day, pull the most relevant "we're hiring" posts
 * from the last 24 hours on X, keep the ones that read like a real opening
 * posted by the person or company hiring, and list them at skill.supply/x.
 *
 * Cost control: X bills pay-per-use, roughly $0.005 per post returned. One
 * page of MAX_POSTS_PER_RUN posts per day caps spend near $15/month. Raise it
 * deliberately (X_DAILY_POSTS env), never by accident.
 *
 * Why relevancy over a 24h window instead of newest-first: hiring posts run to
 * thousands a day. Newest-first with a 100-post cap would only ever see the
 * last half hour. Relevancy returns the day's most engaged posts, which is
 * what a reader wants.
 */

const DEFAULT_POSTS_PER_RUN = 100;
const HARD_CEILING = 500;

export function postsPerRun(): number {
  const n = Number(process.env.X_DAILY_POSTS ?? DEFAULT_POSTS_PER_RUN);
  return Math.max(10, Math.min(HARD_CEILING, Number.isFinite(n) ? n : DEFAULT_POSTS_PER_RUN));
}

// First-person hiring phrases. Retweets, replies, and promoted posts are
// dropped at the source so each opening appears once, from its author.
export const QUERY =
  '("we\'re hiring" OR "we are hiring" OR "i\'m hiring" OR "now hiring" OR "come work with" OR "join our team" OR "hiring a founding" OR "hiring founding") -is:retweet -is:reply -is:nullcast lang:en';

// Jev drops a post only when it is confident the author is NOT hiring. Below
// this the post is noise; above it, the score only orders the list. (Jev is
// well calibrated for order, less so for a hard 0.5 cutoff: see lib/jev.ts.)
const JEV_DROP_BELOW = 0.15;
const JEV_ENDPOINT = process.env.JEV_ENDPOINT ?? "https://openrouter.ai/api/alpha/decisions";

export type XJob = {
  id: string;
  url: string;
  text: string;
  author_handle: string;
  author_name: string;
  author_bio: string;
  author_followers: number;
  likes: number;
  replies: number;
  links: string[];
  tags: string[];
  places: string[];
  comp: string | null;
  hiring_p: number | null;
  posted_at: string;
};

export async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS x_jobs (
      id text PRIMARY KEY,
      url text NOT NULL,
      text text NOT NULL,
      author_handle text NOT NULL,
      author_name text NOT NULL,
      author_bio text NOT NULL DEFAULT '',
      author_followers integer NOT NULL DEFAULT 0,
      likes integer NOT NULL DEFAULT 0,
      replies integer NOT NULL DEFAULT 0,
      links jsonb NOT NULL DEFAULT '[]',
      tags text[] NOT NULL DEFAULT '{}',
      places text[] NOT NULL DEFAULT '{}',
      comp text,
      hiring_p real,
      hidden boolean NOT NULL DEFAULT false,
      posted_at timestamptz NOT NULL,
      fetched_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS x_jobs_posted_at ON x_jobs (posted_at DESC)`;
  await sql`
    CREATE TABLE IF NOT EXISTS x_jobs_runs (
      ran_at timestamptz PRIMARY KEY DEFAULT now(),
      fetched integer NOT NULL,
      kept integer NOT NULL,
      dropped jsonb NOT NULL DEFAULT '{}',
      error text
    )`;
}

type XUser = {
  id: string;
  name: string;
  username: string;
  description?: string;
  public_metrics?: { followers_count: number };
};

type XSearchResponse = {
  data?: {
    id: string;
    text: string;
    author_id: string;
    created_at: string;
    note_tweet?: { text: string };
    public_metrics?: { like_count: number; reply_count: number };
    entities?: { urls?: { expanded_url?: string; unwound_url?: string }[] };
  }[];
  includes?: { users?: XUser[] };
  meta?: { result_count: number; next_token?: string };
  title?: string;
  detail?: string;
};

/** Probability (0 to 1) that the author or their own company is hiring. */
async function hiringProbability(text: string, bio: string): Promise<number | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(JEV_ENDPOINT, {
      method: "POST",
      signal: AbortSignal.timeout(8_000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "~typesafe/jev-latest",
        state: `Author bio: ${bio.slice(0, 300)}\n\nPost on X: ${text.slice(0, 1500)}`,
        questions: {
          hiring: {
            type: "noul",
            instructions:
              "Is the author announcing a real open role at their own company or team (not a recruiter advertising an unnamed client, not someone looking for a job, not a joke, not a list of other companies)?",
          },
        },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { answers?: { hiring?: { noul?: number } } };
    const p = data.answers?.hiring?.noul;
    return typeof p === "number" && Number.isFinite(p) ? p : null;
  } catch {
    return null;
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function searchPage(token: string, params: URLSearchParams): Promise<XSearchResponse> {
  // X_API_BASE exists only so scripts/mock-x-api.mjs can stand in during tests.
  const base = process.env.X_API_BASE ?? "https://api.x.com";
  const res = await fetch(`${base}/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = (await res.json()) as XSearchResponse;
  if (!res.ok) throw new Error(`X API ${res.status}: ${body.title ?? ""} ${body.detail ?? ""}`.trim());
  return body;
}

export type IngestResult = { fetched: number; kept: number; dropped: Record<string, number> };

/** Fetch the day's most relevant hiring posts, filter, score, and upsert. */
export async function ingestXJobs(): Promise<IngestResult> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN is not set");

  await ensureTable();
  const sql = getSql();
  const budget = postsPerRun();
  const dropped: Record<string, number> = {};
  const bump = (k: string) => (dropped[k] = (dropped[k] ?? 0) + 1);
  let fetched = 0;
  let kept = 0;

  try {
    // X requires end_time at least 10 seconds in the past.
    const end = new Date(Date.now() - 30_000);
    const start = new Date(end.getTime() - 24 * 3600 * 1000);
    let nextToken: string | undefined;

    while (fetched < budget) {
      const params = new URLSearchParams({
        query: QUERY,
        sort_order: "relevancy",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        max_results: String(Math.min(100, Math.max(10, budget - fetched))),
        "tweet.fields": "created_at,public_metrics,entities,note_tweet",
        expansions: "author_id",
        "user.fields": "name,username,description,public_metrics",
      });
      if (nextToken) params.set("next_token", nextToken);

      const body = await searchPage(token, params);
      const users = new Map((body.includes?.users ?? []).map((u) => [u.id, u]));
      const posts = body.data ?? [];
      fetched += posts.length;

      // Hard rules first (free), then Jev on the survivors, 10 calls at a time.
      const survivors = posts.flatMap((p) => {
        const user = users.get(p.author_id);
        if (!user) {
          bump("no-author");
          return [];
        }
        const text = p.note_tweet?.text ?? p.text;
        const followers = user.public_metrics?.followers_count ?? 0;
        const reason = rejectReason({ text, followers });
        if (reason) {
          bump(reason.split(":")[0]);
          return [];
        }
        return [{ p, user, text, bio: user.description ?? "", followers }];
      });
      const scores = await mapLimit(survivors, 10, (s) => hiringProbability(s.text, s.bio));

      for (const [i, { p, user, text, bio, followers }] of survivors.entries()) {
        const hiringP = scores[i];
        if (hiringP !== null && hiringP < JEV_DROP_BELOW) {
          bump("jev-not-hiring");
          continue;
        }

        const links = (p.entities?.urls ?? [])
          .map((u) => u.unwound_url ?? u.expanded_url)
          .filter((u): u is string => !!u && !/^https?:\/\/(www\.)?(x|twitter)\.com\//.test(u));

        // Re-seen posts refresh their engagement numbers so reply counts stay
        // honest about how crowded a thread is.
        await sql`
          INSERT INTO x_jobs (id, url, text, author_handle, author_name, author_bio,
            author_followers, likes, replies, links, tags, places, comp, hiring_p, posted_at)
          VALUES (${p.id}, ${`https://x.com/${user.username}/status/${p.id}`}, ${text},
            ${user.username}, ${user.name}, ${bio}, ${followers},
            ${p.public_metrics?.like_count ?? 0}, ${p.public_metrics?.reply_count ?? 0},
            ${JSON.stringify(links)}::jsonb, ${tagsFor(text)}, ${placesFor(`${text} ${bio}`)},
            ${compFor(text)}, ${hiringP}, ${p.created_at})
          ON CONFLICT (id) DO UPDATE SET likes = EXCLUDED.likes, replies = EXCLUDED.replies,
            author_followers = EXCLUDED.author_followers, tags = EXCLUDED.tags,
            places = EXCLUDED.places, comp = EXCLUDED.comp`;
        kept++;
      }

      nextToken = body.meta?.next_token;
      if (!nextToken || posts.length === 0) break;
    }

    await sql`INSERT INTO x_jobs_runs (fetched, kept, dropped)
      VALUES (${fetched}, ${kept}, ${JSON.stringify(dropped)}::jsonb)`;
    return { fetched, kept, dropped };
  } catch (err) {
    await sql`INSERT INTO x_jobs_runs (fetched, kept, dropped, error)
      VALUES (${fetched}, ${kept}, ${JSON.stringify(dropped)}::jsonb, ${(err as Error).message})`.catch(() => {});
    throw err;
  }
}

export type ListOpts = { tag?: string; place?: string; q?: string; days?: number };

export async function listXJobs(opts: ListOpts = {}): Promise<XJob[]> {
  if (!process.env.DATABASE_URL) return [];
  const sql = getSql();
  const days = opts.days ?? 14;
  const tag = opts.tag ?? null;
  const place = opts.place ?? null;
  const q = opts.q ? `%${opts.q.replace(/[%_\\]/g, "\\$&")}%` : null;
  try {
    const rows = await sql`
      SELECT * FROM x_jobs
      WHERE NOT hidden
        AND posted_at > now() - make_interval(days => ${days})
        AND (${tag}::text IS NULL OR ${tag} = ANY(tags))
        AND (${place}::text IS NULL OR ${place} = ANY(places))
        AND (${q}::text IS NULL OR text ILIKE ${q} OR author_name ILIKE ${q}
             OR author_handle ILIKE ${q} OR author_bio ILIKE ${q})
      ORDER BY posted_at DESC
      LIMIT 300`;
    return rows.map((r) => ({ ...r, posted_at: new Date(r.posted_at).toISOString() })) as XJob[];
  } catch {
    // Table not created yet (no ingest has run): show the empty state.
    return [];
  }
}

export async function lastRun(): Promise<{ ran_at: string; kept: number } | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const [row] = await getSql()`SELECT ran_at, kept FROM x_jobs_runs WHERE error IS NULL ORDER BY ran_at DESC LIMIT 1`;
    return row ? { ran_at: new Date(row.ran_at).toISOString(), kept: row.kept } : null;
  } catch {
    return null;
  }
}
