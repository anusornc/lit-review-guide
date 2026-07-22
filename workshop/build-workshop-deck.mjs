import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { thaiContent } from "../app/i18n.ts";
import { mergedGuideContent } from "../app/guide-data.ts";
import { learningToolsContent } from "../app/research-tools.ts";
import { researchSources, methodSourceIds, workflowSourceIds } from "../app/research-sources.ts";
import { statDecisionTree, statRecommendations } from "../app/stat-test-data.ts";

const require = createRequire(import.meta.url);
const pptxgen = require("pptxgenjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, "LitWise-Literature-Review-Workshop-TH.pptx");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "LitWise";
pptx.company = "LitWise Literature Review Expert Guide";
pptx.subject = "เวิร์กชอปการทบทวนวรรณกรรมสำหรับนักศึกษาปริญญาโท ปริญญาเอก และนักวิจัย";
pptx.title = "LitWise: เวิร์กชอปการทบทวนวรรณกรรม";
pptx.lang = "th-TH";
pptx.theme = {
  headFontFace: "Tahoma",
  bodyFontFace: "Tahoma",
  lang: "th-TH",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const H = 7.5;
const C = {
  ink: "12211F",
  paper: "F2EFE6",
  white: "FBFAF5",
  teal: "0F6B63",
  tealSoft: "E0ECE9",
  amber: "C46A15",
  amberSoft: "F7E8D8",
  muted: "6A675E",
  rule: "C8C2B2",
  navy: "172A3A",
  slate: "DDE3E5",
  green: "2E7D62",
  red: "A84A3D",
  pink: "EFE0DD",
};

const base = thaiContent;
const merged = mergedGuideContent.th;
const learning = learningToolsContent.th;
const methods = [...base.methods, ...merged.extraMethods];
const disciplines = [...base.disciplines, merged.interdisciplinary];
const phases = merged.workflow.phases;
const allStats = Object.values(statRecommendations);
const tools = merged.toolkit.toolCategories.flatMap((category) => category.tools.map((tool) => ({ ...tool, category: category.title })));

let slideNumber = 0;

function shadow() {
  return { type: "outer", color: "000000", blur: 2, angle: 45, offset: 1, opacity: 0.08 };
}

function addNotes(slide, text) {
  slide.addNotes(text.replace(/\n{3,}/g, "\n\n"));
}

function addFooter(slide, dark = false) {
  slide.addText("LitWise · เวิร์กชอปการทบทวนวรรณกรรม", {
    x: 0.52, y: 7.17, w: 4.6, h: 0.17, margin: 0,
    fontFace: "Tahoma", fontSize: 8.5, color: dark ? "AFC5C2" : C.muted,
  });
  slide.addText(String(slideNumber).padStart(2, "0"), {
    x: 12.23, y: 7.12, w: 0.55, h: 0.22, margin: 0,
    fontFace: "Tahoma", fontSize: 9, bold: true, align: "right", color: dark ? "AFC5C2" : C.teal,
  });
}

function newSlide({ dark = false, module = "WORKSHOP", noFooter = false } = {}) {
  const slide = pptx.addSlide();
  slideNumber += 1;
  slide.background = { color: dark ? C.ink : C.paper };
  const moduleLabel = module
    .replace("ORIENTATION", "เริ่มต้น")
    .replace("WORKSHOP", "เวิร์กชอป")
    .replace("REFERENCES", "อ้างอิง")
    .replace("CLOSING", "สรุป")
    .replace("MODULE", "โมดูล");
  slide.addText(`LW · ${moduleLabel}`, {
    x: 0.52, y: 0.28, w: 2.7, h: 0.22, margin: 0,
    fontFace: "Tahoma", fontSize: 9, bold: true, charSpacing: 1.2,
    color: dark ? "BFD5D1" : C.teal,
  });
  if (!noFooter) addFooter(slide, dark);
  return slide;
}

function addTitle(slide, title, subtitle = "", { dark = false, size = 31 } = {}) {
  slide.addText(title, {
    x: 0.52, y: 0.69, w: 12.15, h: 0.58, margin: 0,
    fontFace: "Tahoma", fontSize: size, bold: true,
    color: dark ? C.white : C.ink, breakLine: false, fit: "shrink",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.54, y: 1.33, w: 11.9, h: 0.42, margin: 0,
      fontFace: "Tahoma", fontSize: 15.5, color: dark ? "BFD0D6" : C.muted,
      fit: "shrink",
    });
  }
}

function addSourceIds(slide, ids) {
  const unique = [...new Set(ids)];
  const shortOwner = {
    "American Journal of Epidemiology": "AJE",
    "BMC Medical Research Methodology": "BMC MRM",
    "Cochrane Rapid Reviews Methods Group": "Cochrane Rapid Reviews",
    "Health Information & Libraries Journal": "HILJ",
    "International Review of Social Psychology": "IRSP",
    "Journal of Advanced Nursing": "JAN",
    "Journal of Business Research": "JBR",
    "Penn State Eberly College of Science": "Penn State",
  };
  const byOwner = new Map();
  unique.forEach((id) => {
    const source = researchSources[id];
    if (!byOwner.has(source.owner)) byOwner.set(source.owner, source);
  });
  const runs = [{ text: "อ้างอิง: ", options: { bold: true } }];
  [...byOwner.entries()].forEach(([owner, source], index) => {
    if (index > 0) runs.push({ text: " · ", options: {} });
    runs.push({
      text: shortOwner[owner] ?? owner,
      options: { hyperlink: { url: source.href }, color: C.teal },
    });
  });
  slide.addText(runs, {
    x: 0.54, y: 6.88, w: 11.65, h: 0.22, margin: 0,
    fontFace: "Tahoma", fontSize: 8.5, color: C.muted, fit: "shrink",
  });
}

function addPill(slide, text, x, y, w, color = C.teal, fill = C.tealSoft) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34, rectRadius: 0.08,
    fill: { color: fill }, line: { color: fill },
  });
  slide.addText(text, {
    x: x + 0.08, y: y + 0.04, w: w - 0.16, h: 0.2, margin: 0,
    fontFace: "Tahoma", fontSize: 9, bold: true, align: "center", color, fit: "shrink",
  });
}

function addCard(slide, { x, y, w, h, title, body = "", index = "", accent = C.teal, fill = C.white, titleSize = 17, bodySize = 12.5, dark = false }) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fill }, line: { color: dark ? "35505A" : C.rule, width: 0.8 },
    shadow: shadow(),
  });
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 0.07, h,
    fill: { color: accent }, line: { color: accent },
  });
  if (index) {
    slide.addText(index, {
      x: x + 0.18, y: y + 0.14, w: 0.55, h: 0.24, margin: 0,
      fontFace: "Tahoma", fontSize: 10, bold: true, color: accent,
    });
  }
  const tx = x + 0.2 + (index ? 0.58 : 0);
  slide.addText(title, {
    x: tx, y: y + 0.13, w: w - (tx - x) - 0.18, h: 0.42, margin: 0,
    fontFace: "Tahoma", fontSize: titleSize, bold: true, color: dark ? C.white : C.ink, fit: "shrink",
  });
  if (body) {
    slide.addText(body, {
      x: x + 0.2, y: y + 0.62, w: w - 0.4, h: h - 0.76, margin: 0,
      fontFace: "Tahoma", fontSize: bodySize, color: dark ? "D7E1E3" : C.muted,
      valign: "top", breakLine: false, fit: "shrink",
    });
  }
}

function cardGridSlide({ title, subtitle, items, cols = 3, module, sourceIds = [], notes = "", bodySize = 12.5, titleSize = 16, dark = false }) {
  const slide = newSlide({ module, dark });
  addTitle(slide, title, subtitle, { dark });
  const gap = 0.18;
  const x0 = 0.54;
  const y0 = 1.92;
  const totalW = 12.23;
  const rows = Math.ceil(items.length / cols);
  const cardW = (totalW - gap * (cols - 1)) / cols;
  const usableH = sourceIds.length ? 4.72 : 5.08;
  const cardH = (usableH - gap * (rows - 1)) / rows;
  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    addCard(slide, {
      x: x0 + col * (cardW + gap), y: y0 + row * (cardH + gap), w: cardW, h: cardH,
      title: item.title, body: item.body, index: item.index ?? String(index + 1).padStart(2, "0"),
      accent: item.accent ?? (index % 2 ? C.amber : C.teal), fill: dark ? C.navy : C.white,
      bodySize, titleSize, dark,
    });
  });
  if (sourceIds.length) addSourceIds(slide, sourceIds);
  if (notes) addNotes(slide, notes);
  return slide;
}

function sectionSlide(number, title, promise, timing, { moduleLabel = `โมดูล ${number}`, badge = String(number).padStart(2, "0") } = {}) {
  const slide = newSlide({ dark: true, module: moduleLabel });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 8.75, y: 0.8, w: 3.45, h: 3.45,
    fill: { color: C.teal, transparency: 10 }, line: { color: C.tealSoft, transparency: 65, width: 2 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10.47, y: 3.72, w: 1.55, h: 1.55,
    fill: { color: C.amber }, line: { color: C.amber },
  });
  slide.addText(badge, {
    x: 9.03, y: 1.42, w: 2.86, h: 1.05, margin: 0,
    fontFace: "Tahoma", fontSize: 64, bold: true, align: "center", color: C.white,
  });
  slide.addText(title, {
    x: 0.75, y: 1.65, w: 7.4, h: 1.08, margin: 0,
    fontFace: "Tahoma", fontSize: 39, bold: true, color: C.white, fit: "shrink",
  });
  slide.addText(promise, {
    x: 0.78, y: 3.05, w: 6.9, h: 1.2, margin: 0,
    fontFace: "Tahoma", fontSize: 19, color: "C7D5D8", fit: "shrink",
  });
  addPill(slide, timing, 0.78, 4.75, 2.6, C.amber, "4A3421");
  addNotes(slide, `ใช้สไลด์นี้เปิดช่วงใหม่\nเวลาที่แนะนำ: ${timing}\nเป้าหมายของช่วง: ${promise}`);
  return slide;
}

