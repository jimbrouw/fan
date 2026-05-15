# Kitface — Strategy & v2 Roadmap

**Status:** Concept stage. Landing page live at kitface.app. App in build.
**Author input:** Jim Brouwer, Vibe Anything.
**Date:** May 2026.

---

## TL;DR — The five things that matter

1. **VS mode is the marketing engine.** Lead with it. Single-fan posters are transactional; VS posters are content engineered to fight in group chats and viralise on Reels/TikTok.
2. **Animation is the single biggest lever for organic growth.** A 2-second looping version of every poster is 5x more shareable on video-first platforms than static. [Inference]
3. **Retro is your competitive moat.** Classic shirt culture is huge, underserved, and lower-IP-risk. Build it in as `kitface.app/retro` (feature, not separate domain — keep brand equity in one place).
4. **Age-to-era auto-mapping is your nostalgia hook.** Birth year input → era-appropriate kit by default. "Your team. Your era." Strong tagline, strong product feel.
5. **Sort IP before you scale ads.** Half an hour with a sports IP lawyer now saves a takedown disaster after a viral week.

---

## Who's actually buying this

Football fans is too broad to action. Real segments:

- **Lads' group chats (25–40, mostly male)** — banter, VS posters, derby content. Channel: TikTok + Instagram Reels.
- **Parents of kid players (30–50)** — child in their kit, birthdays, framed prints. Channel: Facebook + Instagram, especially around birthday targeting.
- **Gift buyers (partners, 25–55, often women)** — surprise present for the fan in their life. Channel: Facebook + Google search around "football fan gift".
- **Retro shirt obsessives (25–45)** — huge engaged Instagram community. Not currently served. Major opportunity.
- **Grandparents (55+)** — buying for grandkids. Facebook + local press.

**Action:** Don't make one campaign for "football fans". Each segment gets its own ad creative and channel.

---

## Marketing strategy by channel

### TikTok — build the engine

- **Don't pay big creators yet.** Find 20–30 mid-tier fan TikTokers per club (10k–100k followers). Free Pro + small fee. Let them post organically.
- **Hero formats:**
  - "Lost the bet, this gets framed in my kitchen" (VS rival kit)
  - "Made my dad his team in his era" (retro nostalgia reveal)
  - "Mate's stag do, every man in a different rival kit"
  - Transfer deadline day / derby day / loss reaction memes — fast turnaround
- **Sound:** The football TikTok soundscape (stadium audio, commentary clips) is half the algorithm. Build a sound library.
- **Cadence:** Jump on every football meme cycle within 24 hours.

### Instagram

- **Reels:** cross-post TikTok content. Don't make platform-specific content yet.
- **Story stickers:** partner with fan accounts to make Kitface part of their matchday routine.
- **Carousel ads:** photo → poster transformation. Highest-converting format for personalised image products. [Inference, verify in your own tests.]
- **Targeting:** people who follow specific club accounts + age/location overlay.

### Facebook — the revenue channel

- Older buyers, gifting intent, birthdays, Christmas. Almost certainly highest ROAS. [Inference]
- 20+ separate ad creatives, one per club: "Perfect gift for a [Club] fan." Tedious but works.
- Closed fan groups are massive. Don't spam — engage authentically or partner with admins.

### WhatsApp — your real distribution

- Where football banter actually lives. Your share flow must be optimised for it.
- Every shared poster has a subtle `kitface.app` watermark bottom-right. Every share becomes an ad.
- Add a "Share to WhatsApp" button as the *primary* CTA, not Instagram. [Inference: WhatsApp drives more UK football conversation than any other platform.]

---

## What v2 needs to ship

### Priority 1 — Growth levers

- [ ] **Animated poster output (image-to-video pipeline).** Static + 2–4 second loop version of every export. SeaDance for animation, static gen first.
- [ ] **Watermark system.** Subtle `kitface.app` bottom-right, removable on paid tier.
- [ ] **VS mode as hero on landing.** Not buried in "single mode or VS" copy.
- [ ] **Direct WhatsApp share flow.** Pre-formatted message + image attached, one tap.

### Priority 2 — Monetisation features

- [ ] **Print fulfilment.** A3 / A4 / framed / canvas via print-on-demand partner (Prodigi or Gelato). [Inference: 40–60% margin typical for POD photo products.]
- [ ] **Free tier with watermark. Paid removes watermark + unlocks animation + retro packs.**
- [ ] **Greeting card mode** — turn poster into A5 folded card with editable text inside.

### Priority 3 — Product depth

