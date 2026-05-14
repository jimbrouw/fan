# Kitface — Brand Guidelines

## "Official. Electric. Playful."

---

## 1. Brand at a glance

Kitface turns a few personal photos into official-style football posters. The brand should feel like it came from a **football league's media department** — not a print-on-demand shop, not an AI tool.

| | |
|---|---|
| **Category** | Personalised football poster creation |
| **Feels like** | Premier League broadcast package · Nike Football campaign · DAZN graphics · Champions League social tiles |
| **Does not feel like** | Etsy keepsake shop · gaming startup · synthwave · crypto/SaaS landing page · generic AI tool |
| **One line** | Your photos, official football media. |

### The shift

| Old Kitface | New Kitface |
|---|---|
| Warm keepsake print shop | Official football media system |
| Cream paper, sage, burgundy | Light canvas, deep indigo ink, electric gradients |
| Editorial serif, sentimental | Massive heavy grotesk, confident |
| Quiet, safe, Etsy energy | Loud, breathable, broadcast energy |
| Texture as decoration | Gradient as structure |

---

## 2. Brand principles

**1. Official.** It should feel like a real football media company made it. Structured, credible, premium.

**2. Playful.** Big type, cropping, rotation, energy. It's the best day of a fan's life — never stern.

**3. Confident.** Short copy. No fluff. No sentimentality. State things; don't sell them.

**4. Modular.** Every asset works across web, app, posters, social tiles, motion graphics and stadium screens. One system, many surfaces.

**Core tension to hold:** *electric energy* against *clean white space*. Colour is concentrated into moments; it never floods the canvas.

---

## 3. Voice & tone

Confident, expressive, playful — the voice of a broadcast graphics package, not a greetings card.

**Do**
- Short, declarative lines. "Pick your kit. Make it yours."
- Active, present tense. Football vocabulary used naturally.
- Let the design carry emotion — the words stay tight.

**Don't**
- Sentimental keepsake language ("treasure forever", "memories to keep").
- Hype-speak or AI-tool copy ("revolutionary", "powered by AI", "unleash").
- Long paragraphs in UI. If it needs a paragraph, it's a caption.

**Headline bank (tone reference, not literal):**
`MAKE IT LOUD.` · `PICK YOUR KIT.` · `YOUR CLUB. YOUR STORY.` · `MATCHDAY ENERGY.` · `MAKE IT YOURS.`

**Examples**
- Hero: **"Pick your kit. Make it yours."** / sub: "Turn your photos into official-style football posters." / CTA: "Start now"
- Empty state: "No posters yet. Let's fix that."
- Result: "Your poster's ready." not "Your keepsake has been created!"

---

## 4. Logo & wordmark

Kitface has no dedicated logo today — the name is set in Georgia serif. That goes.

- **Wordmark:** "Kitface" set in the heavy display grotesk (see §6), tight tracking, lowercase or title case — never the old serif.
- **Default treatment:** solid deep-indigo ink (`#2A004F`) on light surfaces.
- **Expressive treatment:** the gradient ramp as a text fill — reserved as a *moment* (hero, splash, social tile), not for everyday chrome.
- **Clear space:** keep one cap-height of clear space on all sides.
- **Don't:** add glow, drop shadow, outline, or place the wordmark on a busy gradient where it loses contrast.

---

## 5. Colour system

The system is **light-first**. Deep indigo is the *ink* — type, framing, chrome, contrast anchor — never the page background. Gradients are energy, applied in concentrated moments.

### Core palette

| Role | Token | Hex | Use |
|---|---|---|---|
| Base canvas | `--background` | `#F5F5F7` | Dominant surface. Light grey-white, not pure white — reads broadcast/editorial. |
| Ink / headline | `--foreground` | `#2A004F` | Deep football-purple. Type, chrome, framing, contrast anchor. |
| Accent (CTA) | `--accent` | `#31F0D5` | Cyan. Primary buttons (with indigo text), key highlights. |
| Card / surface | `--surface` | `#FFFFFF` | White cards on the grey canvas. |

### Gradient ramp

The signature. Soft-blended, airy, **translucent** — energy fields, never saturated blocks.

`#D7FF2F` lime → `#31F0D5` cyan → `#4B7CFF` blue → `#7B2CFF` violet