function activitySlide({ number, title, time, task, steps, output, debrief, module }) {
  const slide = newSlide({ module });
  addTitle(slide, title, `กิจกรรมเวิร์กชอป · ${time}`);
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.62, y: 2.05, w: 1.55, h: 1.55,
    fill: { color: C.amber }, line: { color: C.amber },
  });
  slide.addText(number, {
    x: 0.75, y: 2.47, w: 1.28, h: 0.52, margin: 0,
    fontFace: "Tahoma", fontSize: 30, bold: true, align: "center", color: C.white,
  });
  addCard(slide, { x: 2.45, y: 1.95, w: 4.45, h: 2.1, title: "โจทย์", body: task, accent: C.amber, titleSize: 19, bodySize: 16 });
  addCard(slide, { x: 7.12, y: 1.95, w: 5.55, h: 2.1, title: "ขั้นตอน", body: steps.map((step, i) => `${i + 1}. ${step}`).join("\n"), accent: C.teal, titleSize: 19, bodySize: 15 });
  addCard(slide, { x: 2.45, y: 4.28, w: 4.45, h: 1.75, title: "ชิ้นงานที่ต้องได้", body: output, accent: C.green, titleSize: 17, bodySize: 15 });
  addCard(slide, { x: 7.12, y: 4.28, w: 5.55, h: 1.75, title: "คำถามสำหรับถอดบทเรียน", body: debrief, accent: C.red, titleSize: 17, bodySize: 15 });
  addNotes(slide, `เวลารวม ${time}\n\nคำชี้แจงผู้สอน:\n${task}\n\nขั้นตอน:\n${steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}\n\nถอดบทเรียน:\n${debrief}`);
  return slide;
}

function processSlide({ title, subtitle, items, module, sourceIds = [], notes = "" }) {
  const slide = newSlide({ module });
  addTitle(slide, title, subtitle);
  const startX = 0.63;
  const gap = 0.12;
  const itemW = (12.05 - gap * (items.length - 1)) / items.length;
  items.forEach((item, index) => {
    const x = startX + index * (itemW + gap);
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.15, w: itemW, h: 3.6, rectRadius: 0.08,
      fill: { color: index % 2 ? C.white : C.tealSoft }, line: { color: index % 2 ? C.rule : "B9D3CE" },
    });
    slide.addText(String(index + 1).padStart(2, "0"), {
      x: x + 0.18, y: 2.35, w: itemW - 0.36, h: 0.38, margin: 0,
      fontFace: "Tahoma", fontSize: 19, bold: true, color: index % 2 ? C.amber : C.teal,
    });
    slide.addText(item.title, {
      x: x + 0.18, y: 2.91, w: itemW - 0.36, h: 0.65, margin: 0,
      fontFace: "Tahoma", fontSize: 17, bold: true, color: C.ink, fit: "shrink",
    });
    slide.addText(item.body, {
      x: x + 0.18, y: 3.75, w: itemW - 0.36, h: 1.55, margin: 0,
      fontFace: "Tahoma", fontSize: 12.5, color: C.muted, valign: "top", fit: "shrink",
    });
  });
  if (sourceIds.length) addSourceIds(slide, sourceIds);
  if (notes) addNotes(slide, notes);
  return slide;
}

function methodNotes(items) {
  return items.map((method) => [
    method.name,
    `สรุป: ${method.summary}`,
    `เหมาะเมื่อ: ${method.bestFor}`,
    `ไม่ควรเลือกเมื่อ: ${method.avoidWhen}`,
    `ผลผลิต: ${method.output}`,
    `ระยะเวลา: ${method.time}`,
  ].join("\n")).join("\n\n");
}

function disciplineNotes(items) {
  return items.map((item) => [
    item.name,
    `คำถามที่พบบ่อย: ${item.questions}`,
    `แหล่งค้น: ${item.sources}`,
    `วิธีที่มักใช้: ${item.methods.join(", ")}`,
    `ข้อควรระวัง: ${item.caution}`,
  ].join("\n")).join("\n\n");
}

// 01 — Cover
{
  const slide = newSlide({ dark: true, module: "ปริญญาโท · ปริญญาเอก · นักวิจัย", noFooter: true });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: H, fill: { color: C.amber }, line: { color: C.amber } });
  slide.addText("LITWISE", {
    x: 0.75, y: 0.7, w: 2.7, h: 0.4, margin: 0,
    fontFace: "Tahoma", fontSize: 16, bold: true, charSpacing: 3, color: "BFD5D1",
  });
  slide.addText("ออกแบบการทบทวน\nวรรณกรรมให้ตัดสินใจได้", {
    x: 0.75, y: 1.5, w: 7.9, h: 2.25, margin: 0,
    fontFace: "Tahoma", fontSize: 44, bold: true, color: C.white, breakLine: false, fit: "shrink",
  });
  slide.addText("เวิร์กชอปการทบทวนวรรณกรรมสำหรับนักวิจัย", {
    x: 0.8, y: 4.05, w: 6.8, h: 0.45, margin: 0,
    fontFace: "Tahoma", fontSize: 22, color: "BFD0D6",
  });
  addPill(slide, "สำหรับนักศึกษาปริญญาโท · ปริญญาเอก · นักวิจัย", 0.8, 4.9, 5.4, C.amber, "4A3421");
  const nodes = [
    ["คำถาม", 9.1, 1.0, 1.25, C.teal], ["วิธี", 10.7, 1.75, 1.05, C.amber],
    ["ค้น", 9.15, 3.0, 1.0, C.green], ["คัดกรอง", 11.0, 3.65, 1.4, C.teal],
    ["สังเคราะห์", 9.25, 5.05, 1.55, C.amber],
  ];
  nodes.forEach(([label, x, y, w, color], i) => {
    if (i > 0) slide.addShape(pptx.ShapeType.line, { x: Number(x) - 0.65, y: Number(y) - 0.35, w: -0.2, h: -0.2, line: { color: "55706E", width: 2 } });
    slide.addShape(pptx.ShapeType.ellipse, { x, y, w, h: w, fill: { color }, line: { color: C.white, transparency: 65 } });
    slide.addText(label, { x, y: Number(y) + Number(w) / 2 - 0.12, w, h: 0.24, margin: 0, fontFace: "Tahoma", fontSize: 12, bold: true, align: "center", color: C.white, fit: "shrink" });
  });
  slide.addText("litwise.guide", { x: 10.05, y: 6.8, w: 2.25, h: 0.24, margin: 0, fontFace: "Tahoma", fontSize: 10, color: "AFC5C2", align: "right" });
  addNotes(slide, "เปิดด้วยคำถาม: ตอนนี้ผู้เข้าอบรมติดขัดที่สุดที่ขั้นใด—ตั้งคำถาม เลือกวิธี ค้น คัดกรอง หรือสังเคราะห์\n\nบอกผู้เรียนว่าสไลด์ชุดนี้แบ่งเป็นโมดูล สามารถใช้สอนเต็มวันหรือเลือกเฉพาะโมดูลได้");
}

// 02 — Sequence review
processSlide({
  title: "เส้นทางเรียนรู้: จากคำถามสู่ข้อสรุปที่ตรวจสอบได้",
  subtitle: "เริ่มต้น → เลือกวิธี → ดูบริบทสาขา → ลงมือทำ → ใช้เครื่องมือ → ตรวจคุณภาพ",
  module: "ORIENTATION",
  items: [
    { title: "เริ่มจากโจทย์", body: "ระบุว่าต้องการทำแผนที่ ประเมินผล เข้าใจประสบการณ์ หรืออธิบายความซับซ้อน" },
    { title: "เลือกวิธี", body: "ใช้เป้าหมาย ประเภทหลักฐาน สาขา และข้อจำกัดเพื่อหาวิธีเริ่มต้น" },
    { title: "เช็กบริบท", body: "ตรวจฐานข้อมูล มาตรฐาน และธรรมเนียมของแต่ละสาขา" },
    { title: "ลงมือทำทีละขั้น", body: "กำหนดขอบเขต → ค้น → คัดกรอง → ประเมิน → สกัดข้อมูล → เขียน" },
    { title: "ใช้เครื่องมือ", body: "สร้างคำถาม ฝึกคัดกรอง วาง PRISMA และจัดการงาน" },
    { title: "ตรวจคุณภาพ", body: "ทบทวนข้อผิดพลาด แหล่งอ้างอิง และขอบเขตของข้อสรุป" },
  ],
  notes: "อธิบายเหตุผลของเส้นทางเรียนรู้: เริ่มจากคำถามและการตัดสินใจที่งานต้องช่วยตอบ ก่อนเลือกวิธีและเครื่องมือ\n\nในการสอน ให้ใช้เครื่องมือช่วยวางกรอบคำถามก่อนเลือกวิธี และวางเรื่องสถิติหลังการออกแบบกับการสังเคราะห์ เพื่อไม่ให้ผู้เรียนเริ่มต้นจากชื่อสถิติ",
});

// 03 — Outcomes
cardGridSlide({
  title: "เมื่อจบเวิร์กชอป ผู้เรียนควรทำได้ 6 เรื่อง",
  subtitle: "เน้นการตัดสินใจที่ตรวจสอบได้ มากกว่าจำชื่อวิธีหรือชื่อโปรแกรม",
  module: "ORIENTATION",
  cols: 3,
  items: [
    { title: "ตั้งคำถาม", body: "เปลี่ยนหัวข้อกว้างให้เป็นคำถามที่ทบทวนได้" },
    { title: "เลือกวิธี", body: "อธิบายเหตุผลที่เลือกวิธีทบทวนและข้อแลกเปลี่ยน" },
    { title: "ออกแบบการค้น", body: "วางแนวคิด คำค้น ฐานข้อมูล และบันทึกการค้น" },
    { title: "คัดกรองและประเมิน", body: "ใช้เกณฑ์อย่างสม่ำเสมอและเลือกเครื่องมือประเมินให้ตรงกับแบบแผนการศึกษา" },
    { title: "สังเคราะห์ให้เหมาะกับข้อมูล", body: "เลือกวิธีสังเคราะห์ให้สอดคล้องกับคำถามและข้อมูล" },
    { title: "รายงานอย่างโปร่งใส", body: "ตรวจย้อนกลับได้ ใช้ PRISMA/มาตรฐานเฉพาะวิธี และไม่สรุปเกินหลักฐาน" },
  ],
  notes: "ให้ผู้เรียนเลือก 1 ผลลัพธ์ที่สำคัญที่สุดสำหรับตนเอง แล้วกลับมาตรวจตอนท้ายเวิร์กชอป",
});

