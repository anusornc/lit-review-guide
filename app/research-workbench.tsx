"use client";

import { useEffect, useMemo, useState } from "react";
import type { MethodId } from "./guide-data";
import type { Locale } from "./i18n";
import { workflowSourceIds, workbenchSourceIds } from "./research-sources";
import { SourceLinks } from "./source-links";
import { StatTestChooser } from "./stat-test-chooser";
import {
  buildQuestionDraft,
  calculateChecklistProgress,
  calculatePrismaFlow,
  learningToolsContent,
  scoreScreeningDecisions,
  selectQuestionFramework,
  validatePrismaReasonCounts,
  type PrismaExclusionReason,
  type PrismaInputs,
  type QuestionPurposeId,
  type ScreeningDecision,
} from "./research-tools";

type ComparableMethod = {
  id: MethodId;
  name: string;
  family: string;
  bestFor: string;
  output: string;
  time: string;
};

type MethodDeepDive = {
  reporting: string;
};

type WorkflowPhase = {
  title: string;
  purpose: string;
  outputs: readonly string[];
  checkpoint: string;
};

type PrismaReasonRow = PrismaExclusionReason & { id: number };

const checklistStorageKey = "litwise-project-checklist-v1";

export function MethodComparison({
  locale,
  methods,
  methodDeepDives,
}: {
  locale: Locale;
  methods: readonly ComparableMethod[];
  methodDeepDives: Record<MethodId, MethodDeepDive>;
}) {
  const content = learningToolsContent[locale].comparison;
  const [selectedIds, setSelectedIds] = useState<MethodId[]>([]);
  const [limitVisible, setLimitVisible] = useState(false);
  const selectedMethods = selectedIds
    .map((id) => methods.find((method) => method.id === id))
    .filter((method): method is ComparableMethod => Boolean(method));

  const toggleMethod = (methodId: MethodId) => {
    setSelectedIds((current) => {
      if (current.includes(methodId)) {
        setLimitVisible(false);
        return current.filter((id) => id !== methodId);
      }
      if (current.length >= 3) {
        setLimitVisible(true);
        return current;
      }
      setLimitVisible(false);
      return [...current, methodId];
    });
  };

  const metaFor = (methodId: MethodId) => content.methodMeta.find((item) => item.id === methodId);

  return (
    <section className="method-comparison" aria-labelledby="method-comparison-title" data-testid="method-comparison">
      <div className="comparison-heading">
        <div><p className="detail-kicker">{content.index}</p><h3 id="method-comparison-title">{content.title}</h3></div>
        <p>{content.intro}</p>
      </div>
      <div className="comparison-picker" role="group" aria-label={content.selectionLabel}>
        <div className="comparison-picker-label">
          <strong>{content.selectionLabel}</strong>
          <span>{selectedIds.length}/3 {content.selectionCount}</span>
        </div>
        <div className="comparison-method-pills">
          {methods.map((method) => (
            <button
              key={method.id}
              type="button"
              aria-pressed={selectedIds.includes(method.id)}
              className={selectedIds.includes(method.id) ? "active" : ""}
              onClick={() => toggleMethod(method.id)}
            >
              <span aria-hidden="true">{selectedIds.includes(method.id) ? "✓" : "+"}</span>{method.name}
            </button>
          ))}
        </div>
        {limitVisible && <p className="comparison-limit" role="status">{content.maxMessage}</p>}
      </div>

      {selectedMethods.length < 2 ? (
        <p className="comparison-empty">{content.empty}</p>
      ) : (
        <div className="comparison-table-wrap">
          <table>
            <thead>
              <tr><th>{content.columns.attribute}</th>{selectedMethods.map((method) => <th key={method.id}>{method.name}</th>)}</tr>
            </thead>
            <tbody>
              <tr><th>{content.columns.time}</th>{selectedMethods.map((method) => <td key={method.id}>{method.time}</td>)}</tr>
              <tr><th>{content.columns.complexity}</th>{selectedMethods.map((method) => <td key={method.id}>{metaFor(method.id)?.complexity}</td>)}</tr>
              <tr><th>{content.columns.team}</th>{selectedMethods.map((method) => <td key={method.id}>{metaFor(method.id)?.team}</td>)}</tr>
              <tr><th>{content.columns.bestFor}</th>{selectedMethods.map((method) => <td key={method.id}>{method.bestFor}</td>)}</tr>
              <tr><th>{content.columns.output}</th>{selectedMethods.map((method) => <td key={method.id}>{method.output}</td>)}</tr>
              <tr><th>{content.columns.reporting}</th>{selectedMethods.map((method) => <td key={method.id}>{methodDeepDives[method.id]?.reporting}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function WorkflowDrillDown({
  locale,
  phases,
  outputLabel,
  checkpointLabel,
}: {
  locale: Locale;
  phases: readonly WorkflowPhase[];
  outputLabel: string;
  checkpointLabel: string;
}) {
  const content = learningToolsContent[locale].workflow;
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <ol className="workflow-grid workflow-learning-grid">
      {phases.map((phase, index) => {
        const detail = content.details[index];
        const isOpen = openIndex === index;
        const panelId = `workflow-detail-${detail.id}`;
        return (
          <li key={detail.id} className={isOpen ? "expanded" : ""}>
            <div className="workflow-card-summary">
              <div className="workflow-number">{String(index + 1).padStart(2, "0")}</div>
              <h3>{phase.title}</h3>
              <p>{phase.purpose}</p>
              <div className="workflow-outputs">
                <span>{outputLabel}</span>
                <ul>{phase.outputs.map((output) => <li key={output}>{output}</li>)}</ul>
              </div>
              <div className="workflow-checkpoint"><span>{checkpointLabel}</span><p>{phase.checkpoint}</p></div>
              <button
                className="workflow-detail-toggle"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex((current) => current === index ? -1 : index)}
              >
                {isOpen ? content.close : content.open}<span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
            </div>
            {isOpen && (
              <div className="workflow-detail-panel" id={panelId}>
                <div><span>{content.prepareLabel}</span><ul>{detail.prepare.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><span>{content.actionsLabel}</span><ol>{detail.actions.map((item) => <li key={item}>{item}</li>)}</ol></div>
                <div className="workflow-example"><span>{content.exampleLabel}</span><p>{detail.example}</p></div>
                <div><span>{content.pitfallsLabel}</span><ul>{detail.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><span>{content.toolsLabel}</span><ul>{detail.tools.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <SourceLinks locale={locale} sourceIds={workflowSourceIds[detail.id as keyof typeof workflowSourceIds]} className="workflow-guidance-sources" />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ResearchWorkbench({ locale }: { locale: Locale }) {
  const content = learningToolsContent[locale];
  const [checklistReady, setChecklistReady] = useState(false);
  const [completedChecklistIds, setCompletedChecklistIds] = useState<string[]>([]);
  const [questionPurpose, setQuestionPurpose] = useState<QuestionPurposeId>("effect");
  const [questionValues, setQuestionValues] = useState<Record<string, string>>({});
  const [screeningDecisions, setScreeningDecisions] = useState<Partial<Record<string, ScreeningDecision>>>({});
  const [prismaInputs, setPrismaInputs] = useState<PrismaInputs>({
    databases: 0,
    otherSources: 0,
    duplicatesRemoved: 0,
    automationRemoved: 0,
    otherRemoved: 0,
    recordsExcluded: 0,
    reportsNotRetrieved: 0,
    fullTextExcluded: 0,
  });
  const [fullTextReasons, setFullTextReasons] = useState<PrismaReasonRow[]>([
    { id: 1, reason: "", count: 0 },
  ]);
  const [copiedItem, setCopiedItem] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(checklistStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- rehydrate the client-only checklist after static rendering
        if (Array.isArray(parsed)) setCompletedChecklistIds(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      // A damaged local preference should not block the guide.
    }
    setChecklistReady(true);
  }, []);

  useEffect(() => {
    if (!checklistReady) return;
    window.localStorage.setItem(checklistStorageKey, JSON.stringify(completedChecklistIds));
  }, [checklistReady, completedChecklistIds]);

  useEffect(() => {
    if (!copiedItem) return;
    const timeout = window.setTimeout(() => setCopiedItem(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [copiedItem]);

  const copyText = async (id: string, value: string) => {
    await window.navigator.clipboard.writeText(value);
    setCopiedItem(id);
  };

  const checklistProgress = calculateChecklistProgress(completedChecklistIds.length, content.checklist.items.length);
  const frameworkId = selectQuestionFramework(questionPurpose);
  const framework = content.questionBuilder.frameworks.find((item) => item.id === frameworkId) ?? content.questionBuilder.frameworks[0];
  const questionDraft = buildQuestionDraft(frameworkId, questionValues, locale);
  const screeningExpected = useMemo(() => Object.fromEntries(
    content.screening.scenarios.map((scenario) => [scenario.id, scenario.expected]),
  ) as Record<string, ScreeningDecision>, [content.screening.scenarios]);
  const screeningScore = scoreScreeningDecisions(screeningDecisions, screeningExpected);
  const prismaFlow = calculatePrismaFlow(prismaInputs);
  const prismaReasonCounts = validatePrismaReasonCounts(prismaInputs.fullTextExcluded, fullTextReasons);
  const prismaIsValid = prismaFlow.valid && prismaReasonCounts.valid;
  const prismaReasonSummary = fullTextReasons
    .filter((item) => item.reason.trim() || item.count > 0)
    .map((item) => `${item.reason.trim()}: ${item.count}`);
  const prismaSummary = [
    `${content.prisma.stages.identified}: ${prismaFlow.identified}`,
    `${content.prisma.stages.removed}: ${prismaFlow.removedBeforeScreening}`,
    `${content.prisma.stages.screened}: ${prismaFlow.screened}`,
    `${content.prisma.stages.sought}: ${prismaFlow.reportsSought}`,
    `${content.prisma.stages.assessed}: ${prismaFlow.reportsAssessed}`,
    `${content.prisma.stages.included}: ${prismaFlow.studiesIncluded}`,
    ...prismaReasonSummary.map((item) => `${content.prisma.reasonsLabel}: ${item}`),
  ].filter(Boolean).join("\n");

  return (
    <section className="research-workbench-section" id="workbench" aria-labelledby="workbench-title">
      <div className="section-heading split-heading workbench-heading">
        <div><p className="section-index">{content.workbench.index}</p><h2 id="workbench-title">{content.workbench.title}</h2></div>
        <p>{content.workbench.intro}</p>
      </div>

      <div className="project-checklist-panel">
        <div className="project-checklist-summary">
          <div><p className="detail-kicker">{content.checklist.saved}</p><h3>{content.checklist.title}</h3><p>{content.checklist.intro}</p></div>
          <div className="project-progress" aria-label={`${checklistProgress.completed}/${checklistProgress.total} ${content.checklist.progress}`}>
            <strong>{checklistProgress.percent}%</strong>
            <span>{checklistProgress.completed}/{checklistProgress.total} {content.checklist.progress}</span>
          </div>
        </div>
        <div className="project-progress-bar" role="progressbar" aria-label={`${checklistProgress.completed}/${checklistProgress.total} ${content.checklist.progress}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={checklistProgress.percent}><span style={{ width: `${checklistProgress.percent}%` }} /></div>
        <div className="project-checklist-grid">
          {content.checklist.items.map((item) => (
            <label key={item.id} className={completedChecklistIds.includes(item.id) ? "complete" : ""}>
              <input
                type="checkbox"
                checked={completedChecklistIds.includes(item.id)}
                onChange={(event) => setCompletedChecklistIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
              />
              <span><small>{item.stage}</small><strong>{item.label}</strong></span>
            </label>
          ))}
        </div>
        <button className="text-button" type="button" onClick={() => setCompletedChecklistIds([])}>{content.checklist.reset}</button>
      </div>

      <div className="workbench-tool question-builder" data-testid="question-framework-builder">
        <header><p className="detail-kicker">01</p><h3>{content.questionBuilder.title}</h3><p>{content.questionBuilder.intro}</p></header>
        <div className="question-purpose-picker" role="group" aria-label={content.questionBuilder.purposeLabel}>
          <strong>{content.questionBuilder.purposeLabel}</strong>
          <div>{content.questionBuilder.purposes.map((purpose) => (
            <button
              key={purpose.id}
              type="button"
              aria-pressed={questionPurpose === purpose.id}
              className={questionPurpose === purpose.id ? "active" : ""}
              onClick={() => { setQuestionPurpose(purpose.id); setQuestionValues({}); }}
            >
              <strong>{purpose.label}</strong><small>{purpose.description}</small>
            </button>
          ))}</div>
        </div>
        <div className="question-builder-grid">
          <div className="framework-form">
            <p><span>{content.questionBuilder.frameworkLabel}</span><strong>{framework.name}</strong><small>{framework.description}</small></p>
            {framework.fields.map(([fieldId, label]) => (
              <label key={fieldId}>{label}<input value={questionValues[fieldId] ?? ""} onChange={(event) => setQuestionValues((current) => ({ ...current, [fieldId]: event.target.value }))} /></label>
            ))}
          </div>
          <div className="question-draft" aria-live="polite">
            <span>{content.questionBuilder.draftLabel}</span><blockquote>{questionDraft}</blockquote>
            <button className="button button-primary" type="button" onClick={() => copyText("question", questionDraft)}>{copiedItem === "question" ? content.questionBuilder.copied : content.questionBuilder.copy}</button>
          </div>
        </div>
        <SourceLinks locale={locale} sourceIds={workbenchSourceIds.questionBuilder} />
      </div>

      <div className="workbench-tool screening-lab" data-testid="screening-practice-lab">
        <header><p className="detail-kicker">02</p><h3>{content.screening.title}</h3><p>{content.screening.intro}</p></header>
        <aside><span>{content.screening.criteriaLabel}</span><p>{content.screening.criteria}</p></aside>
        <div className="screening-score"><strong>{screeningScore.correct}/{screeningScore.total}</strong><span>{content.screening.score}</span></div>
        <div className="screening-scenarios">
          {content.screening.scenarios.map((scenario, index) => {
            const selected = screeningDecisions[scenario.id];
            return (
              <article key={scenario.id} className={selected ? (selected === scenario.expected ? "correct" : "incorrect") : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span><h4>{scenario.title}</h4><p>{scenario.abstract}</p>
                <div role="group" aria-label={scenario.title}>{content.screening.options.map((option) => (
                  <button key={option.id} type="button" aria-pressed={selected === option.id} onClick={() => setScreeningDecisions((current) => ({ ...current, [scenario.id]: option.id }))}>{option.label}</button>
                ))}</div>
                {selected && <div className="screening-verdict" role="status"><strong>{selected === scenario.expected ? content.screening.correct : content.screening.review}</strong><small>{scenario.rationale}</small></div>}
              </article>
            );
          })}
        </div>
        <button className="text-button" type="button" onClick={() => setScreeningDecisions({})}>{content.screening.reset}</button>
        <SourceLinks locale={locale} sourceIds={workbenchSourceIds.screening} />
      </div>

      <div className="workbench-tool prisma-builder" data-testid="prisma-flow-builder">
        <header><p className="detail-kicker">03</p><h3>{content.prisma.title}</h3><p>{content.prisma.intro}</p></header>
        <div className="prisma-grid">
          <div className="prisma-inputs">
            <strong>{content.prisma.inputLabel}</strong>
            {content.prisma.inputs.map(([inputId, label]) => {
              const key = inputId as keyof PrismaInputs;
              return <label key={key}>{label}<input type="number" min="0" inputMode="numeric" value={prismaInputs[key]} onChange={(event) => setPrismaInputs((current) => ({ ...current, [key]: Number(event.target.value) || 0 }))} /></label>;
            })}
            <fieldset className="prisma-reasons">
              <legend>{content.prisma.reasonsLabel}</legend>
              {fullTextReasons.map((item) => (
                <div key={item.id} className="prisma-reason-row">
                  <label>{content.prisma.reasonName}<input value={item.reason} placeholder={content.prisma.reasonPlaceholder} onChange={(event) => setFullTextReasons((current) => current.map((row) => row.id === item.id ? { ...row, reason: event.target.value } : row))} /></label>
                  <label>{content.prisma.reasonCount}<input type="number" min="0" inputMode="numeric" value={item.count} onChange={(event) => setFullTextReasons((current) => current.map((row) => row.id === item.id ? { ...row, count: Number(event.target.value) || 0 } : row))} /></label>
                  {fullTextReasons.length > 1 && <button type="button" className="text-button" onClick={() => setFullTextReasons((current) => current.filter((row) => row.id !== item.id))}>{content.prisma.removeReason}</button>}
                </div>
              ))}
              <button type="button" className="text-button" onClick={() => setFullTextReasons((current) => [...current, { id: Math.max(...current.map((item) => item.id), 0) + 1, reason: "", count: 0 }])}>{content.prisma.addReason}</button>
              <p className="prisma-reason-total">{content.prisma.reasonTotal}: <strong>{prismaReasonCounts.total}/{prismaInputs.fullTextExcluded}</strong></p>
              {!prismaReasonCounts.valid && <p className="prisma-error" role="alert">{content.prisma.reasonMismatch}</p>}
            </fieldset>
          </div>
          <div className="prisma-flow" aria-live="polite">
            <strong>{content.prisma.flowLabel}</strong>
            {([
              [content.prisma.stages.identified, prismaFlow.identified],
              [content.prisma.stages.removed, prismaFlow.removedBeforeScreening],
              [content.prisma.stages.screened, prismaFlow.screened],
              [content.prisma.stages.sought, prismaFlow.reportsSought],
              [content.prisma.stages.assessed, prismaFlow.reportsAssessed],
              [content.prisma.stages.included, prismaFlow.studiesIncluded],
            ] as const).map(([label, value], index) => <div key={label}><span>{label}</span><b>{value}</b>{index < 5 && <i aria-hidden="true">↓</i>}</div>)}
            {!prismaFlow.valid && <p className="prisma-error" role="alert">{content.prisma.invalid}</p>}
            <button className="button button-primary" type="button" disabled={!prismaIsValid} onClick={() => copyText("prisma", prismaSummary)}>{copiedItem === "prisma" ? content.prisma.copied : content.prisma.copy}</button>
            <a href="https://www.prisma-statement.org/prisma-2020-flow-diagram" target="_blank" rel="noreferrer">{content.prisma.official}<span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <SourceLinks locale={locale} sourceIds={workbenchSourceIds.prisma} />
      </div>

      <StatTestChooser locale={locale} />
    </section>
  );
}
