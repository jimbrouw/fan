import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id,title,body,action_url,read_at,created_at")
    .eq("user_id", user.id)
    .eq("channel", "in_app")
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<NotificationRow[]>();

  if (error) {
    if (error.code === "PGRST205" || /Could not find the table 'public\.notifications'/i.test(error.message)) {
      return NextResponse.json({ notifications: [] });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    notifications: (data ?? []).map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.action_url,
      readAt: notification.read_at,
      createdAt: notification.created_at,
    })),
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to update notifications." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { notificationId?: string };
  if (!body.notificationId) {
    return NextResponse.json({ error: "Missing notificationId." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", body.notificationId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
