import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SMTP_HOST = Deno.env.get("SMTP_HOST") || "mail.aycorp.id";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface SubscriptionExpiringUser {
  email: string;
  display_name: string | null;
  subscription_ends_at: string;
}

async function sendReminderEmail(user: SubscriptionExpiringUser): Promise<boolean> {
  const client = new SmtpClient();

  try {
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASSWORD,
    });

    const displayName = user.display_name || "there";
    const expiryDate = new Date(user.subscription_ends_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
    .content { background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px; }
    .highlight { color: #6366f1; font-weight: 600; }
    .footer { text-align: center; font-size: 14px; color: #6b7280; margin-top: 30px; }
    .cta { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">focuu</div>
  </div>
  
  <div class="content">
    <p>Hey ${displayName} 👋</p>
    
    <p>Just a friendly heads up — your <span class="highlight">focuu Pro</span> subscription will end tomorrow, <strong>${expiryDate}</strong>.</p>
    
    <p>No pressure at all! focuu will still be here for you, and you can always come back to Pro whenever you're ready.</p>
    
    <p>In the meantime, maybe today's a good day for one more deep work session? 💪</p>
    
    <p>Keep focusing on what matters,<br>— The focuu team</p>
  </div>
  
  <div class="footer">
    <p>You're receiving this because you have an active focuu Pro subscription.</p>
    <p>focuu — Your space to focus.</p>
  </div>
</body>
</html>
    `.trim();

    await client.send({
      from: "focuu@aycorp.id",
      to: user.email,
      subject: "Your focuu Pro ends tomorrow — no pressure 🌿",
      content: emailBody,
      html: emailBody,
    });

    await client.close();
    console.log(`✅ Reminder sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${user.email}:`, error);
    await client.close().catch(() => {});
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔔 Starting subscription reminder check...");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find users whose subscription ends tomorrow (H-1)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString();
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString();

    const { data: expiringSubscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select(`
        id,
        user_id,
        ends_at,
        reminder_sent,
        profiles!inner(email, display_name)
      `)
      .eq("status", "active")
      .eq("reminder_sent", false)
      .gte("ends_at", tomorrowStart)
      .lte("ends_at", tomorrowEnd);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} subscriptions expiring tomorrow`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions expiring tomorrow", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let sentCount = 0;
    const failedEmails: string[] = [];

    for (const sub of expiringSubscriptions) {
      const profile = sub.profiles as unknown as { email: string; display_name: string | null };
      
      const success = await sendReminderEmail({
        email: profile.email,
        display_name: profile.display_name,
        subscription_ends_at: sub.ends_at,
      });

      if (success) {
        // Mark reminder as sent
        await supabase
          .from("subscriptions")
          .update({ reminder_sent: true })
          .eq("id", sub.id);
        sentCount++;
      } else {
        failedEmails.push(profile.email);
      }
    }

    console.log(`✅ Sent ${sentCount} reminders, ${failedEmails.length} failed`);

    return new Response(
      JSON.stringify({
        message: `Sent ${sentCount} reminder emails`,
        sent: sentCount,
        failed: failedEmails,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in send-subscription-reminder:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
