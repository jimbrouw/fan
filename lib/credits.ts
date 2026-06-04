// Single source of truth for the free tier and paid credit pack.

export const FREE_TIER_GENERATIONS = 3;

// Accounts that bypass the free-tier cap entirely (internal testing).
const EXEMPT_EMAILS = new Set(["jimbrouwer@gmail.com"]);

export function isExemptEmail(email: string | null | undefined): boolean {
  return EXEMPT_EMAILS.has((email ?? "").toLowerCase());
}

// The single credit pack offered at checkout. Amounts are in pence (GBP).
export const CREDIT_PACK = {
  credits: 10,
  unitAmount: 499,
  currency: "gbp" as const,
  name: "10 Kitface poster credits",
  description: "Create 10 more posters. Credits never expire.",
};