// 04 — Modular agenda
cardGridSlide({
  title: "โครงสร้างแบบโมดูล: สอนได้ทั้งครึ่งวันและเต็มวัน",
  subtitle: "เวอร์ชันเต็มประมาณ 5.5–6 ชั่วโมง ไม่รวมช่วงพัก",
  module: "ORIENTATION",
  cols: 4,
  items: [
    { title: "1 · ตั้งต้น", body: "คำถาม เป้าหมาย หลักฐาน\n45 นาที" },
    { title: "2 · เลือกวิธี", body: "14 วิธีและข้อแลกเปลี่ยน\n55 นาที" },
    { title: "3 · สาขาวิชา", body: "ฐานข้อมูลและมาตรฐาน\n30 นาที" },
    { title: "4 · ขั้นตอนทำงาน", body: "6 ระยะพร้อมกิจกรรม\n100 นาที" },
    { title: "5 · เครื่องมือและ AI", body: "เครื่องมือ พรอมต์ และข้อกำกับ\n45 นาที" },
    { title: "6 · แผนลงมือทำ", body: "รายการตรวจสอบและแผน 30 วัน\n25 นาที" },
    { title: "ภาคเสริม · สถิติ", body: "แผนผังตัดสินใจ 14 เทคนิค\n45 นาที", index: "S" },
  ],
  bodySize: 14,
  notes: "ถ้าสอนครึ่งวัน: ใช้โมดูล 1, 2, ภาพรวมโมดูล 4 และแผนลงมือทำ\nสถิติอยู่ท้ายชุดในฐานะภาคเสริมสำหรับการวิเคราะห์ข้อมูลวิจัย ไม่ใช่ขั้นตอนหลักของการทบทวนวรรณกรรม",
});

// 05 — Baseline activity
activitySlide({
  number: "A0",
  title: "เช็กจุดเริ่มต้นของผู้เรียน",
  time: "8 นาที",
  module: "ORIENTATION",
  task: "เขียนหัวข้อวิจัยปัจจุบัน 1 ประโยค แล้ววงขั้นที่ยังไม่มั่นใจที่สุด",
  steps: ["เขียนหัวข้อหรือปัญหาที่กำลังศึกษา", "เลือกจุดติดขัด: คำถาม / วิธี / ค้น / คัดกรอง / สังเคราะห์", "จับคู่เล่าให้เพื่อนฟังคนละ 60 วินาที"],
  output: "หัวข้อ 1 ประโยค + จุดติดขัดหลัก 1 จุด",
  debrief: "ปัญหาของเราเกิดจากข้อมูลไม่พอ หรือเกิดจากยังไม่ตัดสินใจให้ชัด?",
});

sectionSlide(1, "ตั้งต้นให้ถูก", "เริ่มจากการตัดสินใจที่งานทบทวนต้องสนับสนุน แล้วจึงเลือกกรอบคำถามและขอบเขต", "45–55 นาที");

// 07 — What a review is
cardGridSlide({
  title: "การทบทวนวรรณกรรมไม่ใช่การสะสมบทความ แต่คือการออกแบบข้อสรุป",
  subtitle: "คุณภาพเกิดจากความสอดคล้องระหว่างคำถาม วิธีค้น วิธีคัดเลือก การประเมิน และการสังเคราะห์",
  module: "MODULE 1",
  cols: 3,
  items: [
    { title: "ข้อมูลนำเข้า", body: "หลักฐานที่มีขอบเขตและที่มาชัดเจน" },
    { title: "กระบวนการตัดสินใจ", body: "เกณฑ์และเหตุผลที่ผู้อื่นตรวจสอบหรือทำตามได้" },
    { title: "ผลลัพธ์", body: "ข้อสรุปที่บอกทั้งสิ่งที่รู้ สิ่งที่ยังไม่รู้ และระดับความมั่นใจ" },
  ],
  notes: "เน้นว่าการทบทวนเชิงบรรยายที่ดีทำได้ แต่ต้องเรียกชื่อและรายงานวิธีให้ตรงกับสิ่งที่ทำจริง ไม่ใช้คำว่า ‘อย่างเป็นระบบ’ เพียงเพราะค้นหลายฐานข้อมูล",
});

// 08 — Goals
cardGridSlide({
  title: "คำถามแรก: งานทบทวนนี้ต้องช่วยให้ตัดสินใจเรื่องใด?",
  subtitle: "เป้าหมายคือหลักยึดในการตัดสินใจ—ข้อมูลอื่นไม่ควรทำให้เจตนาหลักของงานเปลี่ยนไป",
  module: "MODULE 1",
  cols: 2,
  items: base.goals.map((goal) => ({ title: goal.title, body: goal.description, index: goal.index })),
  notes: base.goals.map((goal) => `${goal.title}: ${goal.description}`).join("\n"),
});

// 09 — Evidence types
cardGridSlide({
  title: "คำถามที่สอง: หลักฐานที่คาดว่าจะพบมีลักษณะใด?",
  subtitle: "ถ้ายังไม่แน่ใจ ให้ค้นเพื่อสำรวจภาพรวมก่อนตัดสินใจเลือกวิธี",
  module: "MODULE 1",
  cols: 3,
  items: base.evidenceTypes.map((item, index) => ({ title: item.title, body: item.description, index: String(index + 1).padStart(2, "0") })),
  notes: base.evidenceTypes.map((item) => `${item.title}: ${item.description}`).join("\n"),
});

// 10 — Commitments
cardGridSlide({
  title: "คำถามที่สาม: งานนี้ต้องไปไกลแค่ไหน?",
  subtitle: "เวลา ทีม และมาตรฐานการตีพิมพ์เปลี่ยนวิธีทำงาน แต่ไม่ควรถูกซ่อนไว้",
  module: "MODULE 1",
  cols: 3,
  items: merged.commitments.map((item, index) => ({ title: item.title, body: item.description, index: String(index + 1).padStart(2, "0") })),
  notes: "งานเร่งรัดต้องบอกขั้นตอนที่ลดลงและผลกระทบต่อความมั่นใจ\nงานวิทยานิพนธ์ควรโปร่งใสและมีเหตุผล แม้ไม่จำเป็นต้องเรียกงานว่าการทบทวนวรรณกรรมอย่างเป็นระบบ\nงานตีพิมพ์ควรมีโครงร่างการทบทวน ทีมผู้ทบทวน และมาตรฐานการรายงานที่ชัด",
});

// 11 — Frameworks
cardGridSlide({
  title: "เลือกกรอบคำถามให้ตรงกับสิ่งที่อยากรู้",
  subtitle: "กรอบคำถามช่วยจัดองค์ประกอบ แต่ไม่ได้แทนดุลยพินิจของแต่ละสาขา",
  module: "MODULE 1",
  cols: 3,
  sourceIds: ["jbi-manual"],
  items: learning.questionBuilder.frameworks.map((frame, index) => ({
    title: frame.name,
    body: `${frame.description}\n${frame.fields.map((field) => field[1]).join(" · ")}`,
    index: String(index + 1).padStart(2, "0"),
  })),
  notes: learning.questionBuilder.frameworks.map((frame) => `${frame.name} — ${frame.description}\nองค์ประกอบ: ${frame.fields.map((field) => field[1]).join(", ")}`).join("\n\n"),
});

// 12 — Question activity
activitySlide({
  number: "A1",
  title: "จากหัวข้อกว้าง → คำถามที่ทบทวนได้",
  time: "15 นาที",
  module: "MODULE 1",
  task: "เลือก PICO, PEO, SPIDER, SPICE หรือ PCC แล้วเขียนคำถามฉบับร่างจากหัวข้อของตนเอง",
  steps: ["ระบุการตัดสินใจที่คำถามต้องช่วย", "เลือกกรอบที่ตรงกับเจตนา", "กรอกองค์ประกอบเท่าที่รู้และทำเครื่องหมายจุดที่ยังไม่ชัด", "อ่านคำถามออกเสียงให้คู่ฟัง"],
  output: "คำถามฉบับร่าง 1 ข้อ + องค์ประกอบที่ต้องหาข้อมูลเพิ่ม",
  debrief: "คำใดทำให้ขอบเขตกว้างเกินไป? คำใดทำให้พลาดบริบทสำคัญ?",
});

// 13 — Worked example
{
  const slide = newSlide({ module: "MODULE 1" });
  addTitle(slide, "ตัวอย่าง: เปลี่ยน ‘AI กับการเรียน’ เป็นคำถามสำหรับทบทวนวรรณกรรม", "อย่ากระโดดไปหาคำค้นก่อนรู้ว่าจะตอบอะไร");
  addCard(slide, { x: 0.62, y: 2.0, w: 3.55, h: 3.75, title: "หัวข้อเดิม", body: "AI กับการเรียนของนักศึกษามหาวิทยาลัย\n\nปัญหา: ยังไม่รู้ว่าศึกษาใคร AI แบบใด เปรียบเทียบกับอะไร และวัดผลอะไร", accent: C.red, titleSize: 20, bodySize: 17 });
  slide.addShape(pptx.ShapeType.chevron, { x: 4.38, y: 3.33, w: 0.72, h: 0.75, fill: { color: C.amber }, line: { color: C.amber } });
  addCard(slide, { x: 5.3, y: 2.0, w: 7.38, h: 3.75, title: "คำถามแบบ PICO", body: "ในนักศึกษาปริญญาตรี (P) การใช้ระบบ AI ช่วยสอนที่ให้ feedback รายบุคคล (I) เมื่อเทียบกับการสอนปกติ (C) ส่งผลต่อผลสัมฤทธิ์ทางการเรียนและการมีส่วนร่วม (O) อย่างไร?\n\nผลที่ได้: สามารถกำหนดเกณฑ์คัดเลือก ประเภทการศึกษา และตัวชี้วัดได้", accent: C.green, titleSize: 20, bodySize: 17 });
  addSourceIds(slide, ["jbi-manual"]);
  addNotes(slide, "ชวนผู้เรียนสังเกตว่าคำว่า AI กว้างเกินไป ต้องระบุบทบาทของระบบและผลลัพธ์ที่สนใจ\nจากคำถามนี้ยังสามารถเลือกทำการทบทวนวรรณกรรมอย่างเป็นระบบ การทบทวนวรรณกรรมแบบกำหนดขอบเขต หรือการทบทวนวรรณกรรมแบบผสมผสานวิธีได้ ขึ้นกับสภาพหลักฐานและเป้าหมาย");
}

sectionSlide(2, "เลือกวิธีทบทวน", "รู้จักภูมิทัศน์ 14 วิธี แล้วเลือกจากเจตนา ชนิดหลักฐาน ความพร้อมของทีม และผลผลิตที่ต้องการ", "55–65 นาที");

