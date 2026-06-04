import { isPrintfulCardOption, type PrintfulProductOptionId } from "@/lib/fulfillment/printful";

export type CheckoutProduct = {
  id: PrintfulProductOptionId;
  name: string;
  description: string;
  unitAmount: number;
  currency: "gbp";
  requiresShipping: boolean;
};

export const checkoutProducts: Record<PrintfulProductOptionId, CheckoutProduct> = {
  "fathers-day-card": {
    id: "fathers-day-card",
    name: "Father's Day card",
    description: "Printed 4x6 greeting card with your Kitface poster on the front.",
    unitAmount: 799,
    currency: "gbp",
    requiresShipping: true
  },
  "birthday-card": {
    id: "birthday-card",
    name: "Birthday card",
    description: "Printed 4x6 greeting card with your Kitface poster on the front.",
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

export function getCheckoutProduct(optionId: PrintfulProductOptionId) {
  return checkoutProducts[optionId];
}

export function isPhysicalCheckoutOption(optionId: PrintfulProductOptionId) {
  return optionId === "poster" || isPrintfulCardOption(optionId);
}
