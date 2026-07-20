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
      { id: "rapid", title: "ต้องใช้ผลประกอบการตัดสินใจเร็ว", description: "ลดขั้นตอนบางส่วนอย่างโปร่งใส เพื่อให้ได้คำตอบที่นำไปใช้ได้ภายในไม่กี่สัปดาห์" },
      { id: "thesis", title: "บททบทวนสำหรับวิทยานิพนธ์", description: "ค้นอย่างเป็นระบบและสังเคราะห์อย่างมีเหตุผล โดยไม่เรียกงานเกินกว่าสิ่งที่ทำจริง" },
      { id: "publication", title: "งานสังเคราะห์เพื่อการตีพิมพ์", description: "วางโครงร่างล่วงหน้า มีผู้ทบทวนเป็นทีม ค้นอย่างครอบคลุม ประเมินคุณภาพ และรายงานตามมาตรฐาน" },
    ],
    extraMethods: [
      {
        id: "umbrella", name: "การทบทวนงานทบทวนอย่างเป็นระบบ (umbrella review)", family: "สังเคราะห์งานทบทวน",
        summary: "สังเคราะห์ผลจากงานทบทวนอย่างเป็นระบบที่มีอยู่ โดยไม่ย้อนกลับไปวิเคราะห์งานวิจัยปฐมภูมิทุกชิ้น",
        bestFor: "เหมาะเมื่อหัวข้อมีงานทบทวนคุณภาพดีหลายชุด และต้องการเปรียบเทียบผลกับระดับความเชื่อมั่นในภาพรวม",
        avoidWhen: "ไม่เหมาะเมื่อมีงานวิจัยปฐมภูมิใหม่กว่างานทบทวนเดิม งานทบทวนซ้ำซ้อนกันมาก หรือคุณภาพโดยรวมต่ำ",
        output: "ผลสังเคราะห์ในระดับงานทบทวน พร้อมข้อมูลความซ้ำซ้อน คุณภาพ และประเด็นที่ยังไม่แน่นอน",
        time: "โดยมาก 6–12 เดือน",
        steps: ["กำหนดคำถาม", "ค้นหางานทบทวน", "ตรวจความซ้ำซ้อนของงานวิจัยต้นทาง", "ประเมินคุณภาพงานทบทวน", "สังเคราะห์ระดับความเชื่อมั่น"],
        quality: "ประเมินคุณภาพงานทบทวน และแสดงให้ชัดหากงานวิจัยปฐมภูมิชิ้นเดียวถูกนับซ้ำในหลายงานทบทวน",
      },
      {
        id: "rapid", name: "การทบทวนแบบเร่งรัด", family: "การตัดสินใจเร่งด่วน",
        summary: "ลดขอบเขตหรือขั้นตอนบางส่วนตามแผนที่กำหนดไว้ เมื่อต้องใช้หลักฐานประกอบการตัดสินใจอย่างเร่งด่วน",
        bestFor: "เหมาะกับการตัดสินใจด้านนโยบาย บริการ หรือโครงการที่มีผู้ใช้ผลชัดเจนและมีกำหนดเวลาแน่นอน",
        avoidWhen: "ไม่เหมาะเมื่อจำเป็นต้องค้นให้ครอบคลุมที่สุด หรือการลดขั้นตอนอาจทำให้ข้อสรุปในเรื่องสำคัญคลาดเคลื่อน",
        output: "รายงานหลักฐานที่เสร็จตามกรอบเวลา พร้อมระบุขั้นตอนที่ลดลง ความไม่แน่นอน และแผนปรับปรุงในอนาคต",
        time: "โดยมาก 2–12 สัปดาห์",
        steps: ["ตกลงขอบเขตการตัดสินใจ", "กำหนดขั้นตอนที่จะลด", "ค้นและคัดกรอง", "ประเมินหลักฐานสำคัญ", "รายงานข้อจำกัด"],
        quality: "กำหนดขั้นตอนที่จะลดไว้ล่วงหน้า และอธิบายผลที่อาจเกิดขึ้นต่อข้อสรุป",
      },
      {
        id: "systematic-search", name: "การค้นและทบทวนอย่างเป็นระบบ", family: "การค้นเพื่อวิทยานิพนธ์",
        summary: "ค้นอย่างโปร่งใสและทำซ้ำได้ แล้วสังเคราะห์ในระดับที่เหมาะกับวิทยานิพนธ์หรือข้อเสนอโครงการ",
        bestFor: "เหมาะกับงานบัณฑิตศึกษาที่ต้องการบททบทวนซึ่งมีหลักฐานรองรับชัดเจน แต่ไม่ได้ทำการทบทวนอย่างเป็นระบบเต็มรูปแบบ",
        avoidWhen: "ไม่ควรใช้ชื่อเรื่องหรือข้อสรุปที่สื่อว่าค้นครอบคลุมทั้งหมด หากไม่มีทีม ประเมินคุณภาพไม่ครบ หรือไม่ได้วางโครงร่างล่วงหน้า",
        output: "บันทึกการค้นที่ตรวจสอบย้อนหลังได้ ผลการคัดกรอง ตารางหลักฐาน และบทสังเคราะห์เชิงบรรยายตามขอบเขตที่กำหนด",
        time: "โดยมาก 2–6 เดือน",
        steps: ["กำหนดขอบเขตบท", "สร้างชุดคำค้น", "บันทึกการค้น", "คัดกรองสม่ำเสมอ", "สังเคราะห์ตามคำถาม"],
        quality: "เรียกชื่อวิธีให้ตรงกับสิ่งที่ทำ และแยกให้ชัดระหว่างการค้นอย่างเป็นระบบกับการทบทวนอย่างเป็นระบบเต็มรูปแบบ",
      },
      {
        id: "meta-ethnography", name: "เมตาชาติพันธุ์วรรณนา", family: "การสังเคราะห์เชิงตีความ",
        summary: "นำแนวคิดจากงานวิจัยเชิงคุณภาพหลายชิ้นมาเทียบเคียงและตีความร่วมกัน เพื่อพัฒนาคำอธิบายหรือทฤษฎีใหม่",
        bestFor: "เหมาะกับกลุ่มงานวิจัยเชิงคุณภาพที่มีขอบเขตชัดและมีแนวคิดมากพอให้นำมาเปรียบเทียบกันได้",
        avoidWhen: "ไม่เหมาะเมื่อข้อค้นพบบางเกินไป ขาดข้อมูลบริบท หรือทีมต้องการเพียงสรุปหัวข้อเชิงพรรณนา",
        output: "ความสัมพันธ์ของแนวคิดทั้งส่วนที่สอดคล้องและขัดแย้งกัน พร้อมข้ออธิบายหรือการตีความใหม่",
        time: "โดยมาก 6–15 เดือน",
        steps: ["เลือกชุดงานที่มีขอบเขตชัด", "อ่านเชิงตีความ", "เปรียบเทียบความสัมพันธ์ระหว่างงาน", "เทียบเคียงแนวคิด", "สร้างคำอธิบายใหม่"],
        quality: "รักษาความหมายจากงานต้นฉบับ และบันทึกให้เห็นว่าแนวคิดใหม่พัฒนาขึ้นมาอย่างไร",
      },
      {
        id: "thematic", name: "การสังเคราะห์เชิงประเด็น", family: "การสังเคราะห์เชิงคุณภาพที่ตรวจสอบได้",
        summary: "เริ่มจากเข้ารหัสข้อค้นพบเชิงคุณภาพทีละบรรทัด แล้วพัฒนาเป็นประเด็นเชิงพรรณนาและประเด็นเชิงวิเคราะห์",
        bestFor: "เหมาะเมื่ออยากแสดงเส้นทางจากข้อค้นพบในงานต้นฉบับไปสู่ประเด็นที่นำไปใช้ตอบคำถามได้อย่างชัดเจน",
        avoidWhen: "ไม่เหมาะเมื่อเป้าหมายคือการตีความทฤษฎีเชิงลึก หรือข้อค้นพบมีรายละเอียดน้อยเกินกว่าจะเข้ารหัส",
        output: "ประเด็นเชิงพรรณนา ประเด็นเชิงวิเคราะห์ และกรอบรหัสที่ตรวจสอบย้อนกลับถึงงานต้นฉบับได้",
        time: "โดยมาก 4–10 เดือน",
        steps: ["ดึงข้อค้นพบ", "เข้ารหัสทีละบรรทัด", "สร้างประเด็นเชิงพรรณนา", "พัฒนาประเด็นเชิงวิเคราะห์", "ตรวจกรณีที่ขัดแย้ง"],
        quality: "แยกข้อค้นพบของผู้เขียนเดิมออกจากการตีความของผู้ทบทวนให้ชัด",
      },
    ],
    interdisciplinary: {
      id: "interdisciplinary", marker: "ส", name: "สหวิทยาการและสาขาเกิดใหม่",
      intro: "คำถามที่ต้องอาศัยกรอบการประเมินหลักฐานจากหลายสาขา เช่น จริยธรรม AI ความยั่งยืน One Health และการปรับตัวต่อการเปลี่ยนแปลงสภาพภูมิอากาศ",
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
      realist: { search: "ค้นแบบวนซ้ำเพื่อพัฒนาและทดสอบทฤษฎีโครงการ โดยพิจารณาทั้งความเกี่ยวข้องและความน่าเชื่อถือของหลักฐาน", appraisal: "พิจารณาว่าหลักฐานช่วยสนับสนุน ปรับแก้ หรือโต้แย้งคำอธิบายเรื่องบริบท–กลไก–ผลลัพธ์ได้หรือไม่", reporting: "มาตรฐานการตีพิมพ์และการประเมินคุณภาพ RAMESES สำหรับ realist synthesis", tools: "โปรแกรมจัดการอ้างอิง · ตารางทฤษฎี · โปรแกรมวิเคราะห์เชิงคุณภาพ", reference: "rameses" },
      integrative: { search: "ค้นแหล่งเชิงประจักษ์ ทฤษฎี และการปฏิบัติด้วยขอบเขตโปร่งใสและปรับซ้ำอย่างมีเหตุผล", appraisal: "ประเมินตามแบบแผนและอธิบายว่าหลักฐานต่างชนิดมีน้ำหนักต่อการสังเคราะห์อย่างไร", reporting: "ไม่มีมาตรฐานสากลเพียงชุดเดียว จึงต้องรายงานการเลือก ประเมิน และสังเคราะห์อย่างชัดเจน", tools: "โปรแกรมอ้างอิง · ตารางแนวคิด · โปรแกรมวิเคราะห์เชิงคุณภาพ" },
      mixed: { search: "วางการค้นที่เชื่อมกันหรือคำค้นชุดเดียวที่ครอบคลุมทั้งหลักฐานเชิงปริมาณและคุณภาพ", appraisal: "ประเมินแต่ละแบบแผนให้เหมาะสม แล้วประเมินตรรกะและคุณภาพของการบูรณาการ", reporting: "ใช้แนวทางของหลักฐานแต่ละสายและเปิดเผยวิธีบูรณาการ", tools: "ระบบงานทบทวน · โปรแกรมสถิติ · โปรแกรมเชิงคุณภาพ · joint display", reference: "equator" },
      bibliometric: { search: "กำหนดความครอบคลุมฐานข้อมูล บันทึกคำค้นกับวันส่งออก แล้วลบซ้ำและทำความสะอาดเมตาดาตา", appraisal: "ตรวจคุณภาพเมตาดาตา อคติฐานข้อมูล การแยกชื่อผู้แต่ง เกณฑ์ และความไวต่อพารามิเตอร์", reporting: "รายงานฐานข้อมูล คำค้น วันที่ กฎทำความสะอาด ตัวชี้วัด และพารามิเตอร์เครือข่าย", tools: "VOSviewer · bibliometrix · CiteSpace · OpenRefine" },
      critical: { search: "คัดเลือกงานตามเหตุผลเชิงทฤษฎี โดยรวมทั้งงานสำคัญที่วางรากฐานและข้อโต้แย้งที่เห็นต่าง", appraisal: "ประเมินความสอดคล้องของแนวคิด สมมติฐาน จุดยืน บริบททางประวัติศาสตร์ และมุมมองที่มักถูกมองข้าม", reporting: "ไม่มีรายการตรวจมาตรฐานเพียงชุดเดียว จึงต้องระบุขอบเขตของแหล่งข้อมูล เหตุผลในการเลือก และวิธีพัฒนาข้อโต้แย้งให้ชัด", tools: "โปรแกรมอ้างอิง · แผนผังแนวคิด · ตารางข้อโต้แย้ง" },
      umbrella: { search: "ค้นฐานงานทบทวนและฐานบรรณานุกรม พร้อมติดตามความซ้ำซ้อนของงานปฐมภูมิ", appraisal: "ใช้เครื่องมือประเมินงานทบทวนที่เหมาะสม และพิจารณาความซ้ำ ความทันสมัย และความเชื่อมั่น", reporting: "ใช้ PRISMA 2020 เมื่อเหมาะสม และรายงานวิธีจัดการความซ้ำซ้อน", tools: "ระบบงานทบทวน · ตารางอ้างอิงไขว้ · ตารางข้อมูล · กรอบความเชื่อมั่น", reference: "prisma" },
      rapid: { search: "จำกัดฐานข้อมูล ช่วงเวลา ภาษา หรือจำนวนผู้ทบทวนได้ เฉพาะเมื่อกำหนดและบันทึกเหตุผลไว้ล่วงหน้า", appraisal: "ยังควรประเมินหลักฐานที่มีผลต่อการตัดสินใจ และต้องระบุขั้นตอนที่ลดหรือตัดออกอย่างตรงไปตรงมา", reporting: "ใช้แนวทาง rapid review ฉบับปัจจุบัน พร้อมรายงานขั้นตอนที่ลดลงและผลกระทบที่อาจเกิดขึ้น", tools: "Rayyan · Zotero · ตารางข้อมูล · ระบบอัตโนมัติที่มีมนุษย์ตรวจ", reference: "equator" },
      "systematic-search": { search: "กำหนดชุดแนวคิดที่ผู้อื่นนำไปค้นซ้ำได้ ค้นจากหลายแหล่ง บันทึกคำค้นและวันที่ แล้วลบรายการซ้ำ", appraisal: "เลือกเครื่องมือประเมินให้เหมาะกับข้อสรุปที่ต้องอาศัยคุณภาพของงานวิจัย และระบุให้ชัดหากไม่ได้ประเมิน", reporting: "เขียนวิธีค้นและผังการคัดเลือกอย่างโปร่งใส และไม่เรียกงานว่า systematic review หากยังทำไม่ครบตามมาตรฐาน", tools: "Zotero · Rayyan · บันทึกการค้น · ตารางหลักฐาน" },
      "meta-ethnography": { search: "ค้นชุดงานวิจัยที่มีแนวคิดเข้มข้นและขอบเขตชัด โดยอาจปรับการค้นระหว่างทางและติดตามรายการอ้างอิงเพิ่มเติม", appraisal: "ประเมินความลึกของแนวคิด ข้อมูลบริบท และคุณภาพการตีความทั้งจากผู้วิจัยต้นฉบับและผู้สังเคราะห์", reporting: "แนวทาง eMERGe สำหรับการรายงาน meta-ethnography", tools: "NVivo · ATLAS.ti · ตารางเปรียบเทียบแนวคิด · แผนผังแนวคิด", reference: "emerge" },
      thematic: { search: "ค้นงานวิจัยเชิงคุณภาพให้กว้างพอที่จะครอบคลุมมุมมองและความแตกต่างของปรากฏการณ์", appraisal: "ประเมินความน่าเชื่อถือและความเกี่ยวข้องของงาน พร้อมรักษาบริบทและข้อค้นพบที่ไม่สอดคล้องกัน", reporting: "ตรวจแนวทางการสังเคราะห์เชิงคุณภาพฉบับปัจจุบัน และแสดงเส้นทางจากรหัสไปสู่ประเด็นเชิงวิเคราะห์", tools: "NVivo · ATLAS.ti · MAXQDA · ตารางที่มีโครงสร้าง", reference: "equator" },
    },
    disciplineDeepDives: {
      health: { journals: ["Cochrane Database of Systematic Reviews", "BMJ", "JAMA", "The Lancet"], standards: ["ตระกูล PRISMA", "Cochrane Handbook", "JBI Manual", "GRADE เมื่อเหมาะสม"], tools: ["Covidence", "Rayyan", "RevMan", "GRADEpro"], tip: "แยกแนวทางการรายงาน การประเมินความเสี่ยงอคติ และการประเมินความเชื่อมั่น เพราะแต่ละอย่างตอบคนละปัญหา" },
      social: { journals: ["Psychological Bulletin", "Annual Review of Sociology", "Social Science & Medicine"], standards: ["PRISMA เมื่อเหมาะสม", "ENTREQ หรือแนวทางเฉพาะวิธีเชิงคุณภาพ", "แนวทางการรายงาน APA"], tools: ["Rayyan", "NVivo", "R", "Zotero"], tip: "รักษาบริบท นิยามตัวแปร และปัญหา publication bias แทนการถือว่ามาตรวัดทุกชนิดเทียบกันได้" },
      education: { journals: ["Review of Educational Research", "Educational Research Review", "Teaching and Teacher Education"], standards: ["PRISMA เมื่อเหมาะสม", "RAMESES สำหรับ realist synthesis", "แนวทางเฉพาะวิธีเชิงคุณภาพ"], tools: ["EPPI-Reviewer", "Rayyan", "NVivo", "Zotero"], tip: "บันทึกช่วงวัย บริบท ความครบถ้วนของการใช้กิจกรรม และความเป็นธรรม เพราะผลมักไม่ย้ายข้ามบริบทโดยอัตโนมัติ" },
      business: { journals: ["Academy of Management Review", "Journal of Management", "International Journal of Management Reviews"], standards: ["โครงร่างโปร่งใส", "PRISMA เมื่อเหมาะสม", "แนวทางงานทบทวนเฉพาะสาขา"], tools: ["Zotero", "VOSviewer", "bibliometrix", "NVivo"], tip: "แยกการสังเคราะห์หลักฐานออกจากบทความที่ปรึกษา และอธิบายว่าทฤษฎีกำกับการเลือกกับตีความอย่างไร" },
      technology: { journals: ["ACM Computing Surveys", "IEEE Transactions", "Empirical Software Engineering"], standards: ["โครงร่าง SLR หรือ mapping ที่โปร่งใส", "PRISMA เมื่อเหมาะสม", "แนวทางงานทบทวนวิศวกรรมซอฟต์แวร์"], tools: ["Zotero", "Rayyan", "VOSviewer", "R หรือ Python"], tip: "บันทึกรุ่นเทคโนโลยี ความเทียบเคียง benchmark ประเภทเวทีเผยแพร่ preprint และวันที่หลักฐานเริ่มล้าสมัย" },
      science: { journals: ["Environmental Evidence", "วารสาร Annual Review", "วารสารทบทวนเฉพาะศาสตร์"], standards: ["PRISMA เมื่อเหมาะสม", "ROSES สำหรับหลักฐานสิ่งแวดล้อม", "แนวทางสังเคราะห์เฉพาะศาสตร์"], tools: ["R", "bibliometrix", "Zotero", "GIS เมื่อเกี่ยวข้อง"], tip: "วางแผนความแตกต่างด้านชนิด พื้นที่ มาตราส่วน การสัมผัส และการวัดก่อนเลือกแบบจำลองรวม" },
      humanities: { journals: ["วารสารทบทวนเฉพาะศาสตร์", "JSTOR", "Project MUSE"], standards: ["ขอบเขตแหล่งข้อมูลที่ชัดเจน", "การวิจารณ์แหล่งข้อมูล", "จุดยืนและข้อโต้แย้งที่เห็นต่าง"], tools: ["Zotero", "Omeka", "Voyant Tools", "โปรแกรมเข้ารหัสเชิงคุณภาพ"], tip: "ความน่าเชื่อถือเกิดจากการเลือกแหล่งข้อมูลและตีความอย่างโปร่งใส ไม่ใช่การบังคับทุกคำถามให้ใช้แม่แบบจากงานชีวการแพทย์" },
      "law-policy": { journals: ["วารสารกฎหมายตามเขตอำนาจ", "Public Administration Review", "Policy Studies Journal"], standards: ["ลำดับศักดิ์แหล่งกฎหมายและมาตรฐานอ้างอิง", "PRISMA สำหรับงานเชิงประจักษ์", "RAMESES สำหรับคำถามนโยบายซับซ้อน"], tools: ["Westlaw หรือ Lexis", "HeinOnline", "Zotero", "NVivo"], tip: "แยกข้อสรุปเชิงหลักกฎหมายว่า ‘กฎหมายกำหนดไว้อย่างไร’ ออกจากข้อสรุปเชิงประจักษ์ว่า ‘นโยบายก่อให้เกิดผลอย่างไร’" },
      interdisciplinary: { journals: ["Nature Sustainability", "PNAS", "One Earth", "เวทีแนวหน้าของแต่ละสาขา"], standards: ["ตระกูล PRISMA เมื่อเหมาะสม", "JBI Manual", "การตัดสินใจเรื่องขอบเขตและคำศัพท์ที่ชัด"], tools: ["OpenAlex", "VOSviewer", "Connected Papers", "Zotero"], tip: "ค้นข้ามชุดคำศัพท์และตระกูลฐานข้อมูล เพราะดัชนีของศาสตร์เดียวจะทำให้หลักฐานบางส่วนหายไปอย่างเป็นระบบ" },
    },
    workflow: {
      index: "02 · ลงมือทำงานทบทวน", title: "ทำงานทบทวนให้ตรวจสอบย้อนหลังได้ใน 6 ระยะ",
      intro: "ทุกระยะควรมีหลักฐานการตัดสินใจ เพื่อให้นักวิจัยคนอื่น—รวมถึงตัวคุณในอนาคต—ย้อนกลับมาตรวจสอบได้",
      outputLabel: "ชิ้นงานที่ควรมี", checkpointLabel: "คำถามก่อนผ่านไปขั้นถัดไป",
      phases: [
        { title: "กำหนดขอบเขต", purpose: "เปลี่ยนหัวข้อให้เป็นคำถาม คุณูปการ และขอบเขตที่สามารถทบทวนได้จริง", outputs: ["กรอบคำถาม", "เกณฑ์คัดเลือก", "เหตุผลที่เลือกวิธีทบทวน"], checkpoint: "หลักฐานที่วางแผนจะค้น รองรับข้อสรุปที่ต้องการนำเสนอได้หรือไม่" },
        { title: "ค้น", purpose: "แยกคำถามออกเป็นแนวคิด คำพ้อง และแหล่งข้อมูล พร้อมบันทึกวิธีค้นให้ผู้อื่นทำซ้ำได้", outputs: ["ชุดแนวคิด", "คำค้นที่ทดลองแล้ว", "บันทึกการค้น"], checkpoint: "คำค้นพบงานสำคัญที่รู้จักอยู่แล้ว และผู้อื่นทำการค้นซ้ำได้หรือไม่" },
        { title: "คัดกรอง", purpose: "ใช้เกณฑ์คัดเลือกอย่างสม่ำเสมอ และบันทึกเหตุผลทุกครั้งที่ตัดงานออก", outputs: ["รายการอ้างอิงหลังลบรายการซ้ำ", "ผลการคัดกรอง", "จำนวนงานในผังการคัดเลือก"], checkpoint: "หากมีผู้ทบทวนสองคน ทั้งคู่จะตีความเกณฑ์ตรงกันหรือไม่" },
        { title: "ประเมิน", purpose: "พิจารณาว่าหลักฐานแต่ละชิ้นรองรับข้อสรุปประเภทใด และรองรับได้มากน้อยเพียงใด", outputs: ["แบบบันทึกการประเมิน", "ผลประเมินความเสี่ยงอคติ", "ข้อจำกัดของหลักฐาน"], checkpoint: "เครื่องมือประเมินตรงกับประเภทงานวิจัยและเป้าหมายของงานทบทวนหรือไม่" },
        { title: "ดึงข้อมูล", purpose: "เก็บข้อมูลที่เทียบกันได้ โดยไม่ตัดบริบทที่จำเป็นต่อการสังเคราะห์", outputs: ["แบบดึงข้อมูล", "ตารางหลักฐาน", "บันทึกการตรวจสอบ"], checkpoint: "ข้อสังเคราะห์ทุกข้อย้อนกลับไปยังตำแหน่งในแหล่งข้อมูลได้หรือไม่" },
        { title: "เขียน", purpose: "เรียบเรียงข้อค้นพบให้เชื่อมโยงกับความไม่แน่นอน ข้อจำกัด และคุณูปการของงาน", outputs: ["โครงสร้างการสังเคราะห์", "ตารางหรือแผนที่", "รายการตรวจสอบการรายงาน"], checkpoint: "ข้อสรุปยังอยู่ภายในขอบเขตของหลักฐานและโครงร่างที่กำหนดไว้หรือไม่" },
      ],
    },
    toolkit: {
      index: "05 · เครื่องมือนักวิจัย", title: "นำคำแนะนำไปใช้ทำงานวิจัยต่อได้ทันที",
      intro: "คัดลอกแบบฟอร์ม ปรับให้เข้ากับสาขา และบันทึกเหตุผลของการตัดสินใจแต่ละขั้นเพื่อให้งานตรวจสอบได้",
      searchTitle: "แบบร่างคำค้น Boolean", searchIntro: "แยกคำถามออกเป็นแนวคิดหลัก ใช้ OR เชื่อมคำพ้อง ใช้ AND เชื่อมแต่ละแนวคิด แล้วเติมศัพท์ควบคุมให้ตรงกับฐานข้อมูลที่ใช้",
      searchCode: "(\"artificial intelligence\" OR \"machine learning\" OR AI)\nAND\n(education OR teaching OR learning)\nAND\n(ethics OR bias OR fairness)",
      copy: "คัดลอก", copied: "คัดลอกแล้ว ✓", templateLabel: "แบบฟอร์มพร้อมใช้",
      appraisalTitle: "เลือกวิธีประเมินให้ตรงกับประเภทหลักฐาน", appraisalIntro: "ประเภทงานวิจัยที่นำมาทบทวน—ไม่ใช่ชื่อเสียงของวารสาร—เป็นตัวกำหนดว่าควรประเมินคุณภาพจากมุมใด",
      appraisalRows: [
        ["การทดลองแบบสุ่ม", "การสุ่ม การเบี่ยงเบน ข้อมูลหาย การวัด และการเลือกรายงาน", "RoB 2 หรือเครื่องมือเทียบเท่าในสาขา"],
        ["การแทรกแซงไม่สุ่ม", "ตัวแปรกวน การเลือก การจัดกลุ่ม การเบี่ยงเบน และข้อมูลหาย", "ROBINS-I หรือเครื่องมือเทียบเท่า"],
        ["งานเชิงคุณภาพ", "ความเหมาะสม การคัดเลือก การสะท้อนตน การวิเคราะห์ บริบท และความน่าเชื่อถือ", "CASP, JBI หรือเครื่องมือที่เหมาะกับสาขา"],
        ["งานผสานวิธี", "คุณภาพแต่ละส่วนและตรรกะของการบูรณาการ", "MMAT หรือเครื่องมือรายแบบแผนร่วมกับการประเมินการบูรณาการ"],
        ["งานทบทวนอย่างเป็นระบบ", "โครงร่าง การค้น การเลือก การประเมิน การสังเคราะห์ และอคติ", "AMSTAR 2 หรือเครื่องมือประเมินงานทบทวนที่ตรงวัตถุประสงค์"],
      ],
      tableHeadings: ["ประเภทงานวิจัย", "ประเด็นที่ควรตรวจ", "เครื่องมือที่อาจใช้เป็นจุดเริ่มต้น"],
      templates: [
        { id: "search-log", name: "แบบบันทึกการค้น", purpose: "ช่วยให้ผู้อื่นทำการค้นในแต่ละฐานข้อมูลซ้ำได้", content: "ฐานข้อมูล: [ชื่อ]\nแพลตฟอร์ม: [ผู้ให้บริการ]\nวันที่ค้น: [YYYY-MM-DD]\nช่วงข้อมูล: [เริ่ม–สิ้นสุด]\nคำค้นเต็ม: [วางคำค้น]\nตัวกรอง: [ระบุหรือไม่มี]\nจำนวนผลลัพธ์: [n]\nชื่อไฟล์ส่งออก: [ชื่อ]\nหมายเหตุและการปรับ: [เหตุผล]" },
        { id: "eligibility", name: "แบบบันทึกผลการคัดเลือก", purpose: "ช่วยให้ตัดสินใจคัดกรองอย่างสม่ำเสมอและอธิบายเหตุผลได้", content: "รหัสงาน: [ผู้แต่ง-ปี]\nผู้ทบทวน: [ชื่อ]\nระยะ: [ชื่อ/บทคัดย่อ | ฉบับเต็ม]\nผลการพิจารณา: [รับ | ตัดออก | หารือ]\nเกณฑ์ที่ใช้: [เกณฑ์]\nเหตุผลตัดออก: [เหตุผลเฉพาะหนึ่งข้อ]\nหมายเหตุ: [บริบทหรือความไม่แน่นอน]" },
        { id: "matrix", name: "ตารางสกัดข้อมูล", purpose: "เชื่อมบริบท ประเภทงานวิจัย ข้อค้นพบ และผลประเมินคุณภาพ", content: "การอ้างอิง | ประเทศ/บริบท | เป้าหมาย | ประเภทงานวิจัย | กลุ่มตัวอย่าง/ข้อมูล | การแทรกแซงหรือปรากฏการณ์ | ผลลัพธ์/ข้อค้นพบ | บริบท | ข้อจำกัด | ผลประเมิน | หมายเหตุผู้ทบทวน" },
        { id: "protocol", name: "แบบร่างโครงร่างหนึ่งหน้า", purpose: "ช่วยให้ทีมเข้าใจตรงกันก่อนขยายการค้น", content: "การตัดสินใจที่งานนี้ต้องช่วยสนับสนุน:\nคำถามทบทวน:\nชนิดงานทบทวนและเหตุผล:\nประชากร/ปรากฏการณ์:\nแนวคิด/การแทรกแซง:\nบริบท/ตัวเปรียบเทียบ:\nประเภทหลักฐานที่รับ:\nแหล่งที่จะค้น:\nแนวทางประเมิน:\nแนวทางสังเคราะห์:\nแผนลงทะเบียน/รายงาน:\nข้อจำกัดที่ทราบ:" },
      ],
      pitfallsTitle: "6 จุดที่มักพลาดและควรระวังตั้งแต่ต้น",
      pitfalls: [
        ["เลือกวิธีก่อนตั้งคำถาม", "เลือกชื่อวิธีที่กำลังนิยมก่อนกำหนดข้อสรุปที่ต้องการและหลักฐานที่จะใช้"],
        ["พึ่งฐานข้อมูลเดียว", "คิดว่าฐานข้อมูลเพียงแห่งเดียวหรือ Google Scholar ครอบคลุมงานทั้งหมดแล้ว"],
        ["เปลี่ยนเกณฑ์กลางทาง", "เปลี่ยนเกณฑ์หลังเห็นผลการค้นโดยไม่บันทึกเหตุผล"],
        ["ใช้แบบประเมินไม่ตรงประเภท", "ใช้รายการตรวจชุดเดียวกับงานวิจัยที่มีระเบียบวิธีต่างกัน"],
        ["ย้อนกลับหาแหล่งเดิมไม่ได้", "เก็บข้อค้นพบโดยไม่ระบุหน้า ตาราง หรือข้อความต้นทาง"],
        ["สรุปเกินหลักฐาน", "อ้างเหตุและผลหรือเหมารวมกว้างกว่าที่หลักฐานรองรับ"],
      ],
      referencesTitle: "แนวทางการรายงานอย่างเป็นทางการ", referencesNote: "แนวทางเหล่านี้อาจมีการปรับปรุง ควรตรวจฉบับล่าสุด รวมถึงข้อกำหนดของวารสารหรือสถาบันเป้าหมายทุกครั้ง",
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