// 15–16 — Fourteen methods
for (const [part, methodSlice] of [["A", methods.slice(0, 7)], ["B", methods.slice(7, 14)]]) {
  const ids = methodSlice.flatMap((method) => methodSourceIds[method.id]);
  cardGridSlide({
    title: `ภูมิทัศน์ 14 วิธีทบทวน · ${part}`,
    subtitle: "ชื่อวิธีควรสะท้อนสิ่งที่ทำจริง ไม่ใช่ใช้เพื่อทำให้งานดูเข้มข้นขึ้น",
    module: "MODULE 2",
    cols: 2,
    items: methodSlice.map((method) => ({
      title: method.name,
      body: `${method.summary}\nเวลา: ${method.time}`,
      index: String(methods.indexOf(method) + 1).padStart(2, "0"),
    })),
    bodySize: 11.5,
    titleSize: 15,
    sourceIds: [...new Set(ids)].slice(0, 5),
    notes: methodNotes(methodSlice),
  });
}

// 17 — Pathway
processSlide({
  title: "เส้นทางเลือกวิธี: ตอบ 5 คำถามก่อนเลือกชื่อวิธีทบทวน",
  subtitle: "ผลลัพธ์คือวิธีเริ่มต้น + ทางเลือก + ข้อแลกเปลี่ยน ไม่ใช่คำตอบอัตโนมัติ",
  module: "MODULE 2",
  items: [
    { title: "เป้าหมาย", body: "ทำแผนที่ / ประเมิน / ทำความเข้าใจ / อธิบาย" },
    { title: "สาขา", body: "ธรรมเนียม แหล่งข้อมูล และมาตรฐาน" },
    { title: "หลักฐาน", body: "ปริมาณ คุณภาพ ผสม เอกสาร หรือยังไม่แน่ใจ" },
    { title: "ความพร้อม", body: "เร่งด่วน วิทยานิพนธ์ หรือมุ่งตีพิมพ์" },
    { title: "ตรวจความเหมาะสม", body: "ผลผลิต ระยะเวลา สิ่งที่วิธีตอบได้ และสิ่งที่ตอบไม่ได้" },
  ],
  notes: "ใช้เว็บไซต์ LitWise ให้ผู้เรียนทดลองเส้นทางจริงหลังสไลด์นี้\nย้ำว่าเป้าหมายเป็นตัวกำกับหลัก ส่วนสาขา ลักษณะหลักฐาน และความพร้อมของโครงการช่วยปรับความเหมาะสม",
});

// 18 — Intent matching
cardGridSlide({
  title: "จับคู่จาก ‘เจตนา’ ก่อน แล้วค่อยตรวจรายละเอียด",
  subtitle: "หนึ่งโจทย์อาจมีหลายวิธีที่สมเหตุสมผล—ความแตกต่างอยู่ที่สิ่งที่ต้องการสรุป",
  module: "MODULE 2",
  cols: 2,
  items: [
    { title: "ทำแผนที่องค์ความรู้", body: "การทบทวนวรรณกรรมแบบกำหนดขอบเขต · การวิเคราะห์บรรณมิติ · การค้นและทบทวนวรรณกรรมอย่างเป็นระบบ" },
    { title: "ประเมินผลหรือความสัมพันธ์", body: "การทบทวนวรรณกรรมอย่างเป็นระบบ · การวิเคราะห์อภิมาน · การทบทวนงานทบทวนอย่างเป็นระบบ" },
    { title: "เข้าใจประสบการณ์", body: "การสังเคราะห์หลักฐานเชิงคุณภาพ · การสังเคราะห์แบบเมตาชาติพันธุ์วรรณนา · การสังเคราะห์เชิงประเด็น" },
    { title: "อธิบายความซับซ้อน", body: "การทบทวนเชิงสัจนิยม · การทบทวนวรรณกรรมแบบผสมผสานวิธี · การทบทวนวรรณกรรมเชิงบูรณาการ" },
  ],
  sourceIds: ["grant-booth", "jbi-manual"],
  notes: "การทบทวนแบบเร่งรัดเป็นข้อจำกัดด้านกระบวนการและเวลา ไม่ใช่เจตนาของคำถามโดยตัวมันเอง\nการทบทวนเชิงวิพากษ์เหมาะเมื่อเป้าหมายคือโต้แย้งและประเมินกรอบความคิด ไม่ใช่สรุปประสิทธิผล",
});

// 19 — Comparison dimensions
cardGridSlide({
  title: "ก่อนเลือกวิธี ให้เปรียบเทียบอย่างน้อย 6 มิติ",
  subtitle: "อย่าดูเพียงว่า ‘ทำเสร็จเร็วแค่ไหน’",
  module: "MODULE 2",
  cols: 3,
  items: [
    { title: "คำถามที่ตอบได้", body: "วิธีนี้รองรับข้อสรุปประเภทใด" },
    { title: "ขอบเขต", body: "กว้างเพื่อทำแผนที่ หรือแคบเพื่อประเมินผล" },
    { title: "ชนิดหลักฐาน", body: "แบบแผนและข้อมูลเข้ากันได้เพียงใด" },
    { title: "ความเข้มของกระบวนการ", body: "โครงร่าง ทีมผู้ทบทวน การค้น และการประเมินคุณภาพ" },
    { title: "ผลผลิต", body: "แผนที่ ประเด็น ทฤษฎี ค่าประมาณผล หรือข้อเสนอ" },
    { title: "เวลาและทีม", body: "ทรัพยากรที่มีจริงกับความคาดหวังของผลงาน" },
  ],
  notes: "ให้ผู้เรียนใช้ตารางเปรียบเทียบในเว็บไซต์ เลือกไม่เกิน 3 วิธี แล้วบันทึกเหตุผลที่ตัดแต่ละวิธีออก",
});

// 20 — Method activity
activitySlide({
  number: "A2",
  title: "บันทึกเหตุผลในการเลือกวิธี",
  time: "18 นาที",
  module: "MODULE 2",
  task: "เลือกวิธีเริ่มต้น 1 วิธีและทางเลือก 1 วิธีสำหรับคำถามของตนเอง พร้อมเขียนเหตุผลสั้น ๆ",
  steps: ["ระบุเจตนาและชนิดหลักฐาน", "เปรียบเทียบ 2–3 วิธี", "เขียนเหตุผลเลือกและเหตุผลไม่เลือก", "ให้คู่ถามคำถามท้าทาย 1 ข้อ"],
  output: "บันทึก 4 บรรทัด: เลือกอะไร / เพราะอะไร / ไม่ตอบอะไร / ทางเลือกคืออะไร",
  debrief: "ถ้าสภาพหลักฐานจริงไม่ตรงกับที่คาด คุณจะปรับคำถามหรือปรับวิธี?",
});

sectionSlide(3, "เจาะตามสาขาวิชา", "ฐานข้อมูล มาตรฐาน และข้อควรระวังต่างกัน แต่หลักความโปร่งใสและการตรวจย้อนกลับยังเหมือนกัน", "25–35 นาที");

// 22 — Discipline map
cardGridSlide({
  title: "9 กลุ่มสาขา = 9 จุดเริ่มค้นที่ต่างกัน",
  subtitle: "ฐานข้อมูลเฉพาะสาขาช่วยลดจุดที่อาจมองข้ามเมื่อใช้เฉพาะฐานข้อมูลสหสาขา",
  module: "MODULE 3",
  cols: 3,
  items: disciplines.map((item, index) => ({ title: item.name, body: `แหล่งค้นตั้งต้น: ${item.sources.split(", ").slice(0, 2).join(" · ")}`, index: item.marker || String(index + 1) })),
  bodySize: 13,
  titleSize: 16,
  notes: disciplineNotes(disciplines),
});

// 23–25 — Discipline details
for (let start = 0; start < disciplines.length; start += 3) {
  const slice = disciplines.slice(start, start + 3);
  cardGridSlide({
    title: `สาขาวิชาและจุดที่ต้องระวัง · ${Math.floor(start / 3) + 1}/3`,
    subtitle: "คำถามคล้ายกันอาจต้องใช้ฐานข้อมูลและมาตรฐานคนละชุด",
    module: "MODULE 3",
    cols: 3,
    items: slice.map((item) => ({
      title: item.name,
      body: `คำถาม: ${item.questions}\n\nระวัง: ${item.caution}`,
      index: item.marker,
    })),
    bodySize: 13.5,
    titleSize: 18,
    sourceIds: ["equator"],
    notes: disciplineNotes(slice),
  });
}

// 26 — Discipline activity
activitySlide({
  number: "A3",
  title: "วาดแผนที่แหล่งค้นของสาขาตนเอง",
  time: "12 นาที",
  module: "MODULE 3",
  task: "ระบุฐานข้อมูลหลัก 2 แห่ง ฐานเฉพาะสาขา 1 แห่ง และแหล่งวรรณกรรมสีเทา 1 แห่ง",
  steps: ["เริ่มจากกลุ่มสาขาใน LitWise", "เพิ่มแหล่งที่อาจารย์หรือบรรณารักษ์แนะนำ", "ระบุสิ่งที่แต่ละแหล่งครอบคลุมต่างกัน", "เลือกผู้เชี่ยวชาญที่จะช่วยตรวจกลยุทธ์การค้น"],
  output: "แผนที่แหล่งค้นอย่างน้อย 4 แหล่ง พร้อมเหตุผลเลือก",
  debrief: "ถ้าใช้ฐานข้อมูลเดียว งานประเภทใดหรือภูมิภาคใดมีโอกาสหายไป?",
});

sectionSlide(4, "ลงมือทำอย่างเป็นขั้นตอน", "ทำให้ทุกการตัดสินใจมีหลักฐาน มีบันทึก และย้อนกลับไปยังแหล่งเดิมได้", "90–110 นาที");

// 28 — Six phases
processSlide({
  title: "6 ระยะที่ต้องเชื่อมต่อกัน",
  subtitle: "แต่ละระยะมีผลผลิตและจุดตรวจสอบก่อนส่งงานต่อไปยังระยะถัดไป",
  module: "MODULE 4",
  items: phases.map((phase) => ({ title: phase.title, body: `${phase.purpose}\n\nผลผลิต: ${phase.outputs.join(" · ")}` })),
  sourceIds: ["jbi-manual", "cochrane-search", "prisma"],
  notes: phases.map((phase) => `${phase.title}\nเป้าหมาย: ${phase.purpose}\nผลผลิต: ${phase.outputs.join(", ")}\nจุดตรวจสอบ: ${phase.checkpoint}`).join("\n\n"),
});

