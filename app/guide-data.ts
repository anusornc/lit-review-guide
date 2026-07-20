import type { Locale } from "./i18n";

export type CommitmentId = "rapid" | "thesis" | "publication";
export type GoalId = "map" | "evaluate" | "understand" | "explain";
export type EvidenceId = "experimental" | "qualitative" | "mixed" | "theoretical" | "uncertain";
export type DisciplineId = "health" | "social" | "education" | "business" | "technology" | "science" | "humanities" | "law-policy" | "interdisciplinary";
export type MethodId = "systematic" | "scoping" | "meta-analysis" | "qualitative" | "realist" | "integrative" | "mixed" | "bibliometric" | "critical" | "umbrella" | "rapid" | "systematic-search" | "meta-ethnography" | "thematic";

type DecisionInput = {
  goal: GoalId | "";
  discipline: DisciplineId | "";
  evidence: EvidenceId | "";
  commitment: CommitmentId | "";
};

type MethodWeights = Partial<Record<MethodId, number>>;

const decisionWeights: {
  goal: Record<GoalId, MethodWeights>;
  discipline: Record<DisciplineId, MethodWeights>;
  evidence: Record<EvidenceId, MethodWeights>;
  commitment: Record<CommitmentId, MethodWeights>;
} = {
  goal: {
    map: { scoping: 5, bibliometric: 3, "systematic-search": 2, integrative: 1 },
    evaluate: { systematic: 5, "meta-analysis": 4, umbrella: 3, rapid: 2 },
    understand: { qualitative: 5, thematic: 4, "meta-ethnography": 3, integrative: 2 },
    explain: { realist: 5, mixed: 3, integrative: 3, qualitative: 1, critical: 1 },
  },
  discipline: {
    health: { systematic: 2, "meta-analysis": 2, umbrella: 2, rapid: 1 },
    social: { qualitative: 2, realist: 2, thematic: 2, critical: 1 },
    education: { mixed: 2, realist: 2, thematic: 2, systematic: 1 },
    business: { integrative: 2, bibliometric: 2, systematic: 1, critical: 1 },
    technology: { "systematic-search": 2, bibliometric: 2, scoping: 1, systematic: 1 },
    science: { "meta-analysis": 2, systematic: 2, scoping: 1, bibliometric: 1 },
    humanities: { critical: 3, integrative: 2, qualitative: 1 },
    "law-policy": { critical: 2, realist: 2, "systematic-search": 2, rapid: 1 },
    interdisciplinary: { scoping: 2, integrative: 2, realist: 1, "systematic-search": 1 },
  },
  evidence: {
    experimental: { "meta-analysis": 4, systematic: 3, umbrella: 2, rapid: 1 },
    qualitative: { qualitative: 4, thematic: 4, "meta-ethnography": 3, realist: 1 },
    mixed: { mixed: 4, integrative: 3, realist: 3, scoping: 2 },
    theoretical: { critical: 4, integrative: 4, qualitative: 1 },
    uncertain: { scoping: 4, "systematic-search": 3, bibliometric: 2, integrative: 1 },
  },
  commitment: {
    rapid: { rapid: 5, "systematic-search": 3, scoping: 1, critical: 1, systematic: -2, "meta-analysis": -2 },
    thesis: { "systematic-search": 4, scoping: 3, integrative: 2, thematic: 1, systematic: 1 },
    publication: { systematic: 4, "meta-analysis": 3, umbrella: 3, realist: 2, qualitative: 2, "meta-ethnography": 2 },
  },
};

const goalCandidates: Record<GoalId, readonly MethodId[]> = {
  map: ["scoping", "bibliometric", "systematic-search", "integrative"],
  evaluate: ["systematic", "meta-analysis", "umbrella", "rapid", "mixed"],
  understand: ["qualitative", "thematic", "meta-ethnography", "integrative", "mixed"],
  explain: ["realist", "mixed", "integrative", "qualitative", "critical"],
};

export function rankMethods(input: DecisionInput): MethodId[] {
  const scores = new Map<MethodId, number>();

  const addWeights = (weights: MethodWeights) => {
    Object.entries(weights).forEach(([methodId, weight]) => {
      const id = methodId as MethodId;
      scores.set(id, (scores.get(id) ?? 0) + weight);
    });
  };

  if (input.goal) addWeights(decisionWeights.goal[input.goal]);
  if (input.discipline) addWeights(decisionWeights.discipline[input.discipline]);
  if (input.evidence) addWeights(decisionWeights.evidence[input.evidence]);
  if (input.commitment) addWeights(decisionWeights.commitment[input.commitment]);

  const candidates = input.goal ? goalCandidates[input.goal] : [...scores.keys()];

  return [...candidates]
    .sort((left, right) => (scores.get(right) ?? 0) - (scores.get(left) ?? 0) || left.localeCompare(right));
}

const referenceLinks = [
  { id: "prisma", href: "https://www.prisma-statement.org/" },
  { id: "prisma-scr", href: "https://www.prisma-statement.org/scoping" },
  { id: "rameses", href: "https://www.ramesesproject.org/Standards_and_Training_materials.php" },
  { id: "emerge", href: "https://emergeproject.org/" },
  { id: "equator", href: "https://www.equator-network.org/reporting-guidelines/" },
] as const;

