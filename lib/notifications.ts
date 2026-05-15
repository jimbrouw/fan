import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NotificationType = "image_completed" | "image_failed" | "video_completed" | "video_failed";

type NotifyInput = {
  userId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  eventKey: string;
};

type UserPreferenceRow = {
  email_enabled: boolean;
  push_enabled: boolean;
};

type UserRow = {
  email: string;
};

export async function notifyUser(input: NotifyInput) {
  if (!input.userId) return;

  await createInAppNotification(input);
  await sendEmailNotification(input);
  await sendWebPushNotification(input);
}

async function createInAppNotification(input: NotifyInput) {
  const supabase = createServerSupabaseClient();
  const result = await supabase.from("notifications").upsert(
    {
      id: crypto.randomUUID(),
      user_id: input.userId,
      event_key: `${input.eventKey}:in_app`,
      channel: "in_app",
      type: input.type,
      title: input.title,
      body: input.body,
      action_url: input.actionUrl ?? null,
      sent_at: new Date().toISOString(),
    },
    { onConflict: "event_key", ignoreDuplicates: true }
  );

  if (result.error) {
    console.error("In-app notification failed:", result.error.message);
  }
}

async function sendEmailNotification(input: NotifyInput) {
  const supabase = createServerSupabaseClient();
  const { data: preferences } = await supabase
    .from("user_notification_preferences")
    .select("email_enabled,push_enabled")
    .eq("user_id", input.userId)
    .single<UserPreferenceRow>();

  if (preferences && !preferences.email_enabled) return;

  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("id", input.userId)
    .single<UserRow>();

  if (!user?.email) return;

  const eventKey = `${input.eventKey}:email`;
  const inserted = await supabase
    .from("notifications")
    .insert({
      id: crypto.randomUUID(),
      user_id: input.userId,
      event_key: eventKey,
      channel: "email",
      type: input.type,
      title: input.title,
      body: input.body,
      action_url: input.actionUrl ?? null,
    })
    .select("id")
    .single<{ id: string }>();

  if (inserted.error) {
    if (inserted.error.code !== "23505") {
      console.error("Email notification record failed:", inserted.error.message);
    }
    return;
  }

  try {
    await sendTransactionalEmail({
      to: user.email,
      subject: input.title,
      text: `${input.body}${input.actionUrl ? `\n\n${input.actionUrl}` : ""}`,
    });

    await supabase
      .from("notifications")
      .update({ sent_at: new Date().toISOString(), error: null })
      .eq("id", inserted.data.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed.";
    await supabase
      .from("notifications")
      .update({ error: message })
      .eq("id", inserted.data.id);
    console.error("Email notification failed:", message);
  }
}

async function sendWebPushNotification(input: NotifyInput) {
  const supabase = createServerSupabaseClient();
  const { data: preferences } = await supabase
    .from("user_notification_preferences")
    .select("email_enabled,push_enabled")
    .eq("user_id", input.userId)
    .single<UserPreferenceRow>();

  if (!preferences?.push_enabled) return;

  const result = await supabase.from("notifications").upsert(
    {
      id: crypto.randomUUID(),
      user_id: input.userId,
      event_key: `${input.eventKey}:push`,
      channel: "push",
      type: input.type,
      title: input.title,
      body: input.body,
      action_url: input.actionUrl ?? null,
      error: "Web push adapter is reserved for a future subscription-backed implementation.",
    },
    { onConflict: "event_key", ignoreDuplicates: true }
  );

  if (result.error) {
    console.error("Push notification record failed:", result.error.message);
  }
}

async function sendTransactionalEmail(input: { to: string; subject: string; text: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM ?? "Kitface <notifications@kitface.app>";

  if (!resendApiKey) {
    console.info(`Email notification skipped for ${input.to}: RESEND_API_KEY is not configured.`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: input.to,
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email failed: ${response.status} ${await response.text()}`);
  }
}
