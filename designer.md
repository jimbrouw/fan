# Kitface Design, UX, Accessibility, And Marketing Review

Review date: June 10, 2026
Live app reviewed: https://app.kitface.app
Primary viewport checks: 390x844 and 360x740 mobile browser
Evidence screenshots: `design-extract-output/designer-review/`

## Executive Call

Ready for paid traffic: **Not yet**.

Kitface has a strong enough visual direction to build from: light canvas, deep indigo type, cyan CTAs, and a poster-led homepage all feel more like football media than a generic AI tool. The blocker is not brand direction. The main paid-traffic risks are conversion clarity and trust: the homepage does not explain the photo -> kit -> poster flow fast enough, the small-phone hero preview can look blank before the poster content appears, `/create` asks for many decisions before the user sees progress, result/upgrade language is inconsistent, and the paid offer includes copy that overclaims privacy/longevity.

## Top 10 Ranked Todos

1. **P0 - Make first-time onboarding clearer before sign-in**
   - Evidence: homepage says "Pick your kit. Make it yours." with supporting copy, but it does not explain the exact 3-step promise: photo, kit, poster.
   - Todo: replace or augment homepage copy with a simple sequence: "Upload two photos. Pick a team. Get an official-style poster."
   - Suggested CTA: "Make my poster" instead of "Start now".
   - Screenshot: `01-home-mobile.png`, `09-home-small-phone-cropped-preview.png`.

2. **P0 - Fix small-phone homepage preview cropping**
   - Evidence: at 360x740 the hero preview enters the viewport as a mostly blank white card area, so the "wow" proof is delayed.
   - Todo: reduce top vertical space or crop the poster preview higher so a face/shirt is visible in the first viewport on small phones.
   - Screenshot: `09-home-small-phone-cropped-preview.png`.

3. **P1 - Simplify `/create` into a guided setup**
   - Evidence: `/create` shows poster type, team, shirt name, slogan, accessibility option, style cards, photo readiness, and disabled CTA in one long stack before the user has selected a kit.
   - Todo: prioritize required choices first: poster type, team/kit, poster style. Move optional shirt name, slogan, and mobility details into an "Add details" disclosure after required setup.
   - Screenshot: `04-create-mobile.png`.

4. **P1 - Clarify two-photo and VS flows**
   - Evidence: review state shows "Front" and "Smile", while brief says capture currently asks for two photos and VS may require an optional second person. The labels do not explain why each photo matters.
   - Todo: rename the capture steps to user outcomes: "Main photo" and "Expression photo"; for VS, use "Opponent photo" only when "Another person" is selected.
   - Suggested helper: "We use these to keep your face consistent across the poster."

5. **P1 - Make failed generation feel recoverable, not broken**
   - Evidence: generating failure heading is "Provider error."; result fallback says "The image provider hit an internal error."
   - Todo: keep the technical cause in secondary text, not the heading.
   - Suggested heading: "Your poster needs another try."
   - Suggested body: "The image service hit an internal error. Try again with the same photos."
   - Screenshot reference: `05-generating-mobile.png` for waiting-state structure.

6. **P1 - Strengthen result page as the share moment**
   - Evidence: result page structure has useful actions, but the heading "Your poster." is flat and the loading/fallback state looks like a generic empty box.
   - Todo: for completed posters, lead with "Ready for the group chat." or "Your matchday poster is ready."; make Share image the primary action; place WhatsApp beside it; put upgrade below share.
   - Screenshot: `06-result-loading-mobile.png`.

7. **P1 - Rewrite upgrade privacy and value copy**
   - Evidence: upgrade copy says "Full-resolution private file, yours to keep and share forever", which conflicts with the brief's softer privacy constraints.
   - Todo: replace with "Full-resolution file with no Kitface watermark." Replace "Private download link" with "Download link for your order."
   - Screenshot: `07-upgrade-mobile.png`.

8. **P1 - Remove internal fulfillment wording from customer-facing success**
   - Evidence: `/order/success` links to "Check Printful Dashboard", which feels like an operator/admin action, not a customer action.
   - Todo: replace with "View order details" or "Back to your poster"; keep Printful names out of normal customer CTAs unless needed legally.

9. **P2 - Improve accessibility/focus states and disabled-state explanations**
    - Evidence: many controls use `outline-none` and rely on border color only for focus. Disabled CTAs such as "Create poster" do not state what is missing until users read the separate photo box.
    - Todo: add visible `focus-visible` rings, keep 44px minimum targets, and attach disabled help directly near the CTA: "Take photos and choose a kit first."

10. **P2 - Add authenticated camera QA notes instead of treating browser-camera limits as product failure**
    - Evidence: the review browser could not exercise the real authenticated camera flow, but user-confirmed live capture works on device.
    - Todo: keep camera-specific conclusions limited to layout and copy checks unless tested on a signed-in real device with camera permission.

## Direct Answers To Marketing Questions

1. **In 5 seconds, do you know what Kitface does?** Mostly. The supporting line explains it, but the headline does not. Stronger: "Turn your photo into a football poster."
2. **Does it feel fun enough to share?** Potentially yes. The hero poster is funny/shareable; waiting messages are football-native.
3. **Does it feel safe enough to upload a personal photo?** Partly. Privacy page is sensible, but the app should add short in-flow copy like "Photos are used to create your poster."
4. **Does the brand feel football-specific?** Yes, more than a generic AI app, especially the poster art and waiting copy.
5. **Would a parent understand it?** The homepage yes; `/create` less so because "kit", "VS", "same photos", and style options need more guidance.
6. **Would a football fan find it funny/cool rather than embarrassing?** The generated example helps. Some copy like "Provider error" and "Printful Dashboard" breaks the illusion.
7. **Does the upgrade offer feel worth GBP 3.99+?** The no-watermark download could, but the card-first upgrade page muddies the GBP 3.99 anchor.
8. **Is there a clear reason to sign in?** Yes: "Keep your posters" is clear and low-friction.
9. **Is there a clear reason to come back?** Not yet. History exists, but the product needs stronger "make another with these photos", seasonal prompts, club rivalries, or gift moments.

