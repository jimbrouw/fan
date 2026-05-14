# Kitface Rebrand Branding Plan

## Official. Electric. Playful.

This plan translates the supplied reference board into a full Kitface brand system. The image is not just a design plan for one page. It is a brand direction board: it defines the palette, typography, graphic system, web chrome, mobile app shell, poster output, share formats, icon style, and tone. Treat it as a rebrand blueprint, then implement site-first and generated-poster-second so the product and output feel like one system.

## Strategic Shift

### From

Kitface currently reads as a warm keepsake print shop:

- Cream paper canvas
- Sage and burgundy palette
- Georgia serif display type
- Paper-grain texture
- Sentimental, craft-led language
- Soft family keepsake atmosphere

### To

Kitface should read as an official football media system:

- Light broadcast canvas
- Deep indigo ink
- Electric lime, cyan, blue, and violet energy
- Massive condensed-feeling grotesk typography
- Cropped poster art and diagonal graphic forms
- Playful fan energy inside a professional sports-campaign frame

The goal is not a dark neon sports app. The target is a bright matchday broadcast package: breathable, high-confidence, kinetic, official, and friendly.

## Brand Principles

| Principle | Meaning | Design Behavior |
|---|---|---|
| Official | Feels like a club media team, sports broadcaster, or kit launch campaign | Strong alignment, confident type, precise iconography, premium spacing |
| Electric | Captures matchday intensity without going dark | Diagonal gradient beams, sharp color moments, active poster crops |
| Playful | Keeps the product fan-first and family-friendly | Warm copy, approachable interactions, celebratory poster poses |
| Light First | Avoids gamer, crypto, and cyberpunk defaults | Off-white canvas, white panels, indigo text, color used in moments |
| Poster Native | The UI should feel connected to the generated output | Same ramp, type weight, cropped composition, share-format logic |

## Visual Read Of The Supplied Image

The reference board establishes these concrete cues:

- Primary surface is light grey-white, not cream.
- Deep indigo is used as the main ink for logos, headings, labels, icons, and chrome.
- Headlines are very large, uppercase, heavy, and compressed in feeling.
- The color ramp runs lime to cyan to blue to violet, often in diagonal bands.
- Gradients are structural shapes: beams, wedges, corner cuts, and overlays.
- Cards stay white with light borders, modest shadow, and strong internal hierarchy.
- Posters are darker than the UI only where football photography requires it, but the surrounding brand system remains light.
- Mobile app chrome is clean and simple, with the poster artwork carrying most of the drama.
- Share outputs are treated as first-class product surfaces, not afterthoughts.

## Palette

Replace the current earthy palette entirely for brand chrome. Team colors remain accurate inside kit and club-specific poster details.

| Role | Token | Value | Usage |
|---|---|---:|---|
| Canvas | `--background` | `#F5F5F7` | Dominant page and app background |
| Ink | `--foreground` | `#16084A` | Headlines, logo, primary text, icon chrome |
| Ink soft | `--foreground-soft` | `#2A1767` | Secondary labels, pills, quiet controls |
| Surface | `--surface` | `#FCFCFF` | Cards, app panels, upload zones |
| Surface soft | `--surface-soft` | `#EDEAF4` | Subtle blocks, input fills, inactive steps |
| Line | `--line` | `#D8D4E6` | Dividers, card borders, control outlines |
| Muted text | `--muted` | `#77718F` | Captions, helper text, metadata |
| Accent cyan | `--accent` | `#31F0D5` | Primary CTA fill, active states, upload icon |
| Accent lime | `--accent-lime` | `#D7FF2F` | Energy beams, highlights, poster accents |
| Accent blue | `--accent-blue` | `#4B7CFF` | Beam midpoints, link moments, poster UI |
| Accent violet | `--accent-violet` | `#7B2CFF` | Beam endpoints, secondary energy |

Core ramp:

```css
--ramp: linear-gradient(100deg, #D7FF2F 0%, #31F0D5 34%, #4B7CFF 68%, #7B2CFF 100%);
```

### Palette Rules

- Use `#F5F5F7` or a near-white as the dominant surface.
- Use indigo as ink, not as a full-screen background.
- Use the ramp for structural energy forms, not decorative blobs.
- Avoid pink-heavy gradients.
- Avoid pure black.
- Avoid beige, cream, sage, burgundy, paper-grain, and dark stadium UI chrome.
- Club colors are content, not brand tokens. Do not overwrite `lib/teamProfiles.ts` primary and accent values.

## Typography

Kitface should feel loud without becoming aggressive.

