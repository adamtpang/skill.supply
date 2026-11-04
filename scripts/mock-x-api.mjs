// Local stand-in for X's recent-search API and the Jev endpoint, for testing
// the /api/x/ingest pipeline end to end without spending money.
//   node scripts/mock-x-api.mjs   (listens on :3918)
//   X_API_BASE=http://localhost:3918 JEV_ENDPOINT=http://localhost:3918/jev ...
// Post texts are real posts from the 2026-11-04 manual pass, plus noise cases.
import http from "node:http";

const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

const users = {
  u1: { id: "u1", name: "akshay", username: "AkshayNarisetti", description: "Co-Founder CEO @heypocket (YC W26)", public_metrics: { followers_count: 21000 } },
  u2: { id: "u2", name: "haroon", username: "hmbakhsh", description: "cto @36_labs, london", public_metrics: { followers_count: 691 } },
  u3: { id: "u3", name: "Nick Abouzeid, EA", username: "nickabouzeid", description: "Co-founder @RivetTax", public_metrics: { followers_count: 5200 } },
  u4: { id: "u4", name: "Recruiter Rae", username: "recruiter_rae", description: "Technical recruiter. DMs open.", public_metrics: { followers_count: 4000 } },
  u5: { id: "u5", name: "spambot", username: "jobs4u_99", description: "", public_metrics: { followers_count: 9 } },
  u6: { id: "u6", name: "Giulio Greco", username: "im_the_giulio", description: "CEO / Founder @forgegui", public_metrics: { followers_count: 3100 } },
  u7: { id: "u7", name: "Joke Account", username: "lol_hiring", description: "parody", public_metrics: { followers_count: 800 } },
};

const pages = [
  [
    { id: "1001", author_id: "u1", created_at: hoursAgo(3), public_metrics: { like_count: 394, reply_count: 22 },
      text: "We’re hiring a Head of Product at Pocket. Looking for someone with exceptional taste who obsesses over every detail. SF, in person. DM me." },
    { id: "1002", author_id: "u2", created_at: hoursAgo(7), public_metrics: { like_count: 542, reply_count: 42 },
      text: "we're hiring engineers in london at @36_Labs looking for cracked, ambitious, high agency ICs. dms open https://t.co/abc123",
      entities: { urls: [{ unwound_url: "https://36labs.ai/hiring" }, { expanded_url: "https://x.com/36_Labs" }] } },
    { id: "1003", author_id: "u4", created_at: hoursAgo(5), public_metrics: { like_count: 30, reply_count: 4 },
      text: "Series A AI startup in SF is hiring a Product Engineer (React). $200K–$240K + equity. DM me or reply." },
    { id: "1004", author_id: "u5", created_at: hoursAgo(2), public_metrics: { like_count: 0, reply_count: 0 },
      text: "We are hiring! Join our team today, apply now" },
  ],
  [
    { id: "1005", author_id: "u3", created_at: hoursAgo(20), public_metrics: { like_count: 562, reply_count: 92 },
      text: "We’re hiring @RivetTax. Open roles: Back-end, full-stack, front-end sr. engineers, AE roles (2), full-stack engineering interns, GTM / growth. Remote friendly. Shoot me a DM",
      note_tweet: { text: "We’re hiring @RivetTax. Open roles: Back-end, full-stack, front-end sr. engineers, AE roles (2), full-stack engineering interns, GTM / growth. Remote friendly. Shoot me a DM. (long-form note text wins over truncated text)" } },
    { id: "1006", author_id: "u6", created_at: hoursAgo(30), public_metrics: { like_count: 900, reply_count: 120 },
      text: "We're hiring full stack founding engineers @forgegui. $5K if you refer someone we hire. Comp: $150K - $250K, 0.5% - 1% equity. In person in sf." },
    { id: "1007", author_id: "u7", created_at: hoursAgo(4), public_metrics: { like_count: 2000, reply_count: 50 },
      text: "we're hiring someone to explain to my mom what i do for work. MOCK_NOT_HIRING" },
  ],
];

const seen = [];

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const send = (code, body) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (url.pathname === "/jev") {
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", () => {
        const { state } = JSON.parse(raw);
        send(200, { answers: { hiring: { noul: state.includes("MOCK_NOT_HIRING") ? 0.03 : 0.91 } } });
      });
      return;
    }

    if (url.pathname === "/__seen") return send(200, seen);

    if (url.pathname === "/2/tweets/search/recent") {
      if (req.headers.authorization !== "Bearer test-token") return send(401, { title: "Unauthorized" });
      seen.push(Object.fromEntries(url.searchParams));
      const i = url.searchParams.get("next_token") === "p2" ? 1 : 0;
      const data = pages[i];
      const ids = new Set(data.map((d) => d.author_id));
      return send(200, {
        data,
        includes: { users: Object.values(users).filter((u) => ids.has(u.id)) },
        meta: { result_count: data.length, ...(i === 0 ? { next_token: "p2" } : {}) },
      });
    }
    send(404, { title: "Not found" });
  })
  .listen(3918, () => console.log("mock X + Jev on :3918"));
