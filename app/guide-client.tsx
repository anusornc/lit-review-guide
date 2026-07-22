"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { thaiContent, uiText, type Locale } from "./i18n";
import { resolveLocalePreference, resolveThemePreference } from "./preferences";
import { learningToolsContent } from "./research-tools";
import { methodSourceIds } from "./research-sources";
import { MethodComparison, ResearchWorkbench, WorkflowDrillDown } from "./research-workbench";
import { SourceLinks } from "./source-links";
import { StatTestChooser } from "./stat-test-chooser";
import {
  mergedGuideContent,
  rankMethods,
  type CommitmentId,
  type DisciplineId,
  type EvidenceId,
  type GoalId,
  type MethodId,
  type ResearchPromptId,
} from "./guide-data";

type Discipline = {
  readonly id: DisciplineId;
  readonly name: string;
  readonly marker: string;
  readonly intro: string;
  readonly questions: string;
  readonly sources: string;
  readonly methods: readonly string[];
  readonly caution: string;
};

type ReviewMethod = {
  id: MethodId;
  name: string;
  englishName?: string;
  family: string;
  summary: string;
  bestFor: string;
  avoidWhen: string;
  output: string;
  time: string;
  steps: string[];
  quality: string;
};

function BilingualMethodName({ method, locale }: { method: Pick<ReviewMethod, "name" | "englishName">; locale: Locale }) {
  return (
    <>
      {method.name}
      {locale === "th" && method.englishName && <span className="method-english-name" lang="en">{method.englishName}</span>}
    </>
  );
}

type MethodDeepDive = {
  search: string;
  appraisal: string;
  reporting: string;
  tools: string;
  reference?: string;
};

type DisciplineDeepDive = {
  journals: readonly string[];
  standards: readonly string[];
  tools: readonly string[];
  tip: string;
};

type MethodFilterId = "all" | "structured" | "flexible" | "quantitative" | "qualitative";

function DetailModal({ children, className, closeLabel, labelledBy, onClose }: {
  children: ReactNode;
  className: string;
  closeLabel: string;
  labelledBy: string;
  onClose: () => void;
}) {
  return (
    <div className="detail-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className={className} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={closeLabel} autoFocus>×</button>
        {children}
      </article>
    </div>
  );
}

const methodFilterTags: Record<MethodId, readonly Exclude<MethodFilterId, "all">[]> = {
  systematic: ["structured", "quantitative", "qualitative"],
  scoping: ["structured", "flexible"],
  "meta-analysis": ["structured", "quantitative"],
  qualitative: ["flexible", "qualitative"],
  realist: ["structured", "flexible", "qualitative"],
  integrative: ["flexible", "quantitative", "qualitative"],
  mixed: ["structured", "quantitative", "qualitative"],
  bibliometric: ["structured", "quantitative"],
  critical: ["flexible", "qualitative"],
  umbrella: ["structured", "quantitative"],
  rapid: ["structured", "flexible"],
  "systematic-search": ["structured", "flexible"],
  "meta-ethnography": ["structured", "qualitative"],
  thematic: ["flexible", "qualitative"],
};

const goals: { id: GoalId; index: string; title: string; description: string }[] = [
  { id: "map", index: "01", title: "Map a field", description: "See the size, concepts, gaps, and boundaries of a broad topic." },
  { id: "evaluate", index: "02", title: "Evaluate effects", description: "Answer a focused question about impact, association, or effectiveness." },
  { id: "understand", index: "03", title: "Understand experience", description: "Synthesize meanings, perspectives, mechanisms, or lived experience." },
  { id: "explain", index: "04", title: "Explain complexity", description: "Learn what works, for whom, in which contexts, and why." },
];

const evidenceTypes: { id: EvidenceId; title: string; description: string }[] = [
  { id: "experimental", title: "Mostly quantitative", description: "Trials, surveys, measures, or comparable numerical outcomes" },
  { id: "qualitative", title: "Mostly qualitative", description: "Interviews, observations, texts, cases, or interpretive accounts" },
  { id: "mixed", title: "Mixed or diverse", description: "Multiple designs that need an integrated explanation" },
  { id: "theoretical", title: "Conceptual or textual", description: "Theory, arguments, documents, precedents, or historical sources" },
  { id: "uncertain", title: "I do not know yet", description: "Start broad and let an exploratory search reveal the evidence base" },
];

