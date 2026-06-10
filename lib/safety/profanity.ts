const BLOCKED_PERSONALISATION_MESSAGE = "That wording can't be used on a Kitface poster.";

// NSFW SAFETY LIST.
// Terms are base64-encoded so people do not have to read slurs/abuse terms during normal review.
// Decode only when maintaining the safety filter.
const encodedBlockedTerms = [
  "YmFkd29yZA==",
  "ZnVjaw==",
  "ZnVja2Vy",
  "ZnVja2luZw==",
  "bW90aGVyZnVja2Vy",
  "Y3VudA==",
  "Yml0Y2g=",
  "c2x1dA==",
  "d2hvcmU=",
  "dHdhdA==",
  "d2Fua2Vy",
  "ZGljaw==",
  "Y29jaw==",
  "cHVzc3k=",
  "cG9ybg==",
  "cG9ybm8=",
  "c2V4",
  "cmFwZQ==",
  "cmFwaXN0",
  "cGFlZG8=",
  "cGVkbw==",
  "cGFlZG9waGlsZQ==",
  "cGVkb3BoaWxl",
  "aW5jZXN0",
  "bm9uY2U=",
  "bmlnZ2Vy",
  "bmlnZ2E=",
  "Y2hpbms=",
  "cGFraQ==",
  "a2lrZQ==",
  "c3BpYw==",
  "Y29vbg==",
  "Z29vaw==",
  "cmFnaGVhZA==",
  "dG93ZWxoZWFk",
  "ZmFnZ290",
  "ZmFn",
  "dHJhbm55",
  "cmV0YXJk",
  "bW9uZw==",
  "Y3JpcHBsZQ==",
  "ZHlrZQ==",
  "aGVpbCBoaXRsZXI=",
  "aGl0bGVy",
  "bmF6aQ==",
  "a2tr",
  "d2hpdGUgcG93ZXI=",
  "a2lsbCB5b3Vyc2VsZg==",
  "a3lz",
  "ZGll",
  "bXVyZGVy",
  "dGVycm9yaXN0",
  "aXNpcw==",
  "amloYWQ=",
  "Ym9tYg==",
  "c3RhYg==",
  "c2hvb3Q=",
  "aGlsbHNib3JvdWdo",
  "bXVuaWNoIGFpciBkaXNhc3Rlcg==",
  "bXVuaWNoIDU4",
  "aGV5c2Vs",
  "YnJhZGZvcmQgZmlyZQ==",
  "aWJyb3ggZGlzYXN0ZXI="
];

const leetMap: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  "$": "s",
  "!": "i",
  "+": "t"
};

function decodeBase64(value: string) {
  return atob(value);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[0134578@$!+]/g, (char) => leetMap[char] ?? char);
}

function wordsFrom(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function hasSeparatedWordMatch(normalizedInput: string, term: string) {
  const pattern = term
    .split("")
    .map((char) => escapeRegExp(char))
    .join("[^a-z0-9]*");

  return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`, "i").test(normalizedInput);
}

const blockedTerms = encodedBlockedTerms.map((term) => normalizeText(decodeBase64(term)));

export function findBlockedPersonalisationTerm(value: string) {
  const normalizedInput = normalizeText(value);
  const words = wordsFrom(value);
  const wordSet = new Set(words);
  const normalizedPhrase = words.join(" ");
  const compactInput = words.join("");

  for (const term of blockedTerms) {
    const termWords = wordsFrom(term);
    if (termWords.length === 0) continue;

    if (termWords.length > 1) {
      const phrase = termWords.join(" ");
      const compactPhrase = termWords.join("");
      if (normalizedPhrase.includes(phrase) || compactInput.includes(compactPhrase)) {
        return term;
      }
      continue;
    }

    const [word] = termWords;
    if (wordSet.has(word) || hasSeparatedWordMatch(normalizedInput, word)) {
      return term;
    }
  }

  return null;
}

export function getPersonalisationSafetyError(value: string) {
  return findBlockedPersonalisationTerm(value) ? BLOCKED_PERSONALISATION_MESSAGE : null;
}

export function validatePosterPersonalisation(input: {
  shirtName?: string;
  teamSlogan?: string;
}) {
  if (input.shirtName && getPersonalisationSafetyError(input.shirtName)) {
    return { field: "shirtName" as const, message: BLOCKED_PERSONALISATION_MESSAGE };
  }

  if (input.teamSlogan && getPersonalisationSafetyError(input.teamSlogan)) {
    return { field: "teamSlogan" as const, message: BLOCKED_PERSONALISATION_MESSAGE };
  }

  return null;
}

