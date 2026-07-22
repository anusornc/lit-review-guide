import assert from "node:assert/strict";
import test from "node:test";

import { mergedGuideContent, rankMethods } from "../app/guide-data.ts";
import { thaiContent } from "../app/i18n.ts";
import { resolveLocalePreference, resolveThemePreference } from "../app/preferences.ts";

test("resolves static-host locale preferences in a predictable order", () => {
  assert.equal(resolveLocalePreference("th", "en", "en-US"), "th");
  assert.equal(resolveLocalePreference(undefined, "th", "en-US"), "th");
  assert.equal(resolveLocalePreference(undefined, undefined, "th-TH"), "th");
  assert.equal(resolveLocalePreference("invalid", "invalid", "en-GB"), "en");
  assert.equal(resolveThemePreference("dark", false), "dark");
  assert.equal(resolveThemePreference(undefined, true), "dark");
});

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
    assert.equal(content.toolkit.aiLab.prompts.length, 14);
    assert.equal(content.toolkit.aiLab.guardrails.length, 4);
    assert.ok(content.toolkit.aiLab.prompts.every((prompt) => prompt.prompt.includes("[")));
    promptIdsByLocale.push(content.toolkit.aiLab.prompts.map((prompt) => prompt.id));
    const toolNames = content.toolkit.toolCategories.flatMap((category) => category.tools.map((tool) => tool.name));
    assert.equal(content.toolkit.toolCategories.length, 6);
    assert.equal(toolNames.length, 30);
    assert.equal(new Set(toolNames).size, 30);
    assert.match(content.toolkit.toolDirectorySource, /Effortless Academic/);
    for (const addedTool of ["Bibliome", "Liner", "Keenious", "Iris.ai", "Elicit", "Consensus", "SciSpace", "Sourcely", "Litmaps", "Scite", "Anara", "Nested Knowledge", "Paperpal", "Jenni AI", "WriteWise", "Yomu AI", "SciDraw"]) {
      assert.ok(toolNames.includes(addedTool));
    }
    assert.ok(toolNames.some((name) => name.startsWith("Livewrite")));
    assert.ok(content.toolkit.toolCategories.every((category) => category.tools.every((tool) => tool.links.length >= 1)));
    assert.ok(content.toolkit.toolCategories.every((category) => category.tools.every((tool) => tool.links.every((link) => link.href.startsWith("https://")))));
    assert.equal(content.toolkit.templates.length, 4);
    assert.equal(content.toolkit.pitfalls.length, 6);
  }

  assert.deepEqual(promptIdsByLocale[0], promptIdsByLocale[1]);
  assert.deepEqual(promptIdsByLocale[0].slice(-9), [
    "paper-summary",
    "literature-review",
    "evidence-synthesis",
    "research-comparison",
    "methodology-evaluation",
    "research-gap-analysis",
    "theoretical-framework",
    "critical-appraisal",
    "citation-network",
  ]);
  assert.equal(new Set(promptIdsByLocale[0]).size, 14);
  assert.match(mergedGuideContent.th.toolkit.aiLab.prompts.find((prompt) => prompt.id === "paper-summary")?.prompt ?? "", /ห้ามเติมข้อมูลที่บทความไม่ได้รายงาน/);
  assert.match(mergedGuideContent.th.toolkit.aiLab.prompts.find((prompt) => prompt.id === "citation-network")?.prompt ?? "", /เครือข่ายการอ้างอิง/);
  assert.match(mergedGuideContent.en.toolkit.aiLab.prompts.find((prompt) => prompt.id === "paper-summary")?.prompt ?? "", /Label your recommendations as interpretation/);
  assert.match(mergedGuideContent.th.toolkit.aiLab.prompts.find((prompt) => prompt.id === "paper-summary")?.prompt ?? "", /ระบุให้ชัดว่าส่วนหลังเป็นการตีความ/);
  assert.match(mergedGuideContent.en.toolkit.aiLab.prompts.find((prompt) => prompt.id === "citation-network")?.prompt ?? "", /influence on the current papers/);
  assert.match(mergedGuideContent.th.toolkit.aiLab.prompts.find((prompt) => prompt.id === "citation-network")?.prompt ?? "", /อิทธิพลต่อบทความปัจจุบัน/);
  assert.match(mergedGuideContent.en.toolkit.aiLab.prompts.find((prompt) => prompt.id === "citation-network")?.prompt ?? "", /cannot determine without citation context/);
  assert.match(mergedGuideContent.th.toolkit.aiLab.prompts.find((prompt) => prompt.id === "citation-network")?.prompt ?? "", /ยังระบุไม่ได้หากไม่มีข้อความรอบจุดอ้างอิง/);
  assert.doesNotMatch(mergedGuideContent.th.toolkit.aiLab.prompts.map((prompt) => prompt.prompt).join("\n"), /ตำแหน่งต้นทาง|ข้อวินิจฉัย|ระดับความมั่นใจ/);
  assert.equal(mergedGuideContent.th.toolkit.toolDirectoryTitle, "คลังเครื่องมือสำหรับทำงานวิจัย");
});

test("provides an English name for all 14 Thai review methods", () => {
  const thaiMethods = [...thaiContent.methods, ...mergedGuideContent.th.extraMethods];

  assert.equal(thaiMethods.length, 14);
  assert.ok(thaiMethods.every((method) => method.englishName.length > 0));
  assert.deepEqual(thaiMethods.map((method) => method.englishName), [
    "Systematic review",
    "Scoping review",
    "Meta-analysis",
    "Qualitative evidence synthesis",
    "Realist review",
    "Integrative review",
    "Mixed-methods review",
    "Bibliometric review",
    "Critical or narrative review",
    "Umbrella review",
    "Rapid review",
    "Systematic search and review",
    "Meta-ethnography",
    "Thematic synthesis",
  ]);
});

test("provides concise field examples for all 14 review methods", () => {
  const thaiMethods = [...thaiContent.methods, ...mergedGuideContent.th.extraMethods];

  assert.equal(thaiMethods.length, 14);
  assert.ok(thaiMethods.every((method) => method.fieldExamples.length === 3));
  assert.ok(thaiMethods.every((method) => new Set(method.fieldExamples).size === method.fieldExamples.length));
  assert.ok(thaiMethods.every((method) => method.fieldExamples.every((field) => field.trim().length > 0)));
});
