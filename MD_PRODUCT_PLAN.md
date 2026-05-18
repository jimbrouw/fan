# MD Product Plan

## Positioning

MD is the gift-first fork of Kitface.

The core customer is a parent or family member with photos on their phone who wants a football birthday card/poster without spoiling the surprise.

Core promise:

> Make them the star of their own football birthday card/poster.

MD should not compete with Moonpig by offering hundreds of templates. It should do one football transformation well: turn ordinary family photos into a designed, printed football gift.

## Product Shape

Primary flow:

1. Choose occasion: birthday first, World Cup/matchday second.
2. Choose team/country style.
3. Add recipient name, age, and short message.
4. Upload 3-5 existing photos.
5. App guides which photo is strongest.
6. Generate watermarked proof.
7. Pay for print-on-demand card/poster.
8. Submit order to print provider API and show order status.

Secondary retained flows:

- Make one for yourself with guided camera capture.
- VS/matchday banter poster.
- Digital download/share after result.

## Visual Style

Default MD output should avoid fragile pure photorealism.

Use stylised editorial realism:

- recognisable likeness
- premium sports-card / football magazine composition
- print texture or halftone detail
- clean floodlights and football energy
- inspired-by team colours
- minimal readable text

This makes small likeness drift less damaging than a fake-photo look.

## Image Model Strategy

Do not choose by model hype. Run a bake-off.

Test sets:

- 10 real parent-camera-roll photo sets
- 3-5 images per set
- mixed quality: good face, group photo crop, football kit photo, blurry phone image

Models:

- `gpt-image-2-fast` for cheap draft baseline
- `gpt-image-2` for final quality baseline
- `nano-banana-2` as low-cost candidate

Score:

- recognisable likeness
- child/family appropriateness
- text rendering
- team-colour styling
- print composition
- cost per acceptable proof
- cost per paid final

Working assumption:

- Nano Banana 2 may be useful for lower-cost drafts.
- GPT Image 2 may remain better for paid final output if likeness or composition is stronger.
- Final routing should be evidence-led.

## Print-On-Demand Strategy

MD should not handle printing.

Provider candidates:

- Printful
- Gelato
- Prodigi
- Printify

First SKU decision must come before API integration:

- birthday card
- A4/A3 poster
- card plus poster bundle

Selection criteria:

- UK shipping cost and speed
- card/poster catalog
- print file requirements
- API and webhook quality
- branding/white-label options
- base cost and margin
- order status transparency

## IP Guardrails

Until licensing exists:

- Avoid official crests, official marks, and exact sponsor reproduction in MD gift outputs.
- Use inspired-by colourways and generic football-kit details.
- Use user-supplied images only when the user provides them.
- Do not imply official club, league, FIFA, UEFA, or national-team endorsement.

## Immediate Build Sequence

1. Rewrite homepage around MD gift promise.
2. Build upload-first gift intake.
3. Wire `buildMdGiftImagePrompt` as a selectable generation mode.
4. Add simple photo-quality guidance.
5. Run model bake-off.
6. Select first print SKU.
7. Integrate selected print API.
