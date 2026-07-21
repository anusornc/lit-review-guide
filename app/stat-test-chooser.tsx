"use client";

import { useState } from "react";
import type { Locale } from "./i18n";
import { SourceLinks } from "./source-links";
import {
  statChooserText,
  statDecisionTree,
  statRecommendations,
  statSoftware,
  type LocalizedText,
  type StatResultId,
  type StatSoftware,
  type StatTreeOption,
} from "./stat-test-data";

type TrailItem = {
  nodeId: string;
  label: LocalizedText;
};

export function StatTestChooser({ locale }: { locale: Locale }) {
  const content = statChooserText[locale];
  const [nodeId, setNodeId] = useState("root");
  const [resultId, setResultId] = useState<StatResultId | null>(null);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [software, setSoftware] = useState<StatSoftware>("R");
  const node = statDecisionTree[nodeId];
  const result = resultId ? statRecommendations[resultId] : null;

  const reset = () => {
    setNodeId("root");
    setResultId(null);
    setTrail([]);
  };

  const chooseOption = (option: StatTreeOption) => {
    setTrail((current) => [...current, { nodeId, label: { th: option.th, en: option.en } }]);
    if (option.result) {
      setResultId(option.result);
      return;
    }
    if (option.next) setNodeId(option.next);
  };

  const jumpToTrail = (index: number) => {
    const item = trail[index];
    setNodeId(item.nodeId);
    setResultId(null);
    setTrail((current) => current.slice(0, index));
  };

  const openRecommendation = (id: StatResultId) => {
    setResultId(id);
    setTrail([]);
  };

  return (
    <div className="workbench-tool stat-chooser" data-testid="stat-test-chooser">
      <header>
        <p className="detail-kicker">{content.index}</p>
        <h3>{content.title}</h3>
        <p>{content.intro}</p>
      </header>

      <aside className="stat-caution">
        <strong>{content.cautionTitle}</strong>
        <p>{content.caution}</p>
      </aside>

      <nav className="stat-trail" aria-label={locale === "th" ? "เส้นทางคำตอบ" : "Answer trail"}>
        <button type="button" onClick={reset}>{content.start}</button>
        {trail.map((item, index) => (
          <button key={`${item.nodeId}-${index}`} type="button" onClick={() => jumpToTrail(index)}>
            {item.label[locale]}
          </button>
        ))}
      </nav>

      <div className="stat-stage" aria-live="polite">
        {result ? (
          <article className="stat-result">
            <div className="stat-result-heading">
              <span>{String(result.id).padStart(2, "0")}</span>
              <div><h4>{result.name[locale]}</h4><p>{result.useCase[locale]}</p></div>
            </div>

            <div className="stat-result-grid">
              <section>
                <strong>{content.assumptions}</strong>
                <p>{result.assumptions[locale]}</p>
              </section>
              {result.caution && (
                <section className="stat-interpretation">
                  <strong>{content.note}</strong>
                  <p>{result.caution[locale]}</p>
                </section>
              )}
              {result.alternative && (
                <section className="stat-alternative">
                  <strong>{content.alternative}</strong>
                  <p><b>{result.alternative.name}</b> — {result.alternative.reason[locale]}</p>
                </section>
              )}
            </div>

            <section className="stat-command-panel">
              <strong>{content.commands}</strong>
              <div className="stat-software-tabs" role="group" aria-label={content.commands}>
                {statSoftware.map((item) => (
                  <button key={item} type="button" aria-pressed={software === item} onClick={() => setSoftware(item)}>{item}</button>
                ))}
              </div>
              <pre><code>{result.commands[software]}</code></pre>
              <p>{content.commandNote}</p>
            </section>

            <SourceLinks locale={locale} sourceIds={result.sourceIds} className="stat-guidance-sources" />
            <button className="button button-quiet stat-restart" type="button" onClick={reset}>{content.restart}</button>
          </article>
        ) : (
          <article className="stat-question-card">
            <span>{content.step} {trail.length + 1}</span>
            <h4>{node.question[locale]}</h4>
            <div className="stat-option-grid">
              {node.options.map((option) => (
                <button key={option.id} type="button" onClick={() => chooseOption(option)}>
                  <strong>{option[locale]}</strong>
                  {option.hint && <small>{option.hint[locale]}</small>}
                  <b aria-hidden="true">→</b>
                </button>
              ))}
            </div>
          </article>
        )}
      </div>

      {!result && <SourceLinks locale={locale} sourceIds={["ucla-stat-choice"]} className="stat-guidance-sources" />}

      <details className="stat-technique-list">
        <summary><span><strong>{content.all}</strong><small>{content.allIntro}</small></span><b aria-hidden="true">+</b></summary>
        <ol>
          {Object.values(statRecommendations).map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => openRecommendation(item.id)} aria-label={`${content.open}: ${item.name[locale]}`}>
                <span>{String(item.id).padStart(2, "0")}</span>
                <span><strong>{item.name[locale]}</strong><small>{item.useCase[locale]}</small></span>
                <b aria-hidden="true">→</b>
              </button>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

