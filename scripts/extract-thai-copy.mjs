import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import ts from "typescript";

const projectRoot = process.cwd();
const appRoot = path.join(projectRoot, "app");
const workshopRoot = path.join(projectRoot, "workshop");
const outputPath = path.resolve(projectRoot, process.argv[2] ?? ".omx/artifacts/thai-copy-index.json");
const thaiPattern = /[\u0E00-\u0E7F]/;
const execFileAsync = promisify(execFile);

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectSourceFiles(absolutePath));
    if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) files.push(absolutePath);
  }
  return files.sort();
}

function literalText(node, sourceFile) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isTemplateExpression(node)) return node.getText(sourceFile).slice(1, -1);
  return null;
}

function addRecord(recordsByText, text, location) {
  const normalizedText = text.trim();
  if (!normalizedText || !thaiPattern.test(normalizedText)) return;
  const existing = recordsByText.get(normalizedText);
  if (existing) {
    if (!existing.locations.includes(location)) existing.locations.push(location);
  } else {
    recordsByText.set(normalizedText, { text: normalizedText, locations: [location] });
  }
}

function decodeXmlText(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 16)))
    .replace(/&#(\d+);/g, (_match, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 10)))
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function extractParagraphs(xml) {
  const paragraphs = [];
  for (const paragraphMatch of xml.matchAll(/<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g)) {
    let text = "";
    const content = paragraphMatch[1];
    const tokenPattern = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>|<a:br(?:\s[^>]*)?\s*\/>/g;
    for (const token of content.matchAll(tokenPattern)) {
      text += token[1] === undefined ? "\n" : decodeXmlText(token[1]);
    }
    if (text.trim()) paragraphs.push(text.trim());
  }
  return paragraphs;
}

function numberedXmlSort(left, right) {
  const leftNumber = Number.parseInt(left.match(/(\d+)\.xml$/)?.[1] ?? "0", 10);
  const rightNumber = Number.parseInt(right.match(/(\d+)\.xml$/)?.[1] ?? "0", 10);
  return leftNumber - rightNumber || left.localeCompare(right);
}

async function collectPptxFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await collectPptxFiles(absolutePath));
      if (entry.isFile() && entry.name.endsWith(".pptx")) files.push(absolutePath);
    }
    return files.sort();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function extractPptxRecords(absolutePath, recordsByText) {
  const relativePath = path.relative(projectRoot, absolutePath);
  const { stdout: listing } = await execFileAsync("unzip", ["-Z1", absolutePath], { maxBuffer: 10 * 1024 * 1024 });
  const entries = listing.split("\n").filter(Boolean);
  const slideEntries = entries.filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry)).sort(numberedXmlSort);
  const noteEntries = entries.filter((entry) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(entry)).sort(numberedXmlSort);

  for (const [kind, xmlEntries] of [["slide", slideEntries], ["notes", noteEntries]]) {
    for (const entry of xmlEntries) {
      const number = Number.parseInt(entry.match(/(\d+)\.xml$/)[1], 10);
      const { stdout: xml } = await execFileAsync("unzip", ["-p", absolutePath, entry], {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      for (const text of extractParagraphs(xml)) {
        addRecord(recordsByText, text, `${relativePath}#${kind}-${String(number).padStart(2, "0")}`);
      }
    }
  }
}

const recordsByText = new Map();
const sourceFiles = await collectSourceFiles(appRoot);

for (const absolutePath of sourceFiles) {
  const source = await readFile(absolutePath, "utf8");
  const relativePath = path.relative(projectRoot, absolutePath);
  const scriptKind = absolutePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(relativePath, source, ts.ScriptTarget.Latest, true, scriptKind);

  function visit(node) {
    const text = literalText(node, sourceFile)?.trim();
    if (text && thaiPattern.test(text)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      const location = `${relativePath}:${line + 1}:${character + 1}`;
      addRecord(recordsByText, text, location);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

const pptxFiles = await collectPptxFiles(workshopRoot);
for (const pptxFile of pptxFiles) await extractPptxRecords(pptxFile, recordsByText);

const records = [...recordsByText.values()].map((record, index) => ({
  id: `TH-${String(index + 1).padStart(3, "0")}`,
  ...record,
}));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  scope: "Unique Thai string and template literals in app/**/*.ts(x), plus Thai paragraphs in workshop/**/*.pptx slides and speaker notes",
  sourceCounts: {
    sourceFiles: sourceFiles.length,
    pptxFiles: pptxFiles.length,
  },
  itemCount: records.length,
  records,
}, null, 2)}\n`, "utf8");

process.stdout.write(`${outputPath}\n${records.length}\n`);
