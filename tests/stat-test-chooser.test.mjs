import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveStatChoice,
  statDecisionTree,
  statRecommendations,
  statSoftware,
} from "../app/stat-test-data.ts";

test("keeps every decision-tree target valid and all 14 recommendations reachable", () => {
  const reachable = new Set();
  const visited = new Set();
  const queue = ["root"];

  while (queue.length) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    const node = statDecisionTree[nodeId];
    assert.ok(node, `missing decision node: ${nodeId}`);

    for (const option of node.options) {
      assert.ok(option.next || option.result, `${nodeId}/${option.id} has no target`);
      assert.ok(!(option.next && option.result), `${nodeId}/${option.id} has two targets`);
      if (option.next) {
        assert.ok(statDecisionTree[option.next], `missing next node: ${option.next}`);
        queue.push(option.next);
      }
      if (option.result) {
        assert.ok(statRecommendations[option.result], `missing result: ${option.result}`);
        reachable.add(option.result);
      }
    }
  }

  assert.equal(reachable.size, 14);
  assert.deepEqual([...reachable].sort((a, b) => a - b), Array.from({ length: 14 }, (_, index) => index + 1));
});

test("provides bilingual guidance, software help, and sources for every recommendation", () => {
  assert.equal(Object.keys(statRecommendations).length, 14);
  for (const recommendation of Object.values(statRecommendations)) {
    assert.ok(recommendation.name.en && recommendation.name.th);
    assert.ok(recommendation.useCase.en && recommendation.useCase.th);
    assert.ok(recommendation.assumptions.en && recommendation.assumptions.th);
    assert.deepEqual(Object.keys(recommendation.commands), statSoftware);
    assert.ok(recommendation.sourceIds.length >= 2);
  }
});

test("routes representative answers to the intended test", () => {
  assert.deepEqual(resolveStatChoice("root", "compare"), { next: "cmp" });
  assert.deepEqual(resolveStatChoice("cmp", "two"), { next: "g2" });
  assert.deepEqual(resolveStatChoice("g2", "independent"), { next: "g2i" });
  assert.deepEqual(resolveStatChoice("g2i", "continuous"), { result: 2 });
  assert.deepEqual(resolveStatChoice("pred", "binary"), { result: 14 });
  assert.equal(resolveStatChoice("root", "missing"), undefined);
});

test("keeps corrected software and interpretation guardrails", () => {
  assert.match(statRecommendations[2].commands.Python, /equal_var=False/);
  assert.match(statRecommendations[1].commands.Excel, /ไม่มีคำสั่ง one-sample t-test โดยตรง/);
  assert.match(statRecommendations[7].commands.Excel, /ไม่มี repeated-measures ANOVA โดยตรง/);
  assert.match(statRecommendations[11].assumptions.en, /monotonic/);
  assert.match(statRecommendations[2].alternative.reason.en, /median interpretation requires additional/);
});