| Type Role | Font | Weight | Treatment |
|---|---|---:|---|
| Hero display | Geist | 900 | Uppercase, tight line-height, huge scale, short phrases |
| Product headings | Geist | 800-900 | Compact, confident, indigo |
| Body | Geist | 400-600 | Clear, short, practical |
| Metadata | Geist Mono or Geist | 600-700 | Small uppercase labels, step numbers, spec labels |

### Type Rules

- Remove Georgia from `.font-display`.
- Use Geist 900 for display.
- Keep headline copy short enough to crop, stack, and dominate.
- Prefer uppercase for campaign moments and step labels.
- Do not use sentimental long-form headlines.
- Keep body text concise and functional.

Example headline patterns:

- `YOU. YOUR TEAM. YOUR POSTER.`
- `PICK YOUR KIT. MAKE IT YOURS.`
- `FROM FAN TO POSTER IN MINUTES.`
- `MATCHDAY, MADE PERSONAL.`
- `CREATE. PERSONALIZE. SHARE.`

## Graphic System

### Diagonal Beams

Large angled ramp forms should create motion across otherwise quiet surfaces.

Implementation behavior:

- Use oversized pseudo-elements behind content.
- Rotate between 20 and 38 degrees.
- Keep opacity between 0.16 and 0.42 depending on size.
- Clip or crop beams at viewport edges.
- Animate slowly only where it adds polish.

### Gradient Wedges

Use wedges to frame hero posters, mobile screens, upload cards, and share outputs.

Rules:

- Wedges should feel like broadcast graphics, not abstract decoration.
- They can cut across images, but must not obscure faces, CTAs, or key text.
- Prefer one or two strong wedges over many small color fragments.

### Ghost Shapes

Use oversized cropped letters, numerals, crests, or geometric blocks at low opacity.

Rules:

- Use indigo or the ramp at low opacity.
- Keep them behind content.
- Use them to create scale, not clutter.
- Avoid mascot or cartoon shapes.

### Cards And Panels

Cards should be clean white broadcast panels:

- White or near-white fill
- 1px neutral or gradient border
- 8-24px radius depending on surface
- Soft shadow with low opacity
- Strong spacing and clear labels

Avoid nested cards. Use cards for actual objects: upload zones, poster previews, team tiles, share outputs, and result panels.

## Logo And Mark

The current shield concept can stay if it is simplified into a media-system mark.

Guidance:

- Use deep indigo for the mark in normal chrome.
- Use a ramp version only in hero or campaign moments.
- Keep the wordmark heavy, compact, and confident.
- Avoid hand-crafted, vintage, paper, or crest-heavy styling.

## Iconography

Use lucide-react for UI icons because it is already in the stack.

Rules:

- Stroke width: 1.75 to 2.
- Use indigo by default.
- Use accent cyan or lime only for active states and feature moments.
- Icons should support utility: upload, camera, shield, share, download, crop, enhance.
- Avoid emojis in product UI and brand docs.

## Motion

Motion should feel like sports broadcast polish, not particle effects.

| Motion Pattern | Usage | Constraint |
|---|---|---|
| Slow beam drift | Hero background, app shell ambient layer | Transform and opacity only |
| CTA sweep | Primary button hover | Short, restrained, no glow spam |
| Card lift | Poster previews, team tiles | 120-180ms, small translate |
| Step transition | Capture to crop to enhance | Smooth opacity and transform |
| Share format carousel | Result page | Snappy and tactile |

Motion rules:

- No particles.
- No synthwave glow fields.
- No animated layout properties.
- Respect `prefers-reduced-motion`.
- Keep motion purposeful and quiet on mobile.

## Voice And Messaging

### Voice Attributes

| Attribute | Do | Do Not |
|---|---|---|
| Confident | `Pick your kit. Make it yours.` | `Unleash your fandom like never before.` |
| Fan-first | `Your colors. Your moment.` | `Premium AI-powered personalization platform.` |
| Official | `Built like club media.` | `Professional-grade synergistic output.` |
| Playful | `Matchday, made personal.` | `Magical memories forever.` |
| Direct | `Upload. Choose. Create.` | `A seamless journey from image to unforgettable art.` |

### Message House

| Layer | Message |
|---|---|
| Promise | Turn a fan photo into official-looking football poster art in minutes. |
| Emotional payoff | Feel seen in your colors. |
| Functional proof | Upload a photo, choose a team or VS matchup, generate poster formats, download and share. |
| Brand belief | Fans deserve media-day energy too. |
| CTA | Start now. |

