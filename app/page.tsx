"use client";

import { useEffect, useMemo, useState } from "react";
import { thaiContent, uiText, type Locale } from "./i18n";

type GoalId = "map" | "evaluate" | "understand" | "explain";
type EvidenceId = "experimental" | "qualitative" | "mixed" | "theoretical" | "uncertain";

type Discipline = {
  id: string;
  name: string;
  marker: string;
  intro: string;
  questions: string;
  sources: string;
  methods: string[];
  caution: string;
};

type ReviewMethod = {
  id: string;
  name: string;
  family: string;
  summary: string;
  bestFor: string;
  avoidWhen: string;
  output: string;
  time: string;
  steps: string[];
  quality: string;
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

const methodForPath = (goal: GoalId | "", evidence: EvidenceId | "") => {
  if (evidence === "theoretical") return "integrative";
  if (goal === "map") return "scoping";
  if (goal === "understand") return "qualitative";
  if (goal === "explain") return "realist";
  if (goal === "evaluate" && evidence === "mixed") return "mixed";
  if (goal === "evaluate") return "systematic";
  return "scoping";
};

const englishContent = { goals, evidenceTypes, disciplines, methods };

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [localeReady, setLocaleReady] = useState(false);
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<GoalId | "">("");
  const [discipline, setDiscipline] = useState("");
  const [evidence, setEvidence] = useState<EvidenceId | "">("");
  const [activeDiscipline, setActiveDiscipline] = useState("health");
  const [activeMethod, setActiveMethod] = useState("scoping");
  const [methodFilter, setMethodFilter] = useState("All methods");
  const [copied, setCopied] = useState(false);

  const content = locale === "th" ? thaiContent : englishContent;
  const { goals, evidenceTypes, disciplines, methods } = content;
  const t = uiText[locale];

  const recommended = methods.find((method) => method.id === methodForPath(goal, evidence)) ?? methods[1];
  const chosenGoal = goals.find((item) => item.id === goal);
  const chosenDiscipline = disciplines.find((item) => item.id === discipline);
  const selectedDiscipline = disciplines.find((item) => item.id === activeDiscipline) ?? disciplines[0];
  const selectedMethod = methods.find((item) => item.id === activeMethod) ?? methods[1];
  const methodFamilies = [t.method.all, ...Array.from(new Set(methods.map((method) => method.family)))];
  const visibleMethods = methodFilter === t.method.all ? methods : methods.filter((method) => method.family === methodFilter);

  const pathwayText = useMemo(
    () =>
      `${t.pathway.copyLabels.title}\n${t.pathway.copyLabels.intent}: ${chosenGoal?.title ?? t.pathway.notSelected}\n${t.pathway.copyLabels.discipline}: ${chosenDiscipline?.name ?? t.pathway.notSelected}\n${t.pathway.copyLabels.evidence}: ${evidenceTypes.find((item) => item.id === evidence)?.title ?? t.pathway.notSelected}\n${t.pathway.copyLabels.method}: ${recommended.name}\n${t.pathway.copyLabels.why}: ${recommended.bestFor}`,
    [chosenDiscipline, chosenGoal, evidence, evidenceTypes, recommended, t],
  );

  useEffect(() => {
    const parameter = new URLSearchParams(window.location.search).get("lang");
    const stored = window.localStorage.getItem("litwise-language");
    const browserLanguage = window.navigator.language.toLowerCase().startsWith("th") ? "th" : "en";
    const nextLocale: Locale = parameter === "th" || parameter === "en" ? parameter : stored === "th" || stored === "en" ? stored : browserLanguage;
    setLocale(nextLocale);
    setLocaleReady(true);
  }, []);

  useEffect(() => {
    if (!localeReady) return;
    window.localStorage.setItem("litwise-language", locale);
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.history.replaceState({}, "", url);
    setMethodFilter(uiText[locale].method.all);
  }, [locale, localeReady]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyPathway = async () => {
    await navigator.clipboard.writeText(pathwayText);
    setCopied(true);
  };

  const canContinue = (step === 1 && goal) || (step === 2 && discipline) || (step === 3 && evidence);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="LitWise">
          <span className="brand-mark">L</span>
          <span>LitWise</span>
        </a>
        <nav aria-label={locale === "th" ? "เมนูหลัก" : "Main navigation"}>
          <a href="#pathway">{t.nav.start}</a>
          <a href="#disciplines">{t.nav.disciplines}</a>
          <a href="#methods">{t.nav.methods}</a>
          <a href="#field-notes">{t.nav.notes}</a>
        </nav>
        <div className="header-tools">
          <div className="language-switch" role="group" aria-label={t.languageLabel}>
            <button onClick={() => setLocale("en")} aria-pressed={locale === "en"}>EN</button>
            <span aria-hidden="true">/</span>
            <button onClick={() => setLocale("th")} aria-pressed={locale === "th"}>ไทย</button>
          </div>
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
            <div><dt>09</dt><dd>{t.hero.stats[0]}</dd></div>
            <div><dt>08</dt><dd>{t.hero.stats[1]}</dd></div>
            <div><dt>04</dt><dd>{t.hero.stats[2]}</dd></div>
          </dl>
        </div>

        <aside className="hero-compass" aria-label={t.compass.aria}>
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <div className="compass-heading">
            <span className="compass-kicker">{t.compass.title}</span>
            <span className="compass-code">LW · 01</span>
          </div>
          <ol>{t.compass.steps.map((item, index) => <li key={item[0]}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item[0]}</strong><small>{item[1]}</small></div></li>)}</ol>
          <p className="compass-note">{t.compass.note}</p>
        </aside>
      </section>

      <section className="pathway-section" id="pathway">
        <div className="section-heading split-heading">
          <div><p className="section-index">{t.pathway.index}</p><h2>{t.pathway.title}</h2></div>
          <p>{t.pathway.intro}</p>
        </div>

        <div className="pathway-shell">
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
              <div className="result-panel">
                <div className="result-label"><span>{t.pathway.recommended}</span><span>{t.pathway.complete}</span></div>
                <h3>{recommended.name}</h3>
                <p className="result-summary">{recommended.summary}</p>
                <div className="result-reason">
                  <span>{t.pathway.why}</span>
                  <p>{t.pathway.reason(chosenGoal?.title ?? "", chosenDiscipline?.name ?? "", evidenceTypes.find((item) => item.id === evidence)?.title ?? "", recommended.bestFor)}</p>
                </div>
                <div className="result-grid">
                  <div><span>{t.pathway.likelyOutput}</span><p>{recommended.output}</p></div>
                  <div><span>{t.pathway.watchFor}</span><p>{recommended.avoidWhen}</p></div>
                </div>
                <div className="result-actions">
                  <button className="button button-light" onClick={() => { setActiveMethod(recommended.id); document.getElementById("methods")?.scrollIntoView({ behavior: "smooth" }); }}>{t.pathway.study} <span aria-hidden="true">↓</span></button>
                  <button className="button button-quiet" onClick={copyPathway}>{copied ? t.pathway.copied : t.pathway.copy}</button>
                </div>
              </div>
            )}

            <div className="pathway-controls">
              <button className="back-button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>{t.pathway.back}</button>
              {step < 4 && <button className="button button-primary" disabled={!canContinue} onClick={() => setStep((value) => Math.min(4, value + 1))}>{t.pathway.continue} <span aria-hidden="true">→</span></button>}
              {step === 4 && <button className="back-button" onClick={() => { setStep(1); setGoal(""); setDiscipline(""); setEvidence(""); }}>{t.pathway.restart}</button>}
            </div>
          </div>
        </div>
      </section>

      <section className="disciplines-section" id="disciplines">
        <div className="section-heading split-heading">
          <div><p className="section-index">{t.discipline.index}</p><h2>{t.discipline.title}</h2></div>
          <p>{t.discipline.intro}</p>
        </div>

        <div className="discipline-atlas">
          <div className="discipline-list" role="list" aria-label={t.discipline.listAria}>
            {disciplines.map((item, index) => (
              <button key={item.id} onClick={() => setActiveDiscipline(item.id)} className={activeDiscipline === item.id ? "active" : ""} aria-pressed={activeDiscipline === item.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.name}</strong>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <article className="discipline-detail">
            <div className="discipline-monogram" aria-hidden="true">{selectedDiscipline.marker}</div>
            <p className="detail-kicker">{t.discipline.guide} · {selectedDiscipline.name}</p>
            <h3>{selectedDiscipline.intro}</h3>
            <dl>
              <div><dt>{t.discipline.questions}</dt><dd>{selectedDiscipline.questions}</dd></div>
              <div><dt>{t.discipline.sources}</dt><dd>{selectedDiscipline.sources}</dd></div>
              <div><dt>{t.discipline.methods}</dt><dd>{selectedDiscipline.methods.join(" · ")}</dd></div>
            </dl>
            <div className="field-caution"><span>{t.discipline.caution}</span><p>{selectedDiscipline.caution}</p></div>
          </article>
        </div>
      </section>

      <section className="methods-section" id="methods">
        <div className="section-heading methods-heading">
          <div><p className="section-index">{t.method.index}</p><h2>{t.method.title}</h2></div>
          <div className="method-filter" aria-label={t.method.filterAria}>
            <label htmlFor="method-family">{t.method.purpose}</label>
            <select id="method-family" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
              {methodFamilies.map((family) => <option key={family}>{family}</option>)}
            </select>
          </div>
        </div>

        <div className="method-browser">
          <div className="method-list" role="list" aria-label={t.method.listAria}>
            {visibleMethods.map((method, index) => (
              <button key={method.id} className={activeMethod === method.id ? "active" : ""} onClick={() => setActiveMethod(method.id)} aria-pressed={activeMethod === method.id}>
                <span className="method-number">{String(index + 1).padStart(2, "0")}</span>
                <span><small>{method.family}</small><strong>{method.name}</strong><em>{method.summary}</em></span>
                <span className="method-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>

          <article className="method-detail">
            <p className="detail-kicker">{t.method.detail} · {selectedMethod.family}</p>
            <h3>{selectedMethod.name}</h3>
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
            <p className="quality-note"><strong>{t.method.quality}</strong> {selectedMethod.quality}</p>
          </article>
        </div>
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

      <section className="closing-section">
        <div><p className="section-index">{t.closing.index}</p><h2>{t.closing.title}</h2></div>
        <a className="button button-light" href="#pathway" onClick={() => setStep(1)}>{t.nav.action} <span aria-hidden="true">↑</span></a>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">L</span><span>LitWise</span></a>
        <p>{t.footer.tagline}</p>
        <p className="footer-note">{t.footer.note}</p>
      </footer>
    </main>
  );
}