const disciplines: Discipline[] = [
  {
    id: "health",
    marker: "H",
    name: "Health & medicine",
    intro: "Questions about effects, diagnosis, implementation, patient experience, and health systems.",
    questions: "Effectiveness, prevalence, diagnostic accuracy, experience, implementation",
    sources: "MEDLINE, Embase, CINAHL, Cochrane Library, trial registries",
    methods: ["Systematic review", "Scoping review", "Meta-analysis", "Realist review"],
    caution: "Pre-register focused reviews and use discipline-specific risk-of-bias tools.",
  },
  {
    id: "social",
    marker: "S",
    name: "Social & behavioural sciences",
    intro: "Questions about people, institutions, inequality, behaviour, culture, and social change.",
    questions: "Experience, association, mechanisms, policy effects, social patterns",
    sources: "Scopus, Web of Science, PsycINFO, Sociological Abstracts, grey literature",
    methods: ["Qualitative synthesis", "Scoping review", "Realist review", "Systematic review"],
    caution: "Do not erase context or treat unlike constructs as directly comparable.",
  },
  {
    id: "education",
    marker: "E",
    name: "Education",
    intro: "Questions about learning, teaching, curriculum, assessment, access, and educational systems.",
    questions: "Intervention effects, classroom experience, implementation, learning design",
    sources: "ERIC, Education Source, Scopus, ProQuest Dissertations, policy repositories",
    methods: ["Systematic review", "Mixed-methods review", "Scoping review", "Qualitative synthesis"],
    caution: "Account for learner age, setting, implementation fidelity, and local policy.",
  },
  {
    id: "business",
    marker: "B",
    name: "Business & management",
    intro: "Questions about organisations, markets, strategy, work, entrepreneurship, and governance.",
    questions: "Theory development, trends, relationships, organisational mechanisms",
    sources: "Business Source, ABI/INFORM, Scopus, Web of Science, SSRN",
    methods: ["Systematic review", "Integrative review", "Bibliometric review", "Realist review"],
    caution: "Separate scholarly evidence from consultancy claims and publication fashions.",
  },
  {
    id: "technology",
    marker: "T",
    name: "Engineering & computing",
    intro: "Questions about technologies, design approaches, systems, performance, and practice.",
    questions: "Technique comparison, research trends, implementation evidence, practitioner knowledge",
    sources: "IEEE Xplore, ACM Digital Library, Scopus, arXiv, standards and technical reports",
    methods: ["Systematic mapping", "Systematic review", "Multivocal review", "Bibliometric review"],
    caution: "Check version, benchmark comparability, venue quality, and rapid evidence decay.",
  },
  {
    id: "science",
    marker: "N",
    name: "Natural & environmental sciences",
    intro: "Questions about natural systems, interventions, exposure, conservation, and environmental change.",
    questions: "Effects, spatial patterns, causal drivers, environmental management",
    sources: "Web of Science, Scopus, CAB Abstracts, GeoRef, data and agency repositories",
    methods: ["Systematic map", "Systematic review", "Meta-analysis", "Evidence gap map"],
    caution: "Plan for heterogeneity in species, scale, geography, measurement, and climate.",
  },
  {
    id: "humanities",
    marker: "A",
    name: "Arts & humanities",
    intro: "Questions about meaning, interpretation, history, texts, artefacts, and cultural production.",
    questions: "Interpretation, genealogy, historiography, critical debate, archival patterns",
    sources: "JSTOR, MLA Bibliography, Project MUSE, archives, catalogues and primary collections",
    methods: ["Critical review", "Narrative review", "Historiographic review", "Archival synthesis"],
    caution: "Transparency still matters, but completeness and appraisal are interpreted differently.",
  },
  {
    id: "law-policy",
    marker: "L",
    name: "Law & public policy",
    intro: "Questions about doctrine, regulation, policy instruments, institutions, and public outcomes.",
    questions: "Legal interpretation, policy effects, implementation, institutional comparison",
    sources: "HeinOnline, Westlaw, Lexis, government portals, legislation and case repositories",
    methods: ["Doctrinal review", "Systematic review", "Realist review", "Rapid evidence review"],
    caution: "State the jurisdiction, authority hierarchy, date boundary, and policy context.",
  },
];