- [ ] **Squad / family mode.** 3–8 figures in one poster. Family use case is huge for gifting.
- [ ] **Retro kit packs** — `/retro` feature with kits by decade. See dedicated section below.
- [ ] **Age-to-era auto-mapping.** Ask birth year on first use → default to era-appropriate kit (their formative years, roughly age 8–18). User can override. "Your team. Your era." as the framing.
- [ ] **Result/scoreboard overlay.** Final whistle → auto-poster with score. Could make Kitface a weekly habit.
- [ ] **Women's clubs + Lionesses.** Currently invisible. Big audience gap.
- [ ] **Non-league pack.** Wrexham effect. Loyal communities, low IP risk.

### Priority 4 — Nice to haves

- [ ] **Goalscorer celebration pose templates.**
- [ ] **Kit reveal mode** — animated "new signing announcement" graphic.
- [ ] **Pub/event mode** — multi-poster batch for parties, fan groups, watch parties.

---

## Money-making opportunities

Ranked by likely ease + return:

1. **Freemium with watermark removal** (£2.99/month or £3 one-off per poster).
   - Lowest friction, broadest market. Watermarks are your viral loop and your paywall.
2. **Print fulfilment** (A3 print ~£15–25, framed ~£35–50).
   - Highest absolute margin per customer. Gifting use case is genuine demand.
3. **Pro subscription** (£4.99/month).
   - Unlocks: no watermark, all retro packs, animation, squad mode, all clubs.
4. **Greeting cards** (£4.99 printed + posted, on-demand via Moonpig-style fulfilment).
   - Birthday + Christmas are massive seasonal spikes.
5. **B2B/club partnerships.**
   - Clubs use Kitface for fan engagement campaigns. Revenue share or licensing fee. Hard to land but high value. Start with EFL/non-league clubs.
6. **Sponsored kit drops** (kit manufacturer placements).
   - Only viable at scale. Future revenue line.
7. **Physical merch extension** (stickers, mugs, t-shirts of the poster).
   - POD again. Lower margin per unit but unlocks impulse buys.

**My pick for v2 launch:** Freemium with watermark + Print fulfilment + Pro subscription. Three revenue lines, all complementary. Greeting cards as a Q4 push for Christmas.

---

## The retro angle

Strong feature, weak as a separate brand. Reasons:

- Same audience, same product, same backend. Splitting domains splits SEO and brand equity.
- "Kitface Retro" as a feature/tab inside the main app is cleaner.
- `/retro` URL is fine for marketing but make it the same product.

**What retro unlocks:**

