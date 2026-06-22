const DEFAULT_GREETING_CARD_SKU = "GLOBAL-GRE-MOH-7X5-DIR";
const DEFAULT_POSTER_SKU = "ART-FAP-BAP-A3";
const DEFAULT_MUG_SKU = "H-MUG-W";
const DEFAULT_STICKER_SKU = "M-STI-3X4";
const DEFAULT_MAGNET_SKU = "MAG-1-10X10";

export type ProdigiProductOptionId =
  | "fathers-day-card"
  | "birthday-card"
  | "download"
  | "mug"
  | "sticker"
  | "magnet"
  | "poster";

export type ProdigiRecipient = {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrCounty?: string;
  countryCode: string;
  postalOrZipCode: string;
  email?: string;
  phoneNumber?: string;
};

export type ProdigiOrderInput = {
  externalId?: string; // This will map to merchantReference
  recipient: ProdigiRecipient;
  sku: string;
  printReadyImageURL: string;
  quantity?: number;
};

export type ProdigiOrderResponse = {
  id: string;
  status?: string;
  raw: unknown;
};

type ProdigiOrderPayload = {
  merchantReference?: string;
  shippingMethod: string;
  recipient: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      townOrCity: string;
      stateOrCounty?: string;
      countryCode: string;
      postalOrZipCode: string;
    };
    email?: string;
    phoneNumber?: string;
  };
  items: Array<{
    merchantReference?: string;
    sku: string;
    copies: number;
    sizing: string;
    assets: Array<{
      printArea: string;
      url: string;
    }>;
  }>;
};

export function buildProdigiOrderPayload(input: ProdigiOrderInput): ProdigiOrderPayload {
  return {
    merchantReference: input.externalId,
    shippingMethod: "Budget",
    recipient: {
      name: input.recipient.name,
      address: {
        line1: input.recipient.addressLine1,
        line2: input.recipient.addressLine2 || undefined,
        townOrCity: input.recipient.city,
        stateOrCounty: input.recipient.stateOrCounty || undefined,
        countryCode: input.recipient.countryCode,
        postalOrZipCode: input.recipient.postalOrZipCode
      },
      email: input.recipient.email || undefined,
      phoneNumber: input.recipient.phoneNumber || undefined
    },
    items: [
      {
        merchantReference: input.externalId ? `${input.externalId}-item-1` : undefined,
        sku: input.sku,
        copies: input.quantity ?? 1,
        sizing: "fillPrintArea",
        assets: [
          {
            printArea: "default",
            url: input.printReadyImageURL
          }
        ]
      }
    ]
  };
}

export class ProdigiFulfillmentProvider {
  private readonly apiKey?: string;
  private readonly apiUrl?: string;

  constructor(
    apiKey = process.env.PRODIGI_API_KEY,
    apiUrl = process.env.PRODIGI_API_URL || "https://api.sandbox.prodigi.com/v4.0"
  ) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async createOrder(input: ProdigiOrderInput): Promise<ProdigiOrderResponse> {
    if (!this.apiKey) {
      throw new Error("PRODIGI_API_KEY is not configured.");
    }

    const url = `${this.apiUrl}/Orders`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildProdigiOrderPayload(input))
    });

    interface ProdigiApiResponse {
      outcome?: string;
      error?: { message?: string };
      order?: {
        id?: string;
        status?: { stage?: string };
      };
    }

    const data = (await response.json().catch(() => null)) as ProdigiApiResponse | null;

    if (!response.ok) {
      const errorMessage = data?.outcome || data?.error?.message || `Prodigi request failed with status ${response.status}.`;
      throw new Error(errorMessage);
    }

    const orderId = data?.order?.id;
    if (!orderId) {
      throw new Error("Prodigi created order but did not return an order id in response.");
    }

    return {
      id: orderId,
      status: data?.order?.status?.stage,
      raw: data
    };
  }
}

export function isProdigiCardOption(optionId?: string) {
  return optionId === "fathers-day-card" || optionId === "birthday-card";
}

export function isProdigiPhysicalOption(optionId?: string) {
  return optionId === "poster" || optionId === "mug" || optionId === "sticker" || optionId === "magnet" || isProdigiCardOption(optionId);
}

export function readProdigiDraftOrderConfig(optionId: ProdigiProductOptionId = "birthday-card") {
  return {
    ...readProdigiProductConfig(optionId),
    recipient: readProdigiRecipient()
  };
}

export function readProdigiProductConfig(optionId: ProdigiProductOptionId = "birthday-card") {
  if (isProdigiCardOption(optionId)) {
    return {
      sku: process.env.PRODIGI_CARD_SKU || DEFAULT_GREETING_CARD_SKU,
      productType: "card"
    };
  }

  if (optionId === "mug") {
    return {
      sku: process.env.PRODIGI_MUG_SKU || DEFAULT_MUG_SKU,
      productType: "mug"
    };
  }

  if (optionId === "sticker") {
    return {
      sku: process.env.PRODIGI_STICKER_SKU || DEFAULT_STICKER_SKU,
      productType: "sticker"
    };
  }

  if (optionId === "magnet") {
    return {
      sku: process.env.PRODIGI_MAGNET_SKU || DEFAULT_MAGNET_SKU,
      productType: "magnet"
    };
  }

  return {
    sku: process.env.PRODIGI_POSTER_SKU || DEFAULT_POSTER_SKU,
    productType: "poster"
  };
}

function readProdigiRecipient(): ProdigiRecipient {
  const rawRecipient = process.env.PRODIGI_TEST_RECIPIENT_JSON;

  if (rawRecipient) {
    const parsed = JSON.parse(rawRecipient) as ProdigiRecipient;
    assertRecipient(parsed);
    return parsed;
  }

  // Fallback to separate env fields mapping to Prodigi structure
  const recipient = {
    name: process.env.PRINTFUL_TEST_RECIPIENT_NAME || "John Doe",
    addressLine1: process.env.PRINTFUL_TEST_RECIPIENT_ADDRESS1 || "123 Test St",
    addressLine2: process.env.PRINTFUL_TEST_RECIPIENT_ADDRESS2,
    city: process.env.PRINTFUL_TEST_RECIPIENT_CITY || "London",
    stateOrCounty: process.env.PRINTFUL_TEST_RECIPIENT_STATE_CODE,
    countryCode: process.env.PRINTFUL_TEST_RECIPIENT_COUNTRY_CODE || "GB",
    postalOrZipCode: process.env.PRINTFUL_TEST_RECIPIENT_ZIP || "SW1A 1AA",
    phoneNumber: process.env.PRINTFUL_TEST_RECIPIENT_PHONE,
    email: process.env.PRINTFUL_TEST_RECIPIENT_EMAIL || "test@example.com"
  };

  assertRecipient(recipient);
  return recipient;
}

function assertRecipient(recipient: Partial<ProdigiRecipient>): asserts recipient is ProdigiRecipient {
  const missingFields = ["name", "addressLine1", "city", "countryCode", "postalOrZipCode"].filter((field) => {
    const value = recipient[field as keyof ProdigiRecipient];
    return typeof value !== "string" || !value.trim();
  });

  if (missingFields.length > 0) {
    throw new Error(`Prodigi test recipient is missing: ${missingFields.join(", ")}.`);
  }
}