// 29 — Scope
cardGridSlide({
  title: "01 · กำหนดขอบเขต",
  subtitle: phases[0].purpose,
  module: "MODULE 4",
  cols: 3,
  sourceIds: workflowSourceIds.scope,
  items: [
    { title: "เตรียม", body: "คำถามเบื้องต้น · ผู้ใช้ผลการทบทวน · ข้อจำกัดเวลาและทีม" },
    { title: "ตัดสินใจ", body: "กรอบคำถาม · เกณฑ์คัดเลือก · วิธีทบทวน · โครงร่างการทบทวน" },
    { title: "จุดตรวจสอบ", body: phases[0].checkpoint },
  ],
  notes: `ผลผลิตที่ควรได้: ${phases[0].outputs.join(", ")}\nอย่ากำหนดเกณฑ์คัดเลือกจากความสะดวกในการค้นเพียงอย่างเดียว`,
});

// 30 — Search
cardGridSlide({
  title: "02 · ค้น",
  subtitle: phases[1].purpose,
  module: "MODULE 4",
  cols: 3,
  sourceIds: workflowSourceIds.search,
  items: [
    { title: "ชุดแนวคิด", body: "แยกคำถามเป็นแนวคิดหลัก ไม่ใส่ทุกองค์ประกอบลงในคำค้นเสมอไป" },
    { title: "คำศัพท์", body: "คำพ้อง คำย่อ รูปสะกด ศัพท์ควบคุม และคำที่ต้องระวัง" },
    { title: "บันทึกการค้น", body: "ฐานข้อมูล แพลตฟอร์ม วันที่ คำค้น ตัวกรอง จำนวน และไฟล์ส่งออก" },
  ],
  notes: `ผลผลิต: ${phases[1].outputs.join(", ")}\nจุดตรวจสอบ: ${phases[1].checkpoint}\nใช้ PRISMA-S เป็นกรอบรายงานการค้น แต่ต้องปรับรูปแบบคำสั่งค้นให้ตรงกับแต่ละฐานข้อมูล`,
});

// 31 — Boolean
{
  const slide = newSlide({ module: "MODULE 4" });
  addTitle(slide, "สร้างคำค้นแบบบูลีนจากชุดแนวคิด", "OR รวมคำในแนวคิดเดียวกัน · AND เชื่อมแนวคิดต่างกัน · NOT ใช้อย่างระวัง");
  const blocks = [
    { title: "ประชากร", terms: "student* OR undergraduate* OR universit*", color: C.teal },
    { title: "แนวคิด", terms: "“AI tutor*” OR “intelligent tutoring” OR chatbot*", color: C.amber },
    { title: "ผลลัพธ์", terms: "learning OR achievement OR engagement", color: C.green },
  ];
  blocks.forEach((block, index) => {
    const x = 0.68 + index * 4.18;
    addCard(slide, { x, y: 2.05, w: 3.72, h: 2.1, title: block.title, body: block.terms, accent: block.color, titleSize: 20, bodySize: 17 });
    if (index < 2) addPill(slide, "AND", x + 3.79, 2.91, 0.6, C.white, C.ink);
  });
  slide.addShape(pptx.ShapeType.rect, { x: 1.1, y: 4.65, w: 11.1, h: 1.1, fill: { color: C.ink }, line: { color: C.ink } });
  slide.addText("(student* OR undergraduate*) AND (\"AI tutor*\" OR chatbot*) AND (learning OR engagement)", { x: 1.38, y: 4.98, w: 10.55, h: 0.43, margin: 0, fontFace: "Courier New", fontSize: 17, color: "D7ECE8", fit: "shrink" });
  addSourceIds(slide, ["cochrane-search", "prisma-s"]);
  addNotes(slide, "ชุดแนวคิดด้านผลลัพธ์อาจลดความครอบคลุมของการค้น (recall) และไม่จำเป็นเสมอไป จึงควรทดลองเปรียบเทียบผลค้น\nตรวจคำค้นกับบทความหลักที่รู้จักอยู่แล้ว (known-item testing)\nศัพท์ควบคุมต้องตรวจในคลังศัพท์ควบคุม (thesaurus) ของแต่ละฐานข้อมูล ไม่ควรให้ AI เดาแล้วนำไปใช้ทันที");
}

// 32 — Search activity
activitySlide({
  number: "A4",
  title: "สร้างและทดสอบชุดคำค้นฉบับแรก",
  time: "18 นาที",
  module: "MODULE 4",
  task: "แยกคำถามของตนเองเป็นชุดแนวคิด 2–3 ชุด แล้วสร้างคำค้นแบบบูลีนฉบับทดลอง",
  steps: ["เลือกแนวคิดหลัก 2–3 กลุ่ม", "เพิ่มคำพ้อง คำย่อ และรูปสะกด", "เชื่อม OR ภายในกลุ่ม และ AND ระหว่างกลุ่ม", "ระบุคำ/ศัพท์ควบคุมที่ต้องตรวจในฐานข้อมูลจริง"],
  output: "ตารางแนวคิด + คำค้นแบบบูลีน 1 ชุด + จุดที่ต้องทดลองค้น",
  debrief: "คำใดกว้างจนได้ผลลัพธ์ที่ไม่เกี่ยวข้องมากเกินไป และคำใดแคบจนเสี่ยงพลาดงานสำคัญ?",
});

// 33 — Screen
cardGridSlide({
  title: "03 · คัดกรอง",
  subtitle: phases[2].purpose,
  module: "MODULE 4",
  cols: 3,
  sourceIds: workflowSourceIds.screen,
  items: [
    { title: "ซักซ้อมเกณฑ์", body: "ทดลองกับตัวอย่างเดียวกันก่อนเริ่มจริง และปรับนิยามให้ตีความตรงกัน" },
    { title: "คัดกรองสองระยะ", body: "ชื่อเรื่อง/บทคัดย่อ → ฉบับเต็ม; หากไม่แน่ใจให้ส่งต่อ ไม่รีบตัดออก" },
    { title: "บันทึกเหตุผล", body: "เหตุผลที่ตัดออกในขั้นฉบับเต็มต้องสอดคล้องกับผัง PRISMA" },
  ],
  notes: `ผลผลิต: ${phases[2].outputs.join(", ")}\nจุดตรวจสอบ: ${phases[2].checkpoint}\nเกณฑ์ควรทดลองก่อนเห็นผลลัพธ์ทั้งหมด เพื่อลดการขยับเกณฑ์ตามสิ่งที่อยากได้`,
});

// 34 — Screening example
{
  const slide = newSlide({ module: "MODULE 4" });
  addTitle(slide, "ปรับความเข้าใจเกณฑ์คัดกรองให้ตรงกัน", "หลักสำคัญ: ความไม่แน่ใจไม่เท่ากับ ‘คัดออก’ ตัวอย่างนี้ใช้เกณฑ์งาน AI ช่วยสอนนักศึกษามหาวิทยาลัยตั้งแต่ปี 2020 และต้องรายงานผลผู้เรียน");
  const scenarios = learning.screening.scenarios.slice(0, 4);
  const labels = Object.fromEntries(learning.screening.options.map((option) => [option.id, option.label]));
  scenarios.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 0.62 + col * 6.12;
    const y = 1.96 + row * 2.26;
    addCard(slide, { x, y, w: 5.85, h: 2.02, title: item.title, body: `${item.abstract}\n\nคำตอบ: ${labels[item.expected]}`, index: String(index + 1).padStart(2, "0"), accent: item.expected === "include" ? C.green : item.expected === "exclude" ? C.red : C.amber, titleSize: 16, bodySize: 13.5 });
  });
  addSourceIds(slide, ["cochrane-search", "prisma-flow"]);
  addNotes(slide, learning.screening.scenarios.map((item) => `${item.title}\nคำตอบ: ${labels[item.expected]}\nเหตุผล: ${item.rationale}`).join("\n\n"));
}

// 35 — Appraise
cardGridSlide({
  title: "04 · ประเมินคุณภาพ",
  subtitle: phases[3].purpose,
  module: "MODULE 4",
  cols: 3,
  sourceIds: workflowSourceIds.appraise,
  items: [
    { title: "ถามให้ตรง", body: "เครื่องมือช่วยถามเรื่องคุณภาพ ความเสี่ยงอคติ หรือความเชื่อมั่น—ไม่ใช่สิ่งเดียวกัน" },
    { title: "ให้ตรงแบบแผน", body: "การทดลองแบบสุ่ม การศึกษาไม่สุ่ม งานเชิงคุณภาพ งานแบบผสม และการทบทวนวรรณกรรมอย่างเป็นระบบใช้คนละกรอบ" },
    { title: "เชื่อมกับข้อสรุป", body: "ผลประเมินต้องมีผลต่อการสังเคราะห์ การวิเคราะห์ความไว หรือระดับความมั่นใจ" },
  ],
  notes: `ผลผลิต: ${phases[3].outputs.join(", ")}\nจุดตรวจสอบ: ${phases[3].checkpoint}\nหลีกเลี่ยงการรวมคะแนนจากรายการตรวจสอบเป็นตัวเลขเดียวโดยไม่อธิบายความหมายของแต่ละด้านที่ประเมิน`,
});

// 36–37 — Appraisal matrix
for (const [part, rows] of [["1/2", merged.toolkit.appraisalRows.slice(0, 3)], ["2/2", merged.toolkit.appraisalRows.slice(3)]]) {
  const slide = newSlide({ module: "MODULE 4" });
  addTitle(slide, `เลือกเครื่องมือประเมินให้ตรงกับแบบแผนการศึกษา · ${part}`, "เริ่มจากคำถามที่ต้องการประเมิน ไม่ใช่เริ่มจากรายการตรวจสอบที่คุ้นเคย");
  slide.addTable([
    ["ประเภทหลักฐาน", "ประเด็นหลัก", "จุดเริ่มต้นของเครื่องมือ"],
    ...rows,
  ], {
    x: 0.62, y: 1.95, w: 12.08, h: 4.65,
    colW: [2.55, 5.85, 3.68],
    border: { pt: 0.7, color: C.rule },
    fill: C.white,
    color: C.ink,
    fontFace: "Tahoma", fontSize: 15,
    margin: 0.12,
    rowH: 1.02,
    bold: false,
    valign: "middle",
    autoFit: false,
  });
  addSourceIds(slide, ["cochrane-risk-bias", "jbi-manual", "equator"]);
  addNotes(slide, rows.map((row) => `${row[0]}\nพิจารณา: ${row[1]}\nเครื่องมือ: ${row[2]}`).join("\n\n"));
}