Use for: structural beams and wedges, ghost shapes, card borders, the expressive wordmark, button hover sweeps.

### Neutrals

| Token | Hex | Use |
|---|---|---|
| `--line` | `#E9E7EF` | Hairlines, dividers |
| `--surface-soft` | `#CFC9DC` | Muted card fills, inactive states |
| `--muted` | `#8C86A3` | Secondary text |

### Rules

- **No pink.** The ramp stops at violet — it never tips into magenta/fuchsia.
- Colour is a **moment**, not a wash. Most of any screen is `#F5F5F7` + white + indigo type.
- Gradients stay translucent and soft — if it looks like a solid neon block, dial it back.
- Team colours (`lib/teamProfiles.ts`) are **real club colours** and stay accurate — they are content, not brand.

---

## 6. Typography

Massive, heavy, confident. Typography is the loudest tool in the system.

| Role | Family | Weight | Treatment |
|---|---|---|---|
| Display / headline | Geist | 900 | Oversized, tight tracking (`-0.03em`), short lines, cropped and dominant. |
| Body / UI | Geist | 400–600 | Clean grotesk, already wired via `next/font`. |
| Mono | Geist Mono | 400 | Job IDs, technical metadata only. |

- Replace the Georgia serif `.font-display` entirely.
- Headlines should **crop and bleed** — letterforms running off-edge is on-brand.
- Dramatic scale contrast: a huge headline next to small, quiet body text.
- Optional future upgrade: a compressed display face (Druk/Monument-style) for headline moments — ship with Geist 900 first.

---

## 7. Graphic system

Gradients live **inside a geometric system** — they are structure, not background decoration. A small kit of reusable primitives:

- **Gradient beams / wedges** — large, translucent, angled bands of the ramp crossing the light canvas behind content. The core "energy field".
- **Ghost shapes** — oversized cropped letterforms or geometric blocks, ramp at low opacity, sitting behind hero content.
- **Gradient borders** — white cards outlined with a thin ramp stroke; soft floating gradient glow optional.
- **Beam framing** — poster previews and result frames framed by a ramp edge.

Think: *broadcast motion graphics paused mid-animation.* Never: `background: linear-gradient(...)` slapped on a full page.

---

## 8. Layout & composition

- **Light, breathable canvas.** Generous white space. Content blocks float on `#F5F5F7`.
- **Broadcast composition blocks** — modular, angled, confident. Big headline left, cropped poster right.
- **Cropping is a feature** — oversized type and imagery running off-edge.
- **Playful geometry** — slight rotation on poster cards is on-brand (it already exists; keep it).
- Colour concentrated into beams and accents; the grid stays calm underneath.

---

## 9. Poster art direction

The generated posters carry the brand — but they **do not inherit the UI background**. They inherit the **broadcast-graphics language**.

**Move toward:** football campaign graphics · broadcast key art · social-media launch posters · sportswear campaign layouts · official sports composition · light/light-grey graphic base · electric gradient energy forms · giant cropped typography · genuine stadium atmosphere.

**Move away from:** dark movie-poster look · glowing blue fog · deep cinematic shadows · "epic AI wallpaper" · off-white blandness.

**Prompt language direction** (replaces dark-cinematic / neon-fog phrasing):

> premium football broadcast graphics aesthetic, clean light editorial composition, electric lime-to-cyan gradient energy forms, deep indigo typography accents, official sports campaign layout, white/light-grey graphic background, cropped oversized typography, translucent diagonal gradient beams, high-end football social campaign art direction, premium sports TV branding feel, playful but official, confident visual hierarchy

Identity preservation, kit accuracy and the negative-prompt safety rules are unchanged — only the *scene / atmosphere / composition* language shifts.

---

## 10. Motion

If/when surfaces animate:

**Do** — slow gradient drift · sliding diagonal beams · oversized type movement · subtle parallax · sports-broadcast-style transitions.

**Don't** — particle effects · glow explosions · cyberpunk UI motion · anything that reads as "gaming".

Motion is a broadcast package easing into frame, never an effects reel.

---

## 11. Applications