- The classic shirt community on Instagram (Classic Football Shirts, Football Shirt Collective, Toffs, Cult Kits) is large and very engaged. [Unverified: I don't have exact subscriber numbers but the category is well-documented as growing.]
- Generally lower IP risk on kit *designs* from the 70s/80s (copyright on graphic designs has a finite term, varies by jurisdiction). Trademarks (badges, club names) persist — so still get legal advice. [Inference]
- Nostalgia is the single strongest emotional driver in football retail. [Inference]
- Pairs perfectly with age-to-era mapping below.

**Retro packs to launch with:**
- 1970s — classic Adidas-era kits
- 1980s — pin stripes, geometric
- 1990s — baggy, neon, peak shirt sponsor era
- 2000s — early Premier League glamour
- Iconic match kits (Italia 90 England, Euro 96, 1999 Treble United, Liverpool Istanbul, etc.)

---

## Age-to-era auto-mapping — product logic

The product hook: **someone signs up, gives birth year, sees their team in the kit of their formative years.** That hits an emotional note before they've done anything.

**Mapping logic (formative years ~age 8–18):**

| Born | Formative years | Default kit era |
|------|----------------|-----------------|
| 1955 | 1963–1973 | 1960s/early 70s |
| 1965 | 1973–1983 | 1970s |
| 1975 | 1983–1993 | 1980s |
| 1985 | 1993–2003 | 1990s |
| 1995 | 2003–2013 | 2000s |
| 2005 | 2013–2023 | 2010s |

Default to era kit, let user override to current kit (or any era). The default *itself* is the marketing.

**Why ask birth year not detect from photo:**

- Age detection from photo has biometric/privacy implications (GDPR, especially with kids in scope).
- Accuracy is mediocre — wrong era kit ruins the moment.
- Asking is one tap. Detection is a liability.
- "Your team. Your era." as onboarding copy makes it feel like a feature, not a question.

---

## AI agents for research and ops

You've got the n8n + Claude Code stack. Concrete agent jobs that pay back fast:

### 1. Influencer discovery agent
- Scrape TikTok and Instagram for fan accounts per club with 10k–100k followers.
- Filter by post frequency, engagement rate, audience location.
- Output: weekly CSV of candidate creators per club with contact info.
- Stack: TikTok/Instagram scraping (RapidAPI or Apify) → Claude for vetting → Airtable/Notion output.

### 2. Trend monitoring agent
- Watch football TikTok/Twitter for trending sounds, memes, results moments.
- Flags within 2 hours of trend emerging.
- Output: Slack/Telegram ping with trend + suggested poster angle.
- Stack: TikTok trending API → Claude for "is this Kitface-relevant" filter → notification.

### 3. Derby/fixture-driven content agent
- Monitors fixture list. Day before a big match, generates pre-made VS poster templates for both clubs + suggested ad copy.
- Auto-schedules to ad platforms or content queue.

### 4. IP monitoring agent
- Watches for cease-and-desist patterns from Premier League / clubs / kit manufacturers.
- Monitors competitor products for the same IP boundary.
- Flags risk early.

### 5. Customer support / FAQ agent
- Handle "where's my print", "can you do X club", "this kit looks wrong" tickets.
- Escalate the edge cases.

### 6. A/B ad copy generator
- Generate 50 ad variations per club per campaign.
- Feeds Facebook/Meta Ads API.
- Reports back on which variations win, refines.

**Build order:** #2 (trend monitoring) and #3 (derby content) first — they drive growth. #1 (influencer discovery) next. #4 (IP) runs from day one as a passive check.

---

## IP risk — what you actually need to know

**Disclaimer: I'm not a lawyer. Get a sports IP lawyer for a paid hour before you spend on ads. None of the below is legal advice.**

### The risk gradient

- **Generic club colours** — low risk.
- **Recognisable kit pattern, no badge, no sponsor** — medium risk. "Inspired by" zone.
- **Kit pattern + badge** — high risk, especially Premier League.
- **Kit pattern + badge + sponsor + player name** — high risk + multiple rights holders.
- **Retro kits, 30+ years old, no current sponsor, no badge** — generally lower risk on design copyright, but club trademarks (name, badge) still apply. [Inference]

### Your routes forward

1. **Stay clearly in fan-art / parody zone.** No badge reproduction, no sponsor, generic-pattern kits. Lower revenue ceiling, lower risk.
2. **License with the Premier League / individual clubs.** High cost, high friction, very hard. Realistic only at scale.
3. **Start with lower-tier and non-league clubs** that are more open to partnerships. Wrexham route. Get a few real licensing deals on the books.
4. **Hybrid:** Fan-art for top tier, licensed for lower tier + retro.

### Specific actions

- [ ] Audit every current poster on the landing page for badge/sponsor reproduction.
- [ ] Engage a sports IP lawyer for a 1-hour consult. Budget: £200–500.
- [ ] Decide your IP posture *before* the first paid ad spend.
- [ ] Document the design language so it's defensible as "official-style fan art" if challenged.

**This is the single highest-risk item on the board. Resolve it before scaling.**

---

## To-do list

### This week (concept → first prototype)

- [ ] Sketch the VS poster generative prompt and test on 3 image gen models (Flux Pro, Imagen, Nano Banana). Pick the cheapest one that delivers acceptable quality.
- [ ] Test SeaDance with the static output to confirm the animation pipeline works.
- [ ] Watermark spec: bottom-right, ~6% of poster height, semi-transparent, white or kit-contrasting colour.
- [ ] Book the IP lawyer call.
- [ ] Write the birth-year onboarding question + era mapping logic as a spec doc.

### Next 2–4 weeks (build sprint)

- [ ] Ship the freemium → paid watermark flow.
- [ ] Build VS mode as a first-class flow, not a secondary option.
- [ ] Integrate Prodigi or Gelato for print fulfilment. Test order one of your own posters end-to-end.
- [ ] Build the WhatsApp direct-share flow.
- [ ] Stand up the trend monitoring agent (n8n + Claude).

### Month 2 (soft launch)

- [ ] 20–30 fan account TikTokers per club identified, outreach sent.
- [ ] First £100 ad test: VS mode creative, Instagram Reels + Facebook, two cohorts.
- [ ] Squad/family mode in beta.
- [ ] Retro pack 1: 1990s.
- [ ] Age-to-era mapping live.

### Month 3 (scale + iterate)

- [ ] Print fulfilment live.
- [ ] Greeting card mode for Q4 Christmas push.
- [ ] Influencer discovery agent producing weekly lists.
- [ ] First B2B / club partnership conversation (start with one non-league club).
- [ ] Result/scoreboard overlay feature.

---

## Generative prompts

### Static VS poster — image generation prompt

Use this as the system/base prompt, with variables for the two figures and clubs:

```
Generate a professional pre-match football graphic in the style of a 
Premier League or Sky Sports broadcast intro. Square 1:1 format, 1080x1080.

LAYOUT:
- Left half: full-body figure of {FIGURE_1_DESCRIPTION} wearing 
  {CLUB_1_KIT_DESCRIPTION}, facing slightly toward centre, arms by sides, 
  confident stance, dramatic lighting from upper-left.
- Right half: full-body figure of {FIGURE_2_DESCRIPTION} wearing 
  {CLUB_2_KIT_DESCRIPTION}, facing slightly toward centre, mirrored stance, 
  dramatic lighting from upper-right.
- Centre: large "VS" typography, condensed bold sans-serif, white with 
  subtle gold or silver outline, slight motion blur or glow effect.
- Top: small kickoff/match info bar (date + venue text optional).
- Bottom-right: small "kitface.app" watermark, white, 70% opacity, 
  small but legible, lower-right corner inside a 24px safe margin.

BACKGROUND:
- Gradient split: {CLUB_1_PRIMARY_COLOUR} on left half fading to 
  {CLUB_2_PRIMARY_COLOUR} on right half.
- Subtle stadium silhouette in background, low contrast.
- Light particle/dust haze in the air for atmosphere.

STYLE:
- Cinematic, broadcast-quality, sports-graphic-design aesthetic.
- High contrast, dramatic, no cartoon, no illustration style.
- Faces of the figures should be clear and recognisable — use the 
  uploaded reference photos as the source.
- No team badges, no sponsor logos, no copyrighted marks.

QUALITY:
- Sharp focus on figures.
- No text errors. "VS" must be exactly those two letters.
- Watermark text must read exactly "kitface.app".
```

### Animation prompt — SeaDance / image-to-video

Pass the static poster as input image with this prompt:

```
Subtle 3-second cinematic animation of a pre-match football graphic.

MOTION:
- Both figures shift weight slightly, slow micro-movements, breathing 
  motion. Hold confident stance, do not change pose dramatically.
- "VS" letters in centre pulse with a soft glow — brightness rises and 
  falls once over 3 seconds.
- Background particles drift slowly upward.
- Camera holds static or applies very subtle slow zoom-in (no more than 
  5% over the full 3 seconds).
- Lighting on figures pulses gently with the "VS" glow.

CONSTRAINTS:
- Do NOT change the composition.
- Do NOT alter the figures' kit colours or patterns.
- Do NOT move or distort the kitface.app watermark.
- Maintain sharp focus on both figures throughout.
- Loop-friendly — first and last frames should match closely.

DURATION: 3 seconds.
ASPECT RATIO: 1:1, 1080x1080.
```

### Squad / family mode — image generation prompt (v2 spec)

```
Generate a professional team-photo-style football graphic for a family 
or friend group of {N} people.

LAYOUT:
- All {N} figures arranged in a single row (if 3–5 people) or two rows 
  (if 6–8 people), classic team photo composition.
- Each figure wearing {CLUB_KIT_DESCRIPTION}. Front row crouching, back 
  row standing if two rows.
- Slight scale variation if family group includes children (preserve 
  natural height differences from reference photos).
- All figures facing camera, confident expression.

BACKGROUND:
- Stadium pitch with tunnel or trophy backdrop, broadcast quality.
- Soft stadium lighting, late golden hour.
- {CLUB_PRIMARY_COLOUR} accent lighting on the edges.

TEXT (optional, controlled by user):
- Top: large headline text — e.g. "{FAMILY_NAME} FC" or "{GROUP_NAME}" — 
  condensed bold sans-serif, kit-contrasting colour.
- Bottom: small subtitle line, e.g. "Squad 2026" or custom.
- Bottom-right: kitface.app watermark, 70% opacity, white, small.

STYLE:
- Official team-photo aesthetic.
- Cinematic but warm — family/friendship feel, not aggressive.
- Face fidelity to reference photos is critical for all figures.
- No badges, no sponsors, no copyrighted marks.
```

---

## Open questions for Jim

- What's the build stack for the app itself? (Next.js? Native? PWA?)
- Who owns the image generation cost per poster, and what's the unit economics target?
- Is there a target launch date or is this driven by readiness?
- Any existing fan account relationships from your network worth seeding first?
- Do you want women's football in v2 or v3?

---

*End of doc. Iterate freely.*
