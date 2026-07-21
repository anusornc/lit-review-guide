import assert from "node:assert/strict";
import test from "node:test";

import { mergedGuideContent, rankMethods } from "../app/guide-data.ts";

test("ranks a full quantitative health review without presenting a fake percentage", () => {
  const ranked = rankMethods({
    goal: "evaluate",
    discipline: "health",
    evidence: "experimental",
    commitment: "publication",
  });

  assert.deepEqual(ranked.slice(0, 3), ["systematic", "meta-analysis", "umbrella"]);
});

test("adapts the starting method to exploratory and time-bound conditions", () => {
  const exploratory = rankMethods({
    goal: "map",
    discipline: "technology",
    evidence: "uncertain",
    commitment: "thesis",
  });
  const urgent = rankMethods({
    goal: "evaluate",
    discipline: "law-policy",
    evidence: "mixed",
    commitment: "rapid",
  });

  assert.equal(exploratory[0], "scoping");
  assert.equal(urgent[0], "rapid");
});

test("keeps research intent as a hard guardrail when other signals conflict", () => {
  const shared = {
    discipline: "health",
    evidence: "experimental",
    commitment: "publication",
  };

  assert.equal(rankMethods({ ...shared, goal: "map" })[0], "scoping");
  assert.equal(rankMethods({ ...shared, goal: "understand" })[0], "qualitative");
  assert.equal(rankMethods({ ...shared, goal: "explain" })[0], "realist");
});

test("keeps the merged guide complete in English and Thai", () => {
  const promptIdsByLocale = [];

  for (const locale of ["en", "th"]) {
    const content = mergedGuideContent[locale];

    assert.equal(content.extraMethods.length, 5);
    assert.equal(Object.keys(content.methodDeepDives).length, 14);
    assert.equal(Object.keys(content.disciplineDeepDives).length, 9);
    assert.equal(content.workflow.phases.length, 6);
    assert.equal(content.toolkit.searchTips.length, 3);
    assert.equal(content.toolkit.aiLab.anatomy.length, 4);
    assert.equal(content.toolkit.aiLab.prompts.length, 5);
    assert.equal(content.toolkit.aiLab.guardrails.length, 4);
    assert.ok(content.toolkit.aiLab.prompts.every((prompt) => prompt.prompt.includes("[")));
    promptIdsByLocale.push(content.toolkit.aiLab.prompts.map((prompt) => prompt.id));
    assert.equal(content.toolkit.toolCategories.length, 4);
    assert.equal(content.toolkit.toolCategories.flatMap((category) => category.tools).length, 12);
    assert.ok(content.toolkit.toolCategories.every((category) => category.tools.every((tool) => tool.links.length >= 1)));
    assert.ok(content.toolkit.toolCategories.every((category) => category.tools.every((tool) => tool.links.every((link) => link.href.startsWith("https://")))));
    assert.equal(content.toolkit.templates.length, 4);
    assert.equal(content.toolkit.pitfalls.length, 6);
  }

  assert.deepEqual(promptIdsByLocale[0], promptIdsByLocale[1]);
});
