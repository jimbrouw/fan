import { isProdigiCardOption, type ProdigiProductOptionId } from "@/lib/fulfillment/prodigi";

export type CheckoutProduct = {
  id: ProdigiProductOptionId;
  name: string;
  description: string;
  unitAmount: number;
  currency: "gbp";
  requiresShipping: boolean;
};

export const checkoutProducts: Record<ProdigiProductOptionId, CheckoutProduct> = {
  "fathers-day-card": {
    id: "fathers-day-card",
    name: "Father's Day card",
    description: "Printed 7x5 greeting card with your Kitface poster on the front.",
    unitAmount: 799,
    currency: "gbp",
    requiresShipping: true
  },
  "birthday-card": {
    id: "birthday-card",
    name: "Birthday card",
    description: "Printed 7x5 greeting card with your Kitface poster on the front.",
    unitAmount: 799,
    currency: "gbp",
    requiresShipping: true
  },
  download: {
    id: "download",
    name: "Download - no watermark",
    description: "Full-resolution Kitface poster download without the watermark.",
    unitAmount: 399,
    currency: "gbp",
    requiresShipping: false
  },
  poster: {
    id: "poster",
    name: "A3 poster - delivered",
    description: "A3 enhanced matte paper poster delivered to your door.",
    unitAmount: 2999,
    currency: "gbp",
    requiresShipping: true
  }
};

export function getCheckoutProduct(optionId: ProdigiProductOptionId) {
  return checkoutProducts[optionId];
}

export function isPhysicalCheckoutOption(optionId: ProdigiProductOptionId) {
  return optionId === "poster" || isProdigiCardOption(optionId);
}
