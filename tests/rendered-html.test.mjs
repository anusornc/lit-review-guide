import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import test, { after, before } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const templateRoot = new URL("../", import.meta.url);
const projectRoot = fileURLToPath(templateRoot);
let productionServer;
let productionOrigin;

async function reservePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  server.close();
  await once(server, "close");
  return port;
}

before(async () => {
  const port = await reservePort();
  productionOrigin = `http://127.0.0.1:${port}`;
  productionServer = spawn(
    process.execPath,
    [".next/standalone/server.js"],
    { cwd: projectRoot, env: { ...process.env, NODE_ENV: "production", HOSTNAME: "127.0.0.1", PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"] },
  );

  let startupOutput = "";
  productionServer.stdout.on("data", (chunk) => { startupOutput += chunk; });
  productionServer.stderr.on("data", (chunk) => { startupOutput += chunk; });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (productionServer.exitCode !== null) {
      throw new Error(`Next.js production server exited early.\n${startupOutput}`);
    }
    try {
      const response = await fetch(productionOrigin);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await delay(100);
  }

  throw new Error(`Next.js production server did not become ready.\n${startupOutput}`);
});

after(async () => {
  if (!productionServer || productionServer.exitCode !== null) return;
  productionServer.kill("SIGTERM");
  await Promise.race([once(productionServer, "exit"), delay(2_000)]);
  if (productionServer.exitCode === null) productionServer.kill("SIGKILL");
});

async function render(extraHeaders = {}, path = "/") {
  return fetch(`${productionOrigin}${path}`, {
    headers: { accept: "text/html", "x-forwarded-host": "litwise.test", "x-forwarded-proto": "https", ...extraHeaders },
  });
}

test("server-renders the LitWise research guide", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LitWise — Literature Review Expert Guide<\/title>/i);
  assert.match(html, /Find the review method your/);
  assert.match(html, /Start from where you are now/);
  assert.match(html, /Make the method decision in five clear steps/);
  assert.match(html, /Health &amp; medicine/);
  assert.match(html, /Systematic review/);
  assert.match(html, /Umbrella review/);
  assert.match(html, /Execute your review in six traceable phases/);
  assert.match(html, /Put up to three review methods side by side/);
  assert.match(html, /Build the artefacts, not just the vocabulary/);
  assert.match(html, /Question framework builder/);
  assert.match(html, /Screening calibration lab/);
  assert.match(html, /PRISMA flow planner/);
  assert.match(html, /Statistical test chooser/);
  assert.match(html, /Use this as a starting point/);
  assert.match(html, /Browse all 14 techniques/);
  assert.match(html, /Sources for this guidance/);
  assert.match(html, /Saved only in this browser/);
  assert.match(html, /aria-label="0\/12 completed"/);
  assert.match(html, /Full-text exclusion reasons and counts/);
  assert.match(html, /Reason total/);
  assert.match(html, /Research toolkit/);
  assert.match(html, /AI prompt lab/);
  assert.match(html, /Expand search vocabulary/);
  assert.match(html, /Summarize one research paper/);
  assert.match(html, /Map a citation network/);
  assert.match(html, /Treat AI output as a draft to inspect/);
  assert.match(html, /Research tool directory/);
  assert.match(html, /Zotero/);
  assert.match(html, /ASReview/);
  assert.match(html, /Elicit/);
  assert.match(html, /Nested Knowledge/);
  assert.match(html, /SciDraw/);
  assert.match(html, /View the source list/);
  assert.match(html, /Search log template/);
  const orderedJourneyHeadings = [
    "01 · Guided pathway",
    "02 · Method library",
    "03 · Discipline atlas",
    "04 · Before the search",
    "05 · Execute the review",
    "06 · Guided practice",
    "07 · Research toolkit",
    "Supplement",
  ];
  for (let index = 1; index < orderedJourneyHeadings.length; index += 1) {
    assert.ok(
      html.indexOf(orderedJourneyHeadings[index - 1]) < html.indexOf(orderedJourneyHeadings[index]),
      `${orderedJourneyHeadings[index]} should follow ${orderedJourneyHeadings[index - 1]}`,
    );
  }
  assert.match(html, /http:\/\/localhost:3000\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("removes starter assets and ships product metadata", async () => {
  const [page, guideClient, layout, i18n, guideData, researchTools, researchWorkbench, statChooser, statData, researchSources, globalCss, packageJson, ogImage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/guide-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/guide-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/research-tools.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/research-workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/stat-test-chooser.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/stat-test-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/research-sources.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(guideClient, /rankMethods/);
  assert.match(guideClient, /alternativeFit/);
  assert.match(guideClient, /alternativeTradeoff/);
  assert.doesNotMatch(guideClient, /methodForPath/);
  assert.match(guideClient, /methodDeepDives/);
  assert.match(guideClient, /disciplineDeepDives/);
  assert.match(guideClient, /workflow-section/);
  assert.match(guideClient, /MethodComparison/);
  assert.match(guideClient, /WorkflowDrillDown/);
  assert.match(guideClient, /ResearchWorkbench/);
  const orderedSectionMarkers = [
    'id="start"',
    'id="pathway"',
    'id="methods"',
    'id="disciplines"',
    'id="field-notes"',
    'id="workflow"',
    '<ResearchWorkbench',
    'id="toolkit"',
    'id="statistics"',
  ];
  for (let index = 1; index < orderedSectionMarkers.length; index += 1) {
    assert.ok(
      guideClient.indexOf(orderedSectionMarkers[index - 1]) < guideClient.indexOf(orderedSectionMarkers[index]),
      `${orderedSectionMarkers[index]} should follow ${orderedSectionMarkers[index - 1]}`,
    );
  }
  assert.match(guideClient, /methodSourceIds/);
  assert.match(guideClient, /SourceLinks/);
  assert.match(guideClient, /toolkit-section/);
  assert.match(guideClient, /ai-prompt-lab/);
  assert.match(guideClient, /start-stage-grid/);
  assert.match(guideClient, /journey-overview/);
  assert.match(guideClient, /discipline-search/);
  assert.match(guideClient, /method-filter-pills/);
  assert.match(guideClient, /tool-directory/);
  assert.match(guideClient, /https:\/\/effortlessacademic\.com\/tools\//);
  assert.match(guideClient, /theme-toggle/);
  assert.match(guideClient, /hero-research-art/);
  assert.match(guideClient, /wizard-progress/);
  assert.match(guideClient, /methods-grid/);
  assert.match(guideClient, /discipline-card-grid/);
  assert.match(guideClient, /detail-modal/);
  assert.match(guideClient, /keepFocusInDialog/);
  assert.match(guideClient, /event\.key !== "Tab"/);
  assert.match(guideClient, /id="pitfalls"/);
  assert.ok(guideClient.indexOf('<section className="methods-section"') < guideClient.indexOf('<section className="disciplines-section"'));
  assert.match(page, /export const metadata/);
  assert.match(page, /NEXT_PUBLIC_SITE_ORIGIN/);
  assert.match(page, /NEXT_PUBLIC_BASE_PATH/);
  assert.doesNotMatch(page, /next\/headers|cookies\(|headers\(/);
  assert.match(layout, /data-theme/);
  assert.match(layout, /URLSearchParams/);
  assert.match(layout, /navigator\.language/);
  assert.match(layout, /prefers-color-scheme/);
  assert.match(guideClient, /resolveLocalePreference/);
  assert.match(guideClient, /setLocale\("th"\)/);
  assert.match(i18n, /คู่มือการทบทวนวรรณกรรมสำหรับนักวิจัย/);
  assert.match(i18n, /การทบทวนวรรณกรรมอย่างเป็นระบบ/);
  assert.match(i18n, /สุขภาพและการแพทย์/);
  assert.match(i18n, /ตอนนี้คุณอยู่จุดไหน\?/);
  assert.match(i18n, /เริ่มต้นที่ตอบคำถาม 5 ข้อนี้/);
  assert.match(i18n, /เมื่อพิจารณาเวลาและทรัพยากรที่มี คุณต้องการอะไรตอนนี้\?/);
  assert.match(i18n, /วิธีการทบทวนวรรณกรรม และ การเปรียบเทียบ/);
  assert.match(i18n, /หมายเลข 01–07 เป็นลำดับหลักของการทบทวนวรรณกรรม/);
  assert.match(i18n, /\{ index: "A", title: "ยังไม่ได้เริ่ม"/);
  assert.match(i18n, /\{ index: "D", title: "กำลังหาเครื่องมือช่วยทำงาน"/);
  assert.match(i18n, /02 · คลังวิธีทบทวน/);
  assert.match(i18n, /04 · ก่อนเริ่มค้น/);
  assert.match(i18n, /Best fit/);
  assert.match(i18n, /ข้อควรพิจารณา/);
  assert.match(i18n, /งานทบทวนที่น่าเชื่อถือ/);
  assert.doesNotMatch(i18n, /สายโซ่ของการตัดสินใจ|อธิบายและปกป้องได้|ข้ออ้างเชิงความรู้|พื้นที่การสืบค้น|สร้างเส้นทางของฉัน|บันทึกภาคสนาม|ดำเนินการต่อ|ข้อแลกเปลี่ยน|อย่าดูแค่ชื่อวิธี ควรเปรียบเทียบจุดประสงค์และข้อจำกัด/);
  assert.match(guideData, /การทบทวนงานทบทวนอย่างเป็นระบบ \(umbrella review\)/);
  assert.match(guideData, /คลังเครื่องมือสำหรับทำงานวิจัย/);
  assert.match(guideData, /05 · ลงมือทำงานทบทวน/);
  assert.match(guideData, /07 · เครื่องมือนักวิจัย/);
  assert.match(guideData, /คัดเลือกเครื่องมือเพิ่มเติมจากรายการของ Effortless Academic/);
  assert.match(guideData, /Livewrite \(เดิมชื่อ ReSub\)/);
  assert.doesNotMatch(guideData, /บทวิทยานิพนธ์ที่ปกป้องได้|ผืนงานสร้างคำค้น|เกณฑ์เคลื่อน|ตารางไร้ร่องรอย|การทบทวนแบบร่ม/);
  assert.match(researchTools, /เครื่องมือช่วยวางกรอบคำถาม/);
  assert.match(researchTools, /06 · ฝึกลงมือทำ/);
  assert.match(researchTools, /อยากให้งานทบทวนนี้ช่วยตอบคำถามอะไร/);
  assert.match(researchTools, /ดูตัวอย่างที่กรอกครบ/);
  assert.match(researchTools, /เปรียบเทียบว่าอะไรได้ผลกว่ากัน/);
  assert.match(researchTools, /Population · Intervention · Comparison · Outcome/);
  assert.match(researchTools, /Sample · Phenomenon of Interest · Design · Evaluation · Research type/);
  assert.match(researchTools, /แบบฝึกหัดคัดกรองบทความ/);
  assert.match(researchTools, /เครื่องมือวางแผนผัง PRISMA/);
  assert.match(researchTools, /กรอกข้อมูลของคุณ/);
  assert.match(researchTools, /ดูตัวอย่าง/);
  assert.match(researchTools, /ตัวอย่าง: การทบทวนเรื่อง AI ช่วยสอนในมหาวิทยาลัย/);
  assert.match(researchTools, /ตอบได้ตรงกับเกณฑ์/);
  assert.match(researchTools, /ผลรวมของแต่ละเหตุผลต้องเท่ากับจำนวนรายงานฉบับเต็มที่ตัดออก/);
  assert.doesNotMatch(researchTools, /รับเข้า|กรอบตั้งต้น|เส้นทางที่คำนวณได้|รายงานที่พยายามขอ|ขอฉบับเต็มไม่ได้|ระบบอัตโนมัตินำออก|เริ่มจากการตัดสินใจที่งานทบทวนต้องช่วยสนับสนุน|ดุลยพินิจของแต่ละสาขา|ปรากฏการณ์ที่สนใจ/);
  assert.match(researchWorkbench, /litwise-project-checklist-v1/);
  assert.match(researchWorkbench, /validatePrismaReasonCounts/);
  assert.match(researchWorkbench, /className="screening-verdict" role="status"/);
  assert.match(researchWorkbench, /className="question-example"/);
  assert.match(researchWorkbench, /className="purpose-framework-name"/);
  assert.match(researchWorkbench, /framework\.expandedName/);
  assert.match(researchWorkbench, /placeholder={example}/);
  assert.match(researchWorkbench, /data-testid="method-comparison"/);
  assert.match(researchWorkbench, /data-testid="screening-practice-lab"/);
  assert.match(researchWorkbench, /data-testid="prisma-flow-builder"/);
  assert.match(researchWorkbench, /className="prisma-tabs" role="tablist"/);
  assert.match(researchWorkbench, /id="prisma-example-panel"/);
  assert.match(researchWorkbench, /className="prisma-example-reasons"/);
  assert.doesNotMatch(researchWorkbench, /StatTestChooser/);
  assert.match(guideClient, /StatTestChooser/);
  assert.match(researchWorkbench, /workflowSourceIds/);
  assert.match(statChooser, /data-testid="stat-test-chooser"/);
  assert.match(statChooser, /aria-live="polite"/);
  assert.doesNotMatch(statChooser, /iframe|dangerouslySetInnerHTML/);
  assert.match(statData, /ตัวช่วยเลือกสถิติ/);
  assert.match(statData, /ตัวอย่างคำถามวิจัย/);
  assert.match(statData, /equal_var=False/);
  assert.equal((statData.match(/^  \d+: \{/gm) ?? []).length, 14);
  assert.match(researchSources, /JBI Manual for Evidence Synthesis/);
  assert.match(researchSources, /PRISMA 2020 Statement/);
  assert.match(researchSources, /UCLA OARC/);
  assert.match(globalCss, /\.guidance-sources/);
  assert.match(globalCss, /\.stat-option-grid/);
  assert.match(globalCss, /--th-body: 16px/);
  assert.match(globalCss, /html\[data-locale="th"\]\s*\{/);
  assert.match(globalCss, /html\[data-theme="dark"\]/);
  assert.match(globalCss, /@media \(max-width: 600px\)/);
  assert.match(globalCss, /body \{ font-size: 16px; \}/);
  assert.match(globalCss, /\.prompt-anatomy p \{[^}]*font-size: 16px/);
  assert.match(globalCss, /\.journey-overview/);
  assert.match(globalCss, /html\[data-locale="th"\] \.prompt-anatomy p[^}]*\{ font-size: 16px/);
  assert.match(globalCss, /html\[data-locale="th"\] \.alternative-methods button small[^}]*\{ font-size: 16px/);
  assert.match(globalCss, /html\[data-locale="th"\] \.method-detail \.method-steps li[^}]*\{ font-size: 16px/);
  assert.match(globalCss, /\.prompt-(?:anatomy|task-list, \.prompt-preview|guardrails)[^}]*border-radius: 20px/);
  assert.match(globalCss, /@media \(max-width: 840px\)[\s\S]*\.prompt-task-list \{ max-height: none; overflow-y: visible;/);
  assert.match(globalCss, /@media print/);
  assert.match(globalCss, /prefers-reduced-motion/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(ogImage.byteLength > 100_000);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)));
});

test("serves a static English document with client preference bootstrapping", async () => {
  const response = await render({ "accept-language": "th-TH,th;q=0.9,en;q=0.8" });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<html lang="en"[^>]*data-locale="en"/i);
  assert.match(html, /<title>LitWise — Literature Review Expert Guide<\/title>/i);
  assert.match(html, /navigator\.language/);
  assert.match(html, /litwise-language/);
});

test("keeps the query-compatible page static before client hydration", async () => {
  const response = await render({}, "/?lang=th");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<html lang="en"[^>]*data-locale="en"/i);
  assert.match(html, /<main lang="en">/i);
  assert.match(html, /Find the review method your/);
  assert.match(html, /URLSearchParams\(location\.search\).*get/);
});

test("seeds saved locale and theme before hydration without request cookies", async () => {
  const response = await render({ cookie: "litwise-language=th; litwise-theme=dark" });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /localStorage\.getItem.*litwise-language/);
  assert.match(html, /localStorage\.getItem.*litwise-theme/);
  assert.match(html, /<main lang="en">/i);
});
