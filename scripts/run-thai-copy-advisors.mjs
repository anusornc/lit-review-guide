import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const dateStamp = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const indexPath = path.join(projectRoot, ".omx/artifacts", `thai-copy-index-${dateStamp}.json`);
const outputRoot = path.join(projectRoot, ".omx/artifacts", `thai-copy-advisor-results-${dateStamp}`);
const chunkLimit = 90;
const concurrency = 4;

const index = JSON.parse(await readFile(indexPath, "utf8"));
const recordLimit = Number(process.env.THAI_AUDIT_LIMIT ?? 0);
const sourceRecords = recordLimit > 0 ? index.records.slice(0, recordLimit) : index.records;

await mkdir(outputRoot, { recursive: true });

async function readJsonIfExists(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

function buildPrompt(records, retry = false) {
  return `คุณเป็นบรรณาธิการภาษาไทยสำหรับเว็บไซต์คู่มือทำวิจัยระดับปริญญาโท ปริญญาเอก และนักวิจัย

ภารกิจ: ตรวจข้อความภาษาไทยทุกข้อด้านล่างว่าฟังเป็นภาษาไทยที่คนไทยใช้จริงหรือไม่ โดยคำนึงว่าบางข้อเป็นหัวเรื่อง ป้ายปุ่ม ข้อความสั้น ตาราง หรือแม่แบบ prompt อย่าหักคะแนนเพียงเพราะมีศัพท์วิชาการหรือคำอังกฤษในวงเล็บ หากใช้ได้เหมาะกับบริบท

เกณฑ์คะแนน:
5 = เป็นธรรมชาติ ชัดเจน เหมาะกับผู้ใช้ไทย ใช้ได้ทันที
4 = ดีและเข้าใจง่าย มีเพียงจุดเล็กน้อยที่ปรับได้แต่ไม่จำเป็น
3 = เข้าใจได้ แต่ยังมีกลิ่นแปลตรงตัว กำกวม ยาว หรือไม่ใช่สำนวนที่คนไทยนิยม ควรแก้
2 = อ่านยากหรืออาจทำให้เข้าใจผิด ต้องแก้
1 = ผิดความหมายหรือใช้ไม่ได้ ต้องแก้เร่งด่วน

verdict ต้องสอดคล้องกับคะแนน: 4-5=PASS, 2-3=REVISE, 1=CRITICAL

รูปแบบคำตอบบังคับ:
- ตอบหนึ่งบรรทัดต่อหนึ่ง ID และต้องครบทุก ID
- ใช้รูปแบบ ID|score|verdict|issue|suggestion
- ห้ามมีหัวตาราง ห้ามใช้ Markdown ห้ามมีข้อความเกริ่นหรือสรุป
- ห้ามใช้เครื่องหมาย | ภายในช่อง issue หรือ suggestion
- ถ้า PASS ให้ issue และ suggestion เป็น -
- ถ้าต้องแก้ ให้ issue อธิบายสั้นและเจาะจง ส่วน suggestion ให้เฉพาะข้อความหรือแนวแก้ที่เป็นธรรมชาติ ไม่ต้องเขียนเนื้อหายาวทั้งย่อหน้าใหม่
- ทุกช่องต้องอยู่ในบรรทัดเดียว
${retry ? "- นี่คือการส่งซ้ำเฉพาะรายการที่ผลครั้งก่อนขาดหาย โปรดตอบให้ครบทุก ID อย่างเคร่งครัด" : ""}

รายการข้อความ JSON:
${JSON.stringify(records.map(({ id, text }) => ({ id, text })))}
`;
}

function parseRows(raw, expectedRecords) {
  const expectedIds = new Set(expectedRecords.map((record) => record.id));
  const rows = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim().replace(/^[-*]\s*/, "");
    const match = trimmed.match(/^(TH-\d+)\s*\|\s*([1-5])\s*\|\s*(PASS|REVISE|CRITICAL)\s*\|\s*([^|]*)\|\s*(.*)$/i);
    if (!match || !expectedIds.has(match[1])) continue;
    rows.set(match[1], {
      id: match[1],
      score: Number(match[2]),
      verdict: match[3].toUpperCase(),
      issue: match[4].trim() || "-",
      suggestion: match[5].trim() || "-",
    });
  }
  return rows;
}

async function callAdvisor(backend, prompt) {
  const command = backend === "claude" ? "claude" : "agy";
  const args = backend === "claude"
    ? ["--print", "--effort", "high", "--output-format", "text", "--no-session-persistence", prompt]
    : ["--print-timeout", "10m", "--effort", "high", "--sandbox", "--print", prompt];
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: 12 * 60 * 1000,
  });
  return `${stdout}${stderr ? `\n[stderr]\n${stderr}` : ""}`;
}

