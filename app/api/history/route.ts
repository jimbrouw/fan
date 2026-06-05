import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type GenerationJobRow = {
  id: string;
  team_name: string;
  kit_notes: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  error: string | null;
  created_at: string;
};

type NotificationRow = {
  action_url: string | null;
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  const message = error.message ?? "";
  return (
    new RegExp(`Could not find the '${column}' column`, "i").test(message) ||
    new RegExp(`column .*\\.${column} does not exist`, "i").test(message)
  );
}

function jobIdFromActionUrl(actionUrl: string | null) {
  if (!actionUrl) return null;

  const match = actionUrl.match(/^\/result\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function mergeJobs(jobs: GenerationJobRow[]) {
  const byId = new Map<string, GenerationJobRow>();

  for (const job of jobs) {
    byId.set(job.id, job);
  }

  return Array.from(byId.values()).sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view poster history." }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const selectColumns = "id, team_name, kit_notes, status, output_url, error, created_at";

  const notificationRows = await supabase
    .from("notifications")
    .select("action_url")
    .eq("user_id", user.id)
    .eq("channel", "in_app")
    .in("type", ["image_completed", "image_failed"])
    .returns<NotificationRow[]>();

  if (notificationRows.error) {
    if (
      notificationRows.error.code !== "PGRST205" &&
      !/Could not find the table 'public\.notifications'/i.test(notificationRows.error.message)
    ) {
      return NextResponse.json({ error: notificationRows.error.message }, { status: 500 });
    }
  }

  const notifiedJobIds = Array.from(
    new Set((notificationRows.data ?? []).map((notification) => jobIdFromActionUrl(notification.action_url)).filter(Boolean))
  ) as string[];

  const jobs: GenerationJobRow[] = [];
  const ownedJobs = await supabase
    .from("generation_jobs")
    .select(selectColumns)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<GenerationJobRow[]>();

  if (!ownedJobs.error) {
    jobs.push(...(ownedJobs.data ?? []));
  } else if (!isMissingSchemaColumn(ownedJobs.error, "user_id")) {
    return NextResponse.json({ error: ownedJobs.error.message }, { status: 500 });
  }

  if (notifiedJobIds.length > 0) {
    const notifiedJobs = await supabase
      .from("generation_jobs")
      .select(selectColumns)
      .in("id", notifiedJobIds)
      .order("created_at", { ascending: false })
      .returns<GenerationJobRow[]>();

    if (notifiedJobs.error) {
      return NextResponse.json({ error: notifiedJobs.error.message }, { status: 500 });
    }

    jobs.push(...(notifiedJobs.data ?? []));
  }

  return NextResponse.json({ jobs: mergeJobs(jobs) });
}
