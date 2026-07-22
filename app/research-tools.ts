import type { MethodId } from "./guide-data";
import type { Locale } from "./i18n";

export type QuestionPurposeId = "effect" | "experience" | "qualitative" | "policy" | "map";
export type QuestionFrameworkId = "pico" | "peo" | "spider" | "spice" | "pcc";
export type ScreeningDecision = "include" | "exclude" | "full-text" | "discuss";

export type PrismaInputs = {
  databases: number;
  otherSources: number;
  duplicatesRemoved: number;
  automationRemoved: number;
  otherRemoved: number;
  recordsExcluded: number;
  reportsNotRetrieved: number;
  fullTextExcluded: number;
};

export type PrismaExclusionReason = {
  reason: string;
  count: number;
};

const purposeFrameworks: Record<QuestionPurposeId, QuestionFrameworkId> = {
  effect: "pico",
  experience: "peo",
  qualitative: "spider",
  policy: "spice",
  map: "pcc",
};

export function selectQuestionFramework(purpose: QuestionPurposeId): QuestionFrameworkId {
  return purposeFrameworks[purpose];
}

function questionValue(values: Record<string, string>, key: string, locale: Locale) {
  const value = values[key]?.trim();
  if (value) return value;
  const placeholders: Record<Locale, Record<string, string>> = {
    en: {
      population: "[population]", intervention: "[intervention]", comparison: "[comparison]", outcome: "[outcome]",
      exposure: "[exposure]", sample: "[sample]", phenomenon: "[phenomenon]", design: "[design]",
      evaluation: "[evaluation]", researchType: "[research type]", setting: "[setting]", perspective: "[perspective]",
      concept: "[concept]", context: "[context]",
    },
    th: {
      population: "[ประชากร]", intervention: "[การแทรกแซง]", comparison: "[ตัวเปรียบเทียบ]", outcome: "[ผลลัพธ์]",
      exposure: "[ปัจจัยหรือประสบการณ์]", sample: "[กลุ่มตัวอย่าง]", phenomenon: "[ปรากฏการณ์]", design: "[รูปแบบการวิจัย]",
      evaluation: "[สิ่งที่ต้องการประเมิน]", researchType: "[ประเภทงานวิจัย]", setting: "[บริบท]", perspective: "[มุมมอง]",
      concept: "[แนวคิด]", context: "[บริบท]",
    },
  };
  return placeholders[locale][key] ?? `[${key}]`;
}

export function buildQuestionDraft(
  framework: QuestionFrameworkId,
  values: Record<string, string>,
  locale: Locale,
): string {
  const value = (key: string) => questionValue(values, key, locale);
  if (locale === "th") {
    const templates: Record<QuestionFrameworkId, string> = {
      pico: `ในกลุ่ม${value("population")} ${value("intervention")} เมื่อเทียบกับ${value("comparison")} ส่งผลต่อ${value("outcome")}อย่างไร?`,
      peo: `กลุ่ม${value("population")}ที่เผชิญ${value("exposure")} มีประสบการณ์หรือผลลัพธ์เกี่ยวกับ${value("outcome")}อย่างไร?`,
      spider: `${value("sample")}มีประสบการณ์เกี่ยวกับ${value("phenomenon")}อย่างไร เมื่อศึกษาด้วย${value("design")} โดยประเมิน${value("evaluation")} และพิจารณางานวิจัยประเภท${value("researchType")}?`,
      spice: `ใน${value("setting")} จากมุมมองของ${value("perspective")} ${value("intervention")} เมื่อเทียบกับ${value("comparison")} มีผลต่อ${value("evaluation")}อย่างไร?`,
      pcc: `มีหลักฐานประเภทใดเกี่ยวกับ${value("concept")} ในกลุ่ม${value("population")} ภายใต้บริบท${value("context")}?`,
    };
    return templates[framework];
  }

  const templates: Record<QuestionFrameworkId, string> = {
    pico: `Among ${value("population")}, how does ${value("intervention")}, compared with ${value("comparison")}, affect ${value("outcome")}?`,
    peo: `How do ${value("population")} exposed to ${value("exposure")} experience or report ${value("outcome")}?`,
    spider: `How does ${value("sample")} experience ${value("phenomenon")} in ${value("design")} studies evaluating ${value("evaluation")} with ${value("researchType")}?`,
    spice: `In ${value("setting")}, from the perspective of ${value("perspective")}, how does ${value("intervention")}, compared with ${value("comparison")}, influence ${value("evaluation")}?`,
    pcc: `What evidence exists about ${value("concept")} among ${value("population")} in the context of ${value("context")}?`,
  };
  return templates[framework];
}

export function calculateChecklistProgress(completed: number, total: number) {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeCompleted = Math.min(safeTotal, Math.max(0, Math.floor(completed)));
  return {
    completed: safeCompleted,
    total: safeTotal,
    percent: safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100),
  };
}

export function scoreScreeningDecisions(
  decisions: Partial<Record<string, ScreeningDecision>>,
  expected: Record<string, ScreeningDecision>,
) {
  const entries = Object.entries(expected);
  return {
    answered: entries.filter(([id]) => Boolean(decisions[id])).length,
    correct: entries.filter(([id, decision]) => decisions[id] === decision).length,
    total: entries.length,
  };
}

export function calculatePrismaFlow(input: PrismaInputs) {
  const values = Object.values(input);
  const hasInvalidInput = values.some((value) => !Number.isFinite(value) || value < 0);
  const identified = input.databases + input.otherSources;
  const removedBeforeScreening = input.duplicatesRemoved + input.automationRemoved + input.otherRemoved;
  const screened = identified - removedBeforeScreening;
  const reportsSought = screened - input.recordsExcluded;
  const reportsAssessed = reportsSought - input.reportsNotRetrieved;
  const studiesIncluded = reportsAssessed - input.fullTextExcluded;
  const valid = !hasInvalidInput && [identified, screened, reportsSought, reportsAssessed, studiesIncluded]
    .every((value) => Number.isFinite(value) && value >= 0);

  return { identified, removedBeforeScreening, screened, reportsSought, reportsAssessed, studiesIncluded, valid };
}

export function validatePrismaReasonCounts(
  fullTextExcluded: number,
  reasons: PrismaExclusionReason[],
) {
  const total = reasons.reduce((sum, item) => sum + item.count, 0);
  const populatedReasons = reasons.filter((item) => item.reason.trim() || item.count > 0);
  const rowsAreComplete = populatedReasons.every((item) => item.reason.trim() && Number.isFinite(item.count) && item.count > 0);
  const hasRequiredReasons = fullTextExcluded === 0 || populatedReasons.length > 0;
  return {
    total,
    valid: fullTextExcluded >= 0 && rowsAreComplete && hasRequiredReasons && total === fullTextExcluded,
  };
}

