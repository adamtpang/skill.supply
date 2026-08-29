import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import nextConfig, { CONTENT_SECURITY_POLICY } from "../next.config.ts";

test("deployment config enforces the required security headers", async () => {
  const rules = await nextConfig.headers();
  const allHeaders = new Map(rules.flatMap((rule) => rule.headers).map(({ key, value }) => [key, value]));

  assert.equal(allHeaders.get("Content-Security-Policy"), CONTENT_SECURITY_POLICY);
  assert.equal(allHeaders.get("X-Content-Type-Options"), "nosniff");
  assert.match(CONTENT_SECURITY_POLICY, /default-src 'self'/);
  assert.match(CONTENT_SECURITY_POLICY, /object-src 'none'/);
  assert.match(CONTENT_SECURITY_POLICY, /frame-ancestors 'none'/);
  assert.doesNotMatch(CONTENT_SECURITY_POLICY, /unsafe-eval/);
  assert.doesNotMatch(CONTENT_SECURITY_POLICY, /\s\*\s/);
});

test("agent and trust discovery files name the real public surfaces", async () => {
  const [llms, footer, sitemap] = await Promise.all([
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../components/fleet-footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);

  assert.ok(llms.length > 20);
  assert.match(llms, /Operator: Adam Pangelinan/);
  for (const route of ["/about", "/contact", "/privacy"]) {
    assert.match(llms, new RegExp(`https://skill\\.supply${route}`));
    assert.match(footer, new RegExp(`href="${route}"`));
    assert.match(sitemap, new RegExp(route.slice(1)));
  }
});

test("every trust route declares an absolute-site canonical through metadataBase", async () => {
  const routes = ["about", "contact", "privacy"];
  for (const route of routes) {
    const source = await readFile(new URL(`../app/${route}/page.tsx`, import.meta.url), "utf8");
    assert.match(source, new RegExp(`alternates: \\{ canonical: "/${route}" \\}`));
    assert.match(source, /Adam Pangelinan/);
  }
});