// 37 — Extract
cardGridSlide({
  title: "05 · สกัดข้อมูล",
  subtitle: phases[4].purpose,
  module: "MODULE 4",
  cols: 3,
  sourceIds: workflowSourceIds.extract,
  items: [
    { title: "ออกแบบจากแผนสังเคราะห์", body: "สกัดเฉพาะข้อมูลที่จำเป็นต่อคำถามและวิธีสังเคราะห์ที่วางไว้" },
    { title: "ทดลองใช้แบบฟอร์ม", body: "ทดลองกับงาน 3–5 ชิ้น แล้วปรับนิยามของแต่ละช่องก่อนใช้กับงานทั้งชุด" },
    { title: "เก็บที่มาของข้อมูล", body: "ทุกข้อค้นพบย้อนกลับไปยังบทความ หน้า ตาราง หรือข้อความต้นทางได้" },
  ],
  notes: `ผลผลิต: ${phases[4].outputs.join(", ")}\nจุดตรวจสอบ: ${phases[4].checkpoint}\nอย่าสกัดเฉพาะข้อสรุปของผู้เขียน ให้เก็บบริบท ประชากร วิธีวัด และข้อจำกัดที่จำเป็นต่อการแปลผล`,
});

// 38 — Synthesis
cardGridSlide({
  title: "การสังเคราะห์ต้องตอบคำถาม ไม่ใช่เพียงจัดตาราง",
  subtitle: "เลือกระดับการรวมข้อมูลตามความเข้ากันได้และเจตนาของงาน",
  module: "MODULE 4",
  cols: 2,
  sourceIds: ["cochrane-meta-analysis", "thomas-harden", "emerge", "rameses"],
  items: [
    { title: "เชิงปริมาณ", body: "การวิเคราะห์อภิมาน · ขนาดอิทธิพล · ความไม่เป็นเนื้อเดียวกัน · การวิเคราะห์ความไว" },
    { title: "เชิงคุณภาพ", body: "การสังเคราะห์เชิงประเด็น · การสังเคราะห์แบบเมตาชาติพันธุ์วรรณนา · การตีความระดับสูง" },
    { title: "เชิงอธิบาย", body: "การสังเคราะห์เชิงสัจนิยม · บริบท–กลไก–ผลลัพธ์" },
    { title: "แบบผสม", body: "รวมสายหลักฐานโดยอธิบายลำดับเวลา น้ำหนัก และวิธีผสานผล" },
  ],
  notes: "หากการศึกษาต่างกันมาก การไม่รวมเป็นค่าประมาณเดียวอาจเป็นการตัดสินใจที่มีคุณภาพกว่า\nการสังเคราะห์เชิงบรรยายต้องมีโครงสร้างและตรรกะ ไม่ใช่สรุปบทความทีละเรื่อง",
});

// 39 — Write
cardGridSlide({
  title: "06 · เขียนและรายงาน",
  subtitle: phases[5].purpose,
  module: "MODULE 4",
  cols: 3,
  sourceIds: workflowSourceIds.write,
  items: [
    { title: "รายงานกระบวนการ", body: "คำถาม โครงร่าง แหล่งค้น เกณฑ์ ผู้คัดกรอง การประเมิน และวิธีสังเคราะห์" },
    { title: "รายงานผล", body: "หลักฐานที่พบ รูปแบบ ความไม่แน่นอน ข้อจำกัด และผลที่ตรวจสอบได้" },
    { title: "ไม่สรุปเกินหลักฐาน", body: "แยกความสัมพันธ์ออกจากเหตุและผล และแยก ‘ไม่พบหลักฐาน’ ออกจาก ‘มีหลักฐานว่าไม่มีผล’" },
  ],
  notes: `ผลผลิต: ${phases[5].outputs.join(", ")}\nจุดตรวจสอบ: ${phases[5].checkpoint}\nใช้แนวทางการรายงานที่ตรงกับประเภทงานทบทวนและสาขา ไม่ใช้ PRISMA แทนระเบียบวิธีวิจัย`,
});

// 40 — PRISMA
processSlide({
  title: "ผัง PRISMA: ตัวเลขทุกขั้นต้องหักลบกันได้",
  subtitle: "ผังช่วยรายงานการไหลของรายการ (records) รายงาน (reports) และงานวิจัย (studies) แต่ไม่แทนวิธีวิจัย",
  module: "MODULE 4",
  items: [
    { title: "ค้นพบ", body: "รายการจากฐานข้อมูลและแหล่งอื่น" },
    { title: "นำออก", body: "รายการซ้ำ ระบบอัตโนมัติ และเหตุผลก่อนคัดกรอง" },
    { title: "คัดกรอง", body: "ชื่อเรื่องและบทคัดย่อ" },
    { title: "ขอฉบับเต็ม", body: "รายงานที่ขอฉบับเต็ม / รายงานที่ขอไม่ได้" },
    { title: "ประเมินฉบับเต็ม", body: "ตัดออกพร้อมเหตุผลและจำนวน" },
    { title: "คัดเข้า", body: "งานวิจัยหรือรายงานที่นำไปสังเคราะห์" },
  ],
  sourceIds: ["prisma", "prisma-flow"],
  notes: "คำว่า รายการ (record) รายงาน (report) และงานวิจัย (study) มีความหมายต่างกัน\nผลรวมเหตุผลที่ตัดออกในขั้นฉบับเต็มต้องตรงกับจำนวนรายงานฉบับเต็มที่ตัดออก\nใช้เครื่องมือวางแผนผัง PRISMA ใน LitWise เพื่อตรวจความสอดคล้องเบื้องต้น",
});

// 41 — Workflow activity
activitySlide({
  number: "A5",
  title: "สร้างผังขั้นตอนทำงานของโครงการ",
  time: "20 นาที",
  module: "MODULE 4",
  task: "เติมผลผลิตและจุดตรวจสอบของทั้ง 6 ระยะสำหรับโครงการของตนเอง",
  steps: ["เขียนผลผลิตที่ต้องมีในแต่ละระยะ", "ระบุผู้รับผิดชอบและเครื่องมือ", "กำหนดจุดตรวจสอบก่อนส่งงานต่อ", "วง 1 จุดเสี่ยงที่ต้องทดลองก่อน"],
  output: "ผังขั้นตอนทำงาน 6 ช่อง + จุดเสี่ยง 1 จุด + การทดลองลดความเสี่ยง",
  debrief: "ระยะใดมีการตัดสินใจที่ยังไม่มีหลักฐานหรือผู้รับผิดชอบชัดเจน?",
});

