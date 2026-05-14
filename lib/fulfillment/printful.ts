const PRINTFUL_API_BASE_URL = "https://api.printful.com/v2";

export type PrintfulRecipient = {
  name?: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  state_name?: string;
  country_code: string;
  country_name?: string;
  zip: string;
  phone?: string;
  email?: string;
};

export type PrintfulDraftOrderInput = {
  externalId?: string;
  recipient: PrintfulRecipient;
  catalogVariantId: number;
  printFileUrl: string;
  quantity?: number;
  placement?: string;
  technique?: string;
};

export type PrintfulDraftOrderResponse = {
  id: string | number;
  status?: string;
  raw: unknown;
};

type PrintfulOrderPayload = {
  external_id?: string;
  recipient: PrintfulRecipient;
  order_items: Array<{
    catalog_variant_id: number;
    source: "catalog";
    quantity: number;
    placements: Array<{
      placement: string;
      technique: string;
      layers: Array<{
        type: "file";
        url: string;
      }>;
    }>;
  }>;
};

type PrintfulApiError = {
  detail?: string;
  title?: string;
  message?: string;
  error?: string;
};

export function buildPrintfulDraftOrderPayload(input: PrintfulDraftOrderInput): PrintfulOrderPayload {
  return {
    external_id: input.externalId,
    recipient: input.recipient,
    order_items: [
      {
        catalog_variant_id: input.catalogVariantId,
        source: "catalog",
        quantity: input.quantity ?? 1,
        placements: [
          {
            placement: input.placement ?? "default",
            technique: input.technique ?? "digital",
            layers: [
              {
                type: "file",
                url: input.printFileUrl
              }
            ]
          }
        ]
      }
    ]
  };
}

export class PrintfulFulfillmentProvider {
  private readonly apiToken?: string;

  constructor(apiToken = process.env.PRINTFUL_API_TOKEN) {
    this.apiToken = apiToken;
  }

  async createDraftOrder(input: PrintfulDraftOrderInput): Promise<PrintfulDraftOrderResponse> {
    if (!this.apiToken) {
      throw new Error("PRINTFUL_API_TOKEN is not configured.");
    }

    const response = await fetch(`${PRINTFUL_API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildPrintfulDraftOrderPayload(input))
    });

    const data = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new Error(getPrintfulErrorMessage(data, response.status));
    }

    const order = extractPrintfulOrder(data);

    if (!order?.id) {
      throw new Error("Printful created a draft order but did not return an order id.");
    }

    return {
      id: order.id,
      status: order.status,
      raw: data
    };
  }
}

export function readPrintfulDraftOrderConfig() {
  const catalogVariantId = Number(process.env.PRINTFUL_POSTER_VARIANT_ID);

  if (!Number.isInteger(catalogVariantId) || catalogVariantId <= 0) {
    throw new Error("PRINTFUL_POSTER_VARIANT_ID must be configured as a positive integer.");
  }

  return {
    catalogVariantId,
    placement: process.env.PRINTFUL_POSTER_PLACEMENT || "default",
    technique: process.env.PRINTFUL_POSTER_TECHNIQUE || "digital",
    recipient: readPrintfulRecipient()
  };
}

function readPrintfulRecipient(): PrintfulRecipient {
  const rawRecipient = process.env.PRINTFUL_TEST_RECIPIENT_JSON;

  if (rawRecipient) {
    const parsed = JSON.parse(rawRecipient) as PrintfulRecipient;
    assertRecipient(parsed);
    return parsed;
  }

  const recipient = {
    name: process.env.PRINTFUL_TEST_RECIPIENT_NAME,
    address1: process.env.PRINTFUL_TEST_RECIPIENT_ADDRESS1,
    address2: process.env.PRINTFUL_TEST_RECIPIENT_ADDRESS2,
    city: process.env.PRINTFUL_TEST_RECIPIENT_CITY,
    state_code: process.env.PRINTFUL_TEST_RECIPIENT_STATE_CODE,
    country_code: process.env.PRINTFUL_TEST_RECIPIENT_COUNTRY_CODE,
    zip: process.env.PRINTFUL_TEST_RECIPIENT_ZIP,
    phone: process.env.PRINTFUL_TEST_RECIPIENT_PHONE,
    email: process.env.PRINTFUL_TEST_RECIPIENT_EMAIL
  };

  assertRecipient(recipient);
  return recipient;
}

function assertRecipient(recipient: Partial<PrintfulRecipient>): asserts recipient is PrintfulRecipient {
  const missingFields = ["address1", "city", "country_code", "zip"].filter((field) => {
    const value = recipient[field as keyof PrintfulRecipient];
    return typeof value !== "string" || !value.trim();
  });

  if (missingFields.length > 0) {
    throw new Error(`Printful test recipient is missing: ${missingFields.join(", ")}.`);
  }
}

function extractPrintfulOrder(data: unknown): { id?: string | number; status?: string } | null {
  if (!data || typeof data !== "object") return null;
  const maybeData = "data" in data ? (data as { data?: unknown }).data : data;
  if (!maybeData || typeof maybeData !== "object") return null;
  return maybeData as { id?: string | number; status?: string };
}

function getPrintfulErrorMessage(data: unknown, status: number) {
  if (data && typeof data === "object") {
    const error = data as PrintfulApiError;
    return error.detail ?? error.title ?? error.message ?? error.error ?? `Printful request failed with status ${status}.`;
  }

  return `Printful request failed with status ${status}.`;
}
