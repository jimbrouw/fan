# MD Task Handover

## Product Fork

- Branch: `product/md-gift`
- Worktree: `/Users/standard/Developer/fan-md-gift`
- Parent app: Kitface self-capture / matchday poster app remains intact in the original checkout.
- New direction: MD is a gift-first football card/poster product for parents and family buyers using photos already on their phone.

## Finished

- Created a separate git worktree and branch for the MD product fork so gift-market changes do not disrupt the existing Kitface branch.
- Reframed the product around surprise gifting: parent uploads existing photos, chooses team/country style, adds name/age/message, then buys a print-on-demand card or poster.
- Kept the existing self-capture, VS, auth, result, correction, sharing, video, and Printful-era code available as inherited app features rather than deleting them.
- Preserved the current photoreal football poster prompt path for existing Kitface flows.
- Added a new MD prompt direction for less fragile likeness: premium illustrated football gift poster/card, stylised editorial realism, print texture, strong resemblance without pretending to be a perfect photograph.
- Recorded model exploration direction: keep GPT Image 2 as baseline, test Nano Banana 2 as a lower-cost candidate, and compare output quality before making it the default.
- Updated handover context and project instructions for the MD fork.

## Next

### MD Product Definition
1. **MD-01 Define the one-product promise** - lock the homepage promise to one clear offer: "Make them the star of their own football birthday card/poster." Avoid template sprawl.
2. **MD-02 Decide the first paid SKU** - choose the first print-on-demand product: birthday card, A4/A3 poster, or card-plus-poster bundle. Do not build multiple commerce paths at once.
3. **MD-03 Define the safe football IP posture** - decide how club/country styles are described without unlicensed crests, official marks, or replica sponsor claims.

### MD Upload-First Flow
4. **MD-04 Build gift intake flow** - create an upload-first route for occasion, recipient name, age, team/country style, short message, and 3-5 existing photos.
5. **MD-05 Add photo guidance** - grade uploaded photos for size, blur, likely face presence, and main-photo suitability with parent-friendly copy.
6. **MD-06 Keep live capture as secondary** - move guided camera capture behind "making one for yourself" so surprise gifts do not require the recipient to participate.

### MD Image Generation
7. **MD-07 Wire MD prompt variant** - add a generation mode that uses the MD stylised gift prompt while preserving the existing Kitface prompt for self/VS flows.
8. **MD-08 Run model bake-off** - generate the same 10 photo sets through GPT Image 2 fast, GPT Image 2 final, and Nano Banana 2; score likeness, text, kit style, cost, and parent acceptability.
9. **MD-09 Pick default model strategy** - choose default/draft/final model routing after bake-off. Candidate: Nano Banana 2 for drafts, GPT Image 2 for paid final if quality is better.

### MD Print-On-Demand
10. **MD-10 Select print API provider** - compare Printful, Gelato, Prodigi, and Printify for greeting cards/posters, UK delivery, API ergonomics, costs, and branding.
11. **MD-11 Card/poster composition pipeline** - place generated art into print-safe card/poster templates with bleed, safe area, text area, and export dimensions.
12. **MD-12 Checkout and order handoff** - collect payment, create the print provider order, and show order status without handling printing manually.

### MD Retained Features
13. **MD-13 Preserve VS/matchday mode** - keep VS banter as a shareable secondary mode, not the main paid funnel.
14. **MD-14 Preserve self-poster mode** - keep guided camera capture for users knowingly making posters for themselves.
15. **MD-15 Preserve result sharing** - keep watermark preview, download/share links, correction flow, and video experimentation where useful.

## Blockers

- MD model choice needs real generation tests with parent-style camera-roll photos, not just synthetic prompt review.
- Print-on-demand pricing and margin cannot be finalized until the first SKU and provider are selected.
- Official club/team marks require licensing or a careful inspired-by design system.
- Strong privacy claims still require private buckets, signed provider URLs, and a retention policy.
- Nano Banana 2 availability/pricing should be verified against the chosen provider at implementation time because image API pricing changes quickly.
