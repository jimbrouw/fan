import { NextResponse } from "next/server";
import { buildHealthResponse, getRequiredEnvironmentChecks, isHealthTokenAuthorized, type HealthCheck } from "@/lib/health";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wantsDeepCheck = url.searchParams.get("deep") === "1";
  const healthSecret = process.env.KITFACE_HEALTH_CHECK_SECRET;
  const token = request.headers.get("x-kitface-health-token");

  const checks: HealthCheck[] = [{ name: "app", status: "ok" }];

  if (wantsDeepCheck) {
    if (!isHealthTokenAuthorized(healthSecret, token)) {
      return NextResponse.json({ error: "Unauthorized health check." }, { status: 401 });
    }

    checks.push(...getRequiredEnvironmentChecks());
    checks.push(await checkSupabase());
  }

  const body = buildHealthResponse({ checks });
  return NextResponse.json(body, {
    status: body.status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

async function checkSupabase(): Promise<HealthCheck> {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("generation_jobs").select("id").limit(1);

    if (error) {
      return {
        name: "supabase:generation_jobs",
        status: "degraded",
        message: error.message
      };
    }

    return { name: "supabase:generation_jobs", status: "ok" };
  } catch (error) {
    return {
      name: "supabase:generation_jobs",
      status: "degraded",
      message: error instanceof Error ? error.message : "Unknown Supabase health check failure."
    };
  }
}
