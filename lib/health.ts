export type HealthStatus = "ok" | "degraded";

export type HealthCheck = {
  name: string;
  status: HealthStatus;
  message?: string;
};

export type HealthResponse = {
  app: "kitface";
  status: HealthStatus;
  timestamp: string;
  deployment: {
    environment: string;
    gitSha: string | null;
    region: string | null;
  };
  checks: HealthCheck[];
};

const REQUIRED_SERVER_ENV = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "MUAPI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET"
] as const;

export function isHealthTokenAuthorized(secret: string | undefined, token: string | null) {
  return Boolean(secret && token && secret === token);
}

export function getRequiredEnvironmentChecks(env: Partial<NodeJS.ProcessEnv> = process.env): HealthCheck[] {
  return REQUIRED_SERVER_ENV.map((name) => ({
    name: `env:${name}`,
    status: env[name] ? "ok" : "degraded",
    message: env[name] ? undefined : "Missing required production environment variable."
  }));
}

export function buildHealthResponse(input: {
  checks?: HealthCheck[];
  env?: Partial<NodeJS.ProcessEnv>;
  now?: Date;
} = {}): HealthResponse {
  const env = input.env ?? process.env;
  const checks = input.checks ?? [];
  const status: HealthStatus = checks.every((check) => check.status === "ok") ? "ok" : "degraded";

  return {
    app: "kitface",
    status,
    timestamp: (input.now ?? new Date()).toISOString(),
    deployment: {
      environment: env.VERCEL_ENV ?? env.NODE_ENV ?? "unknown",
      gitSha: env.VERCEL_GIT_COMMIT_SHA ?? null,
      region: env.VERCEL_REGION ?? null
    },
    checks
  };
}