### Copy Bank

Hero:

- `YOU. YOUR TEAM. YOUR POSTER.`
- `TURN YOUR PASSION INTO A POSTER.`
- `PICK YOUR KIT. MAKE IT YOURS.`

Subcopy:

- `Create personalized football poster art from your photo in minutes.`
- `Choose your club, set the style, and get matchday-ready artwork to download or share.`
- `Built for fans, families, grassroots teams, and every football moment worth saving.`

Feature labels:

- `Official Quality`
- `Easy To Create`
- `Made For Fans`
- `Share Everywhere`
- `Secure And Private`

Banned phrases:

- `Keepsake print shop`
- `Timeless memories`
- `Cherished forever`
- `Magical`
- `Unleash`
- `Next-generation`
- `AI-powered platform` as a primary headline

## Website And App Chrome Plan

### Phase 1: Foundation

Files:

- `app/globals.css`
- `app/layout.tsx`

Changes:

- Replace cream, sage, burgundy, and paper tokens with the new light broadcast palette.
- Add `--ramp`.
- Add utilities for ramp fills, beam layers, gradient borders, and heavy display type.
- Remove `.paper-grain`.
- Replace `.font-display` with a Geist 900 display utility.
- Set `viewport.themeColor` to `#F5F5F7`.
- Refresh metadata description:
  - `Create official-looking football poster art from your photo in minutes.`

### Phase 2: App Shell

Files:

- `components/AppFrame.tsx`
- `components/Button.tsx`

Changes:

- Restyle the mobile shell as a white broadcast panel on the light canvas.
- Use diagonal beam ambient graphics behind the panel.
- Set the Kitface wordmark in heavy indigo.
- Restyle the privacy pill with neutral surface and indigo/cyan accents.
- Primary button: cyan fill, deep indigo text, subtle gradient sweep on hover.
- Secondary and ghost buttons: light surface, indigo text, neutral border.

### Phase 3: Landing Page

File:

- `app/page.tsx`

Changes:

- Rebuild the hero around the board language:
  - huge left-aligned headline
  - poster preview or hero artwork on the right
  - diagonal ramp beams framing the image
  - clear CTA row
  - short trust or output proof below
- Replace sentimental copy with confident, short copy.
- Keep the playful tilted poster preview but restyle it as white broadcast key-art with a gradient border.
- Feature cards should use icon plus label, not long paragraphs.

### Phase 4: Capture And Creation Flow

Files:

- `app/capture/page.tsx`
- `app/capture/CaptureClient.tsx`
- `app/review/page.tsx`
- `app/create/page.tsx`

Changes:

- Stepper should match the reference board: numbered indigo/cyan steps with thin dividers.
- Upload zones should be white with dashed neutral borders and a cyan/ramp upload mark.
- Photo previews should use white cards and crisp shadows.
- Controls should feel like mobile product UI, not paper forms.

### Phase 5: Result And Share Surfaces

Files:

- `app/result/[jobId]/ResultClient.tsx`
- `lib/posterTemplates.ts`

Changes:

- Use a light result stage with gradient-bordered poster frame.
- Replace sage watermark badges with deep indigo.
- Treat share formats as product cards:
  - Instagram Story
  - Instagram Post
  - X post
  - Facebook post
- Preview outputs should use consistent white panels, indigo labels, and ramp accents.

## Generated Poster Brand Plan

The posters should inherit the broadcast graphic language, not the UI background literally. A good poster can still contain stadium photography, but the art direction should move away from dark cinematic fog and toward official sports campaign composition.

### Poster Art Direction

Use this language consistently:

> premium football broadcast graphics aesthetic, clean light editorial composition, electric lime-to-cyan gradient energy forms, deep indigo typography accents, official sports campaign layout, white/light-grey graphic background, cropped oversized typography, translucent diagonal gradient beams, high-end football social campaign art direction, premium sports TV branding feel, playful but official, confident visual hierarchy

### Prompt Builder Targets

File:

- `lib/ai/promptBuilder.ts`

Changes:

- Replace bland `Off-white background` wording in the baseline `SCENE` section.
- Retune the nano-banana model direction away from dark turf, smoke, low fog, and cinematic stadium gloom.
- Keep identity, kit accuracy, face preservation, and negative prompt sections intact.
- Add clear instruction that text should be graphic/cropped/abstract unless the system explicitly allows readable poster text.

### Poster Template Targets

File:

- `lib/posterTemplates.ts`

Changes:

