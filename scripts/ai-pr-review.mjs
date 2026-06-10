#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;
const failOn = (process.env.AI_REVIEW_FAIL_ON ?? "critical").toLowerCase();

if (!anthropicApiKey) {
  throw new Error("ANTHROPIC_API_KEY is required for the AI architecture review gate.");
}

if (!eventPath) {
  throw new Error("GITHUB_EVENT_PATH is required.");
}

const event = JSON.parse(await readFile(eventPath, "utf8"));
const pullRequest = event.pull_request;

if (!pullRequest) {
  console.log("No pull request payload found; skipping AI architecture review.");
  process.exit(0);
}

const diffUrl = pullRequest.diff_url;
const diffResponse = await fetch(diffUrl, {
  headers: githubToken ? { Authorization: `Bearer ${githubToken}` } : undefined
});

if (!diffResponse.ok) {
  throw new Error(`Failed to fetch PR diff: ${diffResponse.status} ${await diffResponse.text()}`);
}

const diff = await diffResponse.text();
const truncatedDiff = diff.length > 120_000 ? `${diff.slice(0, 120_000)}\n\n[Diff truncated for review budget.]` : diff;

const review = await runArchitectureReview(truncatedDiff);
await postReviewComment(pullRequest, review);

if (shouldFail(review.severity, failOn)) {
  throw new Error(`AI architecture review blocked merge with ${review.severity} severity: ${review.summary}`);
}

console.log(`AI architecture review completed with ${review.severity} severity.`);

async function runArchitectureReview(diffText) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": anthropicApiKey
    },
    body: JSON.stringify({
      model: process.env.AI_REVIEW_MODEL ?? "claude-sonnet-4-5-20250929",
      max_tokens: 1600,
      temperature: 0,
      system: [
        "You are the required architecture and production-safety reviewer for Kitface pull requests.",
        "Ignore formatting, naming style, minor syntax preferences, and linter-level feedback.",
        "Focus on business logic correctness, auth/session boundaries, SQL injection vectors, unhandled edge cases, race conditions, N+1 queries, payment/credit idempotency, provider webhook safety, data deletion, privacy, and deployment risk.",
        "Return only strict JSON with keys: severity, summary, findings, required_actions.",
        "severity must be one of: pass, warning, critical.",
        "Use critical only for issues that should block a production merge."
      ].join(" "),
      messages: [
        {
          role: "user",
          content: `Review this pull request diff for production risks:\n\n${diffText}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic review failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const text = payload.content?.find((part) => part.type === "text")?.text;

  if (!text) {
    throw new Error("Anthropic review returned no text content.");
  }

  try {
    const parsed = JSON.parse(text);
    return normalizeReview(parsed);
  } catch {
    throw new Error(`Anthropic review returned invalid JSON: ${text}`);
  }
}

async function postReviewComment(pullRequestPayload, review) {
  if (!githubToken || !repository) {
    console.log(formatReview(review));
    return;
  }

  const commentsUrl = `https://api.github.com/repos/${repository}/issues/${pullRequestPayload.number}/comments`;
  const response = await fetch(commentsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({ body: formatReview(review) })
  });

  if (!response.ok) {
    throw new Error(`Failed to post AI review comment: ${response.status} ${await response.text()}`);
  }
}

function normalizeReview(review) {
  const severity = ["pass", "warning", "critical"].includes(review.severity) ? review.severity : "warning";
  return {
    severity,
    summary: String(review.summary ?? "AI architecture review completed."),
    findings: Array.isArray(review.findings) ? review.findings.map(String) : [],
    required_actions: Array.isArray(review.required_actions) ? review.required_actions.map(String) : []
  };
}

function shouldFail(severity, threshold) {
  if (threshold === "warning") return severity === "warning" || severity === "critical";
  if (threshold === "critical") return severity === "critical";
  return false;
}

function formatReview(review) {
  const findings = review.findings.length ? review.findings.map((item) => `- ${item}`).join("\n") : "- None.";
  const actions = review.required_actions.length ? review.required_actions.map((item) => `- ${item}`).join("\n") : "- None.";

  return [
    "## AI Architecture Review",
    "",
    `Severity: **${review.severity}**`,
    "",
    review.summary,
    "",
    "### Findings",
    findings,
    "",
    "### Required Actions",
    actions
  ].join("\n");
}