- **Website / landing** — white canvas, huge headline left, poster preview right, translucent gradient beams and ghost shapes behind. Broadcast promo-board energy.
- **App shell** — light UI, indigo ink, electric accents. White cards with gradient borders. *Never* a full dark dashboard — that reads "generic AI tool" instantly.
- **Buttons** — primary: cyan fill, indigo text, animated gradient sweep on hover. Secondary/ghost: neutral borders, indigo text.
- **Result page** — light surrounds, gradient-bordered display frame, deep-indigo watermark badge.
- **Social / sharing cards** — full expressive mode: ramp wordmark, big cropped type, beam graphics.

---

## 12. Do's & don'ts

| Do | Don't |
|---|---|
| Keep surfaces light and breathable | Make a dark UI / dark dashboard |
| Use deep indigo as ink | Use deep indigo as a page background |
| Gradients as structural beams/wedges | Gradients as flat decorative backgrounds |
| Concentrate colour into moments | Flood the canvas with neon |
| Massive, heavy, cropped typography | Timid type, editorial serif |
| Short, confident copy | Sentimental keepsake language |
| Translucent, soft-blended ramp | Saturated neon blocks, pink/magenta |
| Posters as broadcast key art | Posters as dark cinematic AI wallpaper |
| Keep real club colours accurate | Restyle team colours to fit the brand |

---

## Appendix — Implementation map

Where each part of this brand lives in the codebase. This appendix is the brief for a follow-up implementation pass.

### Website / app chrome

- **`app/globals.css`** — keystone. Replace `:root` tokens with §5 palette; add `--ramp` + `.kitface-ramp` utilities (fill + text-clip); rewrite `body` background to light `#F5F5F7` + translucent ramp beams; rewrite `.kitface-shell` to light canvas with angled beam graphics; rewrite `.paper-panel` to white card + optional gradient border; remove `.paper-grain` and the Georgia `.font-display`; add heavy display utility.
- **`app/layout.tsx`** — add Geist weight `900`; `viewport.themeColor` `#f7f1e7` → `#F5F5F7`; drop `paper-grain` body class; refresh `metadata.description` to the §3 voice.
- **`components/AppFrame.tsx`** — restyle shell + panel per new tokens; wordmark in heavy display weight, indigo ink (ramp text-fill optional); restyle the "Private photos" pill + menu icon.
- **`components/Button.tsx`** — `primary`: cyan fill, indigo text, gradient sweep on hover; `secondary`/`ghost`: neutral borders, indigo text.
- **`app/page.tsx`** — hero per §11 (heavy headline left, poster right, beam graphics behind); §3 copy; rebuild the rotated kit-preview card as a white card with gradient border; value-prop card → new tokens.
- **`app/result/[jobId]/ResultClient.tsx`** — header/status/display frame → new tokens + gradient-bordered frame; swap the hardcoded `rgba(23,61,44,0.78)` sage watermark badge for deep-indigo; buttons inherit new styles.

### Generated-poster brand

- **`lib/ai/promptBuilder.ts`** — `SCENE` (~line 188): replace `"Off-white background"` with the §9 broadcast language. Nano-banana direction (~line 153): retune the dark stadium/smoke/fog language toward clean light broadcast composition. Leave identity / kit-accuracy / negative-prompt sections untouched.
- **`lib/posterTemplates.ts`** — rework the SVG preview gradient to light broadcast key-art: light base, ramp as translucent diagonal beams, team `primary`/`accent` kept as accents (replace the `#090b10` near-black mid-stop).
- **`scratch/make_demo_prompts.ts`** + **`scratch/make_vs_demo_prompts.ts`** — update `SCENE` / `STYLE` blocks to the §9 language so regenerated demo and VS prompts match.
- **`lib/teamProfiles.ts`** — **no change.** Real club colours stay accurate.

### Recommended next step

Run the **`extract-design`** skill against `nomadstudio.com/work/branding` to pull concrete gradient stops, type metrics and spacing from the reference — turning "inspired by" into exact values before the implementation pass.

### Verification (for the follow-up pass)

1. `npm run dev` — check `/`, `/capture`, `/result/[jobId]`: light canvas, indigo ink, structural beams, heavy cropped type. WCAG AA contrast.
2. `npm run build` passes — no leftover refs to removed tokens, Georgia display styling, or `paper-grain`.
3. Generate one single-fan + one VS poster — confirm light broadcast-campaign output, not dark fog or off-white blandness.
4. Render `lib/posterTemplates.ts` SVG for 2–3 teams — light key-art, club colours still legible.
5. Before/after screenshots of the landing page and a poster.
