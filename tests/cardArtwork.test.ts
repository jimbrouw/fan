import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import {
  buildProdigiGreetingCardArtwork,
  PRODIGI_DIRECT_CARD_HEIGHT,
  PRODIGI_DIRECT_CARD_WIDTH,
} from "../lib/fulfillment/cardArtwork.ts";

test("buildProdigiGreetingCardArtwork uses only the outer-right and inner-right panels", async () => {
  const poster = await sharp({
    create: {
      width: 900,
      height: 1200,
      channels: 3,
      background: "#e11d48",
    },
  })
    .jpeg()
    .toBuffer();

  const artwork = await buildProdigiGreetingCardArtwork({
    poster,
    message: "Happy birthday from Kitface!",
  });
  const metadata = await sharp(artwork).metadata();

  assert.equal(metadata.width, PRODIGI_DIRECT_CARD_WIDTH);
  assert.equal(metadata.height, PRODIGI_DIRECT_CARD_HEIGHT);
  assert.equal(metadata.density, 300);

  const panels = await Promise.all(
    [0, 1, 2, 3].map(async (panelIndex) => {
      const left = Math.round((PRODIGI_DIRECT_CARD_WIDTH * panelIndex) / 4);
      const right = Math.round((PRODIGI_DIRECT_CARD_WIDTH * (panelIndex + 1)) / 4);
      const inset = 10;
      const panel = await sharp(artwork)
        .extract({
          left: left + inset,
          top: inset,
          width: right - left - inset * 2,
          height: PRODIGI_DIRECT_CARD_HEIGHT - inset * 2,
        })
        .toBuffer();
      return sharp(panel).stats();
    })
  );

  assert.ok(panels[0].channels.every((channel) => channel.mean > 254), "outer-left should be blank");
  assert.ok(panels[1].channels[1].mean < 150, "outer-right should contain the poster");
  assert.ok(panels[2].channels.every((channel) => channel.mean > 254), "inner-left should be blank");
  assert.ok(panels[3].channels.some((channel) => channel.mean < 254), "inner-right should contain the message");
});

test("buildProdigiGreetingCardArtwork leaves both inside panels blank without a message", async () => {
  const poster = await sharp({
    create: { width: 600, height: 800, channels: 3, background: "#0891b2" },
  })
    .png()
    .toBuffer();
  const artwork = await buildProdigiGreetingCardArtwork({ poster });
  const innerLeft = Math.round(PRODIGI_DIRECT_CARD_WIDTH / 2) + 10;
  const inside = await sharp(artwork)
    .extract({
      left: innerLeft,
      top: 10,
      width: PRODIGI_DIRECT_CARD_WIDTH - innerLeft - 10,
      height: PRODIGI_DIRECT_CARD_HEIGHT - 20,
    })
    .toBuffer();
  const stats = await sharp(inside).stats();

  assert.ok(stats.channels.every((channel) => channel.mean > 254));
});