function addStatisticsSupplement() {
sectionSlide("S", "การเลือกสถิติสำหรับงานวิจัย", "ภาคเสริมสำหรับใช้หลังจากกำหนดคำถาม ออกแบบการวิจัย และทราบชนิดข้อมูลแล้ว", "40–50 นาที", { moduleLabel: "ภาคเสริม", badge: "S" });

// 43 — Stats position
{
  const slide = newSlide({ module: "ภาคเสริม" });
  addTitle(slide, "สถิติเป็นปลายทางของการออกแบบ ไม่ใช่จุดเริ่มต้น", "คำถามเดียวกันอาจใช้วิธีวิเคราะห์ต่างกันได้เมื่อโครงสร้างข้อมูลต่างกัน");
  const steps = ["คำถาม", "แบบแผน", "ตัวแปร", "โครงสร้างข้อมูล", "สมมติฐาน", "สถิติ", "การแปลผล"];
  steps.forEach((step, index) => {
    const x = 0.6 + index * 1.78;
    slide.addShape(pptx.ShapeType.chevron, { x, y: 2.65, w: 1.58, h: 1.25, fill: { color: index === 5 ? C.amber : index < 5 ? C.tealSoft : C.slate }, line: { color: index === 5 ? C.amber : C.rule } });
    slide.addText(step, { x: x + (index === 5 ? 0.4 : 0.13), y: 3.08, w: 1.18, h: 0.32, margin: 0, fontFace: "Tahoma", fontSize: 14, bold: true, align: "center", color: index === 5 ? C.white : C.ink, fit: "shrink" });
  });
  addCard(slide, { x: 2.2, y: 4.55, w: 8.92, h: 1.1, title: "คำเตือน", body: "แผนผังนี้ครอบคลุมสถิติพื้นฐาน ไม่แทนคำปรึกษาสำหรับแบบจำลองผสม ข้อมูลที่มีโครงสร้างเป็นกลุ่มหรือแบบติดตามระยะยาว การวิเคราะห์การรอดชีพ ข้อมูลจำนวนนับ ข้อมูลสูญหาย การอนุมานเชิงสาเหตุ หรือการสุ่มตัวอย่างที่ซับซ้อน", accent: C.red, titleSize: 16, bodySize: 14 });
  addSourceIds(slide, ["ucla-stat-choice"]);
  addNotes(slide, "ให้ผู้เรียนยกตัวอย่างว่าการวัดก่อน–หลังกับสองกลุ่มอิสระใช้สถิติต่างกัน แม้โจทย์จะพูดว่า ‘เปรียบเทียบ 2 กลุ่ม’ เหมือนกัน\nแผนผังตัดสินใจเป็นจุดเริ่มต้น ไม่ใช่ระบบที่เลือกคำตอบแทนนักวิจัย");
}

// 44 — Decision tree overview
processSlide({
  title: "แผนผังตัดสินใจเริ่มจากเจตนาของการวิเคราะห์",
  subtitle: statDecisionTree.root.question.th,
  module: "ภาคเสริม",
  items: statDecisionTree.root.options.map((option) => ({ title: option.th, body: option.hint?.th ?? "ตรวจประเภทตัวแปรและโครงสร้างกลุ่มต่อ" })),
  sourceIds: ["ucla-stat-choice", "r-stats", "scipy-stats"],
  notes: "สาธิตเครื่องมือเลือกสถิติใน LitWise แบบสด 2 เส้นทาง\nเส้นทางตัวอย่าง 1: เปรียบเทียบ → 2 กลุ่ม → อิสระ → เชิงปริมาณ → Welch t-test\nเส้นทางตัวอย่าง 2: พยากรณ์ → ผลลัพธ์ 2 ทาง → การถดถอยโลจิสติก",
});

// Fourteen statistics — keep each slide to four cards so the use cases remain
// readable when projected in a classroom.
for (const [label, slice] of [["1–4", allStats.slice(0, 4)], ["5–8", allStats.slice(4, 8)], ["9–11", allStats.slice(8, 11)], ["12–14", allStats.slice(11, 14)]]) {
  const sourceIds = slice.flatMap((item) => item.sourceIds);
  cardGridSlide({
    title: `สถิติพื้นฐาน 14 เทคนิค · ${label}`,
    subtitle: "อ่านข้อตกลงเบื้องต้นและข้อควรระวังในการแปลผลทุกครั้งก่อนเลือกคำสั่งในโปรแกรม",
    module: "ภาคเสริม",
    cols: 2,
    items: slice.map((item) => ({
      title: item.name.th,
      body: `ตัวอย่างคำถาม: ${item.exampleQuestion.th}`,
      index: String(item.id).padStart(2, "0"),
    })),
    bodySize: 15,
    titleSize: 17,
    sourceIds: [...new Set(sourceIds)].slice(0, 5),
    notes: slice.map((item) => `${String(item.id).padStart(2, "0")} ${item.name.th}\nใช้เมื่อ: ${item.useCase.th}\nตัวอย่างคำถาม: ${item.exampleQuestion.th}\nตรวจ: ${item.assumptions.th}\nข้อควรระวัง: ${item.caution?.th ?? "ตรวจการออกแบบและการแปลผลให้สอดคล้องกับคำถาม"}\nทางเลือก: ${item.alternative ? `${item.alternative.name} — ${item.alternative.reason.th}` : "ไม่มีทางเลือกอัตโนมัติ; ปรับแบบจำลองตามข้อมูล"}`).join("\n\n"),
  });
}

// 48 — Assumptions
cardGridSlide({
  title: "ก่อนอ่าน p-value ให้ตรวจ 6 เรื่อง",
  subtitle: "การตรวจข้อตกลงเบื้องต้นกำหนดความน่าเชื่อถือของข้อสรุป",
  module: "ภาคเสริม",
  cols: 3,
  items: [
    { title: "ความเป็นอิสระ", body: "หน่วยสังเกตเป็นอิสระ หรือมีการจับคู่หรือจัดกลุ่มที่ต้องสร้างแบบจำลอง" },
    { title: "ระดับการวัด", body: "ตัวแปรเป็นเชิงปริมาณ อันดับ กลุ่ม หรือผลลัพธ์สองทาง" },
    { title: "การแจกแจง", body: "ตรวจรูปแบบข้อมูลและเศษเหลือ ไม่ใช้การทดสอบการแจกแจงปกติเพียงอย่างเดียว" },
    { title: "ความแปรปรวน", body: "ตรวจความแปรปรวนและใช้ Welch เมื่อสมมติฐานว่าความแปรปรวนเท่ากันไม่สมเหตุสมผล" },
    { title: "รูปแบบความสัมพันธ์", body: "ตรวจว่าเป็นเชิงเส้น เพิ่มหรือลดทิศทางเดียว หรือสัมพันธ์กับลอจิตอย่างไร" },
    { title: "จำนวนตัวอย่าง", body: "พิจารณาจำนวนตัวอย่าง จำนวนเหตุการณ์ เซลล์ที่มีข้อมูลน้อย และความซับซ้อนของแบบจำลอง" },
  ],
  sourceIds: ["delacre-welch", "cochran-chi-square", "vittinghoff-epv"],
  bodySize: 13.5,
  titleSize: 16,
  notes: "ย้ำว่า Spearman เหมาะกับความสัมพันธ์ที่เพิ่มหรือลดไปในทิศทางเดียว ไม่ใช่ความสัมพันธ์ไม่เป็นเส้นตรงทุกแบบ\nMann–Whitney ไม่ได้เป็นการทดสอบมัธยฐานโดยอัตโนมัติ\nWilcoxon signed-rank ต้องการเงื่อนไขเรื่องความสมมาตรหากจะแปลผลในแง่มัธยฐาน",
});

// 49 — Software matrix
cardGridSlide({
  title: "โปรแกรมเป็นเพียงเครื่องมือ ไม่ใช่ระเบียบวิธีวิจัย",
  subtitle: "ชื่อเมนูและคำสั่งเปลี่ยนตามเวอร์ชัน ต้องตรวจคู่มือก่อนใช้กับข้อมูลจริง",
  module: "ภาคเสริม",
  cols: 3,
  items: [
    { title: "SPSS", body: "เหมาะกับการใช้เมนูและงานพื้นฐาน ควรตรวจตัวเลือกของ Welch การทดสอบแบบคำนวณค่าที่แน่นอน และการวินิจฉัยแบบจำลอง" },
    { title: "R", body: "โปร่งใส ทำซ้ำได้ และมีแพ็กเกจเฉพาะทาง ควรบันทึกรุ่นของโปรแกรมและสคริปต์" },
    { title: "Python", body: "SciPy และ statsmodels เหมาะกับขั้นตอนทำงานที่เชื่อมข้อมูลกับโค้ด ควรตรวจค่าตั้งต้นของคำสั่ง" },
    { title: "Jamovi", body: "ใช้เมนูได้ง่ายและรายงานได้เร็ว ควรตรวจโมดูลและเวอร์ชัน" },
    { title: "Stata", body: "เหมาะกับแบบจำลองและงานประยุกต์ ควรเก็บไฟล์คำสั่งเพื่อให้ทำซ้ำได้" },
    { title: "Excel", body: "เหมาะสำหรับสรุปเบื้องต้น แต่ไม่รองรับหลายแบบจำลองโดยตรง และตรวจสอบแบบจำลองได้จำกัด" },
  ],
  sourceIds: ["r-stats", "scipy-stats"],
  bodySize: 13,
  titleSize: 16,
  notes: "สาธิตว่าคำสั่ง independent t-test ใน Python ควรตั้งค่า equal_var=False หากตั้งใจใช้ Welch\nExcel ไม่มี one-sample t-test และ repeated-measures ANOVA โดยตรง จึงไม่ควรใช้สูตรหรือเมนูอื่นแทนโดยอัตโนมัติ",
});

// 50 — Stats activity
activitySlide({
  number: "A6",
  title: "เลือกสถิติพร้อมเหตุผล ไม่ใช่เลือกจากชื่อ",
  time: "15 นาที",
  module: "ภาคเสริม",
  task: "ใช้แผนผังตัดสินใจเลือกวิธีวิเคราะห์สำหรับกรณีตัวอย่าง 2 กรณี แล้วเขียนข้อตกลงเบื้องต้นที่ต้องตรวจ",
  steps: ["ระบุเจตนา: บรรยาย เปรียบเทียบ สัมพันธ์ หรือพยากรณ์", "ระบุชนิดตัวแปรและการจับคู่", "เลือกสถิติเริ่มต้น", "เขียนข้อตกลงเบื้องต้น 2 ข้อและข้อจำกัด 1 ข้อ"],
  output: "ชื่อวิธี + เหตุผล + ข้อตกลงเบื้องต้น + วิธีทางเลือกที่อาจใช้",
  debrief: "ยังขาดข้อมูลใด จึงยังตัดสินใจเลือกสถิติไม่ได้?",
});

}

sectionSlide(5, "เครื่องมือและ AI อย่างรับผิดชอบ", "เลือกเครื่องมือให้ตรงขั้นงาน เก็บที่มาของข้อมูล และใช้ AI เป็นเพียงร่างที่ต้องตรวจ ไม่ใช่ผู้ตัดสินความถูกต้อง", "40–50 นาที");

// 52–53 — Tools
for (const [label, slice] of [["A", tools.slice(0, 6)], ["B", tools.slice(6, 12)]]) {
  cardGridSlide({
    title: `เครื่องมือ 12 รายการตามงานที่ต้องทำ · ${label}`,
    subtitle: "เลือกจากความต้องการของทีม การตรวจย้อนกลับ ค่าใช้จ่าย และการส่งออกข้อมูล",
    module: "MODULE 5",
    cols: 3,
    items: slice.map((tool) => ({
      title: tool.name,
      body: `${tool.category}\n${tool.bestFor}`,
      index: String(tools.indexOf(tool) + 1).padStart(2, "0"),
    })),
    bodySize: 13,
    titleSize: 16,
    notes: slice.map((tool) => `${tool.name} (${tool.category})\nเหมาะกับ: ${tool.bestFor}\nระวัง: ${tool.watchFor}\nการเข้าถึง: ${tool.access}\nลิงก์: ${tool.links.map((link) => link.href).join(", ")}`).join("\n\n"),
  });
}

// 54 — Prompt anatomy
cardGridSlide({
  title: "พรอมต์ที่ตรวจสอบได้มี 4 ส่วน",
  subtitle: "เป้าหมายไม่ใช่ให้ AI ‘ตอบเก่ง’ แต่ให้ผลลัพธ์ตรวจง่ายและไม่แอบเติมหลักฐาน",
  module: "MODULE 5",
  cols: 2,
  items: merged.toolkit.aiLab.anatomy.map((item, index) => ({ title: item.label, body: item.description, index: String(index + 1).padStart(2, "0") })),
  bodySize: 15,
  titleSize: 18,
  notes: merged.toolkit.aiLab.anatomy.map((item, index) => `${index + 1}. ${item.label}: ${item.description}`).join("\n"),
});

// 55 — Prompt tasks
cardGridSlide({
  title: "5 งานที่ AI ช่วยร่างได้—แต่ผู้วิจัยต้องตรวจ",
  subtitle: "เลือกพรอมต์จากงานที่กำลังทำ ไม่ใช่ถามกว้าง ๆ ว่า ‘ช่วยทำการทบทวนวรรณกรรม’",
  module: "MODULE 5",
  cols: 3,
  items: merged.toolkit.aiLab.prompts.map((item, index) => ({ title: item.title, body: item.bestFor, index: String(index + 1).padStart(2, "0") })),
  bodySize: 13.5,
  titleSize: 16,
  notes: merged.toolkit.aiLab.prompts.map((item) => `${item.title}\nเหมาะกับ: ${item.bestFor}\n\nพรอมต์:\n${item.prompt}`).join("\n\n---\n\n"),
});

// 56 — Prompt example
{
  const prompt = merged.toolkit.aiLab.prompts[0];
  const slide = newSlide({ module: "MODULE 5" });
  addTitle(slide, "ตัวอย่างพรอมต์: ขยายคำค้นโดยไม่อ้างว่าเป็นศัพท์ควบคุม", prompt.bestFor);
  addCard(slide, { x: 0.62, y: 1.95, w: 3.85, h: 4.55, title: "บริบท", body: "หัวข้อ · สาขา/ประชากร/บริบท · คำถามหรือการตัดสินใจที่ต้องการหลักฐาน", accent: C.teal, titleSize: 19, bodySize: 16 });
  addCard(slide, { x: 4.68, y: 1.95, w: 3.85, h: 4.55, title: "ข้อกำหนดการใช้หลักฐาน", body: "อย่าเรียกคำใดว่าศัพท์ควบคุม หากยังไม่ได้ตรวจในคลังศัพท์ควบคุม\nแยกคำทั่วไปจากศัพท์ที่ต้องตรวจ\nชี้คำที่เสี่ยงดึงผลลัพธ์ไม่เกี่ยวข้อง", accent: C.red, titleSize: 19, bodySize: 15.5 });
  addCard(slide, { x: 8.74, y: 1.95, w: 3.94, h: 4.55, title: "รูปแบบคำตอบ", body: "ตาราง: แนวคิด | คำค้น | ศัพท์ควบคุมที่ต้องตรวจ | ความเสี่ยง\n\nตามด้วยร่างคำค้นแบบบูลีนสำหรับนำไปทดลอง", accent: C.amber, titleSize: 19, bodySize: 16 });
  addNotes(slide, prompt.prompt);
}

