import assert from "node:assert/strict";
import test from "node:test";
import { formatCorrectionInstructions, parseCorrectionPrompt } from "../lib/ai/corrections.ts";

test("parses explicit deletion conservatively", () => {
  const correction = parseCorrectionPrompt("remove the scarf");

  assert.equal(correction.action, "remove");
  assert.equal(correction.target, "kit");
  assert.equal(correction.value, "scarf");
  assert.ok(correction.preserve.includes("face identity"));
});

test("parses numbered value revisions as exact replacements", () => {
  const correction = parseCorrectionPrompt("make the number 10 not 7");

  assert.equal(correction.action, "replace");
  assert.equal(correction.target, "number");
  assert.equal(correction.value, "7 -> 10");
  assert.ok(correction.confidence > 0.9);
});

test("parses implicit identity correction without restyling", () => {
  const correction = parseCorrectionPrompt("make it more like the original photo");

  assert.equal(correction.action, "refine");
  assert.equal(correction.target, "subject");
  assert.match(correction.value ?? "", /identity preservation/i);
  assert.ok(correction.preserve.includes("poster style"));
});

test("formats ambiguity warnings for risky broad corrections", () => {
  const correction = parseCorrectionPrompt("actually use the second photo");
  const formatted = formatCorrectionInstructions(correction);

  assert.equal(correction.target, "subject");
  assert.match(formatted, /Ambiguity warning:/);
});
