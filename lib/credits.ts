// Single source of truth for the free tier and paid credit pack.

export const FREE_TIER_GENERATIONS = 1;

// Accounts that bypass the free-tier cap entirely (internal testing).
const EXEMPT_EMAILS = new Set(["jimbrouwer@gmail.com"]);

export function isExemptEmail(email: string | null | undefined): boolean {
  return EXEMPT_EMAILS.has((email ?? "").toLowerCase());
}

export function isValidMarketingKey(headerValue: string | null): boolean {
  const expected = process.env.MARKETING_SERVICE_KEY;
  if (!expected || !headerValue) return false;
  return headerValue === expected;
}

// The single credit pack offered at checkout. Amounts are in pence (GBP).
export const CREDIT_PACK = {
  credits: 3,
  unitAmount: 499,
  currency: "gbp" as const,
  name: "3 more Kitface posters",
  description: "Create 3 more premium posters. Credits never expire.",
};