## UX Answers

- **What is confusing in the first 10 seconds?** Whether the first action is choosing a kit or uploading photos. The flow actually starts with sign-in/capture.
- **Where does the user hesitate?** `/create`, because there are many options and the primary CTA is disabled until prerequisites are met.
- **Which CTA labels should change?** "Start now" -> "Make my poster"; "Generate New" -> "Use same photos"; "Redo photos again" -> "Retake photos"; "Try Again" -> "Try again with same photos".
- **Which screens feel least polished?** Loading/fallback result, history CTA area, order success, and the dense `/create` setup.
- **Which copy feels too technical?** "Provider error", "image provider hit an internal error", "Printful Dashboard", "registered as Printful draft orders", "Use latest squad data".
- **Which screens fail on small phones?** Homepage preview crop, `/create` vertical density, capture risk from `100dvh`, and upgrade option density.
- **Where is trust/privacy unclear?** Upgrade download copy overclaims; create/capture could use short "used for posters" reassurance.
- **Where does the app feel most fun?** Hero poster, waiting-state football jokes, and WhatsApp/share intent.
- **Where does it feel least like football media?** Legal/order/admin phrasing and generic fallback boxes.
- **What should be fixed before paid marketing traffic?** First-time homepage clarity, small-phone hero proof, create flow simplification, failed generation recovery, upgrade copy.

## Recommended Copy Changes

| Current | Suggested |
| --- | --- |
| Pick your kit. Make it yours. | Turn your photo into a football poster. |
| Start now | Make my poster |
| Turn your photos into official-style football posters. | Upload two photos, pick a team, and get an official-style poster. |
| Create poster | Make poster |
| Generate New | Use same photos |
| Make another poster with the same photos | Make another with these photos |
| Redo photos again | Retake photos |
| Provider error. | Your poster needs another try. |
| The image provider hit an internal error. | The image service hit an internal error. Try again with the same photos. |
| Upgrade your poster - from GBP 3.99 | Upgrade from GBP 3.99 |
| Full-resolution private file, yours to keep and share forever. | Full-resolution file with no Kitface watermark. |
| Private download link | Download link for your order |
| Check Printful Dashboard | View order details |

## Accessibility Notes

- **Contrast:** Deep indigo on white is strong. Muted lavender text can be low for small helper copy; test `#8C86A3` on white and soft panels before relying on it for critical instructions.
- **Tap targets:** Most buttons are near or above 44px. The checkbox itself is 16px; the label is clickable, which helps, but the visual affordance could be larger.
- **Focus states:** Inputs commonly use `outline-none` and border-only focus. Add clear `focus-visible:ring-2` treatment to buttons, links, inputs, selects, and poster style cards.
- **Screen reader labels:** Icon buttons such as camera flip have labels. Poster style preview graphics are hidden, which is appropriate, but style buttons need concise names and selected states remain important.
- **Disabled states:** Disabled "Create poster" should explain the missing action near the button, not only in a status card above.
- **Reduced motion:** Spinner and waiting-state motion should respect `prefers-reduced-motion`; provide static progress text.
- **Camera usability:** Fixed `100dvh` capture layout should be tested on iPhone Safari with bottom browser chrome, permission prompts, and landscape/keyboard interruptions.
- **Mobility-aid copy:** The current wording is respectful and clear. Better label: "Include my wheelchair or mobility aid". Supporting text: "Show me naturally with it. No forced standing or running poses." This is discoverable without framing disability as an error.

## Visual Design Notes

- The light sports-broadcast direction is coherent and preferable to the old keepsake direction.
- The hero poster is the best brand proof, but it needs to show meaningful content sooner on small phones.
- The abstract poster-style thumbnails on `/create` are functional but not very football-media rich. Consider making them look like broadcast templates with shirt silhouettes, scoreline bars, badges, or stadium lights.
- Cards, borders, and rounded panels are consistent, but the app risks becoming "white cards on light background" in utility screens. Use football-specific microdetails sparingly: badge strips, matchday labels, pitch-line dividers, or broadcast lower-thirds.

## Must Fix Before Launch/Paid Traffic

- Make homepage first viewport explain photo -> kit -> poster.
- Ensure hero preview is visibly a poster on 360px phones.
- Simplify `/create` required path and explain disabled CTA.
- Rewrite failure headings and retry CTAs.
- Remove upgrade overclaims: "private", "forever", and "private download link".
- Replace internal fulfillment/admin copy on order success.

## Nice-To-Have Polish

- Add a "Ready for WhatsApp" result headline after completion.
- Add seasonal/gift prompts on history and upgrade.
- Add compact "how it works" chips under homepage CTA.
- Add richer football poster thumbnails for style choices.
- Add a post-purchase "make one for another fan" CTA with a fresh-photo route.

## Review Limits

I did not sign in, upload personal photos, grant camera permission, complete checkout, or generate a live poster. Auth-gated and job-specific screens were reviewed through direct live URLs with placeholder job IDs plus route code inspection. The browser could not validate the real camera state, and user-confirmed live capture works on device, so camera findings should be treated as layout/copy QA notes only. The real completed-result experience still needs an authenticated device test.
