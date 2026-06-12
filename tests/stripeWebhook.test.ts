import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { buildProdigiRecipient } from "../lib/stripe/checkoutRecipient.ts";

test("buildProdigiRecipient falls back to completed Checkout customer details", () => {
  const session = {
    customer_details: {
      name: "Test Customer",
      email: "test@example.com",
      phone: "07123456789",
      address: {
        line1: "10 Downing Street",
        city: "London",
        country: "GB",
        postal_code: "SW1A 2AA",
      },
    },
  } as Stripe.Checkout.Session;

  assert.deepEqual(buildProdigiRecipient(session), {
    name: "Test Customer",
    addressLine1: "10 Downing Street",
    addressLine2: undefined,
    city: "London",
    stateOrCounty: undefined,
    countryCode: "GB",
    postalOrZipCode: "SW1A 2AA",
    phoneNumber: "07123456789",
    email: "test@example.com",
  });
});
