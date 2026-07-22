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

function normalizedVerdict(score) {
  if (score === 1) return "CRITICAL";
  if (score <= 3) return "REVISE";
  return "PASS";
}

function statusFor(claudeScore, agyScore) {
  if (Math.min(claudeScore, agyScore) <= 2) return "เร่งตรวจ";
  if (claudeScore <= 3 && agyScore <= 3) return "เห็นพ้องว่าควรแก้";
  if (claudeScore <= 3 || agyScore <= 3) return "ควรทบทวน";
  return "ผ่าน";
}

const rows = index.records.map((record) => {
  const claudeReview = claudeById.get(record.id);
  const agyReview = agyById.get(record.id);
  if (!claudeReview || !agyReview) throw new Error(`Missing advisor review for ${record.id}`);
  const normalizedClaudeReview = {
    ...claudeReview,
    rawVerdict: claudeReview.verdict,
    verdict: normalizedVerdict(claudeReview.score),
  };
  const normalizedAgyReview = {
    ...agyReview,
    rawVerdict: agyReview.verdict,
    verdict: normalizedVerdict(agyReview.score),
  };
  const average = (claudeReview.score + agyReview.score) / 2;
  return {
    ...record,
    claude: normalizedClaudeReview,
    agy: normalizedAgyReview,
    average,
    difference: Math.abs(claudeReview.score - agyReview.score),
    status: statusFor(claudeReview.score, agyReview.score),
  };
});

const flaggedRows = rows
  .filter((row) => row.status !== "ผ่าน")
  .sort((left, right) => (
    Math.min(left.claude.score, left.agy.score) - Math.min(right.claude.score, right.agy.score)
    || left.average - right.average
    || right.difference - left.difference
    || left.id.localeCompare(right.id)
  ));

const scoreDistribution = (backend) => Object.fromEntries([1, 2, 3, 4, 5].map((score) => [
  score,
  rows.filter((row) => row[backend].score === score).length,
]));
const statusDistribution = Object.fromEntries(["เร่งตรวจ", "เห็นพ้องว่าควรแก้", "ควรทบทวน", "ผ่าน"].map((status) => [
  status,
  rows.filter((row) => row.status === status).length,
]));
const exactAgreement = rows.filter((row) => row.claude.score === row.agy.score).length;
const verdictNormalizations = rows.flatMap((row) => ["claude", "agy"].flatMap((backend) => {
  const review = row[backend];
  if (review.rawVerdict === review.verdict) return [];
  return [{ id: row.id, backend, rawVerdict: review.rawVerdict, normalizedVerdict: review.verdict }];
}));
const contextChecks = [
  {
    id: "TH-074",
    result: "คงไว้",
    note: "ตัวอักษร ‘ส’ เป็น marker ย่อบนบัตรสาขาสังคมศาสตร์และสหวิทยาการ ไม่ใช่ประโยคที่ขาดหาย จึงเป็นผลบวกลวงจากการตรวจข้อความนอกบริบท",
  },
  {
    id: "TH-149",
    result: "ควรแก้",
    note: "คำว่า ‘บทความที่ปรึกษา’ กำกวมจริง ควรใช้ ‘บทความเชิงรณรงค์หรือแสดงจุดยืน’ ให้ตรงกับ advocacy piece",
  },
  {
    id: "TH-825",
    result: "ควรแก้",
    note: "วลี ‘เมื่อวิธีกำหนด’ ไม่ครบความ ควรใช้ ‘ประเมินอย่างเป็นอิสระต่อกันตามที่ระเบียบวิธีกำหนด’",
  },
];

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

const csvHeaders = [
  "Index", "Original Thai", "Locations", "Claude score", "Claude verdict", "Claude raw verdict", "Claude issue", "Claude suggestion",
  "agy score", "agy verdict", "agy raw verdict", "agy issue", "agy suggestion", "Average", "Score difference", "Status",
];
const csv = [
  csvHeaders.map(csvCell).join(","),
  ...rows.map((row) => [
    row.id,
    row.text,
    row.locations.join("; "),
    row.claude.score,
    row.claude.verdict,
    row.claude.rawVerdict,
    row.claude.issue,
    row.claude.suggestion,
    row.agy.score,
    row.agy.verdict,
    row.agy.rawVerdict,
    row.agy.issue,
    row.agy.suggestion,
    row.average.toFixed(1),
    row.difference,
    row.status,
  ].map(csvCell).join(",")),
].join("\n");

