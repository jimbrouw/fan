import { isProdigiPhysicalOption, type ProdigiProductOptionId } from "@/lib/fulfillment/prodigi";

export type CheckoutProduct = {
  id: ProdigiProductOptionId;
  name: string;
  description: string;
  unitAmount: number;
  currency: "gbp";
  requiresShipping: boolean;
};

export const checkoutProducts: Partial<Record<ProdigiProductOptionId, CheckoutProduct>> = {
  "birthday-card": {
    id: "birthday-card",
    name: "Greeting card",
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
  mug: {
    id: "mug",
    name: "11oz mug",
    description: "White ceramic mug printed with your Kitface poster artwork.",
    unitAmount: 1299,
    currency: "gbp",
    requiresShipping: true
  },
  sticker: {
    id: "sticker",
    name: "Sticker",
    description: "Small kiss-cut vinyl sticker printed with your Kitface poster artwork.",
    unitAmount: 499,
    currency: "gbp",
    requiresShipping: true
  },
  magnet: {
    id: "magnet",
    name: "Fridge magnet",
    description: "Square photo magnet printed with your Kitface poster artwork.",
    unitAmount: 699,
    currency: "gbp",
    requiresShipping: true
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
  return isProdigiPhysicalOption(optionId);
}