// 57 — AI guardrails
cardGridSlide({
  title: "ข้อกำกับการใช้ AI: 4 ข้อที่ไม่ควรต่อรอง",
  subtitle: "คำตอบจาก AI เป็นเพียงร่างที่ต้องตรวจ ไม่ใช่หลักฐานสำหรับนำไปอ้างอิง",
  module: "MODULE 5",
  cols: 2,
  items: merged.toolkit.aiLab.guardrails.map((item, index) => ({ title: `กติกา ${index + 1}`, body: item, index: String(index + 1).padStart(2, "0") })),
  notes: merged.toolkit.aiLab.guardrails.map((item, index) => `${index + 1}. ${item}`).join("\n"),
});

// 58 — Templates
cardGridSlide({
  title: "4 แม่แบบที่ควรสร้างตั้งแต่ต้นโครงการ",
  subtitle: "เอกสารเหล่านี้เปลี่ยนความโปร่งใสจากความตั้งใจให้เป็นหลักฐานการทำงาน",
  module: "MODULE 5",
  cols: 2,
  items: merged.toolkit.templates.map((item, index) => ({ title: item.name, body: `${item.purpose}\n\nช่องหลัก: ${item.content.split("\n").slice(0, 2).join(" · ")}`, index: String(index + 1).padStart(2, "0") })),
  notes: merged.toolkit.templates.map((item) => `${item.name}\n${item.purpose}\n\n${item.content}`).join("\n\n---\n\n"),
});

// 59 — Pitfalls
cardGridSlide({
  title: "6 ข้อผิดพลาดที่ทำให้งานดูเป็นระบบ แต่เชื่อถือไม่ได้",
  subtitle: "ใช้สไลด์นี้ทบทวนความเสี่ยงล่วงหน้าก่อนเริ่มเก็บข้อมูลจริง",
  module: "MODULE 5",
  cols: 3,
  items: merged.toolkit.pitfalls.map((item, index) => ({ title: item[0], body: item[1], index: String(index + 1).padStart(2, "0"), accent: C.red })),
  notes: merged.toolkit.pitfalls.map((item, index) => `${index + 1}. ${item[0]} — ${item[1]}`).join("\n"),
});

sectionSlide(6, "เปลี่ยนสิ่งที่เรียนให้เป็นแผนโครงการจริง", "ปิดช่องว่างด้วยรายการตรวจสอบ ระบุงาน 30 วันแรก และกำหนดหลักฐานว่าทำแต่ละขั้นเสร็จแล้ว", "20–30 นาที");

// 61–62 — Checklist
for (const [part, checklistItems] of [["1/2", learning.checklist.items.slice(0, 6)], ["2/2", learning.checklist.items.slice(6)]]) {
  cardGridSlide({
    title: `12 รายการตรวจสอบตั้งแต่คำถามถึงรายงาน · ${part}`,
    subtitle: "รายการนี้บันทึกในเบราว์เซอร์ของผู้ใช้และไม่ส่งข้อมูลขึ้นเซิร์ฟเวอร์",
    module: "MODULE 6",
    cols: 3,
    items: checklistItems.map((item) => ({ title: item.stage, body: item.label, index: String(learning.checklist.items.indexOf(item) + 1).padStart(2, "0") })),
    bodySize: 14,
    titleSize: 17,
    notes: checklistItems.map((item) => `${learning.checklist.items.indexOf(item) + 1}. [${item.stage}] ${item.label}`).join("\n"),
  });
}

// 62 — 30-day plan
processSlide({
  title: "แผน 30 วันแรก: ลดความเสี่ยงก่อนเพิ่มปริมาณงาน",
  subtitle: "เป้าหมายคือให้คำถาม วิธี เกณฑ์ และกลยุทธ์การค้นผ่านการทดลองก่อนเริ่มคัดกรองจริง",
  module: "MODULE 6",
  items: [
    { title: "สัปดาห์ 1", body: "ตั้งคำถาม · เลือกวิธี · เขียนบันทึกเหตุผล · นัดผู้ให้คำปรึกษา" },
    { title: "สัปดาห์ 2", body: "ร่างเกณฑ์ · เลือกฐานข้อมูล · สร้างตารางแนวคิด · หาบทความหลักตั้งต้น" },
    { title: "สัปดาห์ 3", body: "ทดลองคำค้น · ให้ผู้เชี่ยวชาญตรวจคำค้น · ส่งออกข้อมูล · ลบรายการซ้ำ" },
    { title: "สัปดาห์ 4", body: "ทดลองคัดกรอง · ทดลองสกัดข้อมูล · ปรับโครงร่างและบันทึกเหตุผล" },
  ],
  notes: "ให้ผู้เรียนใส่ชื่อผู้รับผิดชอบและวันส่งจริงในแต่ละสัปดาห์\nหากทำคนเดียว ให้กำหนดจุดขอข้อเสนอแนะจากอาจารย์ บรรณารักษ์ หรือเพื่อนวิจัย",
});

addStatisticsSupplement();

// 64–65 — References
{
  const refs = [
    ["JBI Manual for Evidence Synthesis", researchSources["jbi-manual"].href],
    ["Cochrane Handbook — Searching and selecting studies", researchSources["cochrane-search"].href],
    ["Cochrane Handbook — Risk of bias", researchSources["cochrane-risk-bias"].href],
    ["Cochrane Handbook — Meta-analysis", researchSources["cochrane-meta-analysis"].href],
    ["PRISMA 2020", researchSources.prisma.href],
    ["PRISMA-S", researchSources["prisma-s"].href],
    ["EQUATOR Reporting Guidelines", researchSources.equator.href],
    ["UCLA OARC Statistical Test Guide", researchSources["ucla-stat-choice"].href],
    ["R stats documentation", researchSources["r-stats"].href],
    ["SciPy statistical functions", researchSources["scipy-stats"].href],
  ];
  for (const [part, refSlice] of [["1/2", refs.slice(0, 5)], ["2/2", refs.slice(5)]]) {
    const slide = newSlide({ module: "REFERENCES" });
    addTitle(slide, `แหล่งอ้างอิงหลักของเวิร์กชอป · ${part}`, "เปิดอ่านต้นฉบับและตรวจให้ตรงกับสาขา วิธี และเวอร์ชันโปรแกรมที่ใช้");
    refSlice.forEach(([label, href], index) => {
      const originalIndex = refs.findIndex(([refLabel]) => refLabel === label);
      const y = 1.95 + index * 0.9;
      slide.addShape(pptx.ShapeType.rect, { x: 0.82, y, w: 11.65, h: 0.72, fill: { color: index % 2 ? C.white : C.tealSoft }, line: { color: C.rule } });
      slide.addText(String(originalIndex + 1).padStart(2, "0"), { x: 1.02, y: y + 0.2, w: 0.5, h: 0.27, margin: 0, fontFace: "Tahoma", fontSize: 12, bold: true, color: C.amber });
      slide.addText(label, { x: 1.68, y: y + 0.15, w: 10.2, h: 0.38, margin: 0, fontFace: "Tahoma", fontSize: 15.5, bold: true, color: C.teal, hyperlink: { url: href }, fit: "shrink" });
    });
    addNotes(slide, refSlice.map(([label, href]) => `${label}: ${href}`).join("\n"));
  }
}

// 64 — Closing
{
  const slide = newSlide({ dark: true, module: "CLOSING", noFooter: true });
  slide.addShape(pptx.ShapeType.ellipse, { x: 8.9, y: 0.65, w: 3.5, h: 3.5, fill: { color: C.teal }, line: { color: "5C928B", width: 2 } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 10.55, y: 3.6, w: 1.55, h: 1.55, fill: { color: C.amber }, line: { color: C.amber } });
  slide.addText("คำถามที่ดี\nมาก่อนเครื่องมือ", { x: 0.8, y: 1.45, w: 7.15, h: 1.6, margin: 0, fontFace: "Tahoma", fontSize: 43, bold: true, color: C.white, fit: "shrink" });
  slide.addText("วิธีที่ดีคือวิธีที่ตอบคำถามได้ และอธิบายการตัดสินใจทุกขั้นให้ผู้อื่นตรวจสอบได้", { x: 0.85, y: 3.45, w: 6.7, h: 1.0, margin: 0, fontFace: "Tahoma", fontSize: 20, color: "C5D5D7", fit: "shrink" });
  slide.addText("เปิดคู่มือเวิร์กชอป LitWise", { x: 0.85, y: 5.25, w: 3.2, h: 0.35, margin: 0, fontFace: "Tahoma", fontSize: 16, bold: true, color: C.amber, hyperlink: { url: "https://anusornc.github.io/lit-review-guide/?lang=th" } });
  slide.addText("anusornc.github.io/lit-review-guide", { x: 0.85, y: 5.75, w: 6.7, h: 0.34, margin: 0, fontFace: "Courier New", fontSize: 14, color: "C5D5D7", hyperlink: { url: "https://anusornc.github.io/lit-review-guide/?lang=th" } });
  slide.addText("ขั้นต่อไป\nของคุณ\nคืออะไร?", { x: 9.3, y: 1.55, w: 2.7, h: 1.9, margin: 0, fontFace: "Tahoma", fontSize: 25, bold: true, color: C.white, align: "center", valign: "middle", fit: "shrink" });
  addNotes(slide, "ปิดด้วยบัตรสะท้อนผลก่อนจบ:\n1. การตัดสินใจหนึ่งเรื่องที่ชัดขึ้น\n2. งานหนึ่งชิ้นที่จะทำภายใน 7 วัน\n3. คนหนึ่งคนที่จะขอข้อเสนอแนะ\n\nกลับไปยังผลลัพธ์ที่เลือกในสไลด์ 3 และให้ผู้เรียนประเมินความมั่นใจอีกครั้ง");
}

await pptx.writeFile({ fileName: outputPath });
console.log(`Created ${outputPath}`);
console.log(`Slides: ${slideNumber}`);
