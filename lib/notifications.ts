import { createServerSupabaseClient } from "@/lib/supabase/server";
import webpush from "web-push";

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
  web_push_subscription: Record<string, unknown>;
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.kitface.app";
    const absoluteActionUrl = input.actionUrl
      ? input.actionUrl.startsWith("http")
        ? input.actionUrl
        : `${appUrl}${input.actionUrl}`
      : appUrl;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${input.title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F5F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F5F7; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; border: 1px solid #E4E4E7; overflow: hidden; box-shadow: 0 10px 30px rgba(28, 25, 54, 0.03);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1C1936 0%, #2A2454 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">Kitface</h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #31F0D5; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Official Football Media</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 32px 24px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1C1936; line-height: 1.3;">${input.title}</h2>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #69697A;">${input.body}</p>
                    
                    <!-- CTA Button -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 8px;">
                          <a href="${absoluteActionUrl}" target="_blank" style="display: inline-block; background-color: #00CDAC; color: #1C1936; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 205, 172, 0.25); transition: all 0.2s ease-in-out;">
                            View Poster in App
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px; background-color: #FAFAFB; border-top: 1px solid #E4E4E7; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #9A9AB0; line-height: 1.5;">This email was sent by Kitface because your poster finished generating. Link back to the app: <a href="${appUrl}" style="color: #00CDAC; text-decoration: none; font-weight: 600;">kitface.app</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendTransactionalEmail({
      to: user.email,
      subject: input.title,
      text: `${input.body}${absoluteActionUrl ? `\n\nView details: ${absoluteActionUrl}` : ""}`,
      html: emailHtml,
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
    .select("email_enabled,push_enabled,web_push_subscription")
    .eq("user_id", input.userId)
    .single<UserPreferenceRow>();

  if (!preferences?.push_enabled || !preferences?.web_push_subscription) return;

  const inserted = await supabase.from("notifications").insert(
    {
      id: crypto.randomUUID(),
      user_id: input.userId,
      event_key: `${input.eventKey}:push`,
      channel: "push",
      type: input.type,
      title: input.title,
      body: input.body,
      action_url: input.actionUrl ?? null,
    }
  ).select("id").single<{ id: string }>();

  if (inserted.error) {
    if (inserted.error.code !== "23505") {
      console.error("Push notification record failed:", inserted.error.message);
    }
    return;
  }

  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys not configured");
    }

    webpush.setVapidDetails(
      "mailto:notifications@kitface.app",
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title: input.title,
      body: input.body,
      url: input.actionUrl ?? "/",
    });

    await webpush.sendNotification(preferences.web_push_subscription as unknown as webpush.PushSubscription, payload);

    await supabase
      .from("notifications")
      .update({ sent_at: new Date().toISOString(), error: null })
      .eq("id", inserted.data.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Web push send failed.";
    await supabase
      .from("notifications")
      .update({ error: message })
      .eq("id", inserted.data.id);
    console.error("Web push notification failed:", message);
  }
}

export async function sendTransactionalEmail(input: { to: string; subject: string; text: string; html?: string }) {
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
      html: input.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email failed: ${response.status} ${await response.text()}`);
  }
}
