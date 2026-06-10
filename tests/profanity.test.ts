import assert from "node:assert/strict";
import test from "node:test";
import {
  findBlockedPersonalisationTerm,
  getPersonalisationSafetyError,
  validatePosterPersonalisation
} from "../lib/safety/profanity.ts";

test("personalisation filter allows normal football wording", () => {
  assert.equal(getPersonalisationSafetyError("JONES"), null);
  assert.equal(getPersonalisationSafetyError("Come on you reds"), null);
});

test("personalisation filter blocks exact unsafe terms", () => {
  assert.equal(Boolean(findBlockedPersonalisationTerm("badword")), true);
  assert.equal(validatePosterPersonalisation({ shirtName: "badword" })?.field, "shirtName");
});

test("personalisation filter blocks simple spacing and symbol obfuscation", () => {
  assert.equal(Boolean(findBlockedPersonalisationTerm("b a d w o r d")), true);
  assert.equal(Boolean(findBlockedPersonalisationTerm("b-a-d-w-o-r-d")), true);
});

test("personalisation filter blocks leetspeak obfuscation", () => {
  assert.equal(Boolean(findBlockedPersonalisationTerm("b@dw0rd")), true);
});

test("personalisation filter reports slogan errors", () => {
  const result = validatePosterPersonalisation({ teamSlogan: "badword army" });

  assert.equal(result?.field, "teamSlogan");
  assert.equal(result?.message, "That wording can't be used on a Kitface poster.");
});

test("personalisation filter reports errors for extended fields", () => {
  assert.equal(validatePosterPersonalisation({ teamName: "badword fc" })?.field, "teamName");
  assert.equal(validatePosterPersonalisation({ kitNotes: "add a badword logo" })?.field, "kitNotes");
  assert.equal(validatePosterPersonalisation({ matchdayNotes: "vs badword" })?.field, "matchdayNotes");
  assert.equal(validatePosterPersonalisation({ correctionPrompt: "make it badword" })?.field, "correctionPrompt");
});

