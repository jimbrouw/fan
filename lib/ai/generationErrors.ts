const TRANSIENT_GENERATION_ERROR = /internal error|please try again later|temporar|timeout|timed out|rate limit/i;
const INPUT_REJECTION_ERROR = /content could not be processed|revise your input|content policy|moderation/i;

export function isTransientGenerationError(error?: string | null) {
  return TRANSIENT_GENERATION_ERROR.test(error ?? "");
}

export function getGenerationFailureMessage(error?: string | null) {
  if (INPUT_REJECTION_ERROR.test(error ?? "")) {
    return "This poster setup could not be processed. Try a different opponent setup or retake your photos.";
  }

  if (isTransientGenerationError(error)) {
    return "The image service hit a temporary error. Try again with the same photos.";
  }

  return "We couldn't create this poster. Try again or retake your photos.";
}