function markdownCell(value) {
  return String(value)
    .replaceAll("|", "\\|")
    .replaceAll("\r", "")
    .replaceAll("\n", "<br>");
}

const report = `# รายงานตรวจสำนวนภาษาไทยด้วย Claude และ agy

วันที่ตรวจ: ${dateStamp}

## ขอบเขต

- ตรวจ string และ template literal ภาษาไทยใน \`app/**/*.ts\` และ \`app/**/*.tsx\` รวมทั้งข้อความบนสไลด์และ speaker notes ใน \`workshop/**/*.pptx\`
- แหล่งข้อมูลประกอบด้วยไฟล์ซอร์ส ${index.sourceCounts?.sourceFiles ?? "-"} ไฟล์ และ PowerPoint ${index.sourceCounts?.pptxFiles ?? "-"} ไฟล์
- จำนวนทั้งหมด ${rows.length.toLocaleString("th-TH")} รายการ กำหนดรหัสตั้งแต่ \`${rows[0].id}\` ถึง \`${rows.at(-1).id}\`
- Claude ตอบครบ ${claude.rows.length.toLocaleString("th-TH")} รายการ และ agy ตอบครบ ${agy.rows.length.toLocaleString("th-TH")} รายการ
- ข้อความที่ซ้ำกันถูกรวมเป็นรหัสเดียว แต่ยังเก็บตำแหน่งไฟล์ต้นทางทุกแห่งไว้ในตารางเต็ม
- รอบนี้เป็นการตรวจและจัดทำรายงานเท่านั้น ยังไม่ได้แก้ข้อความในเว็บไซต์

> [!NOTE]
> คะแนนเป็นความเห็นของผู้ตรวจภาษา AI และต้องอ่านร่วมกับบริบทการใช้งานจริง เช่น ข้อความสั้นอาจเป็นอักษรย่อบนไอคอน ไม่ใช่ประโยคที่ขาดหาย

คำตัดสิน PASS / REVISE / CRITICAL ในไฟล์ CSV ถูกปรับให้ตรงกับเกณฑ์คะแนนเดียวกัน โดยยังเก็บคำตัดสินดิบไว้ในคอลัมน์ถัดไป พบคำตัดสินดิบที่ไม่ตรงกับช่วงคะแนน ${verdictNormalizations.length} รายการ และไม่ได้เปลี่ยนคะแนน เหตุผล หรือข้อเสนอของผู้ตรวจ

## เกณฑ์คะแนน

| คะแนน | ความหมาย |
|---:|---|
| 5 | เป็นธรรมชาติ ชัดเจน เหมาะกับผู้ใช้ไทย ใช้ได้ทันที |
| 4 | ดีและเข้าใจง่าย มีเพียงจุดเล็กน้อยที่อาจปรับได้ |
| 3 | เข้าใจได้ แต่ยังแปลตรงตัว กำกวม ยาว หรือไม่ใช่สำนวนที่นิยม ควรแก้ |
| 2 | อ่านยากหรืออาจทำให้เข้าใจผิด ต้องแก้ |
| 1 | ผิดความหมายหรือใช้ไม่ได้ ต้องแก้เร่งด่วน |

## ภาพรวมคะแนน

| คะแนน | Claude | agy |
|---:|---:|---:|
${[5, 4, 3, 2, 1].map((score) => `| ${score} | ${scoreDistribution("claude")[score]} | ${scoreDistribution("agy")[score]} |`).join("\n")}

| สถานะรวม | จำนวน |
|---|---:|
| เร่งตรวจ — อย่างน้อยหนึ่งระบบให้ 1–2 | ${statusDistribution["เร่งตรวจ"]} |
| เห็นพ้องว่าควรแก้ — ทั้งสองระบบให้ 3 | ${statusDistribution["เห็นพ้องว่าควรแก้"]} |
| ควรทบทวน — ระบบหนึ่งให้ 3 และอีกระบบให้ 4–5 | ${statusDistribution["ควรทบทวน"]} |
| ผ่าน — ทั้งสองระบบให้ 4–5 | ${statusDistribution["ผ่าน"]} |

ทั้งสองระบบให้คะแนนตรงกันพอดี ${exactAgreement} จาก ${rows.length} รายการ (${(exactAgreement / rows.length * 100).toFixed(1)}%) ส่วนรายการที่คะแนนต่างกันไม่ควรถูกตัดสินด้วยค่าเฉลี่ยเพียงอย่างเดียว จึงแสดงเหตุผลและข้อเสนอของทั้งสองระบบไว้แยกกันด้านล่าง

## ตรวจบริบทรายการเร่งด่วนเบื้องต้น

| Index | ผลตรวจบริบท | ข้อสรุป |
|---|---|---|
${contextChecks.map((item) => `| ${item.id} | ${item.result} | ${markdownCell(item.note)} |`).join("\n")}

หลังอ่านบริบทจริง รายการเร่งด่วนที่ควรแก้มี 2 รายการ คือ \`TH-149\` และ \`TH-825\` ส่วน \`TH-074\` ควรคงไว้ตามเดิม

## ตารางรายการที่ควรพิจารณา

ตารางนี้รวม ${flaggedRows.length} รายการที่อย่างน้อยหนึ่งระบบให้คะแนนไม่เกิน 3 เรียงจากคะแนนต่ำสุดก่อน รายการที่ทั้งสองระบบให้ 4–5 อยู่ในไฟล์ CSV ฉบับเต็ม

| Index | ข้อความเดิม | ตำแหน่ง | Claude | ข้อสังเกต / ข้อเสนอ Claude | agy | ข้อสังเกต / ข้อเสนอ agy | เฉลี่ย | สถานะ |
|---|---|---|---:|---|---:|---|---:|---|
${flaggedRows.map((row) => `| ${row.id} | ${markdownCell(row.text)} | ${markdownCell(row.locations.join("<br>"))} | ${row.claude.score} | ${markdownCell(`${row.claude.issue}${row.claude.suggestion === "-" ? "" : ` → ${row.claude.suggestion}`}`)} | ${row.agy.score} | ${markdownCell(`${row.agy.issue}${row.agy.suggestion === "-" ? "" : ` → ${row.agy.suggestion}`}`)} | ${row.average.toFixed(1)} | ${row.status} |`).join("\n")}

## วิธีใช้อ้างอิง

แจ้งรหัสได้โดยตรง เช่น “แก้ \`TH-149\` ตามข้อเสนอ agy” หรือ “ขอดูบริบทของ \`TH-825\` ก่อนแก้” รหัสเดียวกันถูกใช้ในรายงานนี้และไฟล์ CSV ฉบับเต็ม
`;

await mkdir(auditRoot, { recursive: true });
await writeFile(path.join(auditRoot, `thai-language-audit-${dateStamp}.md`), `${report}\n`, "utf8");
await writeFile(path.join(auditRoot, `thai-language-audit-full-${dateStamp}.csv`), `${csv}\n`, "utf8");
await writeFile(path.join(auditRoot, `thai-language-audit-summary-${dateStamp}.json`), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  total: rows.length,
  complete: claude.rows.length === rows.length && agy.rows.length === rows.length,
  scoreDistribution: { claude: scoreDistribution("claude"), agy: scoreDistribution("agy") },
  statusDistribution,
  exactAgreement,
  verdictNormalizations,
  flaggedIds: flaggedRows.map((row) => row.id),
}, null, 2)}\n`, "utf8");

process.stdout.write(JSON.stringify({
  total: rows.length,
  flagged: flaggedRows.length,
  scoreDistribution: { claude: scoreDistribution("claude"), agy: scoreDistribution("agy") },
  statusDistribution,
  exactAgreement,
}, null, 2));
