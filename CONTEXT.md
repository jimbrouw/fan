# MD Session Context

This checkout is the MD gift-market fork of Kitface.

## Fork

- Branch: `product/md-gift`
- Worktree: `/Users/standard/Developer/fan-md-gift`
- Created from commit `f3fba2a6c2dbe5fc0ff1889a730041a39c4202e5`.
- Purpose: explore a materially different product direction without disrupting the existing Kitface branch.

## Product Thesis

The original Kitface app works for people knowingly making posters of themselves and for VS matchday banter. The MD fork targets a different buyer: a non-technical but phone-savvy parent or family member making a surprise football birthday card/poster from existing camera-roll photos.

The MD product should lead with one clear gift outcome rather than broad template choice:

> Make them the star of their own football birthday card/poster.

This avoids the surprise-breaking problem of asking the recipient to take guided photos. Parents already have many photos; the app should help them choose useful ones and turn them into a gift-ready printed product.

## Current Strategic Decisions

- Keep the existing Kitface self-capture and VS features, but demote them behind the gift-first flow.
- Avoid competing with Moonpig through hundreds of templates. Compete by doing one football-gift transformation well.
- Use upload-first gifting as the front door: occasion, recipient name, age, team/country style, message, and 3-5 photos.
- Do not default to pure photorealism. It makes likeness errors feel like failures. Use a stylised premium football editorial / illustrated realism look that preserves resemblance while reducing uncanny output.
- Monetization should be print-on-demand first. MD should pass completed card/poster artwork to a print API provider and avoid owning printing operations.
- Existing prompt path should remain available for Kitface self/VS flows. The MD prompt is additive.

## Model Direction

- Existing code already supports `gpt-image-2`, `gpt-image-2-fast`, and a `nano-banana-2` MUAPI endpoint path.
- GPT Image 2 remains the quality baseline.
- Nano Banana 2 should be tested for lower-cost drafts and possibly final output if it handles likeness, text, and print composition well enough.
- Do not decide model purely on price. Score parent acceptability: "would I pay for this as a gift?"

## Print-On-Demand Direction

MD should integrate with a print-on-demand API for cards/posters. Candidate providers to compare:

- Printful
- Gelato
- Prodigi
- Printify

Evaluation criteria: greeting card/poster catalog, UK delivery, API quality, white-label/branding options, base cost, shipping cost, webhook support, image placement/print-template support, and order status clarity.

## Open Product Questions

- First SKU: birthday card, poster, or card-plus-poster bundle?
- Brand name: keep Kitface for the fork or rename MD as a distinct product?
- Team styling: how far can inspired-by team/country designs go without unlicensed crests, official kit copying, or sponsor issues?
- Gift copy tone: parent-sincere, funny football banter, or both through one controlled field?
- Default style: one locked birthday hero look first, or birthday plus World Cup variant?

## Next Concrete Action

Start with `MD-01` and `MD-02`: lock the one-product promise and first paid SKU before building more UI. Then implement the upload-first gift intake flow.