const methods: ReviewMethod[] = [
  {
    id: "systematic",
    name: "Systematic review",
    family: "Focused question",
    summary: "A reproducible search, appraisal, and synthesis designed to answer a precise question.",
    bestFor: "A bounded question with enough comparable primary studies and a defensible protocol.",
    avoidWhen: "The field is too new, the concepts are unstable, or the question is still exploratory.",
    output: "Evidence-based conclusion with an explicit certainty and limitation trail.",
    time: "Often 6–18 months",
    steps: ["Frame the question", "Publish a protocol", "Search and screen", "Appraise studies", "Synthesize and report"],
    quality: "Use an appropriate reporting guideline and design-specific appraisal tool.",
  },
  {
    id: "scoping",
    name: "Scoping review",
    family: "Broad landscape",
    summary: "Maps concepts, evidence types, research activity, and gaps across a broad field.",
    bestFor: "Clarifying definitions, understanding breadth, or deciding whether a systematic review is feasible.",
    avoidWhen: "You need a definitive claim about effectiveness or a pooled effect estimate.",
    output: "An evidence map, concept framework, taxonomy, and research-gap agenda.",
    time: "Often 4–12 months",
    steps: ["Define scope", "Set eligibility", "Search broadly", "Chart evidence", "Map patterns and gaps"],
    quality: "Be explicit about the role of critical appraisal; it is not automatically required.",
  },
  {
    id: "meta-analysis",
    name: "Meta-analysis",
    family: "Quantitative synthesis",
    summary: "Statistically combines compatible effect estimates from multiple studies.",
    bestFor: "Studies with sufficiently similar populations, measures, comparisons, and outcomes.",
    avoidWhen: "Clinical or methodological heterogeneity makes one pooled number misleading.",
    output: "Pooled estimate, uncertainty interval, heterogeneity analysis, and sensitivity checks.",
    time: "Usually part of a systematic review",
    steps: ["Specify effect measures", "Extract estimates", "Model heterogeneity", "Test robustness", "Interpret certainty"],
    quality: "Never choose a statistical model before understanding the source of heterogeneity.",
  },
  {
    id: "qualitative",
    name: "Qualitative evidence synthesis",
    family: "Meaning & experience",
    summary: "Integrates qualitative findings to build themes, explanations, or new interpretations.",
    bestFor: "Understanding experience, acceptability, meaning, barriers, and how people interpret a phenomenon.",
    avoidWhen: "Your only objective is estimating prevalence, frequency, or a causal effect.",
    output: "Analytical themes, conceptual model, line-of-argument, or translated interpretations.",
    time: "Often 6–15 months",
    steps: ["Define phenomenon", "Search purposively", "Appraise context", "Code findings", "Develop higher-order interpretation"],
    quality: "Preserve context and researcher reflexivity rather than reducing all findings to counts.",
  },
  {
    id: "realist",
    name: "Realist review",
    family: "Complex systems",
    summary: "Explains how context activates mechanisms to produce different outcomes.",
    bestFor: "Complex programmes, policy, implementation, and questions about what works for whom and why.",
    avoidWhen: "You only need a simple average effect or cannot develop an initial programme theory.",
    output: "Refined context–mechanism–outcome configurations and a transferable programme theory.",
    time: "Often 8–18 months",
    steps: ["Build initial theory", "Search iteratively", "Judge relevance and rigour", "Test explanations", "Refine programme theory"],
    quality: "Search and appraisal evolve with the theory; document those decisions carefully.",
  },
  {
    id: "integrative",
    name: "Integrative review",
    family: "Theory building",
    summary: "Combines empirical and theoretical literature to reconceptualise a topic or build a framework.",
    bestFor: "Mature but fragmented fields where diverse evidence can support a new conceptual model.",
    avoidWhen: "The selection logic is vague or synthesis becomes an untraceable author opinion.",
    output: "Conceptual framework, model, taxonomy, or redefinition of a problem.",
    time: "Often 4–12 months",
    steps: ["State the problem", "Set transparent boundaries", "Evaluate diverse sources", "Compare concepts", "Build and test a framework"],
    quality: "Explain how evidence types were weighted and how interpretation moved beyond summary.",
  },
  {
    id: "mixed",
    name: "Mixed-methods review",
    family: "Integrated evidence",
    summary: "Combines quantitative and qualitative evidence within one coordinated synthesis.",
    bestFor: "Questions that need both effect evidence and explanations of experience or implementation.",
    avoidWhen: "There is no clear integration question and the two syntheses would merely sit side by side.",
    output: "Integrated model connecting outcomes with implementation, context, or stakeholder experience.",
    time: "Often 9–20 months",
    steps: ["Frame linked questions", "Plan both syntheses", "Appraise by design", "Synthesize streams", "Integrate findings"],
    quality: "Define the point and logic of integration before screening begins.",
  },
  {
    id: "bibliometric",
    name: "Bibliometric review",
    family: "Research structure",
    summary: "Uses publication metadata to analyse growth, influence, collaboration, and conceptual clusters.",
    bestFor: "Large literatures where the structure and evolution of the research community matter.",
    avoidWhen: "Citation counts are being used as a substitute for study quality or substantive interpretation.",
    output: "Performance trends, collaboration networks, co-citation or keyword maps, and thematic evolution.",
    time: "Often 3–9 months",
    steps: ["Define database scope", "Clean metadata", "Select indicators", "Map networks", "Interpret with domain knowledge"],
    quality: "Report database coverage, cleaning rules, parameter choices, and indicator limitations.",
  },
  {
    id: "critical",
    name: "Critical or narrative review",
    family: "Interpretive argument",
    summary: "Develops an expert, historically situated argument about a body of thought or debate.",
    bestFor: "Tracing intellectual traditions, exposing assumptions, or proposing a new interpretation.",
    avoidWhen: "Selective citation is used to imply exhaustive coverage or objective effect estimation.",
    output: "A reasoned critical argument, historiography, theoretical intervention, or future agenda.",
    time: "Varies with corpus and depth",
    steps: ["Position the argument", "Justify the corpus", "Trace debates", "Interrogate assumptions", "Develop the contribution"],
    quality: "Make positionality, boundaries, selection logic, and counter-arguments visible.",
  },
];

const englishContent = { goals, evidenceTypes, disciplines, methods };

