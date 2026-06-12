import assert from "node:assert/strict";
import test from "node:test";
import { buildAppUrl, buildAuthenticatedAppUrl, buildLoginRedirectUrl, getAppUrl } from "../lib/appLinks.ts";

test("getAppUrl normalizes the configured app URL", () => {
  assert.equal(getAppUrl({ NEXT_PUBLIC_APP_URL: "https://app.kitface.app/" }), "https://app.kitface.app");
});

test("buildAppUrl makes relative paths absolute", () => {
  assert.equal(buildAppUrl("/result/job_123", "https://app.kitface.app"), "https://app.kitface.app/result/job_123");
  assert.equal(buildAppUrl("result/job_123", "https://app.kitface.app/"), "https://app.kitface.app/result/job_123");
});

test("buildLoginRedirectUrl preserves the destination in next", () => {
  assert.equal(
    buildLoginRedirectUrl("/result/job_123", "https://app.kitface.app"),
    "https://app.kitface.app/login?next=%2Fresult%2Fjob_123"
  );
});

test("buildAuthenticatedAppUrl sends relative in-app links through login", () => {
  assert.equal(
    buildAuthenticatedAppUrl("/result/job_123", "https://app.kitface.app"),
    "https://app.kitface.app/login?next=%2Fresult%2Fjob_123"
  );
});

test("buildAuthenticatedAppUrl leaves absolute external links alone", () => {
  assert.equal(
    buildAuthenticatedAppUrl("https://example.com/poster", "https://app.kitface.app"),
    "https://example.com/poster"
  );
});
