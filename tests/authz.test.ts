import { test } from "node:test";
import assert from "node:assert/strict";
import { isResourceOwner, decideOwnedResourceAccess } from "../lib/authz.ts";

const OWNER = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";

test("isResourceOwner: matching ids are owner", () => {
  assert.equal(isResourceOwner(OWNER, OWNER), true);
});

test("isResourceOwner: different ids are not owner", () => {
  assert.equal(isResourceOwner(OTHER, OWNER), false);
});

test("isResourceOwner: null/undefined owner is never owner", () => {
  assert.equal(isResourceOwner(null, OWNER), false);
  assert.equal(isResourceOwner(undefined, OWNER), false);
});

test("decideOwnedResourceAccess: owner is allowed once column exists", () => {
  assert.equal(
    decideOwnedResourceAccess({
      ownerColumnAvailable: true,
      resourceUserId: OWNER,
      requesterUserId: OWNER,
    }),
    "allow"
  );
});

test("decideOwnedResourceAccess: non-owner is denied once column exists", () => {
  assert.equal(
    decideOwnedResourceAccess({
      ownerColumnAvailable: true,
      resourceUserId: OWNER,
      requesterUserId: OTHER,
    }),
    "deny"
  );
});

test("decideOwnedResourceAccess: orphan row (null owner) is denied once column exists", () => {
  assert.equal(
    decideOwnedResourceAccess({
      ownerColumnAvailable: true,
      resourceUserId: null,
      requesterUserId: OWNER,
    }),
    "deny"
  );
});

test("decideOwnedResourceAccess: fails open while user_id column is missing", () => {
  // Pre-migration: no ownership data to enforce, so access is allowed to
  // avoid locking legitimate owners out of their own jobs.
  assert.equal(
    decideOwnedResourceAccess({
      ownerColumnAvailable: false,
      resourceUserId: null,
      requesterUserId: OTHER,
    }),
    "allow"
  );
});
