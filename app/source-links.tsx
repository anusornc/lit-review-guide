import type { Locale } from "./i18n";
import { researchSources, sourceUiText, type ResearchSourceId } from "./research-sources";

export function SourceLinks({
  locale,
  sourceIds,
  className = "",
}: {
  locale: Locale;
  sourceIds: readonly ResearchSourceId[];
  className?: string;
}) {
  const text = sourceUiText[locale];

  return (
    <aside className={`guidance-sources ${className}`.trim()} aria-label={text.label}>
      <strong>{text.label}</strong>
      <div>
        {sourceIds.map((sourceId) => {
          const source = researchSources[sourceId];
          return (
            <a key={sourceId} href={source.href} target="_blank" rel="noreferrer">
              <span>{source.title}</span><small>{source.owner}</small><b aria-hidden="true">↗</b>
            </a>
          );
        })}
      </div>
      <p>{text.note}</p>
    </aside>
  );
}
