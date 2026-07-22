import type { Locale } from "./i18n";
import { researchAnalysisPrompts } from "./research-prompts.js";

export type CommitmentId = "rapid" | "thesis" | "publication";
export type GoalId = "map" | "evaluate" | "understand" | "explain";
export type EvidenceId = "experimental" | "qualitative" | "mixed" | "theoretical" | "uncertain";
export type DisciplineId = "health" | "social" | "education" | "business" | "technology" | "science" | "humanities" | "law-policy" | "interdisciplinary";
export type MethodId = "systematic" | "scoping" | "meta-analysis" | "qualitative" | "realist" | "integrative" | "mixed" | "bibliometric" | "critical" | "umbrella" | "rapid" | "systematic-search" | "meta-ethnography" | "thematic";
export type ResearchPromptId = "search-vocabulary" | "question-challenge" | "evidence-matrix" | "gap-audit" | "claim-check" | (typeof researchAnalysisPrompts.en)[number]["id"];

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
        id: "umbrella", name: "Umbrella review", family: "Reviews of reviews", fieldExamples: ["Health & medicine", "Public health", "Psychology"],
        summary: "Synthesizes existing systematic reviews rather than returning to every primary study.",
        bestFor: "Questions with several mature reviews that need a high-level comparison of findings and certainty.",
        avoidWhen: "Primary evidence is new, existing reviews overlap heavily, or their quality is too weak.",
        output: "A structured synthesis of review-level evidence, overlap, quality, and remaining uncertainty.",
        time: "Often 6–12 months",
        steps: ["Frame review-level question", "Search for reviews", "Manage overlap", "Appraise reviews", "Synthesize certainty"],
        quality: "Appraise the included reviews and make double-counting of primary studies visible.",
      },
      {
        id: "rapid", name: "Rapid review", family: "Time-sensitive decision", fieldExamples: ["Health policy", "Public policy", "Emergency response"],
        summary: "Applies explicit, documented shortcuts to evidence synthesis when a decision cannot wait.",
        bestFor: "Urgent policy, service, or programme decisions with a clearly defined decision-maker and deadline.",
        avoidWhen: "Stakeholders need exhaustive coverage or shortcuts could change a high-stakes conclusion.",
        output: "A time-bounded evidence brief with visible shortcuts, uncertainties, and update needs.",
        time: "Often 2–12 weeks",
        steps: ["Agree decision scope", "Choose shortcuts", "Search and screen", "Appraise key evidence", "Report limits"],
        quality: "Pre-specify every shortcut and explain how it may alter the conclusion.",
      },
      {
        id: "systematic-search", name: "Systematic search and review", family: "Defensible thesis search", fieldExamples: ["Education", "Social sciences", "Business & management"],
        summary: "Uses a transparent, reproducible search with a proportionate synthesis for a thesis or proposal.",
        bestFor: "Graduate work that needs a defensible literature base but is not claiming a full systematic review.",
        avoidWhen: "The title or conclusion implies exhaustive synthesis without the team, appraisal, or protocol to support it.",
        output: "A traceable search, screening account, evidence matrix, and bounded narrative synthesis.",
        time: "Often 2–6 months",
        steps: ["Bound the chapter", "Build search blocks", "Log searches", "Screen consistently", "Synthesize by question"],
        quality: "Name the design honestly and distinguish systematic searching from a full systematic review.",
      },
      {
        id: "meta-ethnography", name: "Meta-ethnography", family: "Interpretive synthesis", fieldExamples: ["Health & nursing", "Sociology & anthropology", "Education"],
        summary: "Translates concepts across qualitative studies to develop a new interpretation or theory.",
        bestFor: "A focused body of rich qualitative studies with concepts that can be compared and translated.",
        avoidWhen: "Studies provide thin findings, contexts are erased, or the team only wants descriptive themes.",
        output: "Reciprocal and refutational translations, a line of argument, and higher-order interpretation.",
        time: "Often 6–15 months",
        steps: ["Select a focused corpus", "Read interpretively", "Relate studies", "Translate concepts", "Build a line of argument"],
        quality: "Preserve second-order interpretations and document how translations were developed.",
      },
      {
        id: "thematic", name: "Thematic synthesis", family: "Transparent qualitative synthesis", fieldExamples: ["Public health", "Social sciences", "Education"],
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
      index: "05 · Execute the review", title: "Execute your review in six traceable phases.",
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
      index: "07 · Research toolkit", title: "Move from advice to working research artefacts.",
      intro: "Copy a starter, adapt it to your discipline, and preserve the decisions that make your review auditable.",
      searchTitle: "Boolean search canvas", searchIntro: "Build one block per concept. Add synonyms with OR; connect concepts with AND; add controlled vocabulary inside each database.",
      searchCode: "(\"artificial intelligence\" OR \"machine learning\" OR AI)\nAND\n(education OR teaching OR learning)\nAND\n(ethics OR bias OR fairness)",
      searchTips: [
        { marker: "01", title: "Search the right fields", description: "Use database field tags such as title/abstract or TITLE-ABS-KEY when an all-fields search returns too much noise." },
        { marker: "02", title: "Use truncation carefully", description: "A wildcard can capture useful word endings, but test every truncated term so it does not retrieve unrelated words." },
        { marker: "03", title: "Test proximity operators", description: "When a database supports NEAR, W/n, or an equivalent operator, use it to keep related concepts close without requiring an exact phrase." },
      ],
      aiLab: {
        index: "AI-assisted research",
        title: "AI prompt lab",
        intro: "Use AI to expand, compare, and challenge your thinking while keeping every scholarly decision and source check with the researcher.",
        anatomyTitle: "A reliable research prompt names four things",
        anatomy: [
          { label: "Context", description: "Topic, discipline, purpose, and the material available." },
          { label: "Task", description: "One concrete job for the AI to help with." },
          { label: "Evidence rules", description: "What it may use, must verify, and must not invent." },
          { label: "Output", description: "A structure that makes gaps and uncertainty visible." },
        ],
        taskLabel: "Choose a research task",
        promptLabel: "Copy-ready prompt",
        prompts: [
          {
            id: "search-vocabulary",
            title: "Expand search vocabulary",
            bestFor: "Turning a topic into concept blocks, synonyms, spelling variants, and terms to test in databases.",
            prompt: `Context:
I am reviewing [topic] in [discipline, population, or setting]. My current question is [question or decision].

Task:
Help me build vocabulary for a reproducible database search. Separate the question into concept blocks and propose synonyms, acronyms, spelling variants, broader terms, and narrower terms for each block.

Evidence rules:
- Do not present a term as an official subject heading unless it has been checked in the named database thesaurus.
- Separate natural-language keywords from controlled-vocabulary candidates that I still need to verify.
- Flag terms likely to retrieve irrelevant results and explain why.
- Do not claim that the list is complete.

Output:
Create a table with: concept block | keywords and variants | controlled terms to verify | likely noise. Then draft Boolean blocks, clearly marking any syntax that must be adapted for [database].`,
          },
          {
            id: "question-challenge",
            title: "Challenge a review question",
            bestFor: "Testing whether a proposed question is clear, answerable, and aligned with the evidence likely to exist.",
            prompt: `Context:
My proposed review question is [question]. It sits in [discipline or context], should inform [decision or contribution], and must be completed within [time and team constraints].

Task:
Critique the question before I commit to a review design. Identify ambiguous concepts, hidden assumptions, scope problems, and the kinds of evidence the question would require.

Evidence rules:
- Do not choose a review method from the topic label alone.
- State every assumption you make about the field and available evidence.
- Distinguish what can be checked with a preliminary search from what requires supervisor or stakeholder judgement.

Output:
Provide: 1) issues to resolve, 2) three revised question options with different scopes, 3) evidence each option would need, 4) a feasibility check, and 5) questions I should take to my supervisor or review team.`,
          },
          {
            id: "evidence-matrix",
            title: "Compare supplied studies",
            bestFor: "Building a traceable comparison before synthesis without filling missing fields by inference.",
            prompt: `Context:
I will provide [number] papers or structured notes about [topic]. I need to compare them for [review purpose].

Task:
Extract only information present in the supplied material and build an evidence-comparison matrix.

Evidence rules:
- Use only the documents or notes I provide in this conversation.
- For every entry, cite the source filename or study ID and page, table, or section when available.
- Write "not reported" when information is missing; do not infer it.
- Keep authors' findings separate from your interpretation and flag contradictions.

Output:
Use columns for: citation | aim | context | design | sample/data | measure or phenomenon | main finding | limitation | source location | reviewer note. End with patterns that are supported by the matrix and questions that remain unresolved.`,
          },
          {
            id: "gap-audit",
            title: "Audit a claimed research gap",
            bestFor: "Checking whether a proposed gap is an absence of evidence, a limitation, a contradiction, or only a search artefact.",
            prompt: `Context:
My current corpus contains [describe papers, databases, dates, languages, and inclusion boundaries]. I think the gap is: [proposed gap].

Task:
Stress-test this gap claim against the supplied corpus and search boundaries.

Evidence rules:
- Do not treat "not found in this corpus" as proof that no research exists.
- Trace every observation to studies or search records I provide.
- Distinguish an evidence gap, population or context gap, methodological limitation, contradictory evidence, theory gap, and search-coverage gap.
- Identify what additional searching or expert checking is needed before making the claim.

Output:
Return a gap-audit table with: possible gap type | supporting evidence | counter-evidence | boundary or uncertainty | next verification step. Finish with a cautious gap statement that does not overclaim.`,
          },
          {
            id: "claim-check",
            title: "Check a claim against its source",
            bestFor: "Verifying whether a sentence accurately represents the cited study before it enters a thesis or paper.",
            prompt: `Context:
Draft claim: [paste claim]. Proposed source: [citation, DOI, or supplied document].

Task:
Check whether the source supports the wording and strength of the claim.

Evidence rules:
- If you cannot access or locate the source text, say so and stop short of verification.
- Check the study design, population, setting, comparison, outcome, estimate, uncertainty, and authors' limitations.
- Distinguish association from causation and statistical significance from practical importance.
- Do not invent a quotation, page number, DOI, or result.

Output:
Report: verdict [supported | partly supported | unsupported | unable to verify], exact supporting location, mismatches, missing context, and a revised claim whose strength stays within the evidence.`,
          },
          ...researchAnalysisPrompts.en,
        ],
        guardrailLabel: "AI quality check",
        guardrailTitle: "Treat AI output as a draft to inspect",
        guardrails: [
          "Never cite AI-generated text as evidence; return to the original publication or dataset.",
          "Open and read the source before accepting a quotation, number, method, DOI, or page reference.",
          "Record where AI assisted the work and keep final inclusion, appraisal, and interpretation decisions human-owned.",
          "Do not upload confidential, identifiable, embargoed, or unpublished material without checking consent and institutional policy.",
        ],
      },
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
      toolDirectoryTitle: "Research tool directory",
      toolDirectoryIntro: "Choose tools by the job they must do. For literature searching, combine a broad index with the databases that matter in your discipline; confirm institutional access and record every source, query, filter, and search date.",
      toolDirectorySource: "Search tools were checked against official provider documentation; additional workflow tools were identified from the Effortless Academic list and linked to their official sites.",
      toolDirectorySourceLabel: "View the source list",
      toolLinkLabel: "Official site",
      toolCategories: [
        {
          id: "references", title: "Reference management", description: "Collect, deduplicate, annotate, and cite without losing the source trail.",
          tools: [
            { name: "Zotero", access: "Free core · paid storage", bestFor: "A strong default for most students and research teams, with browser capture and an open ecosystem.", watchFor: "Agree on collections, tags, and attachment storage before collaborating.", links: [{ label: "Zotero", href: "https://www.zotero.org/" }] },
            { name: "Mendeley Reference Manager", access: "Free", bestFor: "Researchers who want a straightforward PDF library and citation workflow.", watchFor: "Check export and collaboration needs before committing a large shared library.", links: [{ label: "Mendeley", href: "https://www.mendeley.com/reference-management/reference-manager" }] },
            { name: "EndNote", access: "Paid · institutional access may apply", bestFor: "Labs and institutions that already use EndNote styles, libraries, and support.", watchFor: "Check whether your university already provides a licence before purchasing.", links: [{ label: "EndNote", href: "https://endnote.com/" }] },
            { name: "Bibliome", access: "One-time purchase · macOS", bestFor: "Researchers who want a local, searchable PDF library with on-device organisation and iCloud-based syncing.", watchFor: "It is currently Apple-platform focused; confirm import, citation, and collaboration requirements before moving your main library.", links: [{ label: "Bibliome", href: "https://psychosonicconsulting.com/bibliome" }] },
          ],
        },
        {
          id: "search-indexes", title: "Scholarly search engines & citation indexes", description: "Search papers, theses, books, proceedings, and citation records across disciplines; use more than one source when coverage affects the conclusion.",
          tools: [
            { name: "Google Scholar Labs Search", access: "Experimental Google Scholar feature · availability may vary", bestFor: "Exploring a research question in natural language and using the resulting papers as leads for a preliminary search.", watchFor: "Treat it as an experiment, not a protocol search; save the cited papers and rerun key concepts in standard databases.", links: [{ label: "Google Scholar Labs", href: "https://scholar.google.com/scholar_labs/search" }] },
            { name: "Google Scholar", access: "Free · full-text access varies", bestFor: "A broad first pass across articles, theses, books, repositories, citations, and related works.", watchFor: "Coverage and ranking are not transparent, only the first 1,000 results are shown, and bulk export is unavailable; do not use it as the only systematic-review source.", links: [{ label: "Google Scholar", href: "https://scholar.google.com/" }] },
            { name: "Semantic Scholar", access: "Free · account optional", bestFor: "Searching across disciplines, filtering results, and following citations or influential references.", watchFor: "AI ranking and citation labels assist discovery but do not establish completeness, relevance, or study quality.", links: [{ label: "Semantic Scholar", href: "https://www.semanticscholar.org/" }] },
            { name: "OpenAlex", access: "Open data · free web search", bestFor: "Searching and filtering a large open catalog of works, authors, institutions, topics, and citation links.", watchFor: "Metadata and automated topic labels can be incomplete or incorrect; verify the publication and DOI at the source.", links: [{ label: "OpenAlex", href: "https://explore.openalex.org/works" }] },
            { name: "Crossref Metadata Search", access: "Free · open metadata", bestFor: "Finding or verifying a DOI and bibliographic metadata when a citation is incomplete.", watchFor: "Crossref searches deposited metadata rather than the full scholarly literature; use it for record verification, not as the sole topical database.", links: [{ label: "Crossref", href: "https://search.crossref.org/" }] },
            { name: "CORE", access: "Free · open-access focus", bestFor: "Finding open-access copies aggregated from repositories and journals.", watchFor: "Repository metadata and versions vary; check whether you are reading a preprint, accepted manuscript, or version of record.", links: [{ label: "CORE", href: "https://core.ac.uk/" }] },
            { name: "OpenAIRE Explore", access: "Free · open research infrastructure", bestFor: "Discovering linked publications, datasets, software, projects, and grants, especially in open-science workflows.", watchFor: "Coverage follows contributing sources and deduplication; verify identifiers and the authoritative record.", links: [{ label: "OpenAIRE Explore", href: "https://explore.openaire.eu/" }] },
            { name: "Lens", access: "Guest search + free account features · institutional tiers", bestFor: "Connecting scholarly works with citations, patents, saved searches, and alerts.", watchFor: "Patent links and citation counts answer a different question from study quality; document filters and export limits.", links: [{ label: "Lens", href: "https://www.lens.org/" }] },
            { name: "Dimensions", access: "Free personal non-commercial tier · paid plans", bestFor: "Connecting publications with grants, datasets, patents, clinical trials, and policy documents.", watchFor: "Features and export limits vary by tier; record the version and filters used.", links: [{ label: "Dimensions", href: "https://app.dimensions.ai/discover/publication" }] },
            { name: "Scopus", access: "Institutional subscription · limited free Preview", bestFor: "Curated multidisciplinary searching, citation tracking, author profiles, and export for evidence or bibliometric work.", watchFor: "Check institutional access and indexed-source coverage; absence from Scopus does not mean the work does not exist.", links: [{ label: "Scopus", href: "https://www.scopus.com/" }] },
            { name: "Web of Science", access: "Institutional subscription", bestFor: "Curated citation searching across sciences, social sciences, arts, humanities, books, and proceedings.", watchFor: "Specify the exact Web of Science collection and coverage dates; do not generalize beyond the indexes searched.", links: [{ label: "Web of Science", href: "https://www.webofscience.com/" }] },
          ],
        },
        {
          id: "field-databases", title: "Field databases & open repositories", description: "Search more deeply with field vocabularies, subject coverage, open collections, and preprint repositories.",
          tools: [
            { name: "PubMed", access: "Free", bestFor: "Biomedical, health, and life-science literature using MEDLINE records, MeSH, and precise field searching.", watchFor: "PubMed is not a full-text database and does not cover every health-related source; supplement it where the protocol requires.", links: [{ label: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/" }] },
            { name: "ERIC", access: "Free", bestFor: "Education research, reports, policy documents, and searches using the ERIC Thesaurus.", watchFor: "Use peer-reviewed and full-text filters deliberately; inclusion in ERIC does not replace appraisal.", links: [{ label: "ERIC", href: "https://eric.ed.gov/" }] },
            { name: "arXiv", access: "Free · preprints", bestFor: "Recent work in physics, mathematics, computer science, quantitative fields, and related disciplines.", watchFor: "Preprints may not be peer reviewed and may later change; check for the published version and record the version and date used.", links: [{ label: "arXiv", href: "https://arxiv.org/search/" }] },
            { name: "DOAJ", access: "Free · open-access index", bestFor: "Finding peer-reviewed open-access journals and article records across languages and regions.", watchFor: "DOAJ evaluates journal inclusion, not the validity of every individual study; appraise each paper.", links: [{ label: "DOAJ", href: "https://doaj.org/search/articles" }] },
            { name: "IEEE Xplore / ACM Digital Library", access: "Search available · full text often institutional", bestFor: "Engineering, electrical technology, computing, and conference literature.", watchFor: "Search both when computing and engineering overlap; adapt the syntax and check conference-versus-journal versions.", links: [{ label: "IEEE Xplore", href: "https://ieeexplore.ieee.org/" }, { label: "ACM Digital Library", href: "https://dl.acm.org/" }] },
            { name: "JSTOR / Project MUSE", access: "Search available · full-text access varies", bestFor: "Humanities and social sciences, including journal archives and scholarly books.", watchFor: "Coverage and date depth differ; combine them with library catalogs and field indexes for comprehensive searches.", links: [{ label: "JSTOR", href: "https://www.jstor.org/" }, { label: "Project MUSE", href: "https://muse.jhu.edu/" }] },
          ],
        },
        {
          id: "discovery", title: "AI-assisted discovery & paper reading", description: "Expand from seed papers, inspect citation context, and question documents without treating AI summaries or rankings as a reproducible database search.",
          tools: [
            { name: "Liner", access: "Free + paid plans", bestFor: "AI-assisted web and scholarly search, source collection, and early exploration of a research question.", watchFor: "Open the cited publication and verify every claim; an AI answer is not a reproducible database search.", links: [{ label: "Liner", href: "https://app.liner.com/" }] },
            { name: "Keenious", access: "Free + paid and institutional plans", bestFor: "Discovering related literature from a question, passage, or manuscript while exploring topics across disciplines.", watchFor: "Record which query or document produced the recommendations and supplement discovery with discipline databases.", links: [{ label: "Keenious", href: "https://keenious.com/landing" }] },
            { name: "Iris.ai", access: "Paid · trial or institutional access may apply", bestFor: "Exploring a topic around a seed paper and grouping related research into concepts or themes.", watchFor: "Treat topic maps as leads rather than evidence of complete coverage; inspect the underlying papers and search boundaries.", links: [{ label: "Iris.ai", href: "https://iris.ai/features/" }] },
            { name: "Elicit", access: "Free + paid plans", bestFor: "Finding papers and building a structured evidence table for rapid orientation and extraction support.", watchFor: "Audit extracted fields against the full text and do not assume its corpus or ranking covers every database required by the protocol.", links: [{ label: "Elicit", href: "https://elicit.com/" }] },
            { name: "Consensus", access: "Free + paid plans", bestFor: "Getting a source-linked overview of how research addresses a plain-language question.", watchFor: "Use it to orient the search, not to replace critical appraisal, comprehensive searching, or reading the cited studies.", links: [{ label: "Consensus", href: "https://consensus.app/" }] },
            { name: "SciSpace", access: "Free + paid plans", bestFor: "Searching literature and asking questions about an individual paper while reading it.", watchFor: "Check answers against the paper's methods, tables, and limitations; do not cite the generated explanation.", links: [{ label: "SciSpace", href: "https://scispace.com/" }] },
            { name: "Sourcely", access: "Free + paid plans", bestFor: "Finding candidate sources from a topic or passage and filtering results during exploratory searching.", watchFor: "Log the actual search process separately and verify relevance, publication status, and bibliographic details at the source.", links: [{ label: "Sourcely", href: "https://www.sourcely.net/" }] },
            { name: "Litmaps", access: "Free + paid plans", bestFor: "Following citation connections from seed papers and monitoring how a literature cluster develops over time.", watchFor: "Citation maps inherit the blind spots of the seed papers; combine them with database and grey-literature searches.", links: [{ label: "Litmaps", href: "https://www.litmaps.com/" }] },
            { name: "Scite", access: "Paid · trial or institutional access may apply", bestFor: "Inspecting whether later publications support, contrast with, or mention a cited claim.", watchFor: "Citation classification is contextual assistance, not a quality verdict; read the citing passage and both papers.", links: [{ label: "Scite", href: "https://scite.ai/" }] },
            { name: "Anara", access: "Free + paid plans", bestFor: "Searching across a researcher's own documents and obtaining citation-linked answers from that collection.", watchFor: "Check each cited passage directly and review privacy rules before uploading unpublished, sensitive, or restricted documents.", links: [{ label: "Anara", href: "https://anara.com/" }] },
          ],
        },
        {
          id: "screening", title: "Screening & review management", description: "Remove duplicates, apply eligibility criteria, resolve conflicts, and preserve an audit trail.",
          tools: [
            { name: "Rayyan", access: "Free + paid plans", bestFor: "Title and abstract screening, especially when several reviewers need blinding and conflict resolution.", watchFor: "Free and paid capabilities differ; agree on reviewer roles before inviting the team.", links: [{ label: "Rayyan", href: "https://www.rayyan.ai/" }] },
            { name: "ASReview", access: "Free · open source", bestFor: "Large screening sets where active learning can prioritise likely-relevant records while humans retain decisions.", watchFor: "Predefine stopping rules and report the model, version, and human decisions transparently.", links: [{ label: "ASReview", href: "https://asreview.nl/" }] },
            { name: "EPPI-Reviewer", access: "Subscription · partner access may apply", bestFor: "Complex evidence reviews and maps that need collaborative coding, synthesis, and review management.", watchFor: "It can be more platform than a small thesis needs; check training and access first.", links: [{ label: "EPPI-Reviewer", href: "https://eppi.ioe.ac.uk/cms/er4" }] },
            { name: "Nested Knowledge", access: "Paid · institutional access may apply", bestFor: "Managing a systematic review from search and screening through extraction, tagging, and visual synthesis in one workspace.", watchFor: "Confirm export, audit-trail, automation, and protocol requirements before committing the whole review to one platform.", links: [{ label: "Nested Knowledge", href: "https://nested-knowledge.com/" }] },
          ],
        },
        {
          id: "writing", title: "Notes, writing & collaboration", description: "Turn reading notes into a shared synthesis and a manuscript that remains maintainable.",
          tools: [
            { name: "Notion / Obsidian", access: "Free core · optional paid services", bestFor: "Linked notes, concept development, and a durable synthesis workspace before drafting.", watchFor: "Choose Notion for shared work or Obsidian for local files; avoid maintaining the same notes in both.", links: [{ label: "Notion", href: "https://www.notion.com/product" }, { label: "Obsidian", href: "https://obsidian.md/" }] },
            { name: "Overleaf", access: "Free + paid plans", bestFor: "LaTeX manuscripts, technical theses, and real-time collaboration around journal templates.", watchFor: "Confirm that your supervisor and coauthors are comfortable reviewing LaTeX projects.", links: [{ label: "Overleaf", href: "https://www.overleaf.com/" }] },
            { name: "Google Docs + Paperpile", access: "Docs free · Paperpile paid", bestFor: "Teams that already review drafts in Google Docs and want citations inside that workflow.", watchFor: "Decide which reference library is authoritative to prevent duplicate or drifting records.", links: [{ label: "Google Docs", href: "https://docs.google.com/" }, { label: "Paperpile", href: "https://paperpile.com/" }] },
            { name: "Paperpal", access: "Free + paid plans", bestFor: "Language editing, academic phrasing, and consistency checks while revising a manuscript.", watchFor: "Accept edits selectively, preserve the intended meaning, and follow journal and university policies on AI-assisted writing.", links: [{ label: "Paperpal", href: "https://paperpal.com/ai-writing-assistant" }] },
            { name: "Jenni AI", access: "Free + paid plans", bestFor: "Drafting support, revision prompts, and citation suggestions for students and academic writers.", watchFor: "Verify suggested citations in the original source and never let generated prose substitute for your analysis or authorship.", links: [{ label: "Jenni AI", href: "https://jenni.ai/" }] },
            { name: "WriteWise", access: "Free + paid plans", bestFor: "Structuring and polishing academic writing with feedback on clarity, coherence, and style.", watchFor: "Review every change for disciplinary meaning and check current privacy and institutional rules before uploading a manuscript.", links: [{ label: "WriteWise", href: "https://web.writewise.io/" }] },
            { name: "Livewrite (formerly ReSub)", access: "Paid plans", bestFor: "Reformatting a manuscript for the requirements of a target journal, especially in medical publishing workflows.", watchFor: "Confirm the generated document against the journal's latest author instructions before submission.", links: [{ label: "Livewrite", href: "https://livewrite.app/" }] },
            { name: "Yomu AI", access: "Free + paid plans", bestFor: "An integrated academic writing workspace with drafting, revision, citations, and formatting support.", watchFor: "Run plagiarism and source checks independently and verify every generated citation and factual statement.", links: [{ label: "Yomu AI", href: "https://www.yomu.ai/" }] },
          ],
        },
        {
          id: "analysis", title: "Analysis & synthesis", description: "Code qualitative findings, calculate pooled estimates, or manage an end-to-end review.",
          tools: [
            { name: "NVivo / ATLAS.ti", access: "Paid · student and institutional options", bestFor: "Systematic coding of qualitative findings, memos, relationships, and team-based analysis.", watchFor: "Software does not choose a coding logic; define the analytical approach before importing everything.", links: [{ label: "NVivo", href: "https://lumivero.com/products/nvivo/" }, { label: "ATLAS.ti", href: "https://atlasti.com/" }] },
            { name: "R + metafor", access: "Free · open source", bestFor: "Reproducible meta-analysis, sensitivity checks, and publication-quality statistical outputs.", watchFor: "Use it with statistical supervision when effect measures, dependence, or heterogeneity are complex.", links: [{ label: "R", href: "https://www.r-project.org/" }, { label: "metafor", href: "https://wviechtb.github.io/metafor/" }] },
            { name: "Covidence", access: "Paid · often institutional", bestFor: "Teams that want screening, extraction, risk-of-bias work, and exports in one review platform.", watchFor: "Check university access and confirm that its workflow matches your review method before setup.", links: [{ label: "Covidence", href: "https://www.covidence.org/" }] },
          ],
        },
        {
          id: "visualisation", title: "Scientific visuals", description: "Create diagrams or illustrations that communicate methods and findings while keeping the underlying evidence visible.",
          tools: [
            { name: "SciDraw", access: "Free + paid plans", bestFor: "Turning prompts, rough sketches, or data into scientific illustrations and explanatory diagrams.", watchFor: "Check scientific accuracy, labels, scale, permissions, and journal image policies; retain the source data and editable original.", links: [{ label: "SciDraw", href: "https://sci-draw.com/" }] },
          ],
        },
      ],
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
      { id: "rapid", title: "ต้องการผลการทบทวนเพื่อประกอบการตัดสินใจอย่างเร่งด่วน", description: "ลดขั้นตอนบางส่วนอย่างโปร่งใส เพื่อให้ได้คำตอบที่นำไปใช้ได้ภายในไม่กี่สัปดาห์" },
      { id: "thesis", title: "บททบทวนสำหรับวิทยานิพนธ์", description: "ค้นอย่างเป็นระบบและสังเคราะห์อย่างมีเหตุผล โดยเรียกชื่อวิธีให้ตรงกับสิ่งที่ทำจริง" },
      { id: "publication", title: "งานสังเคราะห์เพื่อการตีพิมพ์", description: "วางโครงร่างล่วงหน้า มีผู้ทบทวนเป็นทีม ค้นอย่างครอบคลุม ประเมินคุณภาพ และรายงานตามมาตรฐาน" },
    ],
    extraMethods: [
      {
        id: "umbrella", name: "การทบทวนงานทบทวนอย่างเป็นระบบ", englishName: "Umbrella review", family: "สังเคราะห์งานทบทวน", fieldExamples: ["สุขภาพและการแพทย์", "สาธารณสุข", "จิตวิทยา"],
        summary: "สังเคราะห์ผลจากงานทบทวนวรรณกรรมอย่างเป็นระบบที่มีอยู่ โดยไม่ย้อนกลับไปวิเคราะห์งานวิจัยปฐมภูมิทุกชิ้น",
        bestFor: "เหมาะเมื่อหัวข้อมีงานทบทวนคุณภาพดีหลายชุด และต้องการเปรียบเทียบผลกับระดับความเชื่อมั่นในภาพรวม",
        avoidWhen: "ไม่เหมาะเมื่อมีงานวิจัยปฐมภูมิใหม่กว่างานทบทวนเดิม งานทบทวนซ้ำซ้อนกันมาก หรือคุณภาพโดยรวมต่ำ",
        output: "ผลสังเคราะห์ในระดับงานทบทวน พร้อมข้อมูลความซ้ำซ้อน คุณภาพ และประเด็นที่ยังไม่แน่นอน",
        time: "โดยมาก 6–12 เดือน",
        steps: ["กำหนดคำถาม", "ค้นหางานทบทวน", "ตรวจความซ้ำซ้อนของงานวิจัยต้นทาง", "ประเมินคุณภาพงานทบทวน", "สังเคราะห์ระดับความเชื่อมั่น"],
        quality: "ประเมินคุณภาพงานทบทวน และแสดงให้ชัดหากงานวิจัยปฐมภูมิชิ้นเดียวถูกนับซ้ำในหลายงานทบทวน",
      },
      {
        id: "rapid", name: "การทบทวนแบบเร่งรัด", englishName: "Rapid review", family: "การตัดสินใจเร่งด่วน", fieldExamples: ["นโยบายสุขภาพ", "นโยบายสาธารณะ", "การจัดการภาวะฉุกเฉิน"],
        summary: "ลดขอบเขตหรือขั้นตอนบางส่วนตามแผนที่กำหนดไว้ เมื่อต้องใช้หลักฐานประกอบการตัดสินใจอย่างเร่งด่วน",
        bestFor: "เหมาะกับการตัดสินใจด้านนโยบาย บริการ หรือโครงการที่มีผู้ใช้ผลชัดเจนและมีกำหนดเวลาแน่นอน",
        avoidWhen: "ไม่เหมาะเมื่อจำเป็นต้องค้นให้ครอบคลุมที่สุด หรือการลดขั้นตอนอาจทำให้ข้อสรุปในเรื่องสำคัญคลาดเคลื่อน",
        output: "รายงานหลักฐานที่เสร็จตามกรอบเวลา พร้อมระบุขั้นตอนที่ลดลง ความไม่แน่นอน และแผนปรับปรุงในอนาคต",
        time: "โดยมาก 2–12 สัปดาห์",
        steps: ["ตกลงขอบเขตการตัดสินใจ", "กำหนดขั้นตอนที่จะลด", "ค้นและคัดกรอง", "ประเมินหลักฐานสำคัญ", "รายงานข้อจำกัด"],
        quality: "กำหนดขั้นตอนที่จะลดไว้ล่วงหน้า และอธิบายผลที่อาจเกิดขึ้นต่อข้อสรุป",
      },
      {
        id: "systematic-search", name: "การค้นและทบทวนวรรณกรรมอย่างเป็นระบบ", englishName: "Systematic search and review", family: "การค้นเพื่อวิทยานิพนธ์", fieldExamples: ["การศึกษา", "สังคมศาสตร์", "บริหารธุรกิจและการจัดการ"],
        summary: "ค้นอย่างโปร่งใสและให้ผู้อื่นค้นตามได้ แล้วสังเคราะห์ในระดับที่เหมาะกับวิทยานิพนธ์หรือข้อเสนอโครงการ",
        bestFor: "เหมาะกับงานบัณฑิตศึกษาที่ต้องการบททบทวนซึ่งมีหลักฐานรองรับชัดเจน แต่ไม่ได้ทำการทบทวนวรรณกรรมอย่างเป็นระบบเต็มรูปแบบ",
        avoidWhen: "ไม่ควรใช้ชื่อเรื่องหรือข้อสรุปที่สื่อว่าค้นครอบคลุมทั้งหมด หากไม่มีทีม ประเมินคุณภาพไม่ครบ หรือไม่ได้วางโครงร่างล่วงหน้า",
        output: "บันทึกการค้นที่ตรวจสอบย้อนหลังได้ ผลการคัดกรอง ตารางหลักฐาน และบทสังเคราะห์เชิงบรรยายตามขอบเขตที่กำหนด",
        time: "โดยมาก 2–6 เดือน",
        steps: ["กำหนดขอบเขตบท", "สร้างชุดคำค้น", "บันทึกการค้น", "คัดกรองสม่ำเสมอ", "สังเคราะห์ตามคำถาม"],
        quality: "เรียกชื่อวิธีให้ตรงกับสิ่งที่ทำ และแยกให้ชัดระหว่างการค้นอย่างเป็นระบบกับการทบทวนวรรณกรรมอย่างเป็นระบบเต็มรูปแบบ",
      },
      {
        id: "meta-ethnography", name: "การสังเคราะห์แบบเมตาชาติพันธุ์วรรณนา", englishName: "Meta-ethnography", family: "การสังเคราะห์เชิงตีความ", fieldExamples: ["สุขภาพและการพยาบาล", "สังคมวิทยาและมานุษยวิทยา", "การศึกษา"],
        summary: "นำแนวคิดจากงานวิจัยเชิงคุณภาพหลายชิ้นมาเทียบเคียงและตีความร่วมกัน เพื่อพัฒนาคำอธิบายหรือทฤษฎีใหม่",
        bestFor: "เหมาะกับกลุ่มงานวิจัยเชิงคุณภาพที่มีขอบเขตชัดและมีแนวคิดมากพอให้นำมาเปรียบเทียบกันได้",
        avoidWhen: "ไม่เหมาะเมื่อข้อค้นพบบางเกินไป ขาดข้อมูลบริบท หรือทีมต้องการเพียงสรุปหัวข้อเชิงพรรณนา",
        output: "ความสัมพันธ์ของแนวคิดทั้งส่วนที่สอดคล้องและขัดแย้งกัน พร้อมข้ออธิบายหรือการตีความใหม่",
        time: "โดยมาก 6–15 เดือน",
        steps: ["เลือกชุดงานที่มีขอบเขตชัด", "อ่านเชิงตีความ", "เปรียบเทียบความสัมพันธ์ระหว่างงาน", "เทียบเคียงแนวคิด", "สร้างคำอธิบายใหม่"],
        quality: "รักษาความหมายจากงานต้นฉบับ และบันทึกให้เห็นว่าแนวคิดใหม่พัฒนาขึ้นมาอย่างไร",
      },
      {
        id: "thematic", name: "การสังเคราะห์เชิงประเด็น", englishName: "Thematic synthesis", family: "การสังเคราะห์เชิงคุณภาพที่ตรวจสอบได้", fieldExamples: ["สาธารณสุข", "สังคมศาสตร์", "การศึกษา"],
        summary: "เริ่มจากเข้ารหัสข้อค้นพบเชิงคุณภาพทีละบรรทัด แล้วพัฒนาเป็นประเด็นเชิงพรรณนาและประเด็นเชิงวิเคราะห์",
        bestFor: "เหมาะเมื่อต้องการแสดงว่าข้อค้นพบในงานต้นฉบับพัฒนาเป็นประเด็นที่ใช้ตอบคำถามได้อย่างไร",
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
      methods: ["การทบทวนวรรณกรรมแบบกำหนดขอบเขต", "การทบทวนวรรณกรรมเชิงบูรณาการ", "การทบทวนเชิงสัจนิยม", "การค้นและทบทวนวรรณกรรมอย่างเป็นระบบ"],
      caution: "กำหนดขอบเขตให้ชัด และค้นด้วยคำศัพท์กับฐานข้อมูลจากมากกว่าหนึ่งศาสตร์",
    },
    methodDeepDives: {
      systematic: { search: "ค้นหลายฐานข้อมูลที่เกี่ยวข้อง ทะเบียนงาน การอ้างอิง และวรรณกรรมสีเทา พร้อมเก็บคำค้นและวันที่ครบถ้วน", appraisal: "เลือกเครื่องมือประเมินความเสี่ยงอคติตามแบบแผนการศึกษา และแยกการประเมินความเชื่อมั่นออกจากคุณภาพการรายงาน", reporting: "PRISMA 2020 และส่วนขยายที่เกี่ยวข้อง", tools: "Zotero หรือ EndNote · Rayyan หรือ Covidence · ตารางหรือโปรแกรมงานทบทวน", reference: "prisma" },
      scoping: { search: "ค้นอย่างกว้างและปรับการค้นระหว่างทางได้ตามแนวคิดและประเภทหลักฐาน พร้อมบันทึกการเปลี่ยนแปลง", appraisal: "การประเมินคุณภาพขึ้นกับวัตถุประสงค์ ไม่ได้บังคับเสมอ ต้องระบุและให้เหตุผล", reporting: "PRISMA-ScR และตรวจว่ามีฉบับปรับปรุงที่ต้องใช้หรือไม่", tools: "Zotero · Rayyan หรือ Covidence · ตารางจัดหมวดหลักฐาน", reference: "prisma-scr" },
      "meta-analysis": { search: "โดยทั่วไปเป็นส่วนหนึ่งของการทบทวนวรรณกรรมอย่างเป็นระบบ (systematic review) จึงใช้การค้นที่ครอบคลุมในระดับเดียวกัน", appraisal: "ประเมินความเสี่ยงต่ออคติของการศึกษา ความไม่เป็นเนื้อเดียวกันระหว่างการศึกษา การวิเคราะห์ความไว อคติในการรายงานผล และความเชื่อมั่นของหลักฐาน", reporting: "ใช้ PRISMA 2020 ร่วมกับแนวทางที่ตรงกับการวิเคราะห์และแบบแผนการศึกษา", tools: "R (metafor หรือ meta) · Stata · RevMan", reference: "prisma" },
      qualitative: { search: "ผสมผสานการค้นฐานข้อมูล การสืบค้นจากรายการอ้างอิง และการค้นแบบเจาะจง เมื่อต้องการหลักฐานที่มีแนวคิดเชิงลึก", appraisal: "ใช้แนวทางประเมินเชิงคุณภาพอย่างสม่ำเสมอ พร้อมรักษาบริบทและการสะท้อนตน", reporting: "ตรวจคลัง EQUATOR เพื่อเลือกแนวทางล่าสุดที่ตรงกับวิธีสังเคราะห์เชิงคุณภาพ", tools: "NVivo · ATLAS.ti · MAXQDA · ตารางที่มีโครงสร้าง", reference: "equator" },
      realist: { search: "ค้นเพิ่มเติมเป็นระยะเพื่อพัฒนาและทดสอบทฤษฎีโครงการ โดยพิจารณาทั้งความเกี่ยวข้องและความน่าเชื่อถือของหลักฐาน", appraisal: "พิจารณาว่าหลักฐานช่วยสนับสนุน ปรับแก้ หรือโต้แย้งคำอธิบายเรื่องบริบท–กลไก–ผลลัพธ์ได้หรือไม่", reporting: "มาตรฐานการตีพิมพ์และการประเมินคุณภาพ RAMESES สำหรับการสังเคราะห์เชิงสัจนิยม (realist synthesis)", tools: "โปรแกรมจัดการอ้างอิง · ตารางทฤษฎี · โปรแกรมวิเคราะห์เชิงคุณภาพ", reference: "rameses" },
      integrative: { search: "ค้นหลักฐานเชิงประจักษ์ ทฤษฎี และข้อมูลจากการปฏิบัติจริง โดยกำหนดขอบเขตให้ชัดและปรับการค้นอย่างมีเหตุผลเมื่อพบข้อมูลใหม่", appraisal: "ประเมินตามรูปแบบการวิจัยและอธิบายว่าหลักฐานแต่ละประเภทมีน้ำหนักต่อการสังเคราะห์อย่างไร", reporting: "ไม่มีมาตรฐานสากลเพียงชุดเดียว จึงต้องรายงานการเลือก ประเมิน และสังเคราะห์อย่างชัดเจน", tools: "โปรแกรมอ้างอิง · ตารางแนวคิด · โปรแกรมวิเคราะห์เชิงคุณภาพ" },
      mixed: { search: "วางแผนการค้นให้เชื่อมโยงกัน หรือใช้คำค้นชุดเดียวที่ครอบคลุมทั้งหลักฐานเชิงปริมาณและเชิงคุณภาพ", appraisal: "ประเมินงานวิจัยแต่ละรูปแบบให้เหมาะสม แล้วพิจารณาเหตุผลและคุณภาพของการผสานหลักฐาน", reporting: "ใช้แนวทางที่เหมาะกับหลักฐานแต่ละประเภท และอธิบายวิธีผสานผลให้ชัดเจน", tools: "ระบบงานทบทวน · โปรแกรมสถิติ · โปรแกรมเชิงคุณภาพ · ตารางแสดงผลร่วม (joint display)", reference: "equator" },
      bibliometric: { search: "กำหนดความครอบคลุมฐานข้อมูล บันทึกคำค้นกับวันส่งออก แล้วลบซ้ำและทำความสะอาดเมตาดาตา", appraisal: "ตรวจคุณภาพเมตาดาตา อคติของฐานข้อมูล การจำแนกผู้แต่งที่มีชื่อซ้ำกัน เกณฑ์ที่ใช้ และความไวต่อค่าพารามิเตอร์", reporting: "รายงานฐานข้อมูล คำค้น วันที่ กฎทำความสะอาด ตัวชี้วัด และพารามิเตอร์เครือข่าย", tools: "VOSviewer · bibliometrix · CiteSpace · OpenRefine" },
      critical: { search: "คัดเลือกงานตามเหตุผลเชิงทฤษฎี โดยรวมทั้งงานสำคัญที่วางรากฐานและข้อโต้แย้งที่เห็นต่าง", appraisal: "ประเมินความสอดคล้องของแนวคิด สมมติฐาน จุดยืน บริบททางประวัติศาสตร์ และมุมมองที่มักถูกมองข้าม", reporting: "ไม่มีรายการตรวจสอบมาตรฐานเพียงชุดเดียว จึงต้องระบุขอบเขตของแหล่งข้อมูล เหตุผลในการเลือก และอธิบายให้ชัดว่าข้อโต้แย้งพัฒนาขึ้นอย่างไร", tools: "โปรแกรมอ้างอิง · แผนผังแนวคิด · ตารางข้อโต้แย้ง" },
      umbrella: { search: "ค้นฐานงานทบทวนและฐานบรรณานุกรม พร้อมติดตามความซ้ำซ้อนของงานปฐมภูมิ", appraisal: "ใช้เครื่องมือประเมินงานทบทวนที่เหมาะสม และพิจารณาความซ้ำ ความทันสมัย และความเชื่อมั่น", reporting: "ใช้ PRISMA 2020 เมื่อเหมาะสม และรายงานวิธีจัดการความซ้ำซ้อน", tools: "ระบบงานทบทวน · ตารางอ้างอิงไขว้ · ตารางข้อมูล · กรอบความเชื่อมั่น", reference: "prisma" },
      rapid: { search: "จำกัดฐานข้อมูล ช่วงเวลา ภาษา หรือจำนวนผู้ทบทวนได้ เฉพาะเมื่อกำหนดและบันทึกเหตุผลไว้ล่วงหน้า", appraisal: "ยังควรประเมินหลักฐานที่มีผลต่อการตัดสินใจ และต้องระบุขั้นตอนที่ลดหรือตัดออกอย่างตรงไปตรงมา", reporting: "ใช้แนวทางการทบทวนแบบเร่งรัด (rapid review) ฉบับปัจจุบัน พร้อมรายงานขั้นตอนที่ลดลงและผลกระทบที่อาจเกิดขึ้น", tools: "Rayyan · Zotero · ตารางข้อมูล · ระบบอัตโนมัติที่มีมนุษย์ตรวจ", reference: "equator" },
      "systematic-search": { search: "กำหนดชุดแนวคิดที่ผู้อื่นนำไปค้นซ้ำได้ ค้นจากหลายแหล่ง บันทึกคำค้นและวันที่ แล้วลบรายการซ้ำ", appraisal: "เลือกเครื่องมือประเมินให้เหมาะกับข้อสรุปที่ต้องอาศัยคุณภาพของงานวิจัย และระบุให้ชัดหากไม่ได้ประเมิน", reporting: "เขียนวิธีค้นและผังการคัดเลือกอย่างโปร่งใส และไม่เรียกงานว่าการทบทวนวรรณกรรมอย่างเป็นระบบ (systematic review) หากยังทำไม่ครบตามมาตรฐาน", tools: "Zotero · Rayyan · บันทึกการค้น · ตารางหลักฐาน" },
      "meta-ethnography": { search: "ค้นชุดงานวิจัยที่มีแนวคิดเข้มข้นและขอบเขตชัด โดยอาจปรับการค้นระหว่างทางและติดตามรายการอ้างอิงเพิ่มเติม", appraisal: "ประเมินความลึกของแนวคิด ข้อมูลบริบท และคุณภาพการตีความทั้งจากผู้วิจัยต้นฉบับและผู้สังเคราะห์", reporting: "แนวทาง eMERGe สำหรับการรายงานการสังเคราะห์แบบเมตาชาติพันธุ์วรรณนา (meta-ethnography)", tools: "NVivo · ATLAS.ti · ตารางเปรียบเทียบแนวคิด · แผนผังแนวคิด", reference: "emerge" },
      thematic: { search: "ค้นงานวิจัยเชิงคุณภาพให้กว้างพอที่จะครอบคลุมมุมมองและความแตกต่างของปรากฏการณ์", appraisal: "ประเมินความน่าเชื่อถือและความเกี่ยวข้องของงาน พร้อมรักษาบริบทและข้อค้นพบที่ไม่สอดคล้องกัน", reporting: "ตรวจแนวทางการสังเคราะห์เชิงคุณภาพฉบับปัจจุบัน และแสดงให้เห็นว่ารหัสพัฒนาไปเป็นประเด็นเชิงวิเคราะห์อย่างไร", tools: "NVivo · ATLAS.ti · MAXQDA · ตารางที่มีโครงสร้าง", reference: "equator" },
    },
    disciplineDeepDives: {
      health: { journals: ["Cochrane Database of Systematic Reviews", "BMJ", "JAMA", "The Lancet"], standards: ["ตระกูล PRISMA", "Cochrane Handbook", "JBI Manual", "GRADE เมื่อเหมาะสม"], tools: ["Covidence", "Rayyan", "RevMan", "GRADEpro"], tip: "แยกแนวทางการรายงาน การประเมินความเสี่ยงอคติ และการประเมินความเชื่อมั่น เพราะแต่ละอย่างตอบคนละปัญหา" },
      social: { journals: ["Psychological Bulletin", "Annual Review of Sociology", "Social Science & Medicine"], standards: ["PRISMA เมื่อเหมาะสม", "ENTREQ หรือแนวทางเฉพาะวิธีเชิงคุณภาพ", "แนวทางการรายงาน APA"], tools: ["Rayyan", "NVivo", "R", "Zotero"], tip: "รักษาบริบท นิยามตัวแปร และพิจารณาอคติจากการตีพิมพ์ (publication bias) แทนการถือว่ามาตรวัดทุกชนิดเทียบกันได้" },
      education: { journals: ["Review of Educational Research", "Educational Research Review", "Teaching and Teacher Education"], standards: ["PRISMA เมื่อเหมาะสม", "RAMESES สำหรับการสังเคราะห์เชิงสัจนิยม", "แนวทางเฉพาะวิธีเชิงคุณภาพ"], tools: ["EPPI-Reviewer", "Rayyan", "NVivo", "Zotero"], tip: "บันทึกช่วงวัย บริบท ระดับความครบถ้วนในการนำกิจกรรมไปใช้ และความเป็นธรรม เพราะผลการวิจัยไม่สามารถนำไปใช้กับบริบทอื่นได้โดยอัตโนมัติ" },
      business: { journals: ["Academy of Management Review", "Journal of Management", "International Journal of Management Reviews"], standards: ["โครงร่างโปร่งใส", "PRISMA เมื่อเหมาะสม", "แนวทางงานทบทวนเฉพาะสาขา"], tools: ["Zotero", "VOSviewer", "bibliometrix", "NVivo"], tip: "แยกการสังเคราะห์หลักฐานออกจากบทความเชิงรณรงค์หรือแสดงจุดยืน และอธิบายว่าทฤษฎีมีผลต่อการคัดเลือกและตีความหลักฐานอย่างไร" },
      technology: { journals: ["ACM Computing Surveys", "IEEE Transactions", "Empirical Software Engineering"], standards: ["โครงร่างการทบทวนวรรณกรรมอย่างเป็นระบบหรือการทำแผนที่งานวิจัยที่โปร่งใส", "PRISMA เมื่อเหมาะสม", "แนวทางงานทบทวนวิศวกรรมซอฟต์แวร์"], tools: ["Zotero", "Rayyan", "VOSviewer", "R หรือ Python"], tip: "บันทึกรุ่นเทคโนโลยี ความเทียบเคียงของชุดทดสอบมาตรฐาน (benchmark) ประเภทเวทีเผยแพร่ สถานะฉบับก่อนตีพิมพ์ (preprint) และวันที่หลักฐานเริ่มล้าสมัย" },
      science: { journals: ["Environmental Evidence", "วารสาร Annual Review", "วารสารทบทวนเฉพาะศาสตร์"], standards: ["PRISMA เมื่อเหมาะสม", "ROSES สำหรับหลักฐานสิ่งแวดล้อม", "แนวทางสังเคราะห์เฉพาะศาสตร์"], tools: ["R", "bibliometrix", "Zotero", "GIS เมื่อเกี่ยวข้อง"], tip: "วางแผนความแตกต่างด้านชนิด พื้นที่ มาตราส่วน ปัจจัยแวดล้อม และการวัดก่อนเลือกแบบจำลองรวม" },
      humanities: { journals: ["วารสารทบทวนเฉพาะศาสตร์", "JSTOR", "Project MUSE"], standards: ["ขอบเขตแหล่งข้อมูลที่ชัดเจน", "การวิจารณ์แหล่งข้อมูล", "จุดยืนและข้อโต้แย้งที่เห็นต่าง"], tools: ["Zotero", "Omeka", "Voyant Tools", "โปรแกรมเข้ารหัสเชิงคุณภาพ"], tip: "ความน่าเชื่อถือเกิดจากการเลือกแหล่งข้อมูลและตีความอย่างโปร่งใส ไม่ใช่การบังคับทุกคำถามให้ใช้แม่แบบจากงานชีวการแพทย์" },
      "law-policy": { journals: ["วารสารกฎหมายตามเขตอำนาจ", "Public Administration Review", "Policy Studies Journal"], standards: ["ลำดับศักดิ์แหล่งกฎหมายและมาตรฐานอ้างอิง", "PRISMA สำหรับงานเชิงประจักษ์", "RAMESES สำหรับคำถามนโยบายซับซ้อน"], tools: ["Westlaw หรือ Lexis", "HeinOnline", "Zotero", "NVivo"], tip: "แยกข้อสรุปเชิงหลักกฎหมายว่า ‘กฎหมายกำหนดไว้อย่างไร’ ออกจากข้อสรุปเชิงประจักษ์ว่า ‘นโยบายก่อให้เกิดผลอย่างไร’" },
      interdisciplinary: { journals: ["Nature Sustainability", "PNAS", "One Earth", "เวทีแนวหน้าของแต่ละสาขา"], standards: ["ตระกูล PRISMA เมื่อเหมาะสม", "JBI Manual", "การตัดสินใจเรื่องขอบเขตและคำศัพท์ที่ชัด"], tools: ["OpenAlex", "VOSviewer", "Connected Papers", "Zotero"], tip: "ค้นข้ามชุดคำศัพท์และตระกูลฐานข้อมูล เพราะดัชนีของศาสตร์เดียวจะทำให้หลักฐานบางส่วนหายไปอย่างเป็นระบบ" },
    },
    workflow: {
      index: "05 · ลงมือทำงานทบทวน", title: "ทบทวนวรรณกรรมใน 6 ขั้นตอน",
      intro: "ทุกขั้นตอนควรมีข้อมูลสนับสนุนการตัดสินใจ เพื่อให้นักวิจัยคนอื่น—รวมถึงตัวคุณในอนาคต—ย้อนกลับมาตรวจสอบได้",
      outputLabel: "หลักฐานการทำงานที่ควรมี", checkpointLabel: "คำถามก่อนผ่านไปขั้นถัดไป",
      phases: [
        { title: "กำหนดขอบเขต", purpose: "เปลี่ยนหัวข้อให้เป็นคำถาม กำหนดสิ่งที่งานต้องการตอบ และวางขอบเขตที่ทบทวนได้จริง", outputs: ["กรอบคำถาม", "เกณฑ์คัดเลือก", "เหตุผลที่เลือกวิธีทบทวน"], checkpoint: "หลักฐานที่วางแผนจะค้นเพียงพอต่อข้อสรุปที่ต้องการนำเสนอหรือไม่" },
        { title: "ค้น", purpose: "แยกคำถามออกเป็นแนวคิด คำพ้อง และแหล่งข้อมูล พร้อมบันทึกวิธีค้นให้ผู้อื่นทำตามได้", outputs: ["ชุดแนวคิด", "คำค้นที่ทดลองแล้ว", "บันทึกการค้น"], checkpoint: "คำค้นช่วยให้พบบทความสำคัญที่รู้จักอยู่แล้วหรือไม่ และผู้อื่นสามารถใช้คำค้นนี้ค้นตามได้หรือไม่" },
        { title: "คัดกรอง", purpose: "ใช้เกณฑ์คัดเลือกอย่างสม่ำเสมอ และบันทึกเหตุผลทุกครั้งที่ตัดงานออก", outputs: ["รายการอ้างอิงหลังลบรายการซ้ำ", "ผลการคัดกรอง", "จำนวนงานในผังการคัดเลือก"], checkpoint: "หากมีผู้ทบทวนสองคน ทั้งคู่จะตีความเกณฑ์ตรงกันหรือไม่" },
        { title: "ประเมิน", purpose: "พิจารณาว่าหลักฐานแต่ละชิ้นรองรับข้อสรุปประเภทใด และรองรับได้มากน้อยเพียงใด", outputs: ["แบบบันทึกการประเมิน", "ผลประเมินความเสี่ยงอคติ", "ข้อจำกัดของหลักฐาน"], checkpoint: "เครื่องมือประเมินตรงกับประเภทงานวิจัยและเป้าหมายของงานทบทวนหรือไม่" },
        { title: "สกัดข้อมูล", purpose: "เก็บข้อมูลที่เทียบกันได้ โดยไม่ตัดบริบทที่จำเป็นต่อการสังเคราะห์", outputs: ["แบบฟอร์มสกัดข้อมูล", "ตารางหลักฐาน", "บันทึกการตรวจสอบ"], checkpoint: "ข้อสังเคราะห์ทุกข้อย้อนกลับไปยังตำแหน่งในแหล่งข้อมูลได้หรือไม่" },
        { title: "เขียน", purpose: "เรียบเรียงข้อค้นพบให้เชื่อมโยงกับความไม่แน่นอน ข้อจำกัด และประโยชน์ทางวิชาการของงาน", outputs: ["โครงสร้างการสังเคราะห์", "ตารางหรือแผนที่", "รายการตรวจสอบการรายงาน"], checkpoint: "ข้อสรุปยังอยู่ภายในขอบเขตของหลักฐานและโครงร่างที่กำหนดไว้หรือไม่" },
      ],
    },
    toolkit: {
      index: "07 · เครื่องมือนักวิจัย", title: "นำคำแนะนำไปใช้ทำงานวิจัยต่อได้ทันที",
      intro: "คัดลอกแบบฟอร์ม ปรับให้เข้ากับสาขา และบันทึกเหตุผลของการตัดสินใจแต่ละขั้นเพื่อให้งานตรวจสอบได้",
      searchTitle: "แบบร่างคำค้น Boolean", searchIntro: "แยกคำถามออกเป็นแนวคิดหลัก ใช้ OR เชื่อมคำพ้อง ใช้ AND เชื่อมแต่ละแนวคิด แล้วเติมศัพท์ควบคุมให้ตรงกับฐานข้อมูลที่ใช้",
      searchCode: "(\"artificial intelligence\" OR \"machine learning\" OR AI)\nAND\n(education OR teaching OR learning)\nAND\n(ethics OR bias OR fairness)",
      searchTips: [
        { marker: "01", title: "กำหนดเขตข้อมูลที่ต้องการค้น", description: "หากการค้นทุกเขตข้อมูลให้ผลลัพธ์กว้างเกินไป ให้ลองใช้เขตชื่อเรื่องและบทคัดย่อ หรือ TITLE-ABS-KEY ตามรูปแบบของฐานข้อมูล" },
        { marker: "02", title: "ใช้เครื่องหมายตัดคำอย่างระมัดระวัง", description: "เครื่องหมายตัดคำ (truncation) ช่วยค้นคำที่มีรากเดียวกันได้หลายรูป แต่ควรทดลองทุกคำก่อน เพื่อไม่ให้ได้คำอื่นที่ไม่เกี่ยวข้องติดมาด้วย" },
        { marker: "03", title: "ทดลองใช้คำสั่งค้นคำที่อยู่ใกล้กัน", description: "หากฐานข้อมูลรองรับ NEAR, W/n หรือคำสั่งใกล้เคียง ให้ใช้เชื่อมแนวคิดที่ควรอยู่ใกล้กันโดยไม่บังคับเป็นวลีตายตัว" },
      ],
      aiLab: {
        index: "ใช้ AI ช่วยทำงานวิจัย",
        title: "คลังพรอมต์สำหรับงานวิจัย",
        intro: "ให้ AI ช่วยแตกประเด็น เปรียบเทียบ และทักท้วงความคิด โดยผู้วิจัยยังเป็นคนตัดสินใจและตรวจแหล่งข้อมูลทุกครั้ง",
        anatomyTitle: "พรอมต์ที่ใช้กับงานวิจัยได้ดีควรบอกให้ครบ 4 เรื่อง",
        anatomy: [
          { label: "บริบท", description: "หัวข้อ สาขา เป้าหมาย และข้อมูลที่มีอยู่" },
          { label: "งานที่ให้ช่วย", description: "ระบุงานหนึ่งอย่างให้ชัดว่าอยากให้ AI ช่วยอะไร" },
          { label: "ข้อกำหนดการใช้หลักฐาน", description: "กำหนดว่าใช้แหล่งใดได้ ต้องตรวจสอบอะไร และห้ามสร้างข้อมูล ตัวเลข หรือแหล่งอ้างอิงขึ้นเอง" },
          { label: "รูปแบบคำตอบ", description: "กำหนดโครงให้เห็นข้อมูลที่ขาดและความไม่แน่นอน" },
        ],
        taskLabel: "เลือกงานที่ต้องการให้ AI ช่วย",
        promptLabel: "พรอมต์พร้อมนำไปปรับใช้",
        prompts: [
          {
            id: "search-vocabulary",
            title: "ขยายชุดคำค้น",
            bestFor: "แตกหัวข้อเป็นแนวคิดหลัก พร้อมคำพ้อง คำย่อ รูปสะกด และคำที่ต้องนำไปทดลองค้นในฐานข้อมูล",
            prompt: `บริบท:
ฉันกำลังทบทวนเรื่อง [หัวข้อ] ใน [สาขา/ประชากร/บริบท] โดยมีคำถามเบื้องต้นว่า [คำถามหรือการตัดสินใจที่ต้องการข้อมูลสนับสนุน]

งานที่ให้ช่วย:
ช่วยสร้างชุดคำสำหรับวางแผนค้นฐานข้อมูล แยกคำถามเป็นแนวคิดหลัก แล้วเสนอคำพ้อง คำย่อ รูปสะกด คำที่กว้างกว่า และคำที่เฉพาะกว่าของแต่ละแนวคิด

ข้อกำหนดการใช้หลักฐาน:
- อย่าเรียกคำใดว่าเป็นศัพท์ควบคุมอย่างเป็นทางการ หากยังไม่ได้ตรวจในคลังศัพท์ควบคุม (thesaurus) ของฐานข้อมูลนั้น
- แยกคำค้นทั่วไปออกจากคำที่ฉันต้องนำไปตรวจว่าเป็นศัพท์ควบคุมจริงหรือไม่
- ชี้คำที่อาจดึงผลลัพธ์ไม่เกี่ยวข้อง พร้อมอธิบายสาเหตุ
- อย่าอ้างว่ารายการคำนี้ครอบคลุมครบถ้วนแล้ว

รูปแบบคำตอบ:
ทำตาราง: แนวคิดหลัก | คำค้นและรูปแบบคำ | ศัพท์ควบคุมที่ต้องตรวจ | ความเสี่ยงที่จะได้ผลลัพธ์ที่ไม่เกี่ยวข้อง จากนั้นร่างชุดคำค้น Boolean และทำเครื่องหมายส่วนที่ต้องปรับให้ตรงกับ [ชื่อฐานข้อมูล]`,
          },
          {
            id: "question-challenge",
            title: "ตรวจความชัดของคำถามทบทวน",
            bestFor: "ตรวจว่าคำถามชัด ตอบได้จริง และสอดคล้องกับหลักฐานที่คาดว่าจะพบหรือไม่ ก่อนเลือกวิธีทบทวน",
            prompt: `บริบท:
คำถามทบทวนที่กำลังพิจารณาคือ [คำถาม] อยู่ใน [สาขาหรือบริบท] ต้องการนำผลไปใช้เพื่อ [การตัดสินใจหรือประโยชน์ทางวิชาการ] และมีข้อจำกัดด้าน [เวลา/ทีม/การเข้าถึงข้อมูล]

งานที่ให้ช่วย:
ช่วยวิจารณ์คำถามนี้ก่อนที่ฉันจะกำหนดรูปแบบการทบทวน ชี้คำที่กำกวม สมมติฐานที่ซ่อนอยู่ ขอบเขตที่กว้างหรือแคบเกินไป และชนิดหลักฐานที่ต้องมีจึงจะตอบคำถามได้

ข้อกำหนดการใช้หลักฐาน:
- อย่าเลือกวิธีทบทวนจากชื่อหัวข้อเพียงอย่างเดียว
- บอกสมมติฐานทุกข้อที่ใช้เกี่ยวกับสาขาและหลักฐานที่คาดว่าจะมี
- แยกเรื่องที่ตรวจได้ด้วยการค้นนำร่อง ออกจากเรื่องที่ควรหารือกับอาจารย์ที่ปรึกษาหรือผู้มีส่วนได้ส่วนเสีย

รูปแบบคำตอบ:
ตอบเป็น 5 ส่วน: 1) จุดที่ต้องทำให้ชัด 2) คำถามฉบับปรับใหม่ 3 แบบที่มีขอบเขตต่างกัน 3) หลักฐานที่แต่ละแบบต้องใช้ 4) ความเป็นไปได้ในการทำจริง และ 5) คำถามที่ควรนำไปคุยกับอาจารย์ที่ปรึกษาหรือทีมทบทวน`,
          },
          {
            id: "evidence-matrix",
            title: "เปรียบเทียบบทความที่ให้ไว้",
            bestFor: "ทำตารางเปรียบเทียบก่อนสังเคราะห์ โดยไม่เติมข้อมูลที่บทความไม่ได้รายงาน",
            prompt: `บริบท:
ฉันจะให้บทความหรือบันทึกจำนวน [จำนวน] รายการเกี่ยวกับ [หัวข้อ] และต้องการเปรียบเทียบเพื่อ [เป้าหมายของงานทบทวน]

งานที่ให้ช่วย:
ดึงเฉพาะข้อมูลที่ปรากฏในเอกสารที่ให้ แล้วจัดทำตารางเปรียบเทียบหลักฐาน

ข้อกำหนดการใช้หลักฐาน:
- ใช้เฉพาะเอกสารหรือบันทึกที่ฉันให้ในการสนทนานี้
- ทุกช่องต้องระบุชื่อไฟล์หรือรหัสงาน และหน้า ตาราง หรือหัวข้อย่อย หากมีข้อมูลตำแหน่ง
- หากเอกสารไม่ระบุ ให้เขียนว่า “ไม่รายงาน” ห้ามคาดเดาเติมเอง
- แยกข้อค้นพบของผู้เขียนออกจากการตีความของคุณ และทำเครื่องหมายเมื่อแต่ละงานให้ผลขัดกัน

รูปแบบคำตอบ:
ใช้คอลัมน์: การอ้างอิง | เป้าหมาย | บริบท | แบบแผนวิจัย | กลุ่มตัวอย่าง/ข้อมูล | ตัววัดหรือปรากฏการณ์ | ข้อค้นพบหลัก | ข้อจำกัด | หน้า ตาราง หรือส่วนที่เกี่ยวข้อง | หมายเหตุผู้ทบทวน แล้วสรุปเฉพาะรูปแบบที่ตารางรองรับ พร้อมระบุคำถามที่ยังตอบไม่ได้`,
          },
          {
            id: "gap-audit",
            title: "ตรวจข้ออ้างเรื่องช่องว่างวิจัย",
            bestFor: "แยกให้ออกว่าสิ่งที่เรียกว่าช่องว่าง เป็นการขาดหลักฐาน ข้อจำกัดของวิธี ผลที่ขัดกัน หรือเกิดจากการค้นยังไม่ครอบคลุม",
            prompt: `บริบท:
ชุดเอกสารปัจจุบันของฉันมาจาก [ฐานข้อมูล/ช่วงปี/ภาษา/ขอบเขตการคัดเลือก] และกำลังจะเสนอว่าช่องว่างคือ [ข้อความที่ต้องการตรวจ]

งานที่ให้ช่วย:
ช่วยทดสอบว่าข้ออ้างเรื่องช่องว่างนี้หนักแน่นเพียงใด เมื่อเทียบกับชุดเอกสารและขอบเขตการค้นที่ฉันให้

ข้อกำหนดการใช้หลักฐาน:
- การไม่พบในเอกสารชุดนี้ ไม่ได้แปลว่าไม่มีงานวิจัยอยู่จริง
- ทุกข้อสังเกตต้องย้อนกลับไปยังงานวิจัยหรือบันทึกการค้นที่ฉันให้
- แยกช่องว่างด้านหลักฐาน ประชากรหรือบริบท ข้อจำกัดด้านระเบียบวิธี ผลที่ขัดกัน ช่องว่างทางทฤษฎี และช่องว่างจากการค้นไม่ครอบคลุม
- ระบุสิ่งที่ต้องค้นเพิ่มหรือให้ผู้เชี่ยวชาญช่วยตรวจ ก่อนนำข้ออ้างนี้ไปใช้

รูปแบบคำตอบ:
ทำตาราง: ประเภทช่องว่างที่เป็นไปได้ | หลักฐานสนับสนุน | หลักฐานโต้แย้ง | ขอบเขตหรือความไม่แน่นอน | ขั้นตอนตรวจสอบถัดไป แล้วช่วยร่างข้อความอธิบายช่องว่างแบบระมัดระวังและไม่สรุปเกินข้อมูล`,
          },
          {
            id: "claim-check",
            title: "ตรวจข้อความกับแหล่งอ้างอิง",
            bestFor: "ตรวจว่าประโยคในวิทยานิพนธ์หรือบทความกล่าวตรงและไม่แรงเกินกว่างานต้นฉบับรองรับ",
            prompt: `บริบท:
ข้อความร่าง: [วางข้อความ]
แหล่งที่ตั้งใจใช้อ้างอิง: [รายการอ้างอิง/DOI/เอกสารที่ให้]

งานที่ให้ช่วย:
ตรวจว่าแหล่งข้อมูลรองรับเนื้อหาและระดับความหนักแน่นของข้อความนี้หรือไม่

ข้อกำหนดการใช้หลักฐาน:
- หากเข้าถึงหรือหาตำแหน่งข้อความต้นทางไม่ได้ ให้บอกตามตรงและอย่ายืนยันว่าได้ตรวจแล้ว
- ตรวจแบบแผนวิจัย ประชากร บริบท ตัวเปรียบเทียบ ผลลัพธ์ ค่าประมาณ ความไม่แน่นอน และข้อจำกัดที่ผู้เขียนระบุ
- แยกความสัมพันธ์ออกจากเหตุและผล และแยกนัยสำคัญทางสถิติออกจากความสำคัญในทางปฏิบัติ
- ห้ามสร้างข้อความอ้างตรง เลขหน้า DOI หรือผลการศึกษาขึ้นเอง

รูปแบบคำตอบ:
รายงานผลเป็น [รองรับ | รองรับบางส่วน | ไม่รองรับ | ยังตรวจไม่ได้] พร้อมตำแหน่งหลักฐาน จุดที่ไม่ตรง บริบทที่ขาด และข้อความฉบับแก้ที่มีน้ำหนักไม่เกินกว่าหลักฐาน`,
          },
          ...researchAnalysisPrompts.th,
        ],
        guardrailLabel: "จุดตรวจคุณภาพเมื่อใช้ AI",
        guardrailTitle: "ให้ถือว่าคำตอบจาก AI เป็นร่างที่ต้องตรวจ",
        guardrails: [
          "อย่านำข้อความที่ AI สร้างขึ้นไปใช้อ้างอิงเป็นหลักฐาน ต้องย้อนกลับไปยังบทความหรือชุดข้อมูลต้นฉบับ",
          "เปิดอ่านแหล่งต้นฉบับก่อนเชื่อข้อความอ้างตรง ตัวเลข วิธีวิจัย DOI หรือเลขหน้าที่ AI ให้มา",
          "บันทึกว่าใช้ AI ช่วยตรงไหน และให้ผู้วิจัยเป็นผู้ตัดสินใจเรื่องการคัดเลือก การประเมิน และการตีความ",
          "อย่าอัปโหลดข้อมูลลับ ข้อมูลระบุตัวบุคคล งานที่ติดเงื่อนไขเผยแพร่ หรือเอกสารที่ยังไม่ตีพิมพ์ โดยไม่ตรวจความยินยอมและนโยบายของสถาบันก่อน",
        ],
      },
      copy: "คัดลอก", copied: "คัดลอกแล้ว ✓", templateLabel: "แบบฟอร์มพร้อมใช้",
      appraisalTitle: "เลือกวิธีประเมินให้ตรงกับประเภทหลักฐาน", appraisalIntro: "ประเภทงานวิจัยที่นำมาทบทวน—ไม่ใช่ชื่อเสียงของวารสาร—เป็นตัวกำหนดว่าควรประเมินคุณภาพจากมุมใด",
      appraisalRows: [
        ["การทดลองแบบสุ่ม", "การสุ่ม การเบี่ยงเบน ข้อมูลหาย การวัด และการเลือกรายงาน", "RoB 2 หรือเครื่องมือเทียบเท่าในสาขา"],
        ["การแทรกแซงไม่สุ่ม", "ตัวแปรกวน การเลือก การจัดกลุ่ม การเบี่ยงเบน และข้อมูลหาย", "ROBINS-I หรือเครื่องมือเทียบเท่า"],
        ["งานเชิงคุณภาพ", "ความเหมาะสม การคัดเลือก การสะท้อนตน การวิเคราะห์ บริบท และความน่าเชื่อถือ", "CASP, JBI หรือเครื่องมือที่เหมาะกับสาขา"],
        ["งานวิจัยแบบผสมผสานวิธี", "คุณภาพของแต่ละส่วนและเหตุผลในการผสานผล", "MMAT หรือเครื่องมือที่เหมาะกับงานแต่ละรูปแบบ ร่วมกับการประเมินวิธีผสานผล"],
        ["การทบทวนวรรณกรรมอย่างเป็นระบบ", "โครงร่าง การค้น การเลือก การประเมิน การสังเคราะห์ และอคติ", "AMSTAR 2 หรือเครื่องมือประเมินงานทบทวนที่ตรงวัตถุประสงค์"],
      ],
      tableHeadings: ["ประเภทงานวิจัย", "ประเด็นที่ควรตรวจ", "เครื่องมือที่อาจใช้เป็นจุดเริ่มต้น"],
      toolDirectoryTitle: "คลังเครื่องมือสำหรับทำงานวิจัย",
      toolDirectoryIntro: "เลือกเครื่องมือตามงานที่ต้องทำ หากสืบค้นวรรณกรรมควรใช้ระบบค้นแบบกว้างร่วมกับฐานข้อมูลหลักของสาขา ตรวจสิทธิ์ของมหาวิทยาลัย และบันทึกแหล่งค้น คำค้น ตัวกรอง และวันที่ค้นทุกครั้ง",
      toolDirectorySource: "เครื่องมือสืบค้นตรวจสอบจากเอกสารของผู้ให้บริการโดยตรง ส่วนเครื่องมือทำงานวิจัยเพิ่มเติมคัดเลือกจากรายการของ Effortless Academic และเชื่อมไปยังเว็บไซต์ทางการ",
      toolDirectorySourceLabel: "ดูรายการต้นทาง",
      toolLinkLabel: "เว็บไซต์ทางการ",
      toolCategories: [
        {
          id: "references", title: "จัดการเอกสารอ้างอิง", description: "รวบรวม ลบรายการซ้ำ ใส่บันทึก และอ้างอิง โดยยังย้อนกลับไปหาแหล่งต้นทางได้",
          tools: [
            { name: "Zotero", access: "ตัวโปรแกรมใช้ฟรี · พื้นที่เพิ่มมีค่าใช้จ่าย", bestFor: "เป็นตัวเลือกเริ่มต้นที่เหมาะกับนักศึกษาและทีมวิจัยส่วนใหญ่ มีส่วนเสริมเบราว์เซอร์และระบบที่เปิดกว้าง", watchFor: "ก่อนทำงานร่วมกันควรตกลงโครงสร้างโฟลเดอร์ แท็ก และวิธีเก็บไฟล์แนบ", links: [{ label: "Zotero", href: "https://www.zotero.org/" }] },
            { name: "Mendeley Reference Manager", access: "ใช้ฟรี", bestFor: "ผู้ที่ต้องการคลังไฟล์ PDF และระบบแทรกการอ้างอิงที่ใช้งานไม่ซับซ้อน", watchFor: "ควรทดลองส่งออกข้อมูลและการทำงานร่วมกันก่อนย้ายคลังขนาดใหญ่ทั้งหมดเข้าไป", links: [{ label: "Mendeley", href: "https://www.mendeley.com/reference-management/reference-manager" }] },
            { name: "EndNote", access: "มีค่าใช้จ่าย · สถาบันอาจมีสิทธิ์ให้ใช้", bestFor: "ห้องปฏิบัติการหรือมหาวิทยาลัยที่ใช้ EndNote เป็นมาตรฐานและมีรูปแบบอ้างอิงพร้อมอยู่แล้ว", watchFor: "ตรวจสิทธิ์ของมหาวิทยาลัยก่อนซื้อ เพราะหลายแห่งมีใบอนุญาตให้ใช้อยู่แล้ว", links: [{ label: "EndNote", href: "https://endnote.com/" }] },
            { name: "Bibliome", access: "ซื้อครั้งเดียว · ใช้บน macOS", bestFor: "ผู้ที่ต้องการจัดระเบียบและค้นไฟล์ PDF ในเครื่อง โดยให้ระบบช่วยจัดหมวดหมู่และซิงก์ผ่าน iCloud", watchFor: "ปัจจุบันเน้นอุปกรณ์ Apple ควรทดลองนำเข้า ส่งออก อ้างอิง และทำงานร่วมกันก่อนย้ายคลังหลัก", links: [{ label: "Bibliome", href: "https://psychosonicconsulting.com/bibliome" }] },
          ],
        },
        {
          id: "search-indexes", title: "ระบบค้นและดัชนีงานวิจัย", description: "ค้นบทความ วิทยานิพนธ์ หนังสือ รายงานประชุม และข้อมูลการอ้างอิงจากหลายสาขา หากความครอบคลุมมีผลต่อข้อสรุป ควรค้นมากกว่าหนึ่งแหล่ง",
          tools: [
            { name: "Google Scholar Labs Search", access: "ระบบทดลองของ Google Scholar · การเปิดใช้อาจต่างกันตามบัญชี", bestFor: "ทดลองค้นด้วยคำถามภาษาธรรมชาติในช่วงสำรวจหัวข้อ แล้วใช้บทความที่พบเป็นจุดตั้งต้นสำหรับการค้นนำร่อง", watchFor: "ยังไม่ควรใช้แทนการค้นตามโครงร่าง ควรบันทึกบทความที่พบและนำแนวคิดสำคัญไปค้นซ้ำในฐานข้อมูลมาตรฐาน", links: [{ label: "Google Scholar Labs", href: "https://scholar.google.com/scholar_labs/search" }] },
            { name: "Google Scholar", access: "ใช้ฟรี · การเข้าถึงฉบับเต็มขึ้นกับแหล่งเผยแพร่", bestFor: "ค้นเบื้องต้นแบบกว้างจากบทความ วิทยานิพนธ์ หนังสือ คลังสถาบัน งานที่เกี่ยวข้อง และรายการที่อ้างถึง", watchFor: "ไม่เปิดเผยขอบเขตฐานและหลักการจัดอันดับทั้งหมด แสดงผลได้จำกัดและส่งออกจำนวนมากไม่ได้ จึงไม่ควรใช้เป็นแหล่งเดียวของการทบทวนอย่างเป็นระบบ", links: [{ label: "Google Scholar", href: "https://scholar.google.com/" }] },
            { name: "Semantic Scholar", access: "ใช้ฟรี · ไม่ต้องสมัครหากใช้ค้นทั่วไป", bestFor: "ค้นข้ามสาขา กรองผล และติดตามเอกสารอ้างอิง งานที่อ้างถึง และการอ้างอิงที่ระบบจัดว่าเด่น", watchFor: "การจัดอันดับและป้ายกำกับด้วย AI ช่วยสำรวจเท่านั้น ไม่ได้ยืนยันความครอบคลุม ความเกี่ยวข้อง หรือคุณภาพงานวิจัย", links: [{ label: "Semantic Scholar", href: "https://www.semanticscholar.org/" }] },
            { name: "OpenAlex", access: "ข้อมูลเปิด · ค้นผ่านเว็บได้ฟรี", bestFor: "ค้นและกรองระเบียนงาน ผู้แต่ง สถาบัน หัวข้อ และเครือข่ายการอ้างอิงจากดัชนีแบบเปิด", watchFor: "ข้อมูลเมตาและหัวข้อที่ระบบจัดให้อาจไม่ครบหรือคลาดเคลื่อน ต้องตรวจชื่อเรื่อง DOI และสถานะการตีพิมพ์กับต้นทาง", links: [{ label: "OpenAlex", href: "https://explore.openalex.org/works" }] },
            { name: "Crossref Metadata Search", access: "ใช้ฟรี · ข้อมูลเมตาแบบเปิด", bestFor: "ค้นหาหรือตรวจ DOI และข้อมูลบรรณานุกรม เมื่อรายการอ้างอิงมีข้อมูลไม่ครบ", watchFor: "Crossref ค้นจากข้อมูลที่สำนักพิมพ์หรือหน่วยงานนำฝาก ไม่ใช่เนื้อหางานวิจัยทั้งหมด จึงเหมาะกับการตรวจระเบียนมากกว่าการใช้เป็นฐานค้นหลักเพียงแห่งเดียว", links: [{ label: "Crossref", href: "https://search.crossref.org/" }] },
            { name: "CORE", access: "ใช้ฟรี · เน้นงานที่เปิดให้อ่าน", bestFor: "ค้นฉบับเปิดที่รวบรวมจากคลังสถาบันและวารสารหลายแห่ง", watchFor: "ข้อมูลและรุ่นของเอกสารจากแต่ละคลังอาจต่างกัน ต้องตรวจว่าเป็นฉบับก่อนตีพิมพ์ ฉบับผ่านการพิจารณา หรือฉบับเผยแพร่สมบูรณ์", links: [{ label: "CORE", href: "https://core.ac.uk/" }] },
            { name: "OpenAIRE Explore", access: "ใช้ฟรี · โครงสร้างพื้นฐานงานวิจัยแบบเปิด", bestFor: "ค้นสิ่งพิมพ์ ชุดข้อมูล ซอฟต์แวร์ โครงการ และทุนที่เชื่อมโยงกัน โดยเฉพาะงานด้านวิทยาศาสตร์เปิด", watchFor: "ขอบเขตข้อมูลขึ้นกับแหล่งที่เข้าร่วมและการรวมระเบียนซ้ำ ควรตรวจรหัสเอกสารและระเบียนหลักกับต้นทาง", links: [{ label: "OpenAIRE Explore", href: "https://explore.openaire.eu/" }] },
            { name: "Lens", access: "ค้นได้โดยไม่สมัคร · บัญชีฟรีมีฟังก์ชันเพิ่ม · มีแผนสถาบัน", bestFor: "เชื่อมโยงผลงานวิชาการ การอ้างอิง สิทธิบัตร คำค้นที่บันทึกไว้ และการแจ้งเตือน", watchFor: "ความเชื่อมโยงกับสิทธิบัตรและจำนวนการอ้างอิงไม่ได้บอกคุณภาพงานวิจัย ควรบันทึกตัวกรองและข้อจำกัดการส่งออก", links: [{ label: "Lens", href: "https://www.lens.org/" }] },
            { name: "Dimensions", access: "ใช้ฟรีสำหรับงานส่วนบุคคลที่ไม่ใช่เชิงพาณิชย์ · มีแผนเสียเงิน", bestFor: "เชื่อมโยงสิ่งพิมพ์กับทุน ชุดข้อมูล สิทธิบัตร การทดลองทางคลินิก และเอกสารนโยบาย", watchFor: "ฟังก์ชันและจำนวนข้อมูลที่ส่งออกได้ต่างกันตามแผน ควรบันทึกรุ่นบริการและตัวกรองที่ใช้", links: [{ label: "Dimensions", href: "https://app.dimensions.ai/discover/publication" }] },
            { name: "Scopus", access: "ใช้ผ่านสิทธิ์สถาบัน · Scopus Preview เปิดข้อมูลบางส่วน", bestFor: "ค้นงานหลายสาขาจากฐานที่ผ่านการคัดเลือก ติดตามการอ้างอิง ตรวจประวัติผู้แต่ง และส่งออกข้อมูลเพื่อทบทวนหรือวิเคราะห์บรรณมิติ", watchFor: "ตรวจสิทธิ์ของสถาบันและขอบเขตวารสารที่ฐานจัดทำดัชนี การไม่พบใน Scopus ไม่ได้แปลว่างานนั้นไม่มีอยู่", links: [{ label: "Scopus", href: "https://www.scopus.com/" }] },
            { name: "Web of Science", access: "ใช้ผ่านสิทธิ์สถาบัน", bestFor: "ค้นและติดตามการอ้างอิงจากดัชนีที่คัดเลือก ครอบคลุมวิทยาศาสตร์ สังคมศาสตร์ ศิลปศาสตร์ มนุษยศาสตร์ หนังสือ และรายงานประชุม", watchFor: "ต้องระบุชุดดัชนีของ Web of Science และช่วงปีที่ค้นให้ชัด ไม่ควรสรุปเกินขอบเขตของดัชนีที่ใช้", links: [{ label: "Web of Science", href: "https://www.webofscience.com/" }] },
          ],
        },
        {
          id: "field-databases", title: "ฐานข้อมูลเฉพาะสาขาและคลังงานเปิด", description: "ค้นให้ลึกขึ้นด้วยศัพท์ควบคุม เนื้อหาเฉพาะสาขา คลังฉบับเปิด และคลังเอกสารก่อนตีพิมพ์",
          tools: [
            { name: "PubMed", access: "ใช้ฟรี", bestFor: "ค้นงานชีวการแพทย์ สุขภาพ และวิทยาศาสตร์ชีวภาพ โดยใช้ระเบียน MEDLINE หัวเรื่อง MeSH และการค้นแบบระบุเขตข้อมูล", watchFor: "PubMed ไม่ใช่ฐานฉบับเต็มและไม่ครอบคลุมแหล่งข้อมูลสุขภาพทุกแห่ง หากโครงร่างกำหนดให้ค้นกว้างกว่านี้ต้องใช้ฐานอื่นร่วมด้วย", links: [{ label: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/" }] },
            { name: "ERIC", access: "ใช้ฟรี", bestFor: "ค้นงานวิจัยทางการศึกษา รายงาน เอกสารนโยบาย และค้นด้วยศัพท์ใน ERIC Thesaurus", watchFor: "เลือกตัวกรองงานที่ผ่านการพิจารณาและฉบับเต็มอย่างตั้งใจ การอยู่ใน ERIC ไม่ได้แทนการประเมินคุณภาพงาน", links: [{ label: "ERIC", href: "https://eric.ed.gov/" }] },
            { name: "arXiv", access: "ใช้ฟรี · เอกสารก่อนตีพิมพ์", bestFor: "ติดตามงานใหม่ในฟิสิกส์ คณิตศาสตร์ วิทยาการคอมพิวเตอร์ สาขาเชิงปริมาณ และสาขาที่เกี่ยวข้อง", watchFor: "เอกสารอาจยังไม่ผ่านการพิจารณาและอาจแก้ไขภายหลัง ต้องตรวจว่ามีฉบับตีพิมพ์แล้วหรือไม่ พร้อมบันทึกรุ่นและวันที่ที่ใช้", links: [{ label: "arXiv", href: "https://arxiv.org/search/" }] },
            { name: "DOAJ", access: "ใช้ฟรี · ดัชนีวารสารแบบเปิด", bestFor: "ค้นวารสารแบบเปิดที่ผ่านการพิจารณาและระเบียนบทความจากหลายภาษาและภูมิภาค", watchFor: "DOAJ ประเมินวารสารเพื่อรับเข้าดัชนี ไม่ได้ยืนยันความถูกต้องของงานทุกชิ้น ผู้วิจัยยังต้องประเมินแต่ละบทความ", links: [{ label: "DOAJ", href: "https://doaj.org/search/articles" }] },
            { name: "IEEE Xplore / ACM Digital Library", access: "ค้นได้ · ฉบับเต็มมักต้องใช้สิทธิ์สถาบัน", bestFor: "ค้นงานวิศวกรรม เทคโนโลยีไฟฟ้า คอมพิวเตอร์ และรายงานประชุมวิชาการ", watchFor: "เมื่อหัวข้อคาบเกี่ยวคอมพิวเตอร์กับวิศวกรรมควรค้นทั้งสองฐาน ปรับรูปแบบคำค้นให้ตรงแต่ละระบบ และตรวจฉบับประชุมกับฉบับวารสารที่อาจซ้ำกัน", links: [{ label: "IEEE Xplore", href: "https://ieeexplore.ieee.org/" }, { label: "ACM Digital Library", href: "https://dl.acm.org/" }] },
            { name: "JSTOR / Project MUSE", access: "ค้นได้ · การเข้าถึงฉบับเต็มขึ้นกับสิทธิ์", bestFor: "ค้นงานมนุษยศาสตร์และสังคมศาสตร์ รวมถึงวารสารย้อนหลังและหนังสือวิชาการ", watchFor: "แต่ละฐานมีขอบเขตและช่วงปีต่างกัน หากต้องการค้นให้ครอบคลุมควรใช้ร่วมกับรายการสืบค้นของห้องสมุดและฐานข้อมูลหลักของสาขา", links: [{ label: "JSTOR", href: "https://www.jstor.org/" }, { label: "Project MUSE", href: "https://muse.jhu.edu/" }] },
          ],
        },
        {
          id: "discovery", title: "เครื่องมือ AI ช่วยสำรวจและอ่านบทความ", description: "ขยายผลจากบทความตั้งต้น ตรวจบริบทการอ้างอิง และถามข้อมูลจากเอกสาร โดยไม่ใช้บทสรุปหรือการจัดอันดับจาก AI แทนการค้นฐานข้อมูลที่ผู้อื่นทำตามได้",
          tools: [
            { name: "Liner", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ช่วยค้นเว็บและงานวิชาการด้วย AI รวบรวมแหล่งข้อมูล และสำรวจคำถามวิจัยในช่วงเริ่มต้น", watchFor: "ต้องเปิดบทความที่อ้างถึงและตรวจทุกข้อกล่าวอ้าง เพราะคำตอบจาก AI ไม่ใช่การค้นฐานข้อมูลที่ทำซ้ำได้", links: [{ label: "Liner", href: "https://app.liner.com/" }] },
            { name: "Keenious", access: "มีแผนฟรี แผนเสียเงิน และสิทธิ์ระดับสถาบัน", bestFor: "ค้นงานที่เกี่ยวข้องจากคำถาม ข้อความ หรือต้นฉบับ และช่วยสำรวจหัวข้อที่เชื่อมกันข้ามสาขา", watchFor: "บันทึกคำถามหรือเอกสารที่ใช้สร้างคำแนะนำ และค้นเพิ่มในฐานข้อมูลหลักของสาขา", links: [{ label: "Keenious", href: "https://keenious.com/landing" }] },
            { name: "Iris.ai", access: "มีค่าใช้จ่าย · อาจมีช่วงทดลองหรือสิทธิ์ระดับสถาบัน", bestFor: "สำรวจงานที่เชื่อมโยงกับบทความตั้งต้น และจัดกลุ่มงานตามแนวคิดหรือหัวข้อ", watchFor: "ใช้แผนผังหัวข้อเพื่อหาเบาะแส ไม่ควรถือว่าครอบคลุมงานทั้งหมด และต้องเปิดอ่านบทความต้นฉบับ", links: [{ label: "Iris.ai", href: "https://iris.ai/features/" }] },
            { name: "Elicit", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ค้นบทความและสร้างตารางข้อมูลเบื้องต้น เพื่อช่วยสำรวจและเตรียมสกัดข้อมูล", watchFor: "ตรวจข้อมูลที่สกัดกับบทความฉบับเต็ม และอย่าถือว่าฐานข้อมูลหรือการจัดอันดับครอบคลุมทุกแหล่งที่โครงร่างกำหนด", links: [{ label: "Elicit", href: "https://elicit.com/" }] },
            { name: "Consensus", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ดูภาพรวมแบบมีลิงก์ไปยังแหล่งอ้างอิงว่า งานวิจัยตอบคำถามภาษาธรรมดาไว้อย่างไร", watchFor: "ใช้เพื่อทำความเข้าใจหัวข้อเบื้องต้น ไม่ควรใช้แทนการค้นอย่างครอบคลุม การประเมินคุณภาพ หรือการอ่านบทความ", links: [{ label: "Consensus", href: "https://consensus.app/" }] },
            { name: "SciSpace", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ค้นงานวิจัยและถามคำถามเกี่ยวกับบทความแต่ละเรื่องระหว่างอ่าน", watchFor: "ตรวจคำตอบกับส่วนวิธีวิจัย ตารางผล และข้อจำกัดในบทความ และไม่ควรอ้างข้อความอธิบายที่ระบบสร้างขึ้น", links: [{ label: "SciSpace", href: "https://scispace.com/" }] },
            { name: "Sourcely", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ค้นแหล่งข้อมูลจากหัวข้อหรือข้อความ และกรองงานเบื้องต้นระหว่างสำรวจวรรณกรรม", watchFor: "ควรบันทึกกระบวนการค้นจริงแยกต่างหาก และตรวจความเกี่ยวข้อง สถานะการตีพิมพ์ และข้อมูลบรรณานุกรมจากต้นทาง", links: [{ label: "Sourcely", href: "https://www.sourcely.net/" }] },
            { name: "Litmaps", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ติดตามงานที่อ้างถึงกันจากบทความตั้งต้น และดูพัฒนาการของกลุ่มงานวิจัยตามเวลา", watchFor: "แผนผังการอ้างอิงอาจไม่เห็นงานที่อยู่นอกเครือข่ายของบทความตั้งต้น จึงต้องค้นฐานข้อมูลและเอกสารนอกวารสารเพิ่มเติม", links: [{ label: "Litmaps", href: "https://www.litmaps.com/" }] },
            { name: "Scite", access: "มีค่าใช้จ่าย · อาจมีช่วงทดลองหรือสิทธิ์ระดับสถาบัน", bestFor: "ตรวจว่าบทความภายหลังอ้างถึงงานเดิมในลักษณะสนับสนุน โต้แย้ง หรือกล่าวถึง", watchFor: "การจัดประเภทการอ้างอิงช่วยให้เห็นบริบท แต่ไม่ใช่คำตัดสินคุณภาพ ต้องอ่านข้อความที่อ้างถึงและบทความทั้งสองฝั่ง", links: [{ label: "Scite", href: "https://scite.ai/" }] },
            { name: "Anara", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ค้นข้ามเอกสารของผู้วิจัยเองและตอบคำถามพร้อมเชื่อมกลับไปยังข้อความในเอกสาร", watchFor: "ตรวจข้อความที่ระบบอ้างถึงทุกครั้ง และอ่านนโยบายความเป็นส่วนตัวก่อนอัปโหลดงานที่ยังไม่เผยแพร่ ข้อมูลลับ หรือเอกสารที่มีข้อจำกัด", links: [{ label: "Anara", href: "https://anara.com/" }] },
          ],
        },
        {
          id: "screening", title: "คัดกรองและจัดการงานทบทวน", description: "ลบรายการซ้ำ ใช้เกณฑ์คัดเลือก แก้ความเห็นต่าง และเก็บประวัติการตัดสินใจ",
          tools: [
            { name: "Rayyan", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "คัดกรองชื่อเรื่องและบทคัดย่อ โดยเฉพาะงานที่มีผู้ทบทวนหลายคนและต้องปกปิดผลการตัดสินใจระหว่างกัน", watchFor: "ความสามารถของแต่ละแผนต่างกัน ควรกำหนดบทบาททีมก่อนเชิญสมาชิก", links: [{ label: "Rayyan", href: "https://www.rayyan.ai/" }] },
            { name: "ASReview", access: "ฟรี · โอเพนซอร์ส", bestFor: "ชุดเอกสารขนาดใหญ่ที่ต้องการใช้ระบบจัดลำดับแบบเรียนรู้เชิงรุก (active learning) ช่วยจัดลำดับงานที่น่าจะเกี่ยวข้อง โดยให้มนุษย์เป็นผู้ตัดสิน", watchFor: "ควรกำหนดเกณฑ์หยุดและรายงานรุ่นโมเดล การตั้งค่า และการตัดสินใจของผู้ทบทวนให้ชัด", links: [{ label: "ASReview", href: "https://asreview.nl/" }] },
            { name: "EPPI-Reviewer", access: "ระบบสมาชิก · บางโครงการอาจมีสิทธิ์ให้ใช้", bestFor: "งานทบทวนหรือแผนที่หลักฐาน (evidence map) ที่ซับซ้อนและต้องทำงานร่วมกันตั้งแต่ลงรหัสจนถึงสังเคราะห์", watchFor: "งานวิทยานิพนธ์ขนาดเล็กอาจไม่ต้องใช้ระบบเต็มรูปแบบ ควรตรวจค่าใช้จ่ายและเวลาเรียนรู้ก่อน", links: [{ label: "EPPI-Reviewer", href: "https://eppi.ioe.ac.uk/cms/er4" }] },
            { name: "Nested Knowledge", access: "มีค่าใช้จ่าย · สถาบันอาจมีสิทธิ์ให้ใช้", bestFor: "จัดการงานทบทวนวรรณกรรมอย่างเป็นระบบ ตั้งแต่ค้น คัดกรอง สกัดข้อมูล ติดแท็ก จนถึงแสดงผลในพื้นที่เดียว", watchFor: "ควรตรวจการส่งออก ประวัติการตัดสินใจ ระบบอัตโนมัติ และข้อกำหนดของโครงร่างก่อนย้ายงานทั้งโครงการเข้าไป", links: [{ label: "Nested Knowledge", href: "https://nested-knowledge.com/" }] },
          ],
        },
        {
          id: "writing", title: "จดบันทึก เขียน และทำงานร่วมกัน", description: "เปลี่ยนบันทึกจากการอ่านให้เป็นข้อสังเคราะห์ร่วมกันและต้นฉบับที่ดูแลต่อได้",
          tools: [
            { name: "Notion / Obsidian", access: "ฟังก์ชันหลักใช้ฟรี · บริการเสริมมีค่าใช้จ่าย", bestFor: "เชื่อมโยงบันทึก พัฒนาแนวคิด และจัดพื้นที่สำหรับรวบรวมและสังเคราะห์ข้อมูลก่อนเริ่มเขียนต้นฉบับ", watchFor: "เลือก Notion เมื่อต้องทำงานร่วมกัน หรือ Obsidian เมื่อต้องการเก็บไฟล์ไว้ในเครื่อง ไม่ควรทำบันทึกชุดเดียวกันซ้ำสองระบบ", links: [{ label: "Notion", href: "https://www.notion.com/product" }, { label: "Obsidian", href: "https://obsidian.md/" }] },
            { name: "Overleaf", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "วิทยานิพนธ์และบทความที่ใช้ LaTeX รวมถึงงานที่ต้องเขียนร่วมกันบนแม่แบบวารสาร", watchFor: "ควรตรวจว่าอาจารย์ที่ปรึกษาและผู้เขียนร่วมสะดวกตรวจงานใน LaTeX หรือไม่", links: [{ label: "Overleaf", href: "https://www.overleaf.com/" }] },
            { name: "Google Docs + Paperpile", access: "Docs ฟรี · Paperpile มีค่าใช้จ่าย", bestFor: "ทีมที่ตรวจแก้ต้นฉบับใน Google Docs อยู่แล้วและต้องการจัดการการอ้างอิงในพื้นที่เดียวกัน", watchFor: "กำหนดให้ชัดว่าคลังอ้างอิงใดเป็นฉบับหลัก เพื่อป้องกันรายการซ้ำหรือข้อมูลไม่ตรงกัน", links: [{ label: "Google Docs", href: "https://docs.google.com/" }, { label: "Paperpile", href: "https://paperpile.com/" }] },
            { name: "Paperpal", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ตรวจภาษา ปรับสำนวนเชิงวิชาการ และตรวจความสม่ำเสมอระหว่างแก้ต้นฉบับ", watchFor: "เลือกใช้คำแนะนำเป็นรายจุด รักษาความหมายเดิม และตรวจนโยบายของวารสารหรือมหาวิทยาลัยเรื่องการใช้ AI ช่วยเขียน", links: [{ label: "Paperpal", href: "https://paperpal.com/ai-writing-assistant" }] },
            { name: "Jenni AI", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ช่วยร่าง ปรับแก้ และแนะนำเอกสารอ้างอิงสำหรับนักศึกษาและผู้เขียนงานวิชาการ", watchFor: "ตรวจเอกสารอ้างอิงที่แนะนำจากต้นฉบับทุกครั้ง และไม่ใช้ข้อความที่ระบบสร้างแทนการวิเคราะห์หรือความรับผิดชอบของผู้เขียน", links: [{ label: "Jenni AI", href: "https://jenni.ai/" }] },
            { name: "WriteWise", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "ช่วยจัดโครงสร้างและปรับงานเขียนวิชาการ พร้อมข้อเสนอแนะด้านความชัดเจน ความต่อเนื่อง และลีลาการเขียน", watchFor: "ตรวจทุกจุดแก้ไขว่ายังตรงความหมายในสาขา และอ่านนโยบายความเป็นส่วนตัวก่อนอัปโหลดต้นฉบับ", links: [{ label: "WriteWise", href: "https://web.writewise.io/" }] },
            { name: "Livewrite (เดิมชื่อ ReSub)", access: "มีค่าใช้จ่าย", bestFor: "ปรับรูปแบบต้นฉบับให้ตรงข้อกำหนดของวารสารเป้าหมาย โดยเฉพาะงานสายการแพทย์", watchFor: "ตรวจไฟล์ที่ได้กับคำแนะนำสำหรับผู้เขียนฉบับล่าสุดของวารสารก่อนส่งทุกครั้ง", links: [{ label: "Livewrite", href: "https://livewrite.app/" }] },
            { name: "Yomu AI", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "พื้นที่เขียนงานวิชาการที่รวมการร่าง ปรับแก้ จัดการการอ้างอิง และจัดรูปแบบไว้ด้วยกัน", watchFor: "ตรวจทั้งการคัดลอกซ้ำและแหล่งที่มาแยกกัน รวมถึงตรวจเอกสารอ้างอิงและข้อเท็จจริงทุกจุดที่ระบบสร้างขึ้น", links: [{ label: "Yomu AI", href: "https://www.yomu.ai/" }] },
          ],
        },
        {
          id: "analysis", title: "วิเคราะห์และสังเคราะห์", description: "ลงรหัสข้อค้นพบเชิงคุณภาพ รวมผลเชิงสถิติ หรือจัดการกระบวนการทบทวนทั้งงาน",
          tools: [
            { name: "NVivo / ATLAS.ti", access: "มีค่าใช้จ่าย · มีทางเลือกสำหรับนักศึกษาและสถาบัน", bestFor: "ลงรหัสข้อค้นพบเชิงคุณภาพ จัดบันทึก วิเคราะห์ความสัมพันธ์ และทำงานเป็นทีมอย่างเป็นระบบ", watchFor: "โปรแกรมไม่ได้เลือกหลักการวิเคราะห์แทนผู้วิจัย ควรกำหนดแนวทางลงรหัสก่อนนำข้อมูลทั้งหมดเข้าไป", links: [{ label: "NVivo", href: "https://lumivero.com/products/nvivo/" }, { label: "ATLAS.ti", href: "https://atlasti.com/" }] },
            { name: "R + metafor", access: "ฟรี · โอเพนซอร์ส", bestFor: "ทำการวิเคราะห์อภิมาน (meta-analysis) ที่ทำซ้ำได้ ตรวจความไวของผล และสร้างผลลัพธ์ทางสถิติสำหรับรายงาน", watchFor: "ควรมีผู้เชี่ยวชาญด้านสถิติช่วยตรวจ เมื่อค่าผลลัพธ์ ความสัมพันธ์ระหว่างข้อมูล หรือความแตกต่างระหว่างการศึกษามีความซับซ้อน", links: [{ label: "R", href: "https://www.r-project.org/" }, { label: "metafor", href: "https://wviechtb.github.io/metafor/" }] },
            { name: "Covidence", access: "มีค่าใช้จ่าย · มหาวิทยาลัยหลายแห่งมีสิทธิ์ให้ใช้", bestFor: "ทีมที่ต้องการคัดกรอง สกัดข้อมูล ประเมินความเสี่ยงอคติ และส่งออกผลในระบบเดียว", watchFor: "ตรวจสิทธิ์ของมหาวิทยาลัยและทดสอบว่าขั้นตอนในระบบตรงกับวิธีทบทวนก่อนตั้งค่าโครงการ", links: [{ label: "Covidence", href: "https://www.covidence.org/" }] },
          ],
        },
        {
          id: "visualisation", title: "สร้างภาพประกอบวิชาการ", description: "สร้างแผนภาพหรือภาพประกอบเพื่ออธิบายวิธีวิจัยและข้อค้นพบ โดยยังตรวจย้อนกลับไปยังข้อมูลต้นทางได้",
          tools: [
            { name: "SciDraw", access: "มีทั้งแผนฟรีและเสียเงิน", bestFor: "เปลี่ยนคำสั่ง ภาพร่าง หรือข้อมูลให้เป็นภาพประกอบและแผนภาพทางวิทยาศาสตร์", watchFor: "ตรวจความถูกต้องทางวิทยาศาสตร์ ป้ายกำกับ สัดส่วน สิทธิ์การใช้งาน และนโยบายรูปภาพของวารสาร พร้อมเก็บข้อมูลและไฟล์ต้นฉบับที่แก้ไขได้", links: [{ label: "SciDraw", href: "https://sci-draw.com/" }] },
          ],
        },
      ],
      templates: [
        { id: "search-log", name: "แบบบันทึกการค้น", purpose: "ช่วยให้ผู้อื่นตรวจสอบและนำคำค้นไปค้นตามในแต่ละฐานข้อมูลได้", content: "ฐานข้อมูล: [ชื่อ]\nแพลตฟอร์ม: [ผู้ให้บริการ]\nวันที่ค้น: [YYYY-MM-DD]\nช่วงข้อมูล: [เริ่ม–สิ้นสุด]\nคำค้นเต็ม: [วางคำค้น]\nตัวกรอง: [ระบุหรือไม่มี]\nจำนวนผลลัพธ์: [n]\nชื่อไฟล์ส่งออก: [ชื่อ]\nหมายเหตุและการปรับ: [เหตุผล]" },
        { id: "eligibility", name: "แบบบันทึกผลการคัดเลือก", purpose: "ช่วยให้ตัดสินใจคัดกรองอย่างสม่ำเสมอและอธิบายเหตุผลได้", content: "รหัสงาน: [ผู้แต่ง-ปี]\nผู้ทบทวน: [ชื่อ]\nระยะ: [ชื่อ/บทคัดย่อ | ฉบับเต็ม]\nผลการพิจารณา: [คัดเข้า | คัดออก | รอหารือ]\nเกณฑ์ที่ใช้: [เกณฑ์]\nเหตุผลที่คัดออก: [เหตุผลเฉพาะหนึ่งข้อ]\nหมายเหตุ: [บริบทหรือความไม่แน่นอน]" },
        { id: "matrix", name: "ตารางสกัดข้อมูล", purpose: "เชื่อมบริบท ประเภทงานวิจัย ข้อค้นพบ และผลประเมินคุณภาพ", content: "การอ้างอิง | ประเทศ/บริบท | เป้าหมาย | ประเภทงานวิจัย | กลุ่มตัวอย่าง/ข้อมูล | การแทรกแซงหรือปรากฏการณ์ | ผลลัพธ์/ข้อค้นพบ | บริบท | ข้อจำกัด | ผลประเมิน | หมายเหตุผู้ทบทวน" },
        { id: "protocol", name: "แบบร่างโครงร่างการทบทวน 1 หน้า", purpose: "ช่วยให้ทีมเข้าใจตรงกันก่อนขยายการค้น", content: "การตัดสินใจที่งานนี้ต้องช่วยสนับสนุน:\nคำถามทบทวน:\nชนิดงานทบทวนและเหตุผล:\nประชากร/ปรากฏการณ์:\nแนวคิด/การแทรกแซง:\nบริบท/ตัวเปรียบเทียบ:\nประเภทหลักฐานที่จะคัดเข้า:\nแหล่งที่จะค้น:\nแนวทางประเมิน:\nแนวทางสังเคราะห์:\nแผนลงทะเบียน/รายงาน:\nข้อจำกัดที่ทราบ:" },
      ],
      pitfallsTitle: "6 จุดที่มักพลาดและควรระวังตั้งแต่ต้น",
      pitfalls: [
        ["เลือกวิธีก่อนตั้งคำถาม", "เลือกชื่อวิธีที่กำลังนิยมก่อนกำหนดข้อสรุปที่ต้องการและหลักฐานที่จะใช้"],
        ["พึ่งฐานข้อมูลเดียว", "คิดว่าฐานข้อมูลเพียงแห่งเดียวหรือ Google Scholar ครอบคลุมงานทั้งหมดแล้ว"],
        ["เปลี่ยนเกณฑ์กลางทาง", "เปลี่ยนเกณฑ์หลังเห็นผลการค้นโดยไม่บันทึกเหตุผล"],
        ["ใช้แบบประเมินไม่ตรงประเภท", "ใช้รายการตรวจสอบชุดเดียวกับงานวิจัยที่มีระเบียบวิธีต่างกัน"],
        ["ย้อนกลับหาแหล่งเดิมไม่ได้", "เก็บข้อค้นพบโดยไม่ระบุหน้า ตาราง หรือข้อความต้นทาง"],
        ["สรุปเกินหลักฐาน", "อ้างเหตุและผลหรือเหมารวมกว้างกว่าที่หลักฐานรองรับ"],
      ],
      referencesTitle: "แนวทางการรายงานอย่างเป็นทางการ", referencesNote: "แนวทางเหล่านี้อาจมีการปรับปรุง ควรตรวจฉบับล่าสุด รวมถึงข้อกำหนดของวารสารหรือสถาบันเป้าหมายทุกครั้ง",
      references: [
        { ...referenceLinks[0], label: "แนวทางการรายงาน PRISMA" },
        { ...referenceLinks[1], label: "PRISMA สำหรับการทบทวนวรรณกรรมแบบกำหนดขอบเขต" },
        { ...referenceLinks[2], label: "มาตรฐาน RAMESES" },
        { ...referenceLinks[3], label: "แนวทาง eMERGe สำหรับการสังเคราะห์แบบเมตาชาติพันธุ์วรรณนา" },
        { ...referenceLinks[4], label: "คลังแนวทาง EQUATOR" },
      ],
    },
  },
} as const satisfies Record<Locale, object>;