- Replace near-black preview card backgrounds with light broadcast key-art.
- Add translucent diagonal ramp beams.
- Preserve team primary and accent colors as club-specific details.
- Keep player/photo legibility as the priority.

### Demo Prompt Targets

Files:

- `scratch/make_demo_prompts.ts`
- `scratch/make_vs_demo_prompts.ts`

Changes:

- Update demo `SCENE` and `STYLE` language to match the new broadcast system.
- Regenerate demo prompt text only after the core prompt language is updated.

## Surface-Specific Direction

### Homepage

Goal:

- Make the product feel instantly bigger, faster, and more official.

Must include:

- First-viewport Kitface logo or mark
- Huge campaign headline
- Poster preview with real football energy
- Diagonal ramp framing
- Single primary CTA
- Small proof row or feature strip

Avoid:

- Centered generic SaaS hero
- Cream paper background
- Long sentimental paragraphs
- Dark image overlay hero

### Mobile App Shell

Goal:

- Make the creation flow feel like a polished mobile sports tool.

Must include:

- Compact header
- Clear progress state
- Clean upload and selection controls
- Strong thumb-friendly CTAs
- Poster previews that feel valuable

Avoid:

- Dense desktop dashboard patterns
- Nested cards
- Excess text explaining obvious controls

### Generated Posters

Goal:

- Make outputs feel like club media or sports social graphics starring the user.

Must include:

- Identity-safe fan likeness
- Accurate kit details
- Official sports-campaign layout
- Electric energy accents
- Cropped type or abstract typographic shapes
- Clear hierarchy for single-fan and VS posters

Avoid:

- Dark foggy stadium movie posters
- Blue neon smoke
- Generic AI fantasy lighting
- Plain beige studio backgrounds
- Random readable slogan text

## Accessibility And Usability Rules

- Indigo text on `#F5F5F7` is the default high-contrast pairing.
- Accent cyan should not carry small white text.
- Primary cyan buttons should use deep indigo text.
- Any gradient text must be limited to rare brand moments and backed by solid text alternatives where readability matters.
- Interactive targets should remain at least 44px tall on mobile.
- Motion must respect reduced-motion preferences.
- Poster output must not place brand beams across faces or important kit details.

## Implementation Sequence

1. Update tokens and global primitives.
2. Update typography and remove paper-grain styling.
3. Restyle shared shell and buttons.
4. Rebuild the homepage hero and feature surfaces.
5. Restyle capture, review, create, and result flows.
6. Update generated-poster prompt language.
7. Update SVG poster previews.
8. Regenerate demo prompts.
9. Verify with browser screenshots and prompt output.

## Acceptance Criteria

Chrome:

- The app reads light, official, electric, and playful.
- Cream, sage, burgundy, Georgia, and paper-grain are gone from brand chrome.
- Indigo is the ink, not the full background.
- Gradients appear as diagonal structural graphics.
- Buttons, cards, and app shell feel consistent across `/`, `/capture`, `/review`, `/create`, and `/result/[jobId]`.

Posters:

- Generated prompt language asks for light editorial broadcast composition.
- Nano-banana direction no longer defaults to dark fog, smoke, and cinematic stadium gloom.
- VS posters preserve side separation and prompt separation between `[img1]` and `[img2]`.
- Team colors remain accurate.
- Posters feel official and energetic without becoming cyberpunk.

Voice:

- Headlines are short, declarative, and fan-centered.
- Product copy avoids generic AI and sentimental keepsake language.
- CTAs are direct.

## Verification Plan

Run after implementation:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

Visual checks:

- Start the dev server.
- Capture screenshots for `/`, `/capture`, `/review`, `/create`, and a known `/result/[jobId]`.
- Compare before/after screenshots for the homepage and result page.
- Check mobile viewport first, then desktop.
- Confirm no text overlaps and no CTA loses contrast.

Poster checks:

- Generate one single-fan poster.
- Generate one VS poster.
- Render SVG previews for at least three teams.
- Confirm output reads as light broadcast campaign art, not dark cinematic fog or plain off-white studio art.

## Decision Log

| Decision | Rationale |
|---|---|
| Keep the system light | The reference board gets energy from contrast and beams, not dark UI. |
| Use indigo as ink | It creates a strong official sports identity without overpowering the surface. |
| Keep team colors separate | Club accuracy matters more than forcing all posters into one brand palette. |
| Remove Georgia and paper grain | They belong to the old keepsake shop direction. |
| Use gradients structurally | This prevents generic AI gradient decoration and ties UI to poster art. |
| Sequence site before posters | The chrome creates the design system; prompts then inherit the same language. |