export default function GuideClient({ initialLocale, initialTheme }: { initialLocale: Locale; initialTheme: "light" | "dark" }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<GoalId | "">("");
  const [discipline, setDiscipline] = useState<DisciplineId | "">("");
  const [evidence, setEvidence] = useState<EvidenceId | "">("");
  const [commitment, setCommitment] = useState<CommitmentId | "">("");
  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineId>("health");
  const [activeMethod, setActiveMethod] = useState<MethodId>("scoping");
  const [disciplineQuery, setDisciplineQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<MethodFilterId>("all");
  const [activePromptId, setActivePromptId] = useState<ResearchPromptId>("search-vocabulary");
  const [copiedItem, setCopiedItem] = useState("");
  const [detailModal, setDetailModal] = useState<"method" | "discipline" | null>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);

  const merged = mergedGuideContent[locale];
  const baseContent = locale === "th" ? thaiContent : englishContent;
  const content = {
    ...baseContent,
    disciplines: [...baseContent.disciplines, merged.interdisciplinary],
    methods: [...baseContent.methods, ...merged.extraMethods],
  };
  const methodLabel = (method: Pick<ReviewMethod, "name" | "englishName">) => locale === "th" && method.englishName
    ? `${method.name} (${method.englishName})`
    : method.name;
  const { goals, evidenceTypes, disciplines, methods } = content;
  const t = uiText[locale];
  const learning = learningToolsContent[locale];

  const rankedMethodIds = rankMethods({ goal, discipline, evidence, commitment });
  const rankedMethods = rankedMethodIds
    .map((methodId) => methods.find((method) => method.id === methodId))
    .filter((method): method is (typeof methods)[number] => Boolean(method));
  const recommended = rankedMethods[0] ?? methods[1];
  const alternatives = rankedMethods.slice(1, 3);
  const chosenGoal = goals.find((item) => item.id === goal);
  const chosenDiscipline = disciplines.find((item) => item.id === discipline);
  const chosenCommitment = merged.commitments.find((item) => item.id === commitment);
  const selectedDiscipline = disciplines.find((item) => item.id === activeDiscipline) ?? disciplines[0];
  const selectedMethod = methods.find((item) => item.id === activeMethod) ?? methods[1];
  const disciplineDeepDives = merged.disciplineDeepDives as Record<DisciplineId, DisciplineDeepDive>;
  const methodDeepDives = merged.methodDeepDives as Record<MethodId, MethodDeepDive>;
  const selectedDisciplineDeepDive = disciplineDeepDives[selectedDiscipline.id];
  const selectedMethodDeepDive = methodDeepDives[selectedMethod.id];
  const activePrompt = merged.toolkit.aiLab.prompts.find((prompt) => prompt.id === activePromptId)
    ?? merged.toolkit.aiLab.prompts[0];
  const normalizedDisciplineQuery = disciplineQuery.trim().toLocaleLowerCase(locale === "th" ? "th" : "en");
  const matchesDisciplineQuery = (item: Discipline, query: string) => [item.name, item.intro, item.questions, item.sources, ...item.methods]
    .join(" ")
    .toLocaleLowerCase(locale === "th" ? "th" : "en")
    .includes(query);
  const visibleDisciplines = normalizedDisciplineQuery
    ? disciplines.filter((item) => matchesDisciplineQuery(item, normalizedDisciplineQuery))
    : disciplines;
  const methodFilterOptions: { id: MethodFilterId; label: string }[] = [
    { id: "all", label: t.method.filters.all },
    { id: "structured", label: t.method.filters.structured },
    { id: "flexible", label: t.method.filters.flexible },
    { id: "quantitative", label: t.method.filters.quantitative },
    { id: "qualitative", label: t.method.filters.qualitative },
  ];
  const visibleMethods = methodFilter === "all" ? methods : methods.filter((method) => methodFilterTags[method.id].includes(methodFilter));

  const pathwayText = `${t.pathway.copyLabels.title}\n${t.pathway.copyLabels.intent}: ${chosenGoal?.title ?? t.pathway.notSelected}\n${t.pathway.copyLabels.discipline}: ${chosenDiscipline?.name ?? t.pathway.notSelected}\n${t.pathway.copyLabels.evidence}: ${evidenceTypes.find((item) => item.id === evidence)?.title ?? t.pathway.notSelected}\n${t.pathway.copyLabels.commitment}: ${chosenCommitment?.title ?? t.pathway.notSelected}\n${t.pathway.copyLabels.method}: ${methodLabel(recommended)}\n${t.pathway.copyLabels.alternatives}: ${alternatives.map(methodLabel).join(" · ")}\n${t.pathway.copyLabels.why}: ${recommended.bestFor}`;

  useEffect(() => {
    const queryLocale = new URL(window.location.href).searchParams.get("lang");
    const nextLocale = resolveLocalePreference(
      queryLocale,
      window.localStorage.getItem("litwise-language"),
      window.navigator.language,
    );
    const storedTheme = window.localStorage.getItem("litwise-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = resolveThemePreference(storedTheme, prefersDark);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocale(nextLocale);
    setTheme(nextTheme);
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    window.localStorage.setItem("litwise-language", locale);
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.history.replaceState({}, "", url);
  }, [locale, preferencesReady]);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("litwise-theme", theme);
  }, [preferencesReady, theme]);

  useEffect(() => {
    if (!detailModal) return;
    const keepFocusInDialog = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailModal(null);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", keepFocusInDialog);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", keepFocusInDialog);
      window.requestAnimationFrame(() => detailTrigger.current?.focus());
    };
  }, [detailModal]);

  useEffect(() => {
    if (!copiedItem) return;
    const timeout = window.setTimeout(() => setCopiedItem(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [copiedItem]);

  const copyText = async (itemId: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedItem(itemId);
  };

  const canContinue = (step === 1 && goal) || (step === 2 && discipline) || (step === 3 && evidence) || (step === 4 && commitment);

  return (
    <>
      <title>{locale === "th" ? "LitWise — คู่มือการทบทวนวรรณกรรมสำหรับนักวิจัย" : "LitWise — Literature Review Expert Guide"}</title>
      <main lang={locale}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="LitWise">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>LitWise</span>
        </a>
        <nav aria-label={locale === "th" ? "เมนูหลัก" : "Main navigation"}>
          <a href="#start">{t.nav.start}</a>
          <a href="#methods">{t.nav.methods}</a>
          <a href="#disciplines">{t.nav.disciplines}</a>
          <a href="#field-notes">{t.nav.prepare}</a>
          <a href="#workflow">{t.nav.workflow}</a>
          <a href="#workbench">{learning.navLabel}</a>
          <a href="#toolkit">{t.nav.toolkit}</a>
        </nav>
        <div className="header-tools">
          <div className="language-switch" role="group" aria-label={t.languageLabel}>
            <button onClick={() => { setLocale("en"); setMethodFilter("all"); }} aria-pressed={locale === "en"}>EN</button>
            <span aria-hidden="true">/</span>
            <button onClick={() => { setLocale("th"); setMethodFilter("all"); }} aria-pressed={locale === "th"}>ไทย</button>
          </div>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => {
              const nextTheme = theme === "light" ? "dark" : "light";
              setTheme(nextTheme);
              document.documentElement.dataset.theme = nextTheme;
              window.localStorage.setItem("litwise-theme", nextTheme);
            }}
            aria-label={theme === "light" ? t.chrome.darkMode : t.chrome.lightMode}
            title={theme === "light" ? t.chrome.darkMode : t.chrome.lightMode}
          >
            <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
          </button>
          <a className="header-action" href="#pathway">{t.nav.action} <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>{t.hero.eyebrow}</span><span>{t.hero.audience}</span></p>
          <h1>{t.hero.before}<em>{t.hero.emphasis}</em>{t.hero.after}</h1>
          <p className="hero-lede">{t.hero.lede}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#pathway">{t.nav.action} <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#disciplines">{t.hero.explore} <span aria-hidden="true">↓</span></a>
          </div>
          <dl className="trust-row">
            <div><dt>14</dt><dd>{t.hero.stats[0]}</dd></div>
            <div><dt>09</dt><dd>{t.hero.stats[1]}</dd></div>
            <div><dt>05</dt><dd>{t.hero.stats[2]}</dd></div>
          </dl>
        </div>

        <aside className="hero-research-art" aria-label={t.compass.aria}>
          <article className="flow-card">
            <header><span>{t.chrome.researchFlow}</span><b>LW · 01</b></header>
            <div className="flow-stack">
              <div><span>{t.chrome.identified}</span><strong>1,284</strong></div>
              <i aria-hidden="true">↓</i>
              <div><span>{t.chrome.screened}</span><strong>286</strong></div>
              <i aria-hidden="true">↓</i>
              <div className="included"><span>{t.chrome.included}</span><strong>42</strong></div>
            </div>
            <footer><span>{t.compass.steps[0][0]}</span><span>{t.compass.steps[1][0]}</span><span>{t.compass.steps[2][0]}</span></footer>
          </article>
          <article className="checklist-card">
            <p>{t.chrome.protocolChecklist}</p>
            <ul>{t.chrome.checklistItems.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
          </article>
          <blockquote className="hero-quote">“{t.compass.note}”</blockquote>
        </aside>
      </section>

      <section className="start-section" id="start">
        <div className="section-heading split-heading">
          <div><p className="section-index">{t.startHere.index}</p><h2>{t.startHere.title}</h2></div>
          <p>{t.startHere.intro}</p>
        </div>
        <div className="start-stage-grid">
          {t.startHere.cards.map((card) => (
            <a key={card.title} href={card.href}>
              <span className="start-card-index">{card.index}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="start-card-action">{card.action}<b aria-hidden="true">→</b></span>
            </a>
          ))}
        </div>
        <nav className="journey-overview" aria-labelledby="journey-overview-title">
          <div className="journey-overview-heading">
            <h3 id="journey-overview-title">{t.startHere.journeyTitle}</h3>
            <p>{t.startHere.journeyIntro}</p>
          </div>
          <div className="journey-groups">
            {t.startHere.journeyGroups.map((group) => (
              <section key={group.label}>
                <p>{group.label}</p>
                <ol>
                  {group.items.map((item) => (
                    <li key={`${item.index}-${item.href}`}>
                      <a href={item.href}><span>{item.index}</span><strong>{item.title}</strong><b aria-hidden="true">→</b></a>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </nav>
      </section>

      <section className="pathway-section" id="pathway">
        <div className="section-heading split-heading">
          <div><p className="section-index">{t.pathway.index}</p><h2>{t.pathway.title}</h2></div>
          <p>{t.pathway.intro}</p>
        </div>

        <div className="pathway-shell">
          <div className="wizard-progress" aria-hidden="true"><span style={{ width: `${step * 20}%` }} /></div>
          <aside className="step-rail" aria-label={t.pathway.progressAria}>
            {t.pathway.stepNames.map((label, index) => {
              const itemStep = index + 1;
              return (
                <button
                  key={label}
                  className={step === itemStep ? "active" : step > itemStep ? "complete" : ""}
                  onClick={() => itemStep < step && setStep(itemStep)}
                  disabled={itemStep > step}
                  aria-current={step === itemStep ? "step" : undefined}
                >
                  <span>{String(itemStep).padStart(2, "0")}</span>
                  <strong>{label}</strong>
                </button>
              );
            })}
          </aside>

          <div className="pathway-workspace" aria-live="polite">
            {step === 1 && (
              <div className="step-content">
                <p className="step-label">{t.pathway.step1Label}</p>
                <h3>{t.pathway.step1Title}</h3>
                <p className="step-intro">{t.pathway.step1Intro}</p>
                <div className="option-grid">
                  {goals.map((item) => (
                    <button key={item.id} className={`option-card ${goal === item.id ? "selected" : ""}`} onClick={() => setGoal(item.id)} aria-pressed={goal === item.id}>
                      <span className="option-index">{item.index}</span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <p className="step-label">{t.pathway.step2Label}</p>
                <h3>{t.pathway.step2Title}</h3>
                <p className="step-intro">{t.pathway.step2Intro}</p>
                <div className="discipline-choice-grid">
                  {disciplines.map((item) => (
                    <button key={item.id} className={discipline === item.id ? "selected" : ""} onClick={() => setDiscipline(item.id)} aria-pressed={discipline === item.id}>
                      <span>{item.marker}</span><strong>{item.name}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <p className="step-label">{t.pathway.step3Label}</p>
                <h3>{t.pathway.step3Title}</h3>
                <p className="step-intro">{t.pathway.step3Intro}</p>
                <div className="evidence-list">
                  {evidenceTypes.map((item) => (
                    <button key={item.id} className={evidence === item.id ? "selected" : ""} onClick={() => setEvidence(item.id)} aria-pressed={evidence === item.id}>
                      <span className="radio-mark" aria-hidden="true" />
                      <span><strong>{item.title}</strong><small>{item.description}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="step-content">
                <p className="step-label">{t.pathway.step4Label}</p>
                <h3>{t.pathway.step4Title}</h3>
                <p className="step-intro">{t.pathway.step4Intro}</p>
                <div className="commitment-list">
                  {merged.commitments.map((item) => (
                    <button key={item.id} className={commitment === item.id ? "selected" : ""} onClick={() => setCommitment(item.id)} aria-pressed={commitment === item.id}>
                      <span className="radio-mark" aria-hidden="true" />
                      <span><strong>{item.title}</strong><small>{item.description}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="result-panel">
                <div className="result-label"><span>{t.pathway.recommended}</span><span>{t.pathway.complete}</span></div>
                <h3><BilingualMethodName method={recommended} locale={locale} /></h3>
                <p className="result-summary">{recommended.summary}</p>
                <div className="result-reason">
                  <span>{t.pathway.why}</span>
                  <p>{t.pathway.reason(chosenGoal?.title ?? "", chosenDiscipline?.name ?? "", evidenceTypes.find((item) => item.id === evidence)?.title ?? "", chosenCommitment?.title ?? "", recommended.bestFor)}</p>
                </div>
                <div className="result-grid">
                  <div><span>{t.pathway.likelyOutput}</span><p>{recommended.output}</p></div>
                  <div><span>{t.pathway.watchFor}</span><p>{recommended.avoidWhen}</p></div>
                </div>
                <SourceLinks locale={locale} sourceIds={methodSourceIds[recommended.id]} className="pathway-guidance-sources" />
                <div className="alternative-methods">
                  <span>{t.pathway.alternatives}</span>
                  <div>
                    {alternatives.map((method) => (
                      <button key={method.id} onClick={(event) => { setActiveMethod(method.id); detailTrigger.current = event.currentTarget; setDetailModal("method"); }}>
                        <strong><BilingualMethodName method={method} locale={locale} /></strong>
                        <small>{method.family} · {method.time}</small>
                        <em><b>{t.pathway.alternativeFit}</b> {method.bestFor}</em>
                        <em><b>{t.pathway.alternativeTradeoff}</b> {method.avoidWhen}</em>
                      </button>
                    ))}
                  </div>
                  <p>{t.pathway.alternativeHint}</p>
                </div>
                <div className="result-actions">
                  <button className="button button-light" onClick={(event) => { setActiveMethod(recommended.id); detailTrigger.current = event.currentTarget; setDetailModal("method"); }}>{t.pathway.study} <span aria-hidden="true">↗</span></button>
                  <button className="button button-quiet" onClick={() => copyText("pathway", pathwayText)}>{copiedItem === "pathway" ? t.pathway.copied : t.pathway.copy}</button>
                </div>
              </div>
            )}

            <div className="pathway-controls">
              <button className="back-button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>{t.pathway.back}</button>
              {step < 5 && <button className="button button-primary" disabled={!canContinue} onClick={() => setStep((value) => Math.min(5, value + 1))}>{t.pathway.continue} <span aria-hidden="true">→</span></button>}
              {step === 5 && <button className="back-button" onClick={() => { setStep(1); setGoal(""); setDiscipline(""); setEvidence(""); setCommitment(""); }}>{t.pathway.restart}</button>}
            </div>
          </div>
        </div>
      </section>

      <section className="methods-section" id="methods">
        <div className="section-heading methods-heading">
          <div><p className="section-index">{t.method.index}</p><h2>{t.method.title}</h2></div>
          <div className="method-filter-pills" role="group" aria-label={t.method.filterAria}>
            {methodFilterOptions.map((filter) => (
              <button
                key={filter.id}
                className={methodFilter === filter.id ? "active" : ""}
                aria-pressed={methodFilter === filter.id}
                onClick={() => {
                  setMethodFilter(filter.id);
                  const firstVisibleMethod = filter.id === "all" ? methods[0] : methods.find((method) => methodFilterTags[method.id].includes(filter.id as Exclude<MethodFilterId, "all">));
                  if (firstVisibleMethod) setActiveMethod(firstVisibleMethod.id);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="methods-grid" role="list" aria-label={t.method.listAria}>
          {visibleMethods.map((method, index) => (
            <article key={method.id} role="listitem">
              <button
                type="button"
                onClick={(event) => {
                  setActiveMethod(method.id);
                  detailTrigger.current = event.currentTarget;
                  setDetailModal("method");
                }}
                aria-label={`${t.method.cardAction}: ${methodLabel(method)}`}
              >
                <span className="method-card-top"><i>{String(index + 1).padStart(2, "0")}</i><em>{method.time}</em></span>
                <span className="method-card-family">{method.family}</span>
                <strong><BilingualMethodName method={method} locale={locale} /></strong>
                <small>{method.summary}</small>
                <span className="method-card-tags">{methodFilterTags[method.id].map((tag) => <i key={tag}>{t.method.filters[tag]}</i>)}</span>
                <span className="card-link">{t.method.cardAction}<b aria-hidden="true">→</b></span>
              </button>
            </article>
          ))}
        </div>

        <MethodComparison locale={locale} methods={methods} methodDeepDives={methodDeepDives} />

        {detailModal === "method" && (
          <DetailModal className="method-detail" closeLabel={t.chrome.close} labelledBy="method-dialog-title" onClose={() => setDetailModal(null)}>
              <p className="detail-kicker">{t.method.detail} · {selectedMethod.family}</p>
              <h3 id="method-dialog-title"><BilingualMethodName method={selectedMethod} locale={locale} /></h3>
              <p className="method-summary">{selectedMethod.summary}</p>
              <div className="fit-grid">
                <div><span>{t.method.useWhen}</span><p>{selectedMethod.bestFor}</p></div>
                <div><span>{t.method.avoidWhen}</span><p>{selectedMethod.avoidWhen}</p></div>
              </div>
              <div className="method-output"><span>{t.method.output}</span><p>{selectedMethod.output}</p><small>{selectedMethod.time}</small></div>
              <div className="method-steps">
                <span>{t.method.workflow}</span>
                <ol>{selectedMethod.steps.map((item) => <li key={item}>{item}</li>)}</ol>
              </div>
              {selectedMethodDeepDive && (
                <div className="method-deep-dive">
                  <div><span>{t.method.search}</span><p>{selectedMethodDeepDive.search}</p></div>
                  <div><span>{t.method.appraisal}</span><p>{selectedMethodDeepDive.appraisal}</p></div>
                  <div><span>{t.method.reporting}</span><p>{selectedMethodDeepDive.reporting}</p></div>
                  <div><span>{t.method.tools}</span><p>{selectedMethodDeepDive.tools}</p></div>
                </div>
              )}
              <SourceLinks locale={locale} sourceIds={methodSourceIds[selectedMethod.id]} className="method-guidance-sources" />
              <p className="quality-note"><strong>{t.method.quality}</strong> {selectedMethod.quality}</p>
          </DetailModal>
        )}
      </section>

      <section className="disciplines-section" id="disciplines">
        <div className="section-heading split-heading">
          <div><p className="section-index">{t.discipline.index}</p><h2>{t.discipline.title}</h2></div>
          <p>{t.discipline.intro}</p>
        </div>

        <div className="discipline-search">
          <label htmlFor="discipline-search-input">{t.discipline.searchLabel}</label>
          <input
            id="discipline-search-input"
            type="search"
            value={disciplineQuery}
            placeholder={t.discipline.searchPlaceholder}
            onChange={(event) => {
              const nextQuery = event.target.value;
              const normalizedNextQuery = nextQuery.trim().toLocaleLowerCase(locale === "th" ? "th" : "en");
              setDisciplineQuery(nextQuery);
              if (normalizedNextQuery) {
                const firstMatch = disciplines.find((item) => matchesDisciplineQuery(item, normalizedNextQuery));
                if (firstMatch) setActiveDiscipline(firstMatch.id);
              }
            }}
          />
        </div>

        <div className="discipline-card-grid" role="list" aria-label={t.discipline.listAria}>
          {visibleDisciplines.map((item) => (
            <article key={item.id} role="listitem">
              <button
                type="button"
                onClick={(event) => {
                  setActiveDiscipline(item.id);
                  detailTrigger.current = event.currentTarget;
                  setDetailModal("discipline");
                }}
                aria-label={`${t.discipline.cardAction}: ${item.name}`}
              >
                <span className="discipline-card-mark" aria-hidden="true">{item.marker}</span>
                <span className="discipline-card-number">{String(disciplines.findIndex((candidate) => candidate.id === item.id) + 1).padStart(2, "0")}</span>
                <strong>{item.name}</strong>
                <small>{item.intro}</small>
                <span className="discipline-card-tags">{item.methods.slice(0, 3).map((method) => <i key={method}>{method}</i>)}</span>
                <span className="card-link">{t.discipline.cardAction}<b aria-hidden="true">↗</b></span>
              </button>
            </article>
          ))}
          {visibleDisciplines.length === 0 && <p className="discipline-empty">{t.discipline.noResults}</p>}
        </div>

        {detailModal === "discipline" && (
          <DetailModal className="discipline-detail" closeLabel={t.chrome.close} labelledBy="discipline-dialog-title" onClose={() => setDetailModal(null)}>
              <div className="discipline-monogram" aria-hidden="true">{selectedDiscipline.marker}</div>
              <p className="detail-kicker">{t.discipline.guide} · {selectedDiscipline.name}</p>
              <h3 id="discipline-dialog-title">{selectedDiscipline.intro}</h3>
              <dl>
                <div><dt>{t.discipline.questions}</dt><dd>{selectedDiscipline.questions}</dd></div>
                <div><dt>{t.discipline.sources}</dt><dd>{selectedDiscipline.sources}</dd></div>
                <div><dt>{t.discipline.methods}</dt><dd>{selectedDiscipline.methods.join(" · ")}</dd></div>
                {selectedDisciplineDeepDive && <>
                  <div><dt>{t.discipline.journals}</dt><dd>{selectedDisciplineDeepDive.journals.join(" · ")}</dd></div>
                  <div><dt>{t.discipline.standards}</dt><dd>{selectedDisciplineDeepDive.standards.join(" · ")}</dd></div>
                  <div><dt>{t.discipline.tools}</dt><dd>{selectedDisciplineDeepDive.tools.join(" · ")}</dd></div>
                </>}
              </dl>
              {selectedDisciplineDeepDive && <div className="field-insight"><span>{t.discipline.fieldTip}</span><p>{selectedDisciplineDeepDive.tip}</p></div>}
              <div className="field-caution"><span>{t.discipline.caution}</span><p>{selectedDiscipline.caution}</p></div>
          </DetailModal>
        )}
      </section>

      <section className="field-notes" id="field-notes">
        <div className="field-note-title">
          <p className="section-index">{t.notes.index}</p>
          <h2>{t.notes.title}</h2>
        </div>
        <ol className="note-grid">
          {t.notes.items.map((item, index) => <li key={item[0]}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item[0]}</strong><p>{item[1]}</p></li>)}
        </ol>
        <blockquote>{t.notes.quote}<cite>{t.notes.cite}</cite></blockquote>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="section-heading split-heading workflow-heading">
          <div><p className="section-index">{merged.workflow.index}</p><h2>{merged.workflow.title}</h2></div>
          <p>{merged.workflow.intro}</p>
        </div>
        <WorkflowDrillDown
          locale={locale}
          phases={merged.workflow.phases}
          outputLabel={merged.workflow.outputLabel}
          checkpointLabel={merged.workflow.checkpointLabel}
        />
      </section>

      <ResearchWorkbench locale={locale} />

      <section className="toolkit-section" id="toolkit">
        <div className="section-heading split-heading toolkit-heading">
          <div><p className="section-index">{merged.toolkit.index}</p><h2>{merged.toolkit.title}</h2></div>
          <p>{merged.toolkit.intro}</p>
        </div>

        <div className="search-canvas">
          <div><p className="detail-kicker">{merged.toolkit.searchTitle}</p><h3>{merged.toolkit.searchIntro}</h3></div>
          <div className="search-code">
            <pre><code>{merged.toolkit.searchCode}</code></pre>
            <button onClick={() => copyText("boolean", merged.toolkit.searchCode)}>{copiedItem === "boolean" ? merged.toolkit.copied : merged.toolkit.copy}</button>
          </div>
        </div>

        <div className="search-tip-grid">
          {merged.toolkit.searchTips.map((tip) => (
            <article key={tip.title}>
              <span>{tip.marker}</span>
              <div><h3>{tip.title}</h3><p>{tip.description}</p></div>
            </article>
          ))}
        </div>

        <section className="ai-prompt-lab" aria-labelledby="ai-prompt-lab-title">
          <div className="section-heading split-heading prompt-lab-heading">
            <div><p className="section-index">{merged.toolkit.aiLab.index}</p><h2 id="ai-prompt-lab-title">{merged.toolkit.aiLab.title}</h2></div>
            <p>{merged.toolkit.aiLab.intro}</p>
          </div>

          <div className="prompt-anatomy">
            <h3>{merged.toolkit.aiLab.anatomyTitle}</h3>
            <ol>
              {merged.toolkit.aiLab.anatomy.map((part, index) => (
                <li key={part.label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{part.label}</strong><p>{part.description}</p></div>
                </li>
              ))}
            </ol>
          </div>

          <div className="prompt-workbench">
            <div className="prompt-task-list" role="group" aria-label={merged.toolkit.aiLab.taskLabel}>
              <p>{merged.toolkit.aiLab.taskLabel}</p>
              {merged.toolkit.aiLab.prompts.map((prompt, index) => (
                <button
                  key={prompt.id}
                  type="button"
                  aria-pressed={activePrompt.id === prompt.id}
                  className={activePrompt.id === prompt.id ? "active" : ""}
                  onClick={() => setActivePromptId(prompt.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{prompt.title}</strong><small>{prompt.bestFor}</small></span>
                </button>
              ))}
            </div>

            <article
              className="prompt-preview"
              id="ai-prompt-panel"
              aria-live="polite"
            >
              <header><p className="detail-kicker">{merged.toolkit.aiLab.promptLabel}</p><h3>{activePrompt.title}</h3><p>{activePrompt.bestFor}</p></header>
              <pre><code>{activePrompt.prompt}</code></pre>
              <button className="button button-primary" onClick={() => copyText(`prompt-${activePrompt.id}`, activePrompt.prompt)}>
                {copiedItem === `prompt-${activePrompt.id}` ? merged.toolkit.copied : merged.toolkit.copy}
              </button>
            </article>
          </div>

          <aside className="prompt-guardrails">
            <div><p className="detail-kicker">{merged.toolkit.aiLab.guardrailLabel}</p><h3>{merged.toolkit.aiLab.guardrailTitle}</h3></div>
            <ul>{merged.toolkit.aiLab.guardrails.map((guardrail) => <li key={guardrail}><span aria-hidden="true">✓</span>{guardrail}</li>)}</ul>
          </aside>
        </section>

        <div className="appraisal-panel">
          <div className="toolkit-subheading"><p className="detail-kicker">{merged.toolkit.appraisalTitle}</p><h3>{merged.toolkit.appraisalIntro}</h3></div>
          <div className="appraisal-table-wrap">
            <table>
              <thead><tr>{merged.toolkit.tableHeadings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead>
              <tbody>{merged.toolkit.appraisalRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="tool-directory">
          <div className="section-heading split-heading tool-directory-heading">
            <div><h2>{merged.toolkit.toolDirectoryTitle}</h2></div>
            <div className="tool-directory-note">
              <p>{merged.toolkit.toolDirectoryIntro}</p>
              <a href="https://effortlessacademic.com/tools/" target="_blank" rel="noreferrer">{merged.toolkit.toolDirectorySourceLabel}<span aria-hidden="true">↗</span></a>
              <small>{merged.toolkit.toolDirectorySource}</small>
            </div>
          </div>
          <div className="tool-category-grid">
            {merged.toolkit.toolCategories.map((category) => (
              <article className="tool-category" key={category.id}>
                <header><h3>{category.title}</h3><p>{category.description}</p></header>
                <div className="tool-card-list">
                  {category.tools.map((tool) => (
                    <article className="tool-card" key={tool.name}>
                      <div className="tool-card-head"><h4>{tool.name}</h4><span className="tool-access">{tool.access}</span></div>
                      <p>{tool.bestFor}</p>
                      <small>{tool.watchFor}</small>
                      <div className="tool-links">
                        {tool.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{merged.toolkit.toolLinkLabel}: {link.label}<span aria-hidden="true">↗</span></a>)}
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="template-grid">
          {merged.toolkit.templates.map((template) => (
            <article key={template.id}>
              <p className="detail-kicker">{merged.toolkit.templateLabel}</p>
              <h3>{template.name}</h3>
              <p>{template.purpose}</p>
              <pre>{template.content}</pre>
              <button className="button button-primary" onClick={() => copyText(template.id, template.content)}>{copiedItem === template.id ? merged.toolkit.copied : merged.toolkit.copy}</button>
            </article>
          ))}
        </div>

        <div className="pitfall-panel" id="pitfalls">
          <div><p className="detail-kicker">{merged.toolkit.pitfallsTitle}</p></div>
          <ol>{merged.toolkit.pitfalls.map((pitfall, index) => <li key={pitfall[0]}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{pitfall[0]}</strong><p>{pitfall[1]}</p></div></li>)}</ol>
        </div>

        <div className="official-resources">
          <div><p className="detail-kicker">{merged.toolkit.referencesTitle}</p><p>{merged.toolkit.referencesNote}</p></div>
          <div>{merged.toolkit.references.map((reference) => <a key={reference.id} href={reference.href} target="_blank" rel="noreferrer">{reference.label}<span aria-hidden="true">↗</span></a>)}</div>
        </div>
      </section>

      <section className="supplementary-statistics-section" id="statistics">
        <StatTestChooser locale={locale} />
      </section>

      <section className="closing-section">
        <div><p className="section-index">{t.closing.index}</p><h2>{t.closing.title}</h2></div>
        <a className="button button-light" href="#pathway" onClick={() => setStep(1)}>{t.nav.action} <span aria-hidden="true">↑</span></a>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>LitWise</span></a>
        <p>{t.footer.tagline}</p>
        <p className="footer-note">{t.footer.note}</p>
      </footer>
      </main>
    </>
  );
}
