import test from "node:test";
import assert from "node:assert/strict";
import { choosePrimaryReferenceCapture, choosePrimaryReferenceType, chooseSupportingReferenceUrls } from "../lib/captureReferences.ts";

test("primary generation reference prefers smile over neutral front", () => {
  const captures = [
    { type: "neutral_front" as const, imageUrl: "https://example.com/neutral.jpg" },
    { type: "smiling_front" as const, imageUrl: "https://example.com/smile.jpg" },
    { type: "celebration" as const, imageUrl: "https://example.com/celebrate.jpg" },
  ];

  assert.equal(choosePrimaryReferenceCapture(captures)?.imageUrl, "https://example.com/smile.jpg");
  assert.equal(choosePrimaryReferenceType(captures), "smiling_front");
});

test("primary generation reference falls back through celebration, torso, then neutral", () => {
  assert.equal(
    choosePrimaryReferenceCapture([
      { type: "neutral_front" as const, imageUrl: "https://example.com/neutral.jpg" },
      { type: "celebration" as const, imageUrl: "https://example.com/celebrate.jpg" },
    ])?.type,
    "celebration"
  );

  assert.equal(
    choosePrimaryReferenceCapture([
      { type: "neutral_front" as const, imageUrl: "https://example.com/neutral.jpg" },
      { type: "torso" as const, imageUrl: "https://example.com/torso.jpg" },
    ])?.type,
    "torso"
  );

  assert.equal(
    choosePrimaryReferenceCapture([
      { type: "neutral_front" as const, imageUrl: "https://example.com/neutral.jpg" },
      { type: "left_45" as const, imageUrl: "https://example.com/left.jpg" },
    ])?.type,
    "neutral_front"
  );
});

test("supporting generation references exclude primary and keep priority order", () => {
  const captures = [
    { type: "neutral_front" as const, imageUrl: "https://example.com/neutral.jpg" },
    { type: "smiling_front" as const, imageUrl: "https://example.com/smile.jpg" },
    { type: "celebration" as const, imageUrl: "https://example.com/celebrate.jpg" },
    { type: "torso" as const, imageUrl: "https://example.com/torso.jpg" },
  ];

  assert.deepEqual(chooseSupportingReferenceUrls(captures, "https://example.com/smile.jpg"), [
    "https://example.com/celebrate.jpg",
    "https://example.com/torso.jpg",
  ]);
});
