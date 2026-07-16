type PhysicalFulfillmentEnv = {
  PRODIGI_FULFILLMENT_ENABLED?: string;
};

export function isPhysicalFulfillmentEnabled(env: PhysicalFulfillmentEnv = process.env as PhysicalFulfillmentEnv) {
  return env.PRODIGI_FULFILLMENT_ENABLED === "1";
}
