import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const dateStamp = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const artifactRoot = path.join(projectRoot, ".omx/artifacts");
const resultRoot = path.join(artifactRoot, `thai-copy-advisor-results-${dateStamp}`);

const index = JSON.parse(await readFile(path.join(artifactRoot, `thai-copy-index-${dateStamp}.json`), "utf8"));
const claude = JSON.parse(await readFile(path.join(resultRoot, "claude-combined.json"), "utf8"));
const agy = JSON.parse(await readFile(path.join(resultRoot, "agy-combined.json"), "utf8"));
const summary = JSON.parse(await readFile(path.join(projectRoot, `audits/thai-language-audit-summary-${dateStamp}.json`), "utf8"));

const expectedIds = index.records.map((record) => record.id);
const expectedIdSet = new Set(expectedIds);
if (expectedIds.length === 0 || expectedIdSet.size !== expectedIds.length) {
  throw new Error("Source index is empty or contains duplicate IDs");
}

function expectedVerdict(score) {
  if (score === 1) return "CRITICAL";
  if (score <= 3) return "REVISE";
  return "PASS";
}

const actualNormalizations = [];
for (const [backend, result] of [["claude", claude], ["agy", agy]]) {
  const ids = result.rows.map((row) => row.id);
  if (ids.length !== expectedIds.length || new Set(ids).size !== ids.length) {
    throw new Error(`${backend} has a missing or duplicate result`);
  }
  if (expectedIds.some((id) => !ids.includes(id))) {
    throw new Error(`${backend} does not cover every source ID`);
  }
  for (const row of result.rows) {
    if (!expectedIdSet.has(row.id)) throw new Error(`${backend} returned unknown ID ${row.id}`);
    if (!Number.isInteger(row.score) || row.score < 1 || row.score > 5) {
      throw new Error(`${backend} returned an invalid score for ${row.id}`);
    }
    const normalizedVerdict = expectedVerdict(row.score);
    if (row.verdict !== normalizedVerdict) {
      actualNormalizations.push({
        id: row.id,
        backend,
        rawVerdict: row.verdict,
        normalizedVerdict,
      });
    }
  }
}

if (!summary.complete || summary.total !== expectedIds.length) {
  throw new Error("Audit summary is incomplete or has the wrong total");
}
if (JSON.stringify(summary.verdictNormalizations) !== JSON.stringify(actualNormalizations)) {
  throw new Error("Audit summary does not record verdict normalizations accurately");
}

process.stdout.write(`${JSON.stringify({
  source: expectedIds.length,
  claude: claude.rows.length,
  agy: agy.rows.length,
  flagged: summary.flaggedIds.length,
  verdictNormalizations: actualNormalizations,
}, null, 2)}\n`);
