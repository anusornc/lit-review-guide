import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const dateStamp = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const artifactRoot = path.join(projectRoot, ".omx/artifacts");
const resultRoot = path.join(artifactRoot, `thai-copy-advisor-results-${dateStamp}`);
const auditRoot = path.join(projectRoot, "audits");

const index = JSON.parse(await readFile(path.join(artifactRoot, `thai-copy-index-${dateStamp}.json`), "utf8"));
const claude = JSON.parse(await readFile(path.join(resultRoot, "claude-combined.json"), "utf8"));
const agy = JSON.parse(await readFile(path.join(resultRoot, "agy-combined.json"), "utf8"));
const claudeById = new Map(claude.rows.map((row) => [row.id, row]));
const agyById = new Map(agy.rows.map((row) => [row.id, row]));

function sourceGroup(locations) {
  const hasSlides = locations.some((location) => location.startsWith("workshop/"));
  const hasWebsite = locations.some((location) => location.startsWith("app/"));
  if (hasSlides && hasWebsite) return "เว็บไซต์และ PowerPoint";
  if (hasSlides) return "PowerPoint เท่านั้น";
  return "เว็บไซต์";
}

function markdownCell(value) {
  return String(value)
    .replaceAll("|", "\\|")
    .replaceAll("\r", "")
    .replaceAll("\n", "<br>");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

const rows = index.records.flatMap((record) => {
  const claudeReview = claudeById.get(record.id);
  const agyReview = agyById.get(record.id);
  if (!claudeReview || !agyReview) throw new Error(`Missing advisor review for ${record.id}`);

  const claudeFlagged = claudeReview.score <= 3;
  const agyFlagged = agyReview.score <= 3;
  if (claudeFlagged === agyFlagged) return [];

  const flaggedBy = claudeFlagged ? "Claude" : "agy";
  const flaggedReview = claudeFlagged ? claudeReview : agyReview;
  return [{
    ...record,
    claude: claudeReview,
    agy: agyReview,
    flaggedBy,
    flaggedReview,
    difference: Math.abs(claudeReview.score - agyReview.score),
    sourceGroup: sourceGroup(record.locations),
  }];
}).sort((left, right) => (
  right.difference - left.difference
  || left.flaggedReview.score - right.flaggedReview.score
  || left.sourceGroup.localeCompare(right.sourceGroup, "th")
  || Number(left.id.replace("TH-", "")) - Number(right.id.replace("TH-", ""))
));

const groupCounts = Object.fromEntries(
  ["เว็บไซต์", "เว็บไซต์และ PowerPoint", "PowerPoint เท่านั้น"].map((group) => [
    group,
    rows.filter((row) => row.sourceGroup === group).length,
  ]),
);

const report = `# รายการสำนวนภาษาไทยที่ยังควรพิจารณา

วันที่อ้างอิงผลตรวจ: ${dateStamp}

## สรุป

- เหลือ ${rows.length} รายการจากรอบตรวจด้วย Claude และ agy ที่ผู้ตรวจเพียงระบบเดียวให้คะแนนไม่เกิน 3
- เว็บไซต์ ${groupCounts["เว็บไซต์"]} รายการ
- พบทั้งในเว็บไซต์และ PowerPoint ${groupCounts["เว็บไซต์และ PowerPoint"]} รายการ
- PowerPoint เท่านั้น ${groupCounts["PowerPoint เท่านั้น"]} รายการ

รายการเหล่านี้ **ไม่ใช่ข้อผิดพลาดที่ยืนยันแล้ว** เพราะผู้ตรวจอีกระบบให้คะแนน 4–5 จึงควรพิจารณาจากบริบท กลุ่มผู้อ่าน และน้ำเสียงของเว็บไซต์ก่อนแก้ เรียงรายการที่คะแนนต่างกันมากที่สุดไว้ก่อน

> [!NOTE]
> ตำแหน่งสไลด์อ้างอิงจาก PowerPoint ณ เวลาที่ตรวจภาษาในวันที่ ${dateStamp} หากมีการย้ายลำดับสไลด์ภายหลัง ให้ใช้ Index เป็นหลัก ข้อความตัวอย่างคำถามทางสถิติที่เพิ่มหลังรอบตรวจนี้ยังไม่รวมอยู่ใน ${rows.length} รายการ

## ตารางสำหรับพิจารณา

| Index | ข้อความปัจจุบันในรอบตรวจ | แหล่งที่พบ | ผู้ตรวจที่เสนอให้แก้ | คะแนน Claude / agy | ข้อสังเกต | คำที่เสนอ | ตำแหน่งเดิม |
|---|---|---|---|---:|---|---|---|
${rows.map((row) => `| ${row.id} | ${markdownCell(row.text)} | ${row.sourceGroup} | ${row.flaggedBy} | ${row.claude.score} / ${row.agy.score} | ${markdownCell(row.flaggedReview.issue)} | ${markdownCell(row.flaggedReview.suggestion)} | ${markdownCell(row.locations.join("<br>"))} |`).join("\n")}

## วิธีอ้างอิง

แจ้ง Index ได้โดยตรง เช่น “แก้ TH-xxx ตามคำที่เสนอ” หรือ “คง TH-xxx ไว้ตามเดิม” เพื่อให้ตัดสินใจและติดตามการแก้ไขได้ทีละรายการ
`;

const csvHeaders = [
  "Index", "Original Thai", "Source group", "Flagged by", "Claude score", "agy score",
  "Issue", "Suggestion", "Original locations",
];
const csv = [
  csvHeaders.map(csvCell).join(","),
  ...rows.map((row) => [
    row.id,
    row.text,
    row.sourceGroup,
    row.flaggedBy,
    row.claude.score,
    row.agy.score,
    row.flaggedReview.issue,
    row.flaggedReview.suggestion,
    row.locations.join("; "),
  ].map(csvCell).join(",")),
].join("\n");

await mkdir(auditRoot, { recursive: true });
await writeFile(path.join(auditRoot, `thai-language-remaining-${dateStamp}.md`), `${report}\n`, "utf8");
await writeFile(path.join(auditRoot, `thai-language-remaining-${dateStamp}.csv`), `${csv}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ total: rows.length, groupCounts }, null, 2)}\n`);