async function reviewChunk(backend, chunk, chunkIndex) {
  const label = `${backend}-chunk-${String(chunkIndex + 1).padStart(2, "0")}`;
  const rawOutputs = [];
  let remaining = chunk;
  const parsed = new Map();

  for (let attempt = 0; attempt < 3 && remaining.length > 0; attempt += 1) {
    const prompt = buildPrompt(remaining, attempt > 0);
    const raw = await callAdvisor(backend, prompt);
    rawOutputs.push(`## Attempt ${attempt + 1}\n\n${raw}`);
    const attemptRows = parseRows(raw, remaining);
    for (const [id, row] of attemptRows) parsed.set(id, row);
    remaining = chunk.filter((record) => !parsed.has(record.id));
  }

  await writeFile(path.join(outputRoot, `${label}.raw.md`), `${rawOutputs.join("\n\n")}\n`, "utf8");
  await writeFile(path.join(outputRoot, `${label}.json`), `${JSON.stringify({
    backend,
    chunk: chunkIndex + 1,
    expected: chunk.length,
    received: parsed.size,
    missing: remaining.map((record) => record.id),
    rows: [...parsed.values()],
  }, null, 2)}\n`, "utf8");

  process.stdout.write(`${label}: ${parsed.size}/${chunk.length}${remaining.length ? ` missing ${remaining.length}` : ""}\n`);
  return { backend, chunkIndex, rows: parsed, missing: remaining.map((record) => record.id), rawOutputs };
}

const jobs = [];
const previousResults = new Map();
for (const backend of ["claude", "agy"]) {
  const previous = await readJsonIfExists(path.join(outputRoot, `${backend}-combined.json`), { rows: [] });
  const sourceIds = new Set(sourceRecords.map((record) => record.id));
  const previousRows = previous.rows.filter((row) => sourceIds.has(row.id));
  previousResults.set(backend, previousRows);
  const reviewedIds = new Set(previousRows.map((row) => row.id));
  const pendingRecords = sourceRecords.filter((record) => !reviewedIds.has(record.id));
  const chunkOffset = Math.ceil(previousRows.length / chunkLimit);
  for (let indexOffset = 0; indexOffset < pendingRecords.length; indexOffset += chunkLimit) {
    jobs.push({
      backend,
      chunk: pendingRecords.slice(indexOffset, indexOffset + chunkLimit),
      chunkIndex: chunkOffset + Math.floor(indexOffset / chunkLimit),
    });
  }
}

const results = [];
let nextJob = 0;
async function worker() {
  while (nextJob < jobs.length) {
    const job = jobs[nextJob];
    nextJob += 1;
    try {
      results.push(await reviewChunk(job.backend, job.chunk, job.chunkIndex));
    } catch (error) {
      process.stderr.write(`${job.backend}-chunk-${job.chunkIndex + 1} failed: ${error.message}\n`);
      results.push({ backend: job.backend, chunkIndex: job.chunkIndex, rows: new Map(), missing: job.chunk.map((record) => record.id), rawOutputs: [String(error)] });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const allMissing = [];
for (const backend of ["claude", "agy"]) {
  const backendResults = results.filter((result) => result.backend === backend).sort((a, b) => a.chunkIndex - b.chunkIndex);
  const rowsById = new Map(previousResults.get(backend).map((row) => [row.id, row]));
  for (const result of backendResults) {
    for (const [id, row] of result.rows) rowsById.set(id, row);
  }
  const rows = sourceRecords.flatMap((record) => rowsById.has(record.id) ? [rowsById.get(record.id)] : []);
  const missing = sourceRecords.filter((record) => !rowsById.has(record.id)).map((record) => record.id);
  allMissing.push(...missing);
  await writeFile(path.join(outputRoot, `${backend}-combined.json`), `${JSON.stringify({ backend, rows, missing }, null, 2)}\n`, "utf8");

  const artifactPath = path.join(projectRoot, ".omx/artifacts", `ask-${backend}-thai-copy-audit-${dateStamp}.md`);
  const previousArtifact = await readTextIfExists(artifactPath);
  const artifactHeader = previousArtifact || `# Thai copy audit by ${backend}\n\n## Original user task\n\nตรวจสอบภาษาไทยทั้งหมดในโครงการด้วย Claude และ agy เปรียบเทียบผลเป็นตาราง ให้คะแนน และใช้ index number อ้างอิง\n\n## Backend and final prompt\n\nBackend: ${backend}\n\nThe exact scoring prompt is generated by \`scripts/run-thai-copy-advisors.mjs\`; every indexed Thai string was included directly in one chunk prompt.\n`;
  const incrementalArtifact = backendResults.length === 0 ? "" : `\n\n## Incremental raw CLI output\n\n${backendResults.map((result) => result.rawOutputs.join("\n\n")).join("\n\n")}`;
  const artifact = `${artifactHeader}${incrementalArtifact}\n\n## Latest concise summary\n\nReceived ${rows.length} of ${sourceRecords.length} indexed reviews. Missing: ${missing.length ? missing.join(", ") : "none"}.\n\n## Action items / next steps\n\nMerge both advisor result sets, compare scores, rank revisions, and retain the original TH identifiers in the final report.\n`;
  await writeFile(artifactPath, artifact, "utf8");
}

process.stdout.write(`complete: ${jobs.length} jobs; missing rows: ${allMissing.length}\n`);
if (allMissing.length > 0) process.exitCode = 1;
