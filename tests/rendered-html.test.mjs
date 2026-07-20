import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(extraHeaders = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://litwise.test/", {
      headers: { accept: "text/html", host: "litwise.test", "x-forwarded-proto": "https", ...extraHeaders },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the LitWise research guide", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LitWise — Literature Review Expert Guide<\/title>/i);
  assert.match(html, /Find the review method your/);
  assert.match(html, /Make the method decision in four clear steps/);
  assert.match(html, /Health &amp; medicine/);
  assert.match(html, /Systematic review/);
  assert.match(html, /https:\/\/litwise\.test\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("removes starter assets and ships product metadata", async () => {
  const [page, layout, i18n, packageJson, ogImage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(page, /methodForPath/);
  assert.match(page, /discipline-atlas/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(page, /litwise-language/);
  assert.match(page, /setLocale\("th"\)/);
  assert.match(i18n, /คู่มือผู้เชี่ยวชาญด้านการทบทวนวรรณกรรม/);
  assert.match(i18n, /การทบทวนอย่างเป็นระบบ/);
  assert.match(i18n, /สุขภาพและการแพทย์/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(ogImage.byteLength > 100_000);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)));
});

test("serves Thai metadata and document language for Thai readers", async () => {
  const response = await render({ "accept-language": "th-TH,th;q=0.9,en;q=0.8" });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<html lang="th">/i);
  assert.match(html, /<title>LitWise — คู่มือผู้เชี่ยวชาญด้านการทบทวนวรรณกรรม<\/title>/i);
  assert.match(html, /ค้นหาวิธีทบทวนที่เหมาะกับคำถามวิจัยของคุณ/);
});
