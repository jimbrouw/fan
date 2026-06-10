# Content Safety

This file intentionally does not print the NSFW blocked terms.

The personalisation safety filter blocks shirt names and slogans that contain:

- racist, ethnic, homophobic, transphobic, disability, and misogynistic abuse
- graphic sexual terms
- child-abuse and incest terms
- Nazi, extremist, and terrorist terms
- violent threats and self-harm encouragement
- football tragedy abuse and disaster taunts

The actual terms are stored base64-encoded in `lib/safety/profanity.ts` with an NSFW warning. Decode only when maintaining the filter.

User-facing copy should stay neutral:

> That wording can't be used on a Kitface poster.

Do not show the blocked word back to the user.

