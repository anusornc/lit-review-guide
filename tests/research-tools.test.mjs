import assert from "node:assert/strict";
import test from "node:test";

import {
  buildQuestionDraft,
  calculateChecklistProgress,
  calculatePrismaFlow,
  learningToolsContent,
  scoreScreeningDecisions,
  selectQuestionFramework,
  validatePrismaReasonCounts,
} from "../app/research-tools.ts";

test("matches a research purpose to a defensible question framework", () => {
  assert.equal(selectQuestionFramework("effect"), "pico");
  assert.equal(selectQuestionFramework("experience"), "peo");
  assert.equal(selectQuestionFramework("qualitative"), "spider");
  assert.equal(selectQuestionFramework("policy"), "spice");
  assert.equal(selectQuestionFramework("map"), "pcc");
});

test("builds a copy-ready question without inventing missing fields", () => {
  assert.equal(
    buildQuestionDraft("pico", {
      population: "undergraduate students",
      intervention: "AI tutoring",
      comparison: "usual instruction",
      outcome: "learning achievement",
    }, "en"),
    "Among undergraduate students, how does AI tutoring, compared with usual instruction, affect learning achievement?",
  );

  assert.equal(
    buildQuestionDraft("pcc", { population: "นักศึกษามหาวิทยาลัย", concept: "การรู้เท่าทัน AI", context: "ประเทศไทย" }, "th"),
    "มีหลักฐานประเภทใดเกี่ยวกับการรู้เท่าทัน AI ในกลุ่มนักศึกษามหาวิทยาลัย ภายใต้บริบทประเทศไทย?",
  );
});

test("derives a consistent simplified PRISMA flow and flags impossible counts", () => {
  assert.deepEqual(calculatePrismaFlow({
    databases: 100,
    otherSources: 20,
    duplicatesRemoved: 10,
    automationRemoved: 5,
    otherRemoved: 5,
    recordsExcluded: 40,
    reportsNotRetrieved: 5,
    fullTextExcluded: 15,
  }), {
    identified: 120,
    removedBeforeScreening: 20,
    screened: 100,
    reportsSought: 60,
    reportsAssessed: 55,
    studiesIncluded: 40,
    valid: true,
  });

  assert.equal(calculatePrismaFlow({
    databases: 4,
    otherSources: 0,
    duplicatesRemoved: 5,
    automationRemoved: 0,
    otherRemoved: 0,
    recordsExcluded: 0,
    reportsNotRetrieved: 0,
    fullTextExcluded: 0,
  }).valid, false);
});

test("requires traceable full-text reasons to reconcile with the PRISMA exclusion total", () => {
  assert.deepEqual(validatePrismaReasonCounts(15, [
    { reason: "Wrong population", count: 8 },
    { reason: "No empirical outcome", count: 4 },
    { reason: "Duplicate report", count: 3 },
  ]), { total: 15, valid: true });

  assert.deepEqual(validatePrismaReasonCounts(15, [
    { reason: "Wrong population", count: 8 },
    { reason: "No empirical outcome", count: 4 },
  ]), { total: 12, valid: false });

  assert.deepEqual(validatePrismaReasonCounts(0, [
    { reason: "", count: 0 },
  ]), { total: 0, valid: true });

  assert.equal(validatePrismaReasonCounts(4, [
    { reason: "", count: 4 },
  ]).valid, false);
});

test("reports checklist and screening progress through stable public values", () => {
  assert.deepEqual(calculateChecklistProgress(3, 12), { completed: 3, total: 12, percent: 25 });
  assert.deepEqual(scoreScreeningDecisions(
    { empirical: "include", editorial: "exclude", unclear: "full-text" },
    { empirical: "include", editorial: "exclude", unclear: "full-text", conflict: "discuss" },
  ), { answered: 3, correct: 3, total: 4 });
});

test("keeps every learning tool complete in English and Thai", () => {
  for (const locale of ["en", "th"]) {
    const content = learningToolsContent[locale];
    assert.equal(content.comparison.methodMeta.length, 14);
    assert.equal(content.workflow.details.length, 6);
    assert.equal(content.checklist.items.length, 12);
    assert.equal(content.questionBuilder.frameworks.length, 5);
    assert.equal(content.screening.scenarios.length, 6);
    assert.equal(content.prisma.inputs.length, 8);
  }
});

test("uses consistent, natural Thai labels in the learning tools", () => {
  const content = learningToolsContent.th;
  const thaiText = JSON.stringify(content);

  assert.equal(content.questionBuilder.frameworkLabel, "กรอบคำถามที่แนะนำ");
  assert.equal(content.screening.title, "แบบฝึกหัดคัดกรองบทความ");
  assert.equal(content.screening.options[0].label, "คัดเข้า");
  assert.equal(content.screening.options[1].label, "คัดออก");
  assert.equal(content.prisma.flowLabel, "ผลการคำนวณ");
  assert.equal(content.prisma.stages.included, "งานวิจัยที่คัดเข้า");
  assert.doesNotMatch(thaiText, /รับเข้า|กรอบตั้งต้น|เส้นทางที่คำนวณได้|รายงานที่พยายามขอ|ขอฉบับเต็มไม่ได้|ระบบอัตโนมัตินำออก/);
});
