export type CorrectionAction = "add" | "remove" | "replace" | "refine" | "preserve";
export type CorrectionTarget = "subject" | "kit" | "text" | "background" | "colour" | "number" | "team" | "mood" | "layout";

export type CorrectionInstruction = {
  action: CorrectionAction;
  target: CorrectionTarget;
  value?: string;
  confidence: number;
  preserve: string[];
  ambiguityWarning?: string;
};

const defaultPreserveList = [
  "face identity",
  "pose",
  "team",
  "kit era",
  "poster style",
  "watermark",
  "aspect ratio",
  "previous approved corrections",
];

export function parseCorrectionPrompt(prompt: string): CorrectionInstruction {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();

  const removeMatch = lower.match(/\b(remove|delete|get rid of|take out)\b(?:\s+the)?\s+(.+)/);
  if (removeMatch) {
    const value = cleanValue(removeMatch[2]);
    return {
      action: "remove",
      target: inferTarget(value, "text"),
      value,
      confidence: value ? 0.9 : 0.45,
      preserve: defaultPreserveList,
      ambiguityWarning: value ? undefined : "Deletion target is unclear.",
    };
  }

  const numberMatch = lower.match(/\b(?:make|change|set)\b.*?\b(?:number\s*)?(\d{1,3})\s+(?:not|instead of|rather than)\s+(\d{1,3})\b/);
  if (numberMatch) {
    return {
      action: "replace",
      target: "number",
      value: `${numberMatch[2]} -> ${numberMatch[1]}`,
      confidence: 0.96,
      preserve: defaultPreserveList,
    };
  }

  const kitMatch = lower.match(/\b(change|make|switch)\b.*?\b(home|away|third|goalkeeper)\s+kit\b|\b(home|away|third|goalkeeper)\s+kit\s+(?:not|instead of|rather than)\s+\b(home|away|third|goalkeeper)\b/);
  if (kitMatch) {
    const kitValue = kitMatch[2] ?? kitMatch[3];
    return {
      action: "replace",
      target: "kit",
      value: kitValue ? `${kitValue} kit` : normalized,
      confidence: 0.88,
      preserve: defaultPreserveList.filter((item) => item !== "team"),
    };
  }

  const colourMatch = lower.match(/\b(?:make|change|set)\b(?:\s+the)?\s+(.+?)\s+(red|blue|green|yellow|black|white|purple|violet|cyan|lime|navy|gold|silver|orange|pink)\b/);
  if (colourMatch) {
    return {
      action: "replace",
      target: "colour",
      value: `${cleanValue(colourMatch[1])}: ${colourMatch[2]}`,
      confidence: 0.82,
      preserve: defaultPreserveList,
    };
  }

  const teamMatch = lower.match(/\b(?:change|switch|make)\b\s+(.+?)\s+(?:to|into)\s+(.+?)\b(?:kit|team|shirt)?$/);
  if (teamMatch && /\b(arsenal|chelsea|spurs|tottenham|united|city|forest|liverpool|everton|villa|newcastle|england|scotland|wales)\b/.test(teamMatch[2])) {
    return {
      action: "replace",
      target: "team",
      value: cleanValue(teamMatch[2]),
      confidence: 0.76,
      preserve: defaultPreserveList.filter((item) => item !== "team"),
    };
  }

  if (lower.includes("second photo") || lower.includes("other photo")) {
    return {
      action: "replace",
      target: "subject",
      value: normalized,
      confidence: 0.7,
      preserve: defaultPreserveList.filter((item) => item !== "face identity"),
      ambiguityWarning: "Confirm which uploaded photo should become the primary identity reference.",
    };
  }

  if (lower.includes("original photo") || lower.includes("more like the photo")) {
    return {
      action: "refine",
      target: "subject",
      value: "improve identity preservation against the original photo",
      confidence: 0.84,
      preserve: defaultPreserveList,
    };
  }

  if (lower.includes("less dramatic") || lower.includes("tone it down") || lower.includes("subtle")) {
    return {
      action: "refine",
      target: "mood",
      value: "less dramatic, more restrained",
      confidence: 0.86,
      preserve: defaultPreserveList,
    };
  }

  if (lower.includes("keep everything else the same")) {
    return {
      action: "preserve",
      target: "layout",
      value: "keep everything else the same",
      confidence: 0.82,
      preserve: defaultPreserveList,
    };
  }

  return {
    action: "refine",
    target: "layout",
    value: normalized,
    confidence: 0.48,
    preserve: defaultPreserveList,
    ambiguityWarning: "Correction is broad; ask one short clarifying question if applying it could change unrelated poster details.",
  };
}

export function formatCorrectionInstructions(instruction: CorrectionInstruction) {
  return `USER CORRECTION:
Action: ${instruction.action}
Target: ${instruction.target}
Value: ${instruction.value ?? "none"}
Confidence: ${instruction.confidence.toFixed(2)}
Preserve unless directly contradicted: ${instruction.preserve.join(", ")}
Granularity: apply the smallest possible change that satisfies the correction. Do not regenerate unrelated parts.
Conflict handling: newest correction wins if it conflicts with older corrections.
${instruction.ambiguityWarning ? `Ambiguity warning: ${instruction.ambiguityWarning}` : "Ambiguity warning: none"}`;
}

function cleanValue(value: string) {
  return value.replace(/[.?!]$/g, "").trim();
}

function inferTarget(value: string, fallback: CorrectionTarget): CorrectionTarget {
  if (/\b(text|word|title|caption|top)\b/.test(value)) return "text";
  if (/\bshirt|kit|jersey|scarf|sleeve|collar\b/.test(value)) return "kit";
  if (/\bnumber|no\.?\b/.test(value)) return "number";
  if (/\bteam|club|arsenal|chelsea|spurs|tottenham\b/.test(value)) return "team";
  if (/\bbackground|stadium|crowd\b/.test(value)) return "background";
  if (/\blayout|composition|crop\b/.test(value)) return "layout";
  return fallback;
}
