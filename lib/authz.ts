// Centralized ownership-authorization decisions for owned resources
// (generation jobs, capture sessions, etc). Kept as pure functions so the
// security logic is unit-tested in one place and reused across routes.

export function isResourceOwner(
  resourceUserId: string | null | undefined,
  requesterUserId: string
): boolean {
  return Boolean(resourceUserId) && resourceUserId === requesterUserId;
}

export type AccessDecision = "allow" | "deny";

/**
 * Decide whether a requester may access a row that is owned via a `user_id`
 * column.
 *
 * `ownerColumnAvailable` lets callers fail open while the live database is
 * still behind the schema migration that adds `user_id`. In that state there
 * is no ownership data to enforce against, so blocking would break every
 * owner's access. Once the column exists, ownership is strictly enforced.
 */
export function decideOwnedResourceAccess(opts: {
  ownerColumnAvailable: boolean;
  resourceUserId: string | null | undefined;
  requesterUserId: string;
}): AccessDecision {
  if (!opts.ownerColumnAvailable) {
    return "allow";
  }
  return isResourceOwner(opts.resourceUserId, opts.requesterUserId) ? "allow" : "deny";
}