const methodMetaEn: { id: MethodId; complexity: string; team: string }[] = [
  { id: "systematic", complexity: "Advanced", team: "2–6+" },
  { id: "scoping", complexity: "Intermediate", team: "2–4" },
  { id: "meta-analysis", complexity: "Advanced + statistical support", team: "2–6+" },
  { id: "qualitative", complexity: "Advanced interpretive", team: "2–4" },
  { id: "realist", complexity: "Advanced theory-led", team: "2–5" },
  { id: "integrative", complexity: "Intermediate–advanced", team: "1–4" },
  { id: "mixed", complexity: "Advanced integration", team: "3–6+" },
  { id: "bibliometric", complexity: "Intermediate + data cleaning", team: "1–4" },
  { id: "critical", complexity: "Flexible, expertise-heavy", team: "1–3" },
  { id: "umbrella", complexity: "Advanced", team: "2–5" },
  { id: "rapid", complexity: "Intermediate, time-constrained", team: "2–5" },
  { id: "systematic-search", complexity: "Intermediate", team: "1–3" },
  { id: "meta-ethnography", complexity: "Advanced interpretive", team: "2–4" },
  { id: "thematic", complexity: "Intermediate–advanced", team: "2–4" },
];

const methodMetaTh = methodMetaEn.map((item) => ({
  ...item,
  complexity: ({
    "Advanced": "สูง",
    "Intermediate": "ปานกลาง",
    "Advanced + statistical support": "สูง และควรมีผู้เชี่ยวชาญสถิติ",
    "Advanced interpretive": "สูง เน้นการตีความ",
    "Advanced theory-led": "สูง ต้องใช้ทฤษฎีเป็นกรอบหลัก",
    "Intermediate–advanced": "ปานกลางถึงสูง",
    "Advanced integration": "สูง ต้องผสานหลักฐานหลายประเภท",
    "Intermediate + data cleaning": "ปานกลาง และต้องจัดการข้อมูล",
    "Flexible, expertise-heavy": "ยืดหยุ่น แต่ต้องอาศัยความเชี่ยวชาญ",
    "Intermediate, time-constrained": "ปานกลาง ภายใต้เวลาจำกัด",
  } as Record<string, string>)[item.complexity] ?? item.complexity,
}));

