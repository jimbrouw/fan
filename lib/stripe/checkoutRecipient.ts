import type Stripe from "stripe";
import type { ProdigiRecipient } from "@/lib/fulfillment/prodigi";

export function buildProdigiRecipient(session: Stripe.Checkout.Session): ProdigiRecipient {
  const sessionObj = session as unknown as {
    collected_information?: {
      shipping_details?: {
        name?: string;
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          country?: string;
          postal_code?: string;
        };
      };
    };
    shipping_details?: {
      name?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        country?: string;
        postal_code?: string;
      };
    };
    customer_details?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        country?: string;
        postal_code?: string;
      };
    };
  };
  const shipping = sessionObj.collected_information?.shipping_details || sessionObj.shipping_details;
  const customerDetails = sessionObj.customer_details;
  const address = shipping?.address || customerDetails?.address;
  const name = shipping?.name || customerDetails?.name;

  if (!name || !address?.line1 || !address.city || !address.country || !address.postal_code) {
    throw new Error("Stripe checkout session is missing a complete shipping address.");
  }

  return {
    name,
    addressLine1: address.line1,
    addressLine2: address.line2 ?? undefined,
    city: address.city,
    stateOrCounty: address.state ?? undefined,
    countryCode: address.country,
    postalOrZipCode: address.postal_code,
    phoneNumber: customerDetails?.phone ?? undefined,
    email: customerDetails?.email ?? undefined
  };
}