export const mergedGuideContent = {
  en: {
    commitments: [
      { id: "rapid", title: "A decision is due soon", description: "Use transparent shortcuts and produce a useful answer in weeks, not months." },
      { id: "thesis", title: "A defensible thesis chapter", description: "Show a reproducible search and reasoned synthesis without claiming a full review." },
      { id: "publication", title: "A publishable evidence synthesis", description: "Plan a protocol, team review, comprehensive search, appraisal, and formal reporting." },
    ],
    extraMethods: [
      {
        id: "umbrella", name: "Umbrella review", family: "Reviews of reviews",
        summary: "Synthesizes existing systematic reviews rather than returning to every primary study.",
        bestFor: "Questions with several mature reviews that need a high-level comparison of findings and certainty.",
        avoidWhen: "Primary evidence is new, existing reviews overlap heavily, or their quality is too weak.",
        output: "A structured synthesis of review-level evidence, overlap, quality, and remaining uncertainty.",
        time: "Often 6–12 months",
        steps: ["Frame review-level question", "Search for reviews", "Manage overlap", "Appraise reviews", "Synthesize certainty"],
        quality: "Appraise the included reviews and make double-counting of primary studies visible.",
      },
      {
        id: "rapid", name: "Rapid review", family: "Time-sensitive decision",
        summary: "Applies explicit, documented shortcuts to evidence synthesis when a decision cannot wait.",
        bestFor: "Urgent policy, service, or programme decisions with a clearly defined decision-maker and deadline.",
        avoidWhen: "Stakeholders need exhaustive coverage or shortcuts could change a high-stakes conclusion.",
        output: "A time-bounded evidence brief with visible shortcuts, uncertainties, and update needs.",
        time: "Often 2–12 weeks",
        steps: ["Agree decision scope", "Choose shortcuts", "Search and screen", "Appraise key evidence", "Report limits"],
        quality: "Pre-specify every shortcut and explain how it may alter the conclusion.",
      },
      {
        id: "systematic-search", name: "Systematic search and review", family: "Defensible thesis search",
        summary: "Uses a transparent, reproducible search with a proportionate synthesis for a thesis or proposal.",
        bestFor: "Graduate work that needs a defensible literature base but is not claiming a full systematic review.",
        avoidWhen: "The title or conclusion implies exhaustive synthesis without the team, appraisal, or protocol to support it.",
        output: "A traceable search, screening account, evidence matrix, and bounded narrative synthesis.",
        time: "Often 2–6 months",
        steps: ["Bound the chapter", "Build search blocks", "Log searches", "Screen consistently", "Synthesize by question"],
        quality: "Name the design honestly and distinguish systematic searching from a full systematic review.",
      },
      {
        id: "meta-ethnography", name: "Meta-ethnography", family: "Interpretive synthesis",
        summary: "Translates concepts across qualitative studies to develop a new interpretation or theory.",
        bestFor: "A focused body of rich qualitative studies with concepts that can be compared and translated.",
        avoidWhen: "Studies provide thin findings, contexts are erased, or the team only wants descriptive themes.",
        output: "Reciprocal and refutational translations, a line of argument, and higher-order interpretation.",
        time: "Often 6–15 months",
        steps: ["Select a focused corpus", "Read interpretively", "Relate studies", "Translate concepts", "Build a line of argument"],
        quality: "Preserve second-order interpretations and document how translations were developed.",
      },
      {
        id: "thematic", name: "Thematic synthesis", family: "Transparent qualitative synthesis",
        summary: "Codes qualitative findings line by line, then develops descriptive and analytical themes.",
        bestFor: "Qualitative evidence where a transparent route from study findings to actionable themes is needed.",
        avoidWhen: "The goal is deep theory translation rather than theme development, or findings are too sparse to code.",
        output: "Descriptive themes, analytical themes, and a traceable coding framework.",
        time: "Often 4–10 months",
        steps: ["Extract findings", "Code line by line", "Build descriptive themes", "Develop analytical themes", "Test disconfirming cases"],
        quality: "Keep the boundary between authors’ findings and reviewers’ interpretation explicit.",
      },
    ],
    interdisciplinary: {
      id: "interdisciplinary", marker: "I", name: "Interdisciplinary & emerging fields",
      intro: "Questions that cross evidence cultures, such as AI ethics, sustainability, One Health, and climate adaptation.",
      questions: "Concept alignment, evidence gaps, system mechanisms, contested definitions, emerging practice",
      sources: "Scopus, Web of Science, OpenAlex, Dimensions, Lens, Google Scholar, domain repositories",
      methods: ["Scoping review", "Integrative review", "Realist review", "Systematic search and review"],
      caution: "Define boundaries explicitly and search more than one disciplinary vocabulary and database family.",
    },
    methodDeepDives: {
      systematic: { search: "Search multiple relevant databases, registries, citations, and grey literature; preserve full strategies and dates.", appraisal: "Match risk-of-bias tools to each study design; assess certainty separately from reporting quality.", reporting: "PRISMA 2020 and the relevant extension where applicable.", tools: "Zotero or EndNote · Rayyan or Covidence · spreadsheets or review software", reference: "prisma" },
      scoping: { search: "Use a broad, often iterative search across concepts and evidence types; document refinements.", appraisal: "Critical appraisal is purpose-dependent, not automatic; state and justify the decision.", reporting: "PRISMA-ScR; check whether an updated extension applies when you report.", tools: "Zotero · Rayyan or Covidence · spreadsheet or qualitative charting tool", reference: "prisma-scr" },
      "meta-analysis": { search: "Usually sits inside a systematic review and therefore inherits its comprehensive search.", appraisal: "Assess study-level bias, heterogeneity, sensitivity, reporting bias, and certainty of the body of evidence.", reporting: "Use PRISMA 2020 plus guidance appropriate to the analysis and study designs.", tools: "R (metafor or meta) · Stata · RevMan", reference: "prisma" },
      qualitative: { search: "Combine database searching with citation chaining and purposive searching when conceptual richness matters.", appraisal: "Use a qualitative appraisal approach consistently while preserving context and reflexivity.", reporting: "Consult EQUATOR for current qualitative evidence-synthesis guidance relevant to the chosen method.", tools: "NVivo · ATLAS.ti · MAXQDA · structured spreadsheets", reference: "equator" },
      realist: { search: "Search iteratively to develop and test programme theory; relevance and rigour guide inclusion.", appraisal: "Judge whether evidence can support, refine, or challenge the proposed context–mechanism–outcome explanation.", reporting: "RAMESES publication and quality standards for realist synthesis.", tools: "Reference manager · structured theory matrix · qualitative analysis tool", reference: "rameses" },
      integrative: { search: "Search empirical, theoretical, and practice sources using transparent boundaries and iterative refinement.", appraisal: "Use design-sensitive appraisal and explain how unlike evidence types influence the synthesis.", reporting: "No single universal standard; report selection, appraisal, and synthesis decisions explicitly.", tools: "Reference manager · concept matrix · qualitative analysis tool" },
      mixed: { search: "Plan linked searches or one inclusive strategy that can retrieve both quantitative and qualitative evidence.", appraisal: "Appraise each design appropriately, then evaluate the logic and quality of integration.", reporting: "Use reporting guidance for each evidence stream and make the integration method explicit.", tools: "Review platform · statistics software · qualitative analysis tool · joint display matrix", reference: "equator" },
      bibliometric: { search: "Define database coverage, document the query and export date, then deduplicate and clean metadata.", appraisal: "Audit metadata quality, database bias, author disambiguation, thresholds, and sensitivity to parameter choices.", reporting: "Report database, query, date, cleaning rules, indicators, and network parameters.", tools: "VOSviewer · bibliometrix · CiteSpace · OpenRefine" },
      critical: { search: "Use justified purposive and theoretical sampling, including foundational work and strong counter-positions.", appraisal: "Evaluate conceptual coherence, assumptions, positionality, historical context, and excluded voices.", reporting: "No universal checklist; make corpus boundaries, selection logic, and argumentative method visible.", tools: "Reference manager · concept map · argument matrix" },
      umbrella: { search: "Search review databases and bibliographic databases for systematic reviews; track overlap among primary studies.", appraisal: "Use an appropriate review-appraisal tool and examine overlap, recency, and certainty.", reporting: "Use PRISMA 2020 where applicable and report overlap management explicitly.", tools: "Review platform · citation matrix · spreadsheet · certainty framework", reference: "prisma" },
      rapid: { search: "Limit sources, dates, languages, or reviewer duplication only when agreed and documented in advance.", appraisal: "Retain proportionate appraisal of decision-critical evidence; do not hide omitted steps.", reporting: "Use current rapid-review guidance and describe every shortcut and its likely consequence.", tools: "Rayyan · Zotero · spreadsheet · automation with human verification", reference: "equator" },
      "systematic-search": { search: "Build reproducible concept blocks, search several appropriate sources, log exact strings and dates, and deduplicate.", appraisal: "Use a proportionate tool for claims that depend on study quality; state any omitted appraisal.", reporting: "A transparent methods section and flow account; do not label the work a full systematic review unless it meets that standard.", tools: "Zotero · Rayyan · search log · evidence matrix" },
      "meta-ethnography": { search: "Seek a conceptually rich, focused corpus; iterative searching and citation chaining can be appropriate.", appraisal: "Assess conceptual richness, context, and the quality of first- and second-order interpretations.", reporting: "eMERGe reporting guidance for meta-ethnography.", tools: "NVivo · ATLAS.ti · translation table · concept map", reference: "emerge" },
      thematic: { search: "Retrieve qualitative studies broadly enough to capture perspectives and variation in the phenomenon.", appraisal: "Appraise qualitative rigour and relevance; carry context and disconfirming findings into coding.", reporting: "Consult current qualitative synthesis guidance and report the route from codes to analytical themes.", tools: "NVivo · ATLAS.ti · MAXQDA · structured spreadsheet", reference: "equator" },
    },
    disciplineDeepDives: {
      health: { journals: ["Cochrane Database of Systematic Reviews", "BMJ", "JAMA", "The Lancet"], standards: ["PRISMA family", "Cochrane Handbook", "JBI Manual", "GRADE where appropriate"], tools: ["Covidence", "Rayyan", "RevMan", "GRADEpro"], tip: "Separate reporting guidance, risk-of-bias appraisal, and certainty assessment: they solve different problems." },
      social: { journals: ["Psychological Bulletin", "Annual Review of Sociology", "Social Science & Medicine"], standards: ["PRISMA where applicable", "ENTREQ or method-specific qualitative guidance", "APA reporting guidance"], tools: ["Rayyan", "NVivo", "R", "Zotero"], tip: "Preserve context, construct definitions, and publication-bias concerns instead of treating every measure as equivalent." },
      education: { journals: ["Review of Educational Research", "Educational Research Review", "Teaching and Teacher Education"], standards: ["PRISMA where applicable", "RAMESES for realist synthesis", "method-specific qualitative guidance"], tools: ["EPPI-Reviewer", "Rayyan", "NVivo", "Zotero"], tip: "Record learner age, setting, implementation fidelity, and equity because effects rarely travel without context." },
      business: { journals: ["Academy of Management Review", "Journal of Management", "International Journal of Management Reviews"], standards: ["Transparent protocol", "PRISMA where appropriate", "field-specific review guidance"], tools: ["Zotero", "VOSviewer", "bibliometrix", "NVivo"], tip: "Distinguish evidence synthesis from consultancy commentary and explain how theory shaped inclusion and interpretation." },
      technology: { journals: ["ACM Computing Surveys", "IEEE Transactions", "Empirical Software Engineering"], standards: ["Transparent SLR or mapping protocol", "PRISMA where appropriate", "software-engineering review guidance"], tools: ["Zotero", "Rayyan", "VOSviewer", "R or Python"], tip: "Record technology versions, benchmark comparability, venue types, preprints, and the date at which evidence becomes stale." },
      science: { journals: ["Environmental Evidence", "Annual Review journals", "discipline-specific review journals"], standards: ["PRISMA where applicable", "ROSES in environmental evidence", "discipline-specific synthesis guidance"], tools: ["R", "bibliometrix", "Zotero", "GIS where relevant"], tip: "Plan heterogeneity around species, geography, scale, exposure, and measurement before choosing a pooled model." },
      humanities: { journals: ["Discipline review journals", "JSTOR collections", "Project MUSE journals"], standards: ["Explicit corpus boundaries", "Source criticism", "Positionality and counter-argument"], tools: ["Zotero", "Omeka", "Voyant Tools", "qualitative coding tools"], tip: "Rigor comes from transparent corpus construction and interpretation, not from forcing every question into a biomedical template." },
      "law-policy": { journals: ["Jurisdiction-specific law reviews", "Public Administration Review", "Policy Studies Journal"], standards: ["Authority hierarchy and citation standard", "PRISMA for empirical reviews", "RAMESES for complex policy questions"], tools: ["Westlaw or Lexis", "HeinOnline", "Zotero", "NVivo"], tip: "Separate doctrinal claims about what the law is from empirical claims about what a policy does." },
      interdisciplinary: { journals: ["Nature Sustainability", "PNAS", "One Earth", "field-specific frontier venues"], standards: ["PRISMA family where applicable", "JBI Manual", "explicit boundary and vocabulary decisions"], tools: ["OpenAlex", "VOSviewer", "Connected Papers", "Zotero"], tip: "Search across vocabularies and database families; a single discipline’s index will systematically miss part of the field." },
    },
    workflow: {
      index: "02 · Execute the review", title: "Execute your review in six traceable phases.",
      intro: "Each phase should leave an artefact that another researcher—or your future self—can inspect.",
      outputLabel: "Leave behind", checkpointLabel: "Decision gate",
      phases: [
        { title: "Scope", purpose: "Turn the topic into a reviewable question, contribution, and boundary.", outputs: ["Question framework", "Eligibility criteria", "Review type rationale"], checkpoint: "Can the intended claim be supported by the planned evidence?" },
        { title: "Search", purpose: "Translate the question into concepts, synonyms, sources, and a reproducible search log.", outputs: ["Concept blocks", "Piloted strategies", "Search log"], checkpoint: "Do known sentinel papers appear, and is every search reproducible?" },
        { title: "Screen", purpose: "Apply eligibility rules consistently and preserve the reason for every exclusion.", outputs: ["Deduplicated library", "Screening decisions", "Flow counts"], checkpoint: "Would two reviewers interpret the criteria in the same way?" },
        { title: "Appraise", purpose: "Judge the kind and strength of claim each source can support.", outputs: ["Appraisal records", "Risk-of-bias judgements", "Evidence limitations"], checkpoint: "Is the tool appropriate to the study design and review purpose?" },
        { title: "Extract", purpose: "Capture comparable evidence without stripping away context needed for synthesis.", outputs: ["Extraction form", "Evidence matrix", "Audit notes"], checkpoint: "Can every synthesized claim be traced back to a source location?" },
        { title: "Write", purpose: "Build an argument that connects findings, uncertainty, limitations, and contribution.", outputs: ["Synthesis structure", "Tables or maps", "Reporting checklist"], checkpoint: "Does the conclusion stay inside the evidence and protocol boundaries?" },
      ],
    },
    toolkit: {
      index: "05 · Research toolkit", title: "Move from advice to working research artefacts.",
      intro: "Copy a starter, adapt it to your discipline, and preserve the decisions that make your review auditable.",
      searchTitle: "Boolean search canvas", searchIntro: "Build one block per concept. Add synonyms with OR; connect concepts with AND; add controlled vocabulary inside each database.",
      searchCode: "(\"artificial intelligence\" OR \"machine learning\" OR AI)\nAND\n(education OR teaching OR learning)\nAND\n(ethics OR bias OR fairness)",
      copy: "Copy", copied: "Copied ✓", templateLabel: "Copy-ready template",
      appraisalTitle: "Choose appraisal by evidence design", appraisalIntro: "The design of the included study—not the prestige of its journal—determines the appraisal lens.",
      appraisalRows: [
        ["Randomized intervention", "Randomization, deviations, missing outcomes, measurement, reporting", "RoB 2 or a field-equivalent tool"],
        ["Non-randomized intervention", "Confounding, selection, classification, deviations, missingness", "ROBINS-I or a field-equivalent tool"],
        ["Qualitative study", "Fit, recruitment, reflexivity, analysis, context, credibility", "CASP, JBI, or a discipline-appropriate tool"],
        ["Mixed-methods study", "Quality of each component and the logic of integration", "MMAT or design-specific tools plus integration appraisal"],
        ["Systematic review", "Protocol, search, selection, appraisal, synthesis, bias", "AMSTAR 2 or a purpose-appropriate review tool"],
      ],
      tableHeadings: ["Evidence design", "Inspect", "Possible starting tool"],
      templates: [
        { id: "search-log", name: "Search log template", purpose: "Make every database search reproducible.", content: "Database: [name]\nPlatform: [provider]\nDate searched: [YYYY-MM-DD]\nCoverage: [start–end]\nExact search string: [paste]\nFilters: [list or none]\nResults returned: [n]\nExport file: [name]\nNotes and changes: [why]" },
        { id: "eligibility", name: "Eligibility decision form", purpose: "Keep screening decisions consistent and explainable.", content: "Study ID: [author-year]\nReviewer: [name]\nStage: [title/abstract | full text]\nDecision: [include | exclude | discuss]\nCriterion triggered: [criterion]\nExclusion reason: [one specific reason]\nNotes: [context or uncertainty]" },
        { id: "matrix", name: "Evidence extraction matrix", purpose: "Connect study context, design, finding, and quality.", content: "Citation | Country/setting | Aim | Design | Sample/data | Intervention or phenomenon | Outcome/finding | Context | Limitation | Appraisal | Reviewer note" },
        { id: "protocol", name: "One-page protocol starter", purpose: "Align the team before the search expands.", content: "Decision this review supports:\nReview question:\nReview type and rationale:\nPopulation/phenomenon:\nConcept/intervention:\nContext/comparator:\nEligible evidence designs:\nSources to search:\nAppraisal approach:\nSynthesis approach:\nRegistration/reporting plan:\nKnown constraints:" },
      ],
      pitfallsTitle: "Six failure modes to catch early",
      pitfalls: [
        ["Method-first thinking", "Choosing a fashionable label before defining the claim and evidence."],
        ["One-database confidence", "Treating one index or Google Scholar as complete coverage."],
        ["Moving criteria", "Changing eligibility after seeing results without documenting the decision."],
        ["Tool mismatch", "Using one appraisal checklist for unlike study designs."],
        ["Spreadsheet amnesia", "Keeping findings without page, table, or quotation traceability."],
        ["Conclusion inflation", "Making causal or universal claims that the included evidence cannot support."],
      ],
      referencesTitle: "Official reporting resources", referencesNote: "Guidelines evolve. Confirm the current version and the requirements of your target journal or institution.",
      references: [
        { ...referenceLinks[0], label: "PRISMA statement" },
        { ...referenceLinks[1], label: "PRISMA for scoping reviews" },
        { ...referenceLinks[2], label: "RAMESES standards" },
        { ...referenceLinks[3], label: "eMERGe meta-ethnography guidance" },
        { ...referenceLinks[4], label: "EQUATOR guideline library" },
      ],
    },
  },
  th: {
    commitments: [
      { id: "rapid", title: "ต้องใช้ผลเพื่อตัดสินใจเร็ว", description: "ใช้ทางลัดอย่างโปร่งใส เพื่อได้คำตอบที่นำไปใช้ได้ภายในไม่กี่สัปดาห์" },
      { id: "thesis", title: "บทวิทยานิพนธ์ที่ปกป้องได้", description: "แสดงการค้นที่ทำซ้ำได้และการสังเคราะห์ที่มีเหตุผล โดยไม่อ้างว่าเป็น systematic review เต็มรูปแบบ" },
      { id: "publication", title: "งานสังเคราะห์เพื่อตีพิมพ์", description: "วางโครงร่าง ทีมผู้ทบทวน การค้นครอบคลุม การประเมิน และการรายงานตามมาตรฐาน" },
    ],
    extraMethods: [
      {
        id: "umbrella", name: "การทบทวนแบบร่ม", family: "ทบทวนงานทบทวน",
        summary: "สังเคราะห์ systematic reviews ที่มีอยู่ แทนการกลับไปพิจารณางานปฐมภูมิทุกชิ้น",
        bestFor: "คำถามที่มีงานทบทวนคุณภาพดีหลายชุด และต้องการเปรียบเทียบข้อค้นพบกับความเชื่อมั่นในภาพรวม",
        avoidWhen: "หลักฐานปฐมภูมิใหม่กว่า งานทบทวนซ้ำซ้อนมาก หรือคุณภาพงานทบทวนเดิมอ่อนเกินไป",
        output: "ข้อสังเคราะห์ระดับงานทบทวน พร้อมความซ้ำซ้อน คุณภาพ และความไม่แน่นอนที่ยังเหลือ",
        time: "โดยมาก 6–12 เดือน",
        steps: ["กำหนดคำถามระดับงานทบทวน", "ค้นหางานทบทวน", "จัดการความซ้ำซ้อน", "ประเมินงานทบทวน", "สังเคราะห์ความเชื่อมั่น"],
        quality: "ประเมินคุณภาพงานทบทวนและเปิดเผยการนับงานปฐมภูมิซ้ำ",
      },
      {
        id: "rapid", name: "การทบทวนแบบเร่งรัด", family: "การตัดสินใจเร่งด่วน",
        summary: "ใช้ทางลัดที่กำหนดและบันทึกไว้อย่างชัดเจน เมื่อการตัดสินใจไม่สามารถรอได้",
        bestFor: "การตัดสินใจเชิงนโยบาย บริการ หรือโครงการที่มีผู้ใช้ผลลัพธ์และกำหนดเวลาชัดเจน",
        avoidWhen: "ผู้ใช้ต้องการความครอบคลุมทั้งหมด หรือทางลัดอาจเปลี่ยนข้อสรุปที่มีความเสี่ยงสูง",
        output: "รายงานหลักฐานตามกรอบเวลา พร้อมทางลัด ความไม่แน่นอน และความจำเป็นต้องปรับปรุง",
        time: "โดยมาก 2–12 สัปดาห์",
        steps: ["ตกลงขอบเขตการตัดสินใจ", "เลือกทางลัด", "ค้นและคัดกรอง", "ประเมินหลักฐานสำคัญ", "รายงานข้อจำกัด"],
        quality: "กำหนดทางลัดล่วงหน้าและอธิบายว่าทางลัดอาจกระทบข้อสรุปอย่างไร",
      },
      {
        id: "systematic-search", name: "การค้นและทบทวนอย่างเป็นระบบ", family: "การค้นเพื่อวิทยานิพนธ์",
        summary: "ใช้การค้นที่โปร่งใสและทำซ้ำได้ ร่วมกับการสังเคราะห์ที่พอเหมาะสำหรับวิทยานิพนธ์หรือข้อเสนอโครงการ",
        bestFor: "งานบัณฑิตศึกษาที่ต้องการฐานวรรณกรรมที่ปกป้องได้ แต่ไม่ได้อ้างว่าเป็น systematic review เต็มรูปแบบ",
        avoidWhen: "ชื่อเรื่องหรือข้อสรุปอ้างความครอบคลุมทั้งหมด โดยไม่มีทีม การประเมิน หรือโครงร่างรองรับ",
        output: "การค้นที่ตรวจสอบย้อนกลับได้ บัญชีการคัดกรอง ตารางหลักฐาน และการสังเคราะห์เชิงบรรยายที่มีขอบเขต",
        time: "โดยมาก 2–6 เดือน",
        steps: ["กำหนดขอบเขตบท", "สร้างชุดคำค้น", "บันทึกการค้น", "คัดกรองสม่ำเสมอ", "สังเคราะห์ตามคำถาม"],
        quality: "เรียกชื่อแบบแผนให้ตรง และแยกการค้นอย่างเป็นระบบออกจาก systematic review เต็มรูปแบบ",
      },
      {
        id: "meta-ethnography", name: "เมตาชาติพันธุ์วรรณนา", family: "การสังเคราะห์เชิงตีความ",
        summary: "แปลแนวคิดข้ามงานวิจัยเชิงคุณภาพ เพื่อพัฒนาการตีความหรือทฤษฎีใหม่",
        bestFor: "กลุ่มงานเชิงคุณภาพที่เจาะจงและมีแนวคิดเข้มข้น ซึ่งสามารถนำมาเปรียบเทียบและแปลข้ามกันได้",
        avoidWhen: "ข้อค้นพบบางเกินไป บริบทถูกตัดทิ้ง หรือทีมต้องการเพียงหัวข้อเชิงพรรณนา",
        output: "การแปลแนวคิดทั้งที่สอดคล้องและขัดแย้ง แนวข้อโต้แย้ง และการตีความระดับสูง",
        time: "โดยมาก 6–15 เดือน",
        steps: ["เลือกคลังงานที่เจาะจง", "อ่านเชิงตีความ", "เชื่อมความสัมพันธ์ของงาน", "แปลแนวคิด", "สร้างแนวข้อโต้แย้ง"],
        quality: "รักษาการตีความระดับที่สอง และบันทึกเส้นทางการพัฒนาคำแปลแนวคิด",
      },
      {
        id: "thematic", name: "การสังเคราะห์เชิงประเด็น", family: "การสังเคราะห์เชิงคุณภาพที่ตรวจสอบได้",
        summary: "เข้ารหัสข้อค้นพบเชิงคุณภาพทีละบรรทัด ก่อนพัฒนาเป็นประเด็นเชิงพรรณนาและเชิงวิเคราะห์",
        bestFor: "หลักฐานเชิงคุณภาพที่ต้องการเส้นทางโปร่งใสจากข้อค้นพบของงานไปสู่ประเด็นที่นำไปใช้ได้",
        avoidWhen: "เป้าหมายคือการแปลทฤษฎีเชิงลึกแทนการสร้างประเด็น หรือข้อค้นพบบางเกินกว่าจะเข้ารหัส",
        output: "ประเด็นเชิงพรรณนา ประเด็นเชิงวิเคราะห์ และกรอบรหัสที่ตรวจสอบย้อนกลับได้",
        time: "โดยมาก 4–10 เดือน",
        steps: ["ดึงข้อค้นพบ", "เข้ารหัสทีละบรรทัด", "สร้างประเด็นเชิงพรรณนา", "พัฒนาประเด็นเชิงวิเคราะห์", "ตรวจกรณีที่ขัดแย้ง"],
        quality: "แยกข้อค้นพบของผู้เขียนเดิมออกจากการตีความของผู้ทบทวนให้ชัด",
      },
    ],
    interdisciplinary: {
      id: "interdisciplinary", marker: "ส", name: "สหวิทยาการและสาขาเกิดใหม่",
      intro: "คำถามที่ข้ามวัฒนธรรมหลักฐาน เช่น จริยธรรม AI ความยั่งยืน One Health และการปรับตัวต่อภูมิอากาศ",
      questions: "การเชื่อมแนวคิด ช่องว่างหลักฐาน กลไกระบบ นิยามที่ยังถกเถียง และแนวปฏิบัติใหม่",
      sources: "Scopus, Web of Science, OpenAlex, Dimensions, Lens, Google Scholar และคลังเฉพาะศาสตร์",
      methods: ["การทบทวนขอบเขต", "การทบทวนเชิงบูรณาการ", "การทบทวนแบบสัจนิยม", "การค้นและทบทวนอย่างเป็นระบบ"],
      caution: "กำหนดขอบเขตให้ชัด และค้นด้วยคำศัพท์กับฐานข้อมูลจากมากกว่าหนึ่งศาสตร์",
    },
    methodDeepDives: {
      systematic: { search: "ค้นหลายฐานข้อมูลที่เกี่ยวข้อง ทะเบียนงาน การอ้างอิง และวรรณกรรมสีเทา พร้อมเก็บคำค้นและวันที่ครบถ้วน", appraisal: "เลือกเครื่องมือประเมินความเสี่ยงอคติตามแบบแผนการศึกษา และแยกการประเมินความเชื่อมั่นออกจากคุณภาพการรายงาน", reporting: "PRISMA 2020 และส่วนขยายที่เกี่ยวข้อง", tools: "Zotero หรือ EndNote · Rayyan หรือ Covidence · ตารางหรือโปรแกรมงานทบทวน", reference: "prisma" },
      scoping: { search: "ค้นอย่างกว้างและปรับซ้ำได้ตามแนวคิดกับชนิดหลักฐาน พร้อมบันทึกการเปลี่ยนแปลง", appraisal: "การประเมินคุณภาพขึ้นกับวัตถุประสงค์ ไม่ได้บังคับเสมอ ต้องระบุและให้เหตุผล", reporting: "PRISMA-ScR และตรวจว่ามีฉบับปรับปรุงที่ต้องใช้หรือไม่", tools: "Zotero · Rayyan หรือ Covidence · ตารางจัดหมวดหลักฐาน", reference: "prisma-scr" },
      "meta-analysis": { search: "โดยทั่วไปเป็นส่วนหนึ่งของ systematic review จึงใช้การค้นที่ครอบคลุมในระดับเดียวกัน", appraisal: "ประเมินอคติรายงานวิจัย ความแตกต่าง ความไว อคติการรายงาน และความเชื่อมั่นของหลักฐาน", reporting: "ใช้ PRISMA 2020 ร่วมกับแนวทางที่ตรงกับการวิเคราะห์และแบบแผนการศึกษา", tools: "R (metafor หรือ meta) · Stata · RevMan", reference: "prisma" },
      qualitative: { search: "ผสมการค้นฐานข้อมูล การตามการอ้างอิง และการค้นแบบมีเป้าหมายเมื่อความเข้มข้นของแนวคิดมีความสำคัญ", appraisal: "ใช้แนวทางประเมินเชิงคุณภาพอย่างสม่ำเสมอ พร้อมรักษาบริบทและการสะท้อนตน", reporting: "ตรวจคลัง EQUATOR เพื่อเลือกแนวทางล่าสุดที่ตรงกับวิธีสังเคราะห์เชิงคุณภาพ", tools: "NVivo · ATLAS.ti · MAXQDA · ตารางที่มีโครงสร้าง", reference: "equator" },
      realist: { search: "ค้นแบบวนซ้ำเพื่อพัฒนาและทดสอบทฤษฎีโครงการ โดยใช้ความเกี่ยวข้องและความเข้มแข็งกำกับการเลือก", appraisal: "ตัดสินว่าหลักฐานช่วยรองรับ ปรับ หรือท้าทายคำอธิบายบริบท–กลไก–ผลลัพธ์ได้หรือไม่", reporting: "มาตรฐานการตีพิมพ์และคุณภาพ RAMESES สำหรับ realist synthesis", tools: "โปรแกรมจัดการอ้างอิง · ตารางทฤษฎี · โปรแกรมวิเคราะห์เชิงคุณภาพ", reference: "rameses" },
      integrative: { search: "ค้นแหล่งเชิงประจักษ์ ทฤษฎี และการปฏิบัติด้วยขอบเขตโปร่งใสและปรับซ้ำอย่างมีเหตุผล", appraisal: "ประเมินตามแบบแผนและอธิบายว่าหลักฐานต่างชนิดมีน้ำหนักต่อการสังเคราะห์อย่างไร", reporting: "ไม่มีมาตรฐานสากลเพียงชุดเดียว จึงต้องรายงานการเลือก ประเมิน และสังเคราะห์อย่างชัดเจน", tools: "โปรแกรมอ้างอิง · ตารางแนวคิด · โปรแกรมวิเคราะห์เชิงคุณภาพ" },
      mixed: { search: "วางการค้นที่เชื่อมกันหรือคำค้นชุดเดียวที่ครอบคลุมทั้งหลักฐานเชิงปริมาณและคุณภาพ", appraisal: "ประเมินแต่ละแบบแผนให้เหมาะสม แล้วประเมินตรรกะและคุณภาพของการบูรณาการ", reporting: "ใช้แนวทางของหลักฐานแต่ละสายและเปิดเผยวิธีบูรณาการ", tools: "ระบบงานทบทวน · โปรแกรมสถิติ · โปรแกรมเชิงคุณภาพ · joint display", reference: "equator" },
      bibliometric: { search: "กำหนดความครอบคลุมฐานข้อมูล บันทึกคำค้นกับวันส่งออก แล้วลบซ้ำและทำความสะอาดเมตาดาตา", appraisal: "ตรวจคุณภาพเมตาดาตา อคติฐานข้อมูล การแยกชื่อผู้แต่ง เกณฑ์ และความไวต่อพารามิเตอร์", reporting: "รายงานฐานข้อมูล คำค้น วันที่ กฎทำความสะอาด ตัวชี้วัด และพารามิเตอร์เครือข่าย", tools: "VOSviewer · bibliometrix · CiteSpace · OpenRefine" },
      critical: { search: "สุ่มเลือกเชิงทฤษฎีอย่างมีเหตุผล รวมทั้งงานฐานรากและข้อโต้แย้งอีกด้านที่เข้มแข็ง", appraisal: "ประเมินความสอดคล้องแนวคิด สมมติฐาน จุดยืน บริบทประวัติศาสตร์ และเสียงที่ถูกละเลย", reporting: "ไม่มี checklist สากล ต้องเปิดเผยขอบเขตคลัง ตรรกะการเลือก และวิธีสร้างข้อโต้แย้ง", tools: "โปรแกรมอ้างอิง · แผนผังแนวคิด · ตารางข้อโต้แย้ง" },
      umbrella: { search: "ค้นฐานงานทบทวนและฐานบรรณานุกรม พร้อมติดตามความซ้ำซ้อนของงานปฐมภูมิ", appraisal: "ใช้เครื่องมือประเมินงานทบทวนที่เหมาะสม และพิจารณาความซ้ำ ความทันสมัย และความเชื่อมั่น", reporting: "ใช้ PRISMA 2020 เมื่อเหมาะสม และรายงานวิธีจัดการความซ้ำซ้อน", tools: "ระบบงานทบทวน · ตารางอ้างอิงไขว้ · ตารางข้อมูล · กรอบความเชื่อมั่น", reference: "prisma" },
      rapid: { search: "จำกัดแหล่ง ช่วงเวลา ภาษา หรือการทำซ้ำของผู้ทบทวน เฉพาะเมื่อกำหนดและบันทึกล่วงหน้า", appraisal: "คงการประเมินที่พอเหมาะสำหรับหลักฐานสำคัญต่อการตัดสินใจ และไม่ซ่อนขั้นที่ตัดออก", reporting: "ใช้แนวทาง rapid review ปัจจุบัน พร้อมบอกทุกทางลัดและผลที่อาจเกิด", tools: "Rayyan · Zotero · ตารางข้อมูล · ระบบอัตโนมัติที่มีมนุษย์ตรวจ", reference: "equator" },
      "systematic-search": { search: "สร้างชุดแนวคิดที่ทำซ้ำได้ ค้นหลายแหล่ง บันทึกคำค้นกับวันที่ และลบรายการซ้ำ", appraisal: "ใช้เครื่องมือพอเหมาะกับข้ออ้างที่ขึ้นกับคุณภาพงาน และระบุหากไม่ได้ประเมิน", reporting: "เขียนวิธีและผังการคัดเลือกอย่างโปร่งใส และไม่เรียกว่า systematic review เต็มรูปแบบหากยังไม่ถึงมาตรฐาน", tools: "Zotero · Rayyan · บันทึกการค้น · ตารางหลักฐาน" },
      "meta-ethnography": { search: "ค้นคลังงานที่มีแนวคิดเข้มข้นและเจาะจง โดยอาจปรับซ้ำและตามการอ้างอิง", appraisal: "ประเมินความเข้มข้นแนวคิด บริบท และคุณภาพการตีความระดับแรกกับระดับที่สอง", reporting: "แนวทาง eMERGe สำหรับการรายงาน meta-ethnography", tools: "NVivo · ATLAS.ti · ตารางแปลแนวคิด · แผนผังแนวคิด", reference: "emerge" },
      thematic: { search: "ค้นงานเชิงคุณภาพให้กว้างพอที่จะครอบคลุมมุมมองและความแตกต่างของปรากฏการณ์", appraisal: "ประเมินความเข้มแข็งและความเกี่ยวข้องเชิงคุณภาพ พร้อมรักษาบริบทและข้อค้นพบที่ขัดแย้ง", reporting: "ตรวจแนวทางสังเคราะห์เชิงคุณภาพปัจจุบัน และรายงานเส้นทางจากรหัสสู่ประเด็นวิเคราะห์", tools: "NVivo · ATLAS.ti · MAXQDA · ตารางที่มีโครงสร้าง", reference: "equator" },
    },
    disciplineDeepDives: {
      health: { journals: ["Cochrane Database of Systematic Reviews", "BMJ", "JAMA", "The Lancet"], standards: ["ตระกูล PRISMA", "Cochrane Handbook", "JBI Manual", "GRADE เมื่อเหมาะสม"], tools: ["Covidence", "Rayyan", "RevMan", "GRADEpro"], tip: "แยกแนวทางการรายงาน การประเมินความเสี่ยงอคติ และการประเมินความเชื่อมั่น เพราะแต่ละอย่างตอบคนละปัญหา" },
      social: { journals: ["Psychological Bulletin", "Annual Review of Sociology", "Social Science & Medicine"], standards: ["PRISMA เมื่อเหมาะสม", "ENTREQ หรือแนวทางเฉพาะวิธีเชิงคุณภาพ", "แนวทางการรายงาน APA"], tools: ["Rayyan", "NVivo", "R", "Zotero"], tip: "รักษาบริบท นิยามตัวแปร และปัญหา publication bias แทนการถือว่ามาตรวัดทุกชนิดเทียบกันได้" },
      education: { journals: ["Review of Educational Research", "Educational Research Review", "Teaching and Teacher Education"], standards: ["PRISMA เมื่อเหมาะสม", "RAMESES สำหรับ realist synthesis", "แนวทางเฉพาะวิธีเชิงคุณภาพ"], tools: ["EPPI-Reviewer", "Rayyan", "NVivo", "Zotero"], tip: "บันทึกช่วงวัย บริบท ความครบถ้วนของการใช้กิจกรรม และความเป็นธรรม เพราะผลมักไม่ย้ายข้ามบริบทโดยอัตโนมัติ" },
      business: { journals: ["Academy of Management Review", "Journal of Management", "International Journal of Management Reviews"], standards: ["โครงร่างโปร่งใส", "PRISMA เมื่อเหมาะสม", "แนวทางงานทบทวนเฉพาะสาขา"], tools: ["Zotero", "VOSviewer", "bibliometrix", "NVivo"], tip: "แยกการสังเคราะห์หลักฐานออกจากบทความที่ปรึกษา และอธิบายว่าทฤษฎีกำกับการเลือกกับตีความอย่างไร" },
      technology: { journals: ["ACM Computing Surveys", "IEEE Transactions", "Empirical Software Engineering"], standards: ["โครงร่าง SLR หรือ mapping ที่โปร่งใส", "PRISMA เมื่อเหมาะสม", "แนวทางงานทบทวนวิศวกรรมซอฟต์แวร์"], tools: ["Zotero", "Rayyan", "VOSviewer", "R หรือ Python"], tip: "บันทึกรุ่นเทคโนโลยี ความเทียบเคียง benchmark ประเภทเวทีเผยแพร่ preprint และวันที่หลักฐานเริ่มล้าสมัย" },
      science: { journals: ["Environmental Evidence", "วารสาร Annual Review", "วารสารทบทวนเฉพาะศาสตร์"], standards: ["PRISMA เมื่อเหมาะสม", "ROSES สำหรับหลักฐานสิ่งแวดล้อม", "แนวทางสังเคราะห์เฉพาะศาสตร์"], tools: ["R", "bibliometrix", "Zotero", "GIS เมื่อเกี่ยวข้อง"], tip: "วางแผนความแตกต่างด้านชนิด พื้นที่ มาตราส่วน การสัมผัส และการวัดก่อนเลือกแบบจำลองรวม" },
      humanities: { journals: ["วารสารทบทวนเฉพาะศาสตร์", "คลัง JSTOR", "วารสาร Project MUSE"], standards: ["ขอบเขตคลังที่ชัด", "การวิจารณ์แหล่งข้อมูล", "จุดยืนและข้อโต้แย้งอีกด้าน"], tools: ["Zotero", "Omeka", "Voyant Tools", "โปรแกรมเข้ารหัสเชิงคุณภาพ"], tip: "ความเข้มแข็งมาจากการสร้างคลังและตีความอย่างโปร่งใส ไม่ใช่การบังคับทุกคำถามให้เป็นแม่แบบชีวการแพทย์" },
      "law-policy": { journals: ["วารสารกฎหมายตามเขตอำนาจ", "Public Administration Review", "Policy Studies Journal"], standards: ["ลำดับศักดิ์แหล่งกฎหมายและมาตรฐานอ้างอิง", "PRISMA สำหรับงานเชิงประจักษ์", "RAMESES สำหรับคำถามนโยบายซับซ้อน"], tools: ["Westlaw หรือ Lexis", "HeinOnline", "Zotero", "NVivo"], tip: "แยกข้ออ้างเชิงหลักกฎหมายว่า ‘กฎหมายคืออะไร’ ออกจากข้ออ้างเชิงประจักษ์ว่า ‘นโยบายทำให้เกิดอะไร’" },
      interdisciplinary: { journals: ["Nature Sustainability", "PNAS", "One Earth", "เวทีแนวหน้าของแต่ละสาขา"], standards: ["ตระกูล PRISMA เมื่อเหมาะสม", "JBI Manual", "การตัดสินใจเรื่องขอบเขตและคำศัพท์ที่ชัด"], tools: ["OpenAlex", "VOSviewer", "Connected Papers", "Zotero"], tip: "ค้นข้ามชุดคำศัพท์และตระกูลฐานข้อมูล เพราะดัชนีของศาสตร์เดียวจะทำให้หลักฐานบางส่วนหายไปอย่างเป็นระบบ" },
    },
    workflow: {
      index: "02 · ลงมือทำงานทบทวน", title: "ทำงานทบทวนผ่าน 6 ระยะที่ตรวจสอบย้อนกลับได้",
      intro: "ทุกระยะควรทิ้งร่องรอยที่นักวิจัยคนอื่น—หรือตัวคุณในอนาคต—กลับมาตรวจได้",
      outputLabel: "สิ่งที่ต้องเหลือไว้", checkpointLabel: "จุดตรวจการตัดสินใจ",
      phases: [
        { title: "กำหนดขอบเขต", purpose: "เปลี่ยนหัวข้อเป็นคำถาม คุณูปการ และขอบเขตที่ทบทวนได้", outputs: ["กรอบคำถาม", "เกณฑ์คัดเลือก", "เหตุผลเลือกวิธีทบทวน"], checkpoint: "ข้ออ้างที่ตั้งใจสร้าง รองรับได้ด้วยหลักฐานที่วางแผนไว้หรือไม่" },
        { title: "ค้น", purpose: "แปลงคำถามเป็นแนวคิด คำพ้อง แหล่งข้อมูล และบันทึกการค้นที่ทำซ้ำได้", outputs: ["ชุดแนวคิด", "คำค้นที่ทดลองแล้ว", "บันทึกการค้น"], checkpoint: "พบงานหลักที่รู้จัก และทุกการค้นทำซ้ำได้หรือไม่" },
        { title: "คัดกรอง", purpose: "ใช้เกณฑ์คัดเลือกอย่างสม่ำเสมอ และเก็บเหตุผลการตัดออกทุกครั้ง", outputs: ["คลังที่ลบซ้ำแล้ว", "ผลคัดกรอง", "จำนวนในผังการคัดเลือก"], checkpoint: "ผู้ทบทวนสองคนจะตีความเกณฑ์ตรงกันหรือไม่" },
        { title: "ประเมิน", purpose: "ตัดสินว่าหลักฐานแต่ละชิ้นรองรับข้ออ้างชนิดใดและได้มากเพียงใด", outputs: ["แบบบันทึกประเมิน", "คำตัดสินความเสี่ยงอคติ", "ข้อจำกัดหลักฐาน"], checkpoint: "เครื่องมือตรงกับแบบแผนการศึกษาและเป้าหมายงานทบทวนหรือไม่" },
        { title: "ดึงข้อมูล", purpose: "เก็บข้อมูลที่เทียบกันได้ โดยไม่ตัดบริบทที่จำเป็นต่อการสังเคราะห์", outputs: ["แบบดึงข้อมูล", "ตารางหลักฐาน", "บันทึกการตรวจสอบ"], checkpoint: "ข้อสังเคราะห์ทุกข้อย้อนกลับไปยังตำแหน่งในแหล่งข้อมูลได้หรือไม่" },
        { title: "เขียน", purpose: "สร้างข้อโต้แย้งที่เชื่อมผล ความไม่แน่นอน ข้อจำกัด และคุณูปการ", outputs: ["โครงสร้างการสังเคราะห์", "ตารางหรือแผนที่", "รายการตรวจการรายงาน"], checkpoint: "ข้อสรุปยังอยู่ภายในขอบเขตหลักฐานและโครงร่างหรือไม่" },
      ],
    },
    toolkit: {
      index: "05 · เครื่องมือนักวิจัย", title: "เปลี่ยนคำแนะนำให้เป็นชิ้นงานวิจัยที่ใช้ต่อได้",
      intro: "คัดลอกต้นแบบ ปรับให้เข้ากับสาขา และเก็บการตัดสินใจที่ทำให้งานทบทวนตรวจสอบได้",
      searchTitle: "ผืนงานสร้างคำค้น Boolean", searchIntro: "สร้างหนึ่งชุดต่อหนึ่งแนวคิด เชื่อมคำพ้องด้วย OR เชื่อมแนวคิดด้วย AND และเติมศัพท์ควบคุมของแต่ละฐานข้อมูล",
      searchCode: "(\"artificial intelligence\" OR \"machine learning\" OR AI)\nAND\n(education OR teaching OR learning)\nAND\n(ethics OR bias OR fairness)",
      copy: "คัดลอก", copied: "คัดลอกแล้ว ✓", templateLabel: "ต้นแบบพร้อมคัดลอก",
      appraisalTitle: "เลือกการประเมินตามแบบแผนหลักฐาน", appraisalIntro: "แบบแผนของงานที่นำเข้า—ไม่ใช่ชื่อเสียงวารสาร—เป็นตัวกำหนดมุมมองการประเมิน",
      appraisalRows: [
        ["การทดลองแบบสุ่ม", "การสุ่ม การเบี่ยงเบน ข้อมูลหาย การวัด และการเลือกรายงาน", "RoB 2 หรือเครื่องมือเทียบเท่าในสาขา"],
        ["การแทรกแซงไม่สุ่ม", "ตัวแปรกวน การเลือก การจัดกลุ่ม การเบี่ยงเบน และข้อมูลหาย", "ROBINS-I หรือเครื่องมือเทียบเท่า"],
        ["งานเชิงคุณภาพ", "ความเหมาะสม การคัดเลือก การสะท้อนตน การวิเคราะห์ บริบท และความน่าเชื่อถือ", "CASP, JBI หรือเครื่องมือที่เหมาะกับสาขา"],
        ["งานผสานวิธี", "คุณภาพแต่ละส่วนและตรรกะของการบูรณาการ", "MMAT หรือเครื่องมือรายแบบแผนร่วมกับการประเมินการบูรณาการ"],
        ["งานทบทวนอย่างเป็นระบบ", "โครงร่าง การค้น การเลือก การประเมิน การสังเคราะห์ และอคติ", "AMSTAR 2 หรือเครื่องมือประเมินงานทบทวนที่ตรงวัตถุประสงค์"],
      ],
      tableHeadings: ["แบบแผนหลักฐาน", "สิ่งที่ตรวจ", "เครื่องมือเริ่มต้นที่อาจใช้"],
      templates: [
        { id: "search-log", name: "ต้นแบบบันทึกการค้น", purpose: "ทำให้ทุกการค้นฐานข้อมูลทำซ้ำได้", content: "ฐานข้อมูล: [ชื่อ]\nแพลตฟอร์ม: [ผู้ให้บริการ]\nวันที่ค้น: [YYYY-MM-DD]\nช่วงข้อมูล: [เริ่ม–สิ้นสุด]\nคำค้นเต็ม: [วางคำค้น]\nตัวกรอง: [ระบุหรือไม่มี]\nจำนวนผลลัพธ์: [n]\nชื่อไฟล์ส่งออก: [ชื่อ]\nหมายเหตุและการปรับ: [เหตุผล]" },
        { id: "eligibility", name: "แบบตัดสินการคัดเลือก", purpose: "ทำให้การคัดกรองสม่ำเสมอและอธิบายได้", content: "รหัสงาน: [ผู้แต่ง-ปี]\nผู้ทบทวน: [ชื่อ]\nระยะ: [ชื่อ/บทคัดย่อ | ฉบับเต็ม]\nคำตัดสิน: [รับ | ตัดออก | หารือ]\nเกณฑ์ที่ใช้: [เกณฑ์]\nเหตุผลตัดออก: [เหตุผลเฉพาะหนึ่งข้อ]\nหมายเหตุ: [บริบทหรือความไม่แน่นอน]" },
        { id: "matrix", name: "ตารางดึงหลักฐาน", purpose: "เชื่อมบริบท แบบแผน ข้อค้นพบ และคุณภาพ", content: "การอ้างอิง | ประเทศ/บริบท | เป้าหมาย | แบบแผน | กลุ่มตัวอย่าง/ข้อมูล | การแทรกแซงหรือปรากฏการณ์ | ผลลัพธ์/ข้อค้นพบ | บริบท | ข้อจำกัด | ผลประเมิน | หมายเหตุผู้ทบทวน" },
        { id: "protocol", name: "ต้นแบบโครงร่างหนึ่งหน้า", purpose: "ทำให้ทีมเห็นตรงกันก่อนการค้นขยายตัว", content: "การตัดสินใจที่งานนี้ต้องรองรับ:\nคำถามทบทวน:\nชนิดงานทบทวนและเหตุผล:\nประชากร/ปรากฏการณ์:\nแนวคิด/การแทรกแซง:\nบริบท/ตัวเปรียบเทียบ:\nแบบแผนหลักฐานที่รับ:\nแหล่งที่จะค้น:\nแนวทางประเมิน:\nแนวทางสังเคราะห์:\nแผนลงทะเบียน/รายงาน:\nข้อจำกัดที่ทราบ:" },
      ],
      pitfallsTitle: "6 จุดล้มเหลวที่ควรจับตั้งแต่ต้น",
      pitfalls: [
        ["เริ่มจากชื่อวิธี", "เลือกชื่อที่กำลังนิยมก่อนกำหนดข้ออ้างและหลักฐาน"],
        ["มั่นใจในฐานเดียว", "ถือว่าดัชนีเดียวหรือ Google Scholar ครอบคลุมทั้งหมด"],
        ["เกณฑ์เคลื่อน", "เปลี่ยนเกณฑ์หลังเห็นผลโดยไม่บันทึกการตัดสินใจ"],
        ["เครื่องมือไม่ตรง", "ใช้ checklist เดียวกับงานที่มีแบบแผนต่างกัน"],
        ["ตารางไร้ร่องรอย", "เก็บข้อค้นพบโดยไม่มีหน้า ตาราง หรือข้อความต้นทาง"],
        ["ขยายข้อสรุป", "อ้างเชิงสาเหตุหรือสากลเกินกว่าที่หลักฐานรองรับ"],
      ],
      referencesTitle: "แหล่งแนวทางการรายงานทางการ", referencesNote: "แนวทางมีการปรับปรุง ควรตรวจฉบับล่าสุดและข้อกำหนดของวารสารหรือสถาบันเป้าหมาย",
      references: [
        { ...referenceLinks[0], label: "PRISMA statement" },
        { ...referenceLinks[1], label: "PRISMA สำหรับ scoping reviews" },
        { ...referenceLinks[2], label: "มาตรฐาน RAMESES" },
        { ...referenceLinks[3], label: "แนวทาง eMERGe สำหรับ meta-ethnography" },
        { ...referenceLinks[4], label: "คลังแนวทาง EQUATOR" },
      ],
    },
  },
} as const satisfies Record<Locale, object>;