export const learningToolsContent = {
  en: {
    navLabel: "My project",
    comparison: {
      index: "Compare before choosing",
      title: "Put up to three review methods side by side.",
      intro: "A familiar name is not enough. Compare the claim, workload, team, output, and reporting expectations before committing.",
      selectionLabel: "Select methods to compare",
      selectionCount: "selected",
      maxMessage: "Remove one method before adding another.",
      empty: "Choose at least two methods to reveal the comparison table.",
      columns: { attribute: "Decision factor", time: "Typical time", complexity: "Complexity", team: "Suggested team", bestFor: "Best fit", output: "Expected output", reporting: "Reporting guidance" },
      methodMeta: methodMetaEn,
    },
    workflow: {
      open: "Open step guide",
      close: "Close step guide",
      actionsLabel: "What to do",
      prepareLabel: "Prepare first",
      exampleLabel: "Concrete example",
      pitfallsLabel: "Watch for",
      toolsLabel: "Useful tools",
      details: [
        { id: "scope", prepare: ["A decision, audience, or knowledge gap", "A realistic boundary for time and evidence"], actions: ["Choose a question framework", "State inclusion and exclusion rules", "Name the review method and why it fits", "Pilot the boundary with a few known papers"], example: "For a scoping review of AI literacy in universities, define students, AI-literacy concepts, higher-education settings, evidence types, languages, and dates before searching.", pitfalls: ["Choosing the method before the question", "Changing eligibility after seeing attractive results without recording why"], tools: ["PICO/PEO/SPIDER/SPICE/PCC builder", "Protocol template", "Supervisor or librarian review"] },
        { id: "search", prepare: ["Question concepts and likely synonyms", "Database families that cover the discipline"], actions: ["Build concept blocks and controlled-vocabulary candidates", "Translate syntax for each database", "Test whether sentinel papers are retrieved", "Log every search, filter, date, and export"], example: "Test the same concept blocks in Scopus and ERIC, but adapt fields, phrases, truncation, and thesaurus terms to each platform.", pitfalls: ["Treating Google Scholar as complete coverage", "Copying one database query into another without translating syntax"], tools: ["Search log", "Zotero or EndNote", "Database thesauri and a research librarian"] },
        { id: "screen", prepare: ["Deduplicated records", "Observable eligibility criteria and reviewer instructions"], actions: ["Pilot 20–50 records and calibrate criteria", "Screen titles and abstracts conservatively", "Retrieve and assess full text", "Resolve disagreements and log one primary exclusion reason"], example: "If the abstract does not identify the participant level, move it to full text rather than guessing that it is ineligible.", pitfalls: ["Using quality as an eligibility criterion without a protocol reason", "Excluding uncertain abstracts too early"], tools: ["Rayyan, Covidence, or ASReview with human decisions", "Screening decision log", "PRISMA flow counts"] },
        { id: "appraise", prepare: ["Included studies grouped by design", "A tool matched to each design and review purpose"], actions: ["Train reviewers with worked examples", "Assess independently where the method requires it", "Resolve disagreements or use a third reviewer", "Summarize judgements and test their influence on findings"], example: "Use RoB 2 for randomized trials and a suitable qualitative tool for interview studies; do not force both into one checklist.", pitfalls: ["Confusing poor reporting with high risk of bias", "Using appraisal scores mechanically without explaining judgement"], tools: ["RoB 2, ROBINS-I, CASP, JBI, MMAT, or AMSTAR 2 as appropriate", "Appraisal decision log", "Sensitivity analysis plan"] },
        { id: "extract", prepare: ["A stable extraction form", "A synthesis plan linked to the review question"], actions: ["Pilot the form on 3–5 varied studies", "Record page, table, or quotation provenance", "Reconcile duplicate extraction where required", "Choose narrative, thematic, quantitative, or mixed synthesis"], example: "Keep setting and implementation details beside outcomes so the synthesis can explain why results differ.", pitfalls: ["Starting extraction before the form is stable", "Collecting interesting fields that do not answer the review question"], tools: ["Evidence matrix", "Excel, Google Sheets, or review software", "R, qualitative analysis software, or joint displays"] },
        { id: "write", prepare: ["Traceable findings and uncertainty", "The reporting guideline for the chosen method"], actions: ["Report methods so another team could repeat them", "Show study characteristics and selection flow", "Connect claims to appraisal and certainty", "Discuss limitations, implications, and update needs"], example: "Attach full database strategies and a transparent exclusion table as supplementary material rather than summarizing the search in one sentence.", pitfalls: ["Writing conclusions stronger than the included evidence", "Hiding protocol changes or automation"], tools: ["PRISMA, PRISMA-ScR, ENTREQ, RAMESES, or method-specific guidance", "Reference manager", "Reporting checklist"] },
      ],
    },
    workbench: { index: "06 · Guided practice", title: "Build the artefacts, not just the vocabulary.", intro: "Use these client-side tools to rehearse decisions and create copy-ready working notes. Your checklist stays in this browser; no research data is uploaded." },
    checklist: {
      title: "My review project",
      intro: "A progress checklist for the minimum traceable workflow. Completion is a reminder—not a quality score.",
      saved: "Saved only in this browser",
      reset: "Reset checklist",
      progress: "completed",
      items: [
        { id: "question", stage: "Prepare", label: "Write a reviewable question and intended contribution" },
        { id: "method", stage: "Prepare", label: "Choose and justify the review method" },
        { id: "criteria", stage: "Plan", label: "Define and pilot inclusion/exclusion criteria" },
        { id: "sources", stage: "Plan", label: "Select database families and other sources" },
        { id: "strategy", stage: "Search", label: "Test search strategies against sentinel papers" },
        { id: "log", stage: "Search", label: "Save exact searches, dates, filters, counts, and exports" },
        { id: "deduplicate", stage: "Screen", label: "Deduplicate while preserving source provenance" },
        { id: "screen", stage: "Screen", label: "Calibrate and complete two-stage screening" },
        { id: "appraise", stage: "Appraise", label: "Use design-appropriate appraisal and resolve disagreements" },
        { id: "extract", stage: "Extract", label: "Pilot a traceable extraction form" },
        { id: "synthesize", stage: "Synthesize", label: "Apply a synthesis method aligned with the question" },
        { id: "report", stage: "Report", label: "Complete the relevant reporting checklist and flow account" },
      ],
    },
    questionBuilder: {
      title: "Question framework builder",
      intro: "What do you want this review to answer? Choose the goal closest to your project. We will suggest a question framework, show a complete example, and give you fields for your own topic. Adapt the wording and scope to your discipline.",
      purposeLabel: "What kind of answer are you looking for?",
      frameworkLabel: "Suggested starting framework",
      draftLabel: "Question draft",
      exampleToggle: "View a completed example",
      exampleQuestionLabel: "Question produced from this example",
      copy: "Copy question",
      copied: "Copied",
      purposes: [
        { id: "effect", label: "Compare what works better", description: "For a treatment, teaching method, programme, policy, or other option" },
        { id: "experience", label: "Understand an exposure or experience", description: "For what a group encounters, feels, interprets, or reports" },
        { id: "qualitative", label: "Explore views or experiences in depth", description: "For qualitative or mixed-method evidence" },
        { id: "policy", label: "Compare services, policies, or practice", description: "For choices in a setting and from stakeholder perspectives" },
        { id: "map", label: "See what research already exists", description: "For the breadth of a topic, population, and context" },
      ],
      frameworks: [
        { id: "pico", name: "PICO", expandedName: "Population · Intervention · Comparison · Outcome", description: "A focused question comparing effects or outcomes", fields: [["population", "Population or problem", "First-year university students"], ["intervention", "Method, programme, or option", "Flipped-classroom teaching"], ["comparison", "What it is compared with", "Lecture-based teaching"], ["outcome", "Outcome of interest", "Achievement and classroom engagement"]], exampleQuestion: "Among first-year university students, does flipped-classroom teaching improve achievement and classroom engagement compared with lecture-based teaching?" },
        { id: "peo", name: "PEO", expandedName: "Population · Exposure · Outcome", description: "A question about what a group experiences or is exposed to", fields: [["population", "Population", "Secondary-school teachers using AI for the first time"], ["exposure", "Exposure or experience", "Using generative AI to plan lessons"], ["outcome", "Experience or perceived outcome", "Changes in their role and ethical concerns"]], exampleQuestion: "How do secondary-school teachers using generative AI to plan lessons experience changes in their role and ethical concerns?" },
        { id: "spider", name: "SPIDER", expandedName: "Sample · Phenomenon of Interest · Design · Evaluation · Research type", description: "An in-depth qualitative or mixed-method question", fields: [["sample", "Sample", "Small independent restaurant owners"], ["phenomenon", "Issue or experience to explore", "Using food-delivery platforms"], ["design", "Study design", "In-depth interviews"], ["evaluation", "What participants report", "Benefits, barriers, and adaptation"], ["researchType", "Research type", "Qualitative research"]], exampleQuestion: "What benefits, barriers, and forms of adaptation do small independent restaurant owners report when using food-delivery platforms in qualitative interview studies?" },
        { id: "spice", name: "SPICE", expandedName: "Setting · Perspective · Intervention · Comparison · Evaluation", description: "A question comparing a service, policy, or practice option", fields: [["setting", "Setting", "University mental-health centres"], ["perspective", "Whose perspective", "Students who have used the service"], ["intervention", "Service, policy, or option", "Video counselling"], ["comparison", "Alternative", "In-person counselling"], ["evaluation", "How it will be judged", "Satisfaction and continued attendance"]], exampleQuestion: "From the perspective of students using university mental-health centres, how does video counselling compare with in-person counselling for satisfaction and continued attendance?" },
        { id: "pcc", name: "PCC", expandedName: "Population · Concept · Context", description: "A broad scoping or evidence-mapping question", fields: [["population", "Population or participants", "Local disaster-management agencies"], ["concept", "Concept to map", "Artificial intelligence for forecasting and early warning"], ["context", "Context", "Resource-constrained developing countries"]], exampleQuestion: "What research exists on the use of artificial intelligence for forecasting and early warning by local disaster-management agencies in resource-constrained developing countries?" },
      ],
    },
    screening: {
      title: "Screening calibration lab",
      intro: "Apply one example protocol to six records. At title/abstract stage, uncertainty normally moves forward instead of becoming an early exclusion.",
      criteriaLabel: "Example protocol",
      criteria: "Include empirical studies from 2020 onward about AI-supported tutoring for university students that report a learning or engagement outcome. Exclude editorials, school-only studies, and tools without learner outcomes.",
      score: "correct decisions",
      correct: "Correct",
      review: "Review this decision",
      reset: "Try again",
      options: [
        { id: "include", label: "Include" }, { id: "exclude", label: "Exclude" },
        { id: "full-text", label: "Check full text" }, { id: "discuss", label: "Discuss" },
      ],
      scenarios: [
        { id: "empirical", title: "AI tutor in a first-year statistics course", abstract: "A 2023 controlled study of 180 university students reports achievement and engagement outcomes.", expected: "include", rationale: "The population, intervention, date, empirical design, and outcomes match the protocol." },
        { id: "editorial", title: "Why universities should embrace AI tutors", abstract: "A 2024 editorial argues for adoption but reports no empirical study or learner outcome.", expected: "exclude", rationale: "The protocol excludes editorials and requires empirical outcomes." },
        { id: "unclear", title: "Adaptive tutoring in formal education", abstract: "The abstract reports learning gains but does not identify whether participants were school or university students.", expected: "full-text", rationale: "Population is unclear. Retrieve full text rather than making an unsupported exclusion." },
        { id: "school", title: "Generative tutoring for grade 8 mathematics", abstract: "A 2022 school study reports test performance among 13–14 year-old pupils.", expected: "exclude", rationale: "The protocol is limited to university students." },
        { id: "protocol", title: "Protocol for evaluating a university AI tutor", abstract: "A 2025 protocol describes planned outcomes but contains no results.", expected: "exclude", rationale: "This example protocol requires completed empirical results." },
        { id: "borderline", title: "AI feedback assistant in postgraduate writing", abstract: "A mixed-methods university study reports engagement but it is unclear whether the system provides tutoring or only administrative feedback.", expected: "discuss", rationale: "The intervention boundary is ambiguous and should be calibrated with another reviewer." },
      ],
    },
    prisma: {
      title: "PRISMA flow planner",
      intro: "Enter counts to check arithmetic and produce a copy-ready selection summary. This planning aid does not replace the official PRISMA 2020 diagram or its instructions.",
      plannerTab: "Enter your counts",
      exampleTab: "View an example",
      inputLabel: "Selection counts",
      flowLabel: "Derived flow",
      reasonsLabel: "Full-text exclusion reasons and counts",
      reasonName: "Reason",
      reasonCount: "Count",
      reasonPlaceholder: "Example: Wrong population",
      addReason: "Add reason",
      removeReason: "Remove",
      reasonTotal: "Reason total",
      reasonMismatch: "The reason counts must add up to the number of full-text reports excluded.",
      copy: "Copy flow summary",
      copied: "Copied",
      invalid: "One or more exclusions are larger than the records available at that stage. Check the counts.",
      official: "Open official PRISMA flow diagrams",
      inputs: [
        ["databases", "Records identified from databases"], ["otherSources", "Records identified from other sources"],
        ["duplicatesRemoved", "Duplicate records removed"], ["automationRemoved", "Records removed by automation"],
        ["otherRemoved", "Records removed for other reasons"], ["recordsExcluded", "Records excluded at title/abstract"],
        ["reportsNotRetrieved", "Reports not retrieved"], ["fullTextExcluded", "Full-text reports excluded"],
      ],
      stages: { identified: "Records identified", removed: "Removed before screening", screened: "Records screened", sought: "Reports sought", assessed: "Reports assessed", included: "Studies included" },
      example: {
        title: "Example: AI-supported tutoring in universities",
        intro: "This hypothetical example shows how counts move from search results to included studies. Notice that the full-text exclusion reasons add up to the full-text reports excluded.",
        note: "Example numbers only. Use counts from your own search and screening records in the planner tab.",
        inputs: { databases: 1200, otherSources: 50, duplicatesRemoved: 200, automationRemoved: 0, otherRemoved: 10, recordsExcluded: 900, reportsNotRetrieved: 10, fullTextExcluded: 80 },
        reasons: [["Wrong population", 30], ["Wrong intervention or concept", 25], ["Ineligible study design", 15], ["No eligible outcome", 10]],
      },
    },
  },
  th: {
    navLabel: "โครงการของฉัน",
    comparison: {
      index: "เปรียบเทียบก่อนเลือก",
      title: "เปรียบเทียบวิธีทบทวนได้สูงสุด 3 วิธี",
      intro: "อย่าตัดสินจากชื่อที่คุ้นเคยเพียงอย่างเดียว ควรเปรียบเทียบประเภทข้อสรุป ปริมาณงาน จำนวนคนในทีม ผลลัพธ์ และมาตรฐานการรายงานก่อนเลือก",
      selectionLabel: "เลือกวิธีที่ต้องการเปรียบเทียบ",
      selectionCount: "วิธีที่เลือก",
      maxMessage: "นำวิธีหนึ่งออกก่อนเพิ่มวิธีใหม่",
      empty: "เลือกอย่างน้อยสองวิธีเพื่อเปิดตารางเปรียบเทียบ",
      columns: { attribute: "ปัจจัยตัดสินใจ", time: "ระยะเวลาโดยทั่วไป", complexity: "ความซับซ้อน", team: "ขนาดทีมที่แนะนำ", bestFor: "เหมาะกับ", output: "ผลลัพธ์ที่คาดหวัง", reporting: "แนวทางการรายงาน" },
      methodMeta: methodMetaTh,
    },
    workflow: {
      open: "เปิดคำแนะนำขั้นนี้",
      close: "ปิดคำแนะนำขั้นนี้",
      actionsLabel: "สิ่งที่ต้องทำ",
      prepareLabel: "สิ่งที่ควรเตรียม",
      exampleLabel: "ตัวอย่างที่เห็นภาพ",
      pitfallsLabel: "จุดที่ต้องระวัง",
      toolsLabel: "เครื่องมือที่ช่วยได้",
      details: [
        { id: "scope", prepare: ["การตัดสินใจ กลุ่มผู้อ่าน หรือช่องว่างความรู้ที่งานต้องช่วยตอบ", "ขอบเขตด้านเวลาและหลักฐานที่ทำได้จริง"], actions: ["เลือกกรอบช่วยตั้งคำถาม", "กำหนดเกณฑ์คัดเข้าและคัดออก", "ระบุวิธีทบทวนพร้อมเหตุผล", "ทดลองกำหนดขอบเขตโดยใช้บทความหลักบางส่วน"], example: "หากทำการทบทวนวรรณกรรมแบบกำหนดขอบเขต (scoping review) เรื่องการรู้เท่าทัน AI ในมหาวิทยาลัย ควรกำหนดกลุ่มนักศึกษา แนวคิด บริบท ประเภทหลักฐาน ภาษา และช่วงเวลาให้ชัดก่อนค้น", pitfalls: ["เลือกวิธีก่อนตั้งคำถาม", "เปลี่ยนเกณฑ์หลังเห็นผลที่น่าสนใจโดยไม่บันทึกเหตุผล"], tools: ["เครื่องมือสร้าง PICO/PEO/SPIDER/SPICE/PCC", "แบบร่างโครงร่าง", "อาจารย์ที่ปรึกษาหรือบรรณารักษ์วิจัย"] },
        { id: "search", prepare: ["แนวคิดหลักและคำพ้องจากคำถาม", "กลุ่มฐานข้อมูลที่ครอบคลุมสาขา"], actions: ["สร้างชุดแนวคิดและคำที่ต้องตรวจในศัพท์ควบคุม", "แปลงรูปแบบคำค้นให้ตรงกับแต่ละฐานข้อมูล", "ทดสอบว่าค้นพบบทความหลักที่รู้จัก", "บันทึกคำค้น ตัวกรอง วันที่ จำนวน และไฟล์ส่งออก"], example: "ใช้แนวคิดชุดเดียวกันใน Scopus และ ERIC ได้ แต่ต้องปรับเขตค้น วลี เครื่องหมายตัดคำ และศัพท์ควบคุมให้ตรงกับแต่ละระบบ", pitfalls: ["ถือว่า Google Scholar ครอบคลุมหลักฐานทั้งหมด", "คัดลอกคำค้นจากฐานหนึ่งไปอีกฐานโดยไม่ปรับรูปแบบคำสั่งค้น"], tools: ["แบบบันทึกการค้น", "Zotero หรือ EndNote", "คลังศัพท์ควบคุม (thesaurus) ของฐานข้อมูลและบรรณารักษ์วิจัย"] },
        { id: "screen", prepare: ["รายการอ้างอิงหลังลบรายการซ้ำ", "เกณฑ์ที่สังเกตและตัดสินได้ พร้อมคำอธิบายสำหรับผู้ทบทวน"], actions: ["ทดลอง 20–50 รายการและซักซ้อมเกณฑ์ให้เข้าใจตรงกัน", "คัดกรองชื่อเรื่องและบทคัดย่อโดยไม่รีบตัดกรณีไม่ชัด", "ขอและประเมินฉบับเต็ม", "หาข้อสรุปเมื่อมีความเห็นไม่ตรงกัน และบันทึกเหตุผลหลักหนึ่งข้อเมื่อตัดบทความออก"], example: "หากบทคัดย่อไม่ระบุระดับการศึกษา ให้ส่งไปตรวจฉบับเต็มแทนการเดาว่าไม่ผ่านเกณฑ์", pitfalls: ["ใช้คุณภาพเป็นเกณฑ์คัดเข้าโดยไม่มีเหตุผลในโครงร่าง", "ตัดบทคัดย่อที่ข้อมูลไม่ชัดเร็วเกินไป"], tools: ["Rayyan, Covidence หรือ ASReview โดยให้มนุษย์ตัดสิน", "แบบบันทึกผลคัดกรอง", "จำนวนสำหรับผัง PRISMA"] },
        { id: "appraise", prepare: ["งานวิจัยที่คัดเข้าและจัดกลุ่มตามรูปแบบการวิจัย", "เครื่องมือที่ตรงกับรูปแบบและเป้าหมายของงานทบทวน"], actions: ["ฝึกผู้ประเมินด้วยตัวอย่าง", "ประเมินอย่างเป็นอิสระต่อกันตามที่ระเบียบวิธีกำหนด", "หารือหรือใช้ผู้ประเมินคนที่สามเมื่อผลไม่ตรงกัน", "สรุปผลและตรวจว่าคุณภาพมีผลต่อข้อค้นพบหรือไม่"], example: "ใช้ RoB 2 กับงานสุ่มทดลองและใช้เครื่องมือเชิงคุณภาพกับงานสัมภาษณ์ ไม่ควรบังคับงานทั้งสองชนิดลงรายการตรวจสอบชุดเดียว", pitfalls: ["สับสนระหว่างรายงานไม่ครบกับมีความเสี่ยงอคติสูง", "รวมคะแนนตามสูตรโดยไม่อธิบายเหตุผลประกอบ"], tools: ["RoB 2, ROBINS-I, CASP, JBI, MMAT หรือ AMSTAR 2 ตามความเหมาะสม", "แบบบันทึกการประเมิน", "แผนตรวจความไวของผล"] },
        { id: "extract", prepare: ["แบบฟอร์มสกัดข้อมูลที่ปรับจนลงตัวแล้ว", "แผนสังเคราะห์ที่เชื่อมกับคำถามทบทวน"], actions: ["ทดลองแบบฟอร์มกับงานที่หลากหลาย 3–5 เรื่อง", "บันทึกหน้า ตาราง หรือข้อความต้นทาง", "ตรวจความตรงกันเมื่อมีผู้สกัดข้อมูลมากกว่าหนึ่งคน", "เลือกการสังเคราะห์เชิงบรรยาย เชิงประเด็น เชิงปริมาณ หรือแบบผสม"], example: "เก็บบริบทและรายละเอียดการนำไปใช้ไว้คู่กับผลลัพธ์ เพื่ออธิบายได้ว่าเหตุใดผลของแต่ละงานจึงต่างกัน", pitfalls: ["เริ่มสกัดก่อนแบบฟอร์มนิ่ง", "เก็บข้อมูลที่น่าสนใจแต่ไม่ช่วยตอบคำถาม"], tools: ["ตารางหลักฐาน", "Excel, Google Sheets หรือโปรแกรมจัดการงานทบทวน", "R โปรแกรมวิเคราะห์เชิงคุณภาพ หรือตารางแสดงผลร่วม (joint display)"] },
        { id: "write", prepare: ["ข้อค้นพบที่ระบุแหล่งหลักฐานและระดับความไม่แน่นอนได้ชัดเจน", "แนวทางรายงานที่ตรงกับวิธีทบทวน"], actions: ["รายงานวิธีให้ทีมอื่นทำตามได้", "แสดงลักษณะงานและขั้นตอนการคัดเลือก", "เชื่อมข้อสรุปกับผลประเมินและความเชื่อมั่น", "อภิปรายข้อจำกัด การนำไปใช้ และความจำเป็นในการปรับปรุงข้อมูล"], example: "แนบคำค้นเต็มของทุกฐานข้อมูลและตารางเหตุผลคัดออกไว้ในเอกสารเสริม แทนการเขียนเพียงว่าค้นอย่างเป็นระบบ", pitfalls: ["สรุปผลเกินกว่าที่หลักฐานที่คัดเข้ามารองรับ", "ซ่อนการเปลี่ยนโครงร่างหรือการใช้ระบบอัตโนมัติ"], tools: ["PRISMA, PRISMA-ScR, ENTREQ, RAMESES หรือแนวทางเฉพาะวิธี", "โปรแกรมจัดการอ้างอิง", "รายการตรวจสอบการรายงาน"] },
      ],
    },
    workbench: { index: "06 · ฝึกลงมือทำ", title: "ลงมือวางแผนงานวิจัย", intro: "ใช้เครื่องมือในหน้านี้เพื่อฝึกตัดสินใจและสร้างบันทึกที่นำไปปรับใช้ได้ รายการตรวจสอบจะเก็บไว้ในเบราว์เซอร์นี้เท่านั้น โดยไม่มีการส่งข้อมูลงานวิจัยออกไป" },
    checklist: {
      title: "รายการตรวจสอบขั้นตอนการทบทวนวรรณกรรม",
      intro: "รายการตรวจสอบขั้นตอนสำคัญที่ควรย้อนกลับมาตรวจได้ การทำครบทุกข้อเป็นเพียงตัวช่วยเตือน ไม่ได้หมายความว่างานมีคุณภาพแล้ว",
      saved: "บันทึกไว้เฉพาะในเบราว์เซอร์นี้",
      reset: "เริ่มรายการใหม่",
      progress: "ทำแล้ว",
      items: [
        { id: "question", stage: "เตรียม", label: "เขียนคำถามทบทวนวรรณกรรมให้ชัดเจน และระบุช่องว่างความรู้ที่ต้องการเติมเต็ม" },
        { id: "method", stage: "เตรียม", label: "เลือกวิธีทบทวนและบันทึกเหตุผล" },
        { id: "criteria", stage: "วางแผน", label: "กำหนดและทดลองเกณฑ์คัดเข้า/คัดออก" },
        { id: "sources", stage: "วางแผน", label: "เลือกกลุ่มฐานข้อมูลและแหล่งอื่นที่เกี่ยวข้อง" },
        { id: "strategy", stage: "ค้น", label: "ทดสอบคำค้นกับบทความหลักที่รู้จัก" },
        { id: "log", stage: "ค้น", label: "เก็บคำค้น วันที่ ตัวกรอง จำนวน และไฟล์ส่งออก" },
        { id: "deduplicate", stage: "คัดกรอง", label: "ลบรายการซ้ำโดยยังตรวจย้อนกลับไปยังแหล่งที่มาได้" },
        { id: "screen", stage: "คัดกรอง", label: "ซักซ้อมเกณฑ์ให้เข้าใจตรงกันและคัดกรองสองระยะ" },
        { id: "appraise", stage: "ประเมิน", label: "ใช้เครื่องมือให้ตรงกับรูปแบบการวิจัย และหาข้อสรุปเมื่อผลประเมินไม่ตรงกัน" },
        { id: "extract", stage: "สกัด", label: "ทดลองแบบสกัดข้อมูลที่ตรวจย้อนกลับได้" },
        { id: "synthesize", stage: "สังเคราะห์", label: "ใช้วิธีสังเคราะห์ที่สอดคล้องกับคำถาม" },
        { id: "report", stage: "รายงาน", label: "ตรวจแนวทางรายงานและสรุปขั้นตอนการคัดเลือก" },
      ],
    },
    questionBuilder: {
      title: "เครื่องมือช่วยวางกรอบคำถาม",
      intro: "อยากให้งานทบทวนนี้ช่วยตอบคำถามอะไร? เลือกเป้าหมายที่ใกล้กับงานของคุณ แล้วระบบจะแนะนำกรอบคำถาม พร้อมตัวอย่างที่กรอกครบและช่องสำหรับหัวข้อของคุณ คุณปรับคำและขอบเขตให้เหมาะกับสาขาของคุณได้",
      purposeLabel: "คุณอยากหาคำตอบแบบไหน?",
      frameworkLabel: "กรอบคำถามที่แนะนำ",
      draftLabel: "ร่างคำถาม",
      exampleToggle: "ดูตัวอย่างที่กรอกครบ",
      exampleQuestionLabel: "คำถามที่ได้จากตัวอย่าง",
      copy: "คัดลอกคำถาม",
      copied: "คัดลอกแล้ว",
      purposes: [
        { id: "effect", label: "เปรียบเทียบว่าอะไรได้ผลกว่ากัน", description: "เช่น วิธีรักษา วิธีสอน โปรแกรม หรือนโยบาย" },
        { id: "experience", label: "ดูว่าคนกลุ่มหนึ่งเผชิญอะไรและเกิดผลอย่างไร", description: "เหมาะกับคำถามเรื่องปัจจัย ประสบการณ์ หรือผลที่เกิดขึ้น" },
        { id: "qualitative", label: "เจาะลึกมุมมองหรือประสบการณ์", description: "เหมาะกับงานวิจัยเชิงคุณภาพหรือแบบผสม" },
        { id: "policy", label: "เปรียบเทียบบริการ นโยบาย หรือแนวทางปฏิบัติ", description: "ดูทางเลือกในบริบทและมุมมองของผู้เกี่ยวข้อง" },
        { id: "map", label: "สำรวจว่ามีงานวิจัยอะไรอยู่แล้ว", description: "ดูขอบเขตของหัวข้อ กลุ่มเป้าหมาย และบริบท ก่อนเจาะลึก" },
      ],
      frameworks: [
        { id: "pico", name: "PICO", expandedName: "Population · Intervention · Comparison · Outcome", description: "คำถามที่ต้องการเปรียบเทียบผลหรือประสิทธิภาพอย่างเจาะจง", fields: [["population", "กลุ่มเป้าหมายหรือปัญหา", "นักศึกษามหาวิทยาลัยชั้นปีที่ 1"], ["intervention", "วิธี โปรแกรม หรือนวัตกรรมที่สนใจ", "การสอนแบบห้องเรียนกลับด้าน"], ["comparison", "สิ่งที่นำมาเปรียบเทียบ", "การสอนแบบบรรยายตามปกติ"], ["outcome", "ผลที่ต้องการดู", "ผลสัมฤทธิ์ทางการเรียนและการมีส่วนร่วม"]], exampleQuestion: "ในนักศึกษามหาวิทยาลัยชั้นปีที่ 1 การสอนแบบห้องเรียนกลับด้านช่วยเพิ่มผลสัมฤทธิ์ทางการเรียนและการมีส่วนร่วมได้ดีกว่าการสอนแบบบรรยายตามปกติหรือไม่?" },
        { id: "peo", name: "PEO", expandedName: "Population · Exposure · Outcome", description: "คำถามว่าคนกลุ่มหนึ่งเผชิญอะไรและรับรู้ผลอย่างไร", fields: [["population", "กลุ่มเป้าหมาย", "ครูมัธยมศึกษาที่เริ่มใช้ AI ช่วยสอน"], ["exposure", "ปัจจัยหรือประสบการณ์ที่สนใจ", "การใช้ Generative AI ช่วยออกแบบบทเรียน"], ["outcome", "ประสบการณ์หรือผลที่รับรู้", "มุมมองต่อบทบาทครูและความกังวลด้านจริยธรรม"]], exampleQuestion: "ครูมัธยมศึกษาที่เริ่มใช้ Generative AI ช่วยออกแบบบทเรียน มีมุมมองต่อบทบาทของตนเองและมีความกังวลด้านจริยธรรมอย่างไร?" },
        { id: "spider", name: "SPIDER", expandedName: "Sample · Phenomenon of Interest · Design · Evaluation · Research type", description: "คำถามที่ต้องการเจาะลึกหลักฐานเชิงคุณภาพหรือแบบผสม", fields: [["sample", "กลุ่มตัวอย่าง", "ผู้ประกอบการร้านอาหารรายย่อย"], ["phenomenon", "ประเด็นหรือประสบการณ์ที่ต้องการศึกษา", "การใช้แพลตฟอร์มส่งอาหาร"], ["design", "รูปแบบการศึกษา", "การสัมภาษณ์เชิงลึก"], ["evaluation", "สิ่งที่ผู้เข้าร่วมสะท้อน", "ประโยชน์ อุปสรรค และการปรับตัว"], ["researchType", "ประเภทงานวิจัย", "งานวิจัยเชิงคุณภาพ"]], exampleQuestion: "ผู้ประกอบการร้านอาหารรายย่อยสะท้อนประโยชน์ อุปสรรค และการปรับตัวจากการใช้แพลตฟอร์มส่งอาหารอย่างไร จากงานวิจัยเชิงคุณภาพที่ใช้การสัมภาษณ์เชิงลึก?" },
        { id: "spice", name: "SPICE", expandedName: "Setting · Perspective · Intervention · Comparison · Evaluation", description: "คำถามที่ใช้เปรียบเทียบบริการ นโยบาย หรือแนวทางปฏิบัติ", fields: [["setting", "บริบทหรือสถานที่", "ศูนย์สุขภาพจิตในมหาวิทยาลัย"], ["perspective", "มุมมองของใคร", "นักศึกษาที่เคยใช้บริการ"], ["intervention", "บริการ นโยบาย หรือทางเลือกที่สนใจ", "การให้คำปรึกษาผ่านวิดีโอคอล"], ["comparison", "ทางเลือกที่นำมาเปรียบเทียบ", "การให้คำปรึกษาแบบพบหน้า"], ["evaluation", "เกณฑ์ที่ใช้พิจารณา", "ความพึงพอใจและการมาตามนัดต่อเนื่อง"]], exampleQuestion: "จากมุมมองของนักศึกษาที่ใช้ศูนย์สุขภาพจิตในมหาวิทยาลัย การให้คำปรึกษาผ่านวิดีโอคอลให้ผลด้านความพึงพอใจและการมาตามนัดต่อเนื่องต่างจากการให้คำปรึกษาแบบพบหน้าอย่างไร?" },
        { id: "pcc", name: "PCC", expandedName: "Population · Concept · Context", description: "คำถามกว้างสำหรับสำรวจขอบเขตงานวิจัยที่มีอยู่", fields: [["population", "กลุ่มเป้าหมายหรือผู้เกี่ยวข้อง", "หน่วยงานท้องถิ่นที่รับมือภัยพิบัติ"], ["concept", "แนวคิดที่ต้องการสำรวจ", "การใช้ AI เพื่อพยากรณ์และเตือนภัย"], ["context", "บริบท", "ประเทศกำลังพัฒนาที่มีทรัพยากรจำกัด"]], exampleQuestion: "มีงานวิจัยอะไรบ้างเกี่ยวกับการใช้ AI เพื่อพยากรณ์และเตือนภัยโดยหน่วยงานท้องถิ่นในประเทศกำลังพัฒนาที่มีทรัพยากรจำกัด?" },
      ],
    },
    screening: {
      title: "แบบฝึกหัดคัดกรองบทความ",
      intro: "ทดลองใช้เกณฑ์ตัวอย่างกับบทความ 6 รายการในขั้นชื่อเรื่องและบทคัดย่อ หากยังไม่แน่ใจ ควรส่งไปตรวจฉบับเต็มแทนการรีบตัดออก",
      criteriaLabel: "เกณฑ์ตัวอย่าง",
      criteria: "คัดเข้างานวิจัยเชิงประจักษ์ตั้งแต่ปี 2020 ที่ศึกษา AI ช่วยสอนนักศึกษามหาวิทยาลัยและรายงานผลด้านการเรียนรู้หรือการมีส่วนร่วม คัดออกบทบรรณาธิการ งานที่ศึกษาเฉพาะนักเรียน และงานเกี่ยวกับเครื่องมือที่ไม่ได้รายงานผลลัพธ์ของผู้เรียน",
      score: "คำตอบที่สอดคล้องกับเกณฑ์",
      correct: "ตอบได้ตรงกับเกณฑ์",
      review: "ควรทบทวนคำตอบนี้อีกครั้ง",
      reset: "ลองใหม่",
      options: [
        { id: "include", label: "คัดเข้า" }, { id: "exclude", label: "คัดออก" },
        { id: "full-text", label: "ตรวจฉบับเต็ม" }, { id: "discuss", label: "หารือ" },
      ],
      scenarios: [
        { id: "empirical", title: "ระบบ AI ช่วยสอนในวิชาสถิติชั้นปีที่ 1", abstract: "การศึกษาแบบมีกลุ่มควบคุมในปี 2023 ในนักศึกษามหาวิทยาลัย 180 คน รายงานผลสัมฤทธิ์และการมีส่วนร่วม", expected: "include", rationale: "ประชากร การแทรกแซง ปี รูปแบบการวิจัย และผลลัพธ์ตรงกับเกณฑ์" },
        { id: "editorial", title: "เหตุใดมหาวิทยาลัยควรใช้ระบบ AI ช่วยสอน", abstract: "บทบรรณาธิการปี 2024 เสนอเหตุผลสนับสนุน แต่ไม่มีการศึกษาเชิงประจักษ์หรือผลลัพธ์ผู้เรียน", expected: "exclude", rationale: "เกณฑ์กำหนดให้คัดบทบรรณาธิการออกและต้องมีผลการศึกษาเชิงประจักษ์" },
        { id: "unclear", title: "ระบบสอนแบบปรับตัวในสถานศึกษา", abstract: "บทคัดย่อรายงานผลการเรียนที่ดีขึ้น แต่ไม่ระบุว่าผู้เข้าร่วมเป็นนักเรียนหรือนักศึกษา", expected: "full-text", rationale: "ประชากรยังไม่ชัด ควรอ่านฉบับเต็มแทนการเดาแล้วตัดออก" },
        { id: "school", title: "การสอนคณิตศาสตร์ ม.2 ด้วย Generative AI", abstract: "งานปี 2022 ในนักเรียนอายุ 13–14 ปี รายงานผลคะแนนสอบ", expected: "exclude", rationale: "เกณฑ์กำหนดให้คัดเข้าเฉพาะงานที่ศึกษานักศึกษามหาวิทยาลัย" },
        { id: "protocol", title: "โครงร่างการประเมินระบบ AI ช่วยสอนในมหาวิทยาลัย", abstract: "โครงร่างปี 2025 อธิบายผลลัพธ์ที่จะศึกษาแต่ยังไม่มีผลการวิจัย", expected: "exclude", rationale: "เกณฑ์ตัวอย่างกำหนดให้งานที่คัดเข้าต้องมีผลการศึกษาเชิงประจักษ์แล้ว" },
        { id: "borderline", title: "ผู้ช่วย AI ให้คำแนะนำด้านการเขียนแก่นักศึกษาบัณฑิตศึกษา", abstract: "งานแบบผสมรายงานการมีส่วนร่วม แต่ไม่ชัดว่าเป็นการสอนหรือเพียงช่วยงานธุรการ", expected: "discuss", rationale: "ขอบเขตการแทรกแซงยังไม่ชัด ควรหารือกับผู้ทบทวนอีกคนเพื่อให้เข้าใจเกณฑ์ตรงกัน" },
      ],
    },
    prisma: {
      title: "เครื่องมือวางแผนผัง PRISMA",
      intro: "กรอกจำนวนเพื่อตรวจความสอดคล้องและสร้างข้อความสรุปพร้อมคัดลอก เครื่องมือนี้ช่วยวางแผน แต่ไม่แทนผังและคำแนะนำ PRISMA 2020 ฉบับทางการ",
      plannerTab: "กรอกข้อมูลของคุณ",
      exampleTab: "ดูตัวอย่าง",
      inputLabel: "จำนวนในกระบวนการคัดเลือก",
      flowLabel: "ผลการคำนวณ",
      reasonsLabel: "เหตุผลและจำนวนที่ตัดออกในขั้นฉบับเต็ม",
      reasonName: "เหตุผล",
      reasonCount: "จำนวน",
      reasonPlaceholder: "ตัวอย่าง: ประชากรไม่ตรง",
      addReason: "เพิ่มเหตุผล",
      removeReason: "ลบรายการ",
      reasonTotal: "รวมจำนวนตามเหตุผล",
      reasonMismatch: "ผลรวมของแต่ละเหตุผลต้องเท่ากับจำนวนรายงานฉบับเต็มที่ตัดออก",
      copy: "คัดลอกสรุปผล",
      copied: "คัดลอกแล้ว",
      invalid: "มีจำนวนที่ตัดออกมากกว่ารายการที่เหลือในขั้นนั้น กรุณาตรวจตัวเลข",
      official: "เปิดแผนผัง PRISMA ฉบับทางการ",
      inputs: [
        ["databases", "รายการจากฐานข้อมูล"], ["otherSources", "รายการจากแหล่งอื่น"],
        ["duplicatesRemoved", "รายการซ้ำที่ลบออก"], ["automationRemoved", "รายการที่ระบบคัดออกอัตโนมัติ"],
        ["otherRemoved", "รายการที่คัดออกด้วยเหตุผลอื่น"], ["recordsExcluded", "รายการที่คัดออกจากชื่อเรื่อง/บทคัดย่อ"],
        ["reportsNotRetrieved", "รายงานที่ไม่สามารถเข้าถึงฉบับเต็ม"], ["fullTextExcluded", "รายงานฉบับเต็มที่คัดออก"],
      ],
      stages: { identified: "รายการที่ค้นพบ", removed: "รายการที่คัดออกก่อนคัดกรอง", screened: "รายการที่คัดกรอง", sought: "รายงานที่ขอฉบับเต็ม", assessed: "รายงานฉบับเต็มที่ประเมิน", included: "งานวิจัยที่คัดเข้า" },
      example: {
        title: "ตัวอย่าง: การทบทวนเรื่อง AI ช่วยสอนในมหาวิทยาลัย",
        intro: "ตัวอย่างสมมตินี้แสดงว่าตัวเลขเปลี่ยนจากผลการค้นไปเป็นงานวิจัยที่คัดเข้าอย่างไร สังเกตว่าผลรวมของเหตุผลที่คัดออกในขั้นฉบับเต็มต้องเท่ากับจำนวนรายงานฉบับเต็มที่คัดออก",
        note: "ตัวเลขนี้ใช้เพื่ออธิบายวิธีกรอกเท่านั้น เมื่อลงมือทำจริงควรใช้จำนวนจากบันทึกการค้นและการคัดกรองของคุณ",
        inputs: { databases: 1200, otherSources: 50, duplicatesRemoved: 200, automationRemoved: 0, otherRemoved: 10, recordsExcluded: 900, reportsNotRetrieved: 10, fullTextExcluded: 80 },
        reasons: [["ประชากรไม่ตรงเกณฑ์", 30], ["แนวคิดหรือสิ่งที่ศึกษาไม่ตรง", 25], ["รูปแบบการวิจัยไม่ตรงเกณฑ์", 15], ["ไม่รายงานผลลัพธ์ที่กำหนด", 10]],
      },
    },
  },
} as const;
