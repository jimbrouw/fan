import assert from "node:assert/strict";
import test from "node:test";
import { buildHealthResponse, getRequiredEnvironmentChecks, isHealthTokenAuthorized } from "../lib/health.ts";

test("buildHealthResponse marks all-ok checks healthy", () => {
  const response = buildHealthResponse({
    now: new Date("2026-06-09T12:00:00.000Z"),
    env: {
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: "abc123",
      VERCEL_REGION: "iad1"
    },
    checks: [{ name: "app", status: "ok" }]
  });

  assert.equal(response.status, "ok");
  assert.equal(response.timestamp, "2026-06-09T12:00:00.000Z");
  assert.deepEqual(response.deployment, {
    environment: "preview",
    gitSha: "abc123",
    region: "iad1"
  });
});

test("buildHealthResponse marks degraded checks unhealthy", () => {
  const response = buildHealthResponse({
    checks: [
      { name: "app", status: "ok" },
      { name: "supabase", status: "degraded", message: "timeout" }
    ]
  });

  assert.equal(response.status, "degraded");
});

test("isHealthTokenAuthorized requires both configured secret and matching token", () => {
  assert.equal(isHealthTokenAuthorized("secret", "secret"), true);
  assert.equal(isHealthTokenAuthorized("secret", "wrong"), false);
  assert.equal(isHealthTokenAuthorized(undefined, "secret"), false);
  assert.equal(isHealthTokenAuthorized("secret", null), false);
});

test("getRequiredEnvironmentChecks reports missing production variables", () => {
  const checks = getRequiredEnvironmentChecks({
    NEXT_PUBLIC_APP_URL: "https://kitface-app.vercel.app",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co"
  });

  assert.equal(checks.find((check) => check.name === "env:NEXT_PUBLIC_APP_URL")?.status, "ok");
  assert.equal(checks.find((check) => check.name === "env:MUAPI_API_KEY")?.status, "degraded");
});
