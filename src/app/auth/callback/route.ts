import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";
import { emailWrapper, emailButton } from "@/lib/email/templates";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Track whether this is a first-time signup
      let isNewUser = false;

      // Capture referral from cookie
      const cookieStore = await cookies();
      const refCode = cookieStore.get("zts_ref")?.value;

      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      if (refCode && /^[a-f0-9]{8}$/.test(refCode) && data.user) {
        try {
          // Look up referrer by referral_code
          const { data: referrer } = await serviceClient
            .from("profiles")
            .select("id")
            .eq("referral_code", refCode)
            .single();

          if (referrer && referrer.id !== data.user.id) {
            // Update referred user's referred_by
            await serviceClient
              .from("profiles")
              .update({ referred_by: referrer.id })
              .eq("id", data.user.id)
              .is("referred_by", null);
          }
        } catch {
          // Non-critical — don't block auth
        }
      }

      // Send welcome email on first login
      if (data.user) {
        try {
          const { data: profile } = await serviceClient
            .from("profiles")
            .select("display_name, welcome_email_sent")
            .eq("id", data.user.id)
            .single();

          if (profile && !profile.welcome_email_sent) {
            isNewUser = true;
            const name = profile.display_name?.split(" ")[0] ?? "there";
            const unsubToken = generateUnsubscribeToken(data.user.id);
            const resend = new Resend(process.env.RESEND_API_KEY);

            await resend.emails.send({
              from: "Zero to Ship <hello@zerotoship.app>",
              to: data.user.email!,
              subject: "Welcome to Zero to Ship",
              html: emailWrapper(
                `<p>Hey ${name},</p>
                  <p>Welcome to <strong>Zero to Ship</strong> — you just took the first step toward building real software with AI.</p>
                  <p>Here's what to expect:</p>
                  <ul>
                    <li><strong>16 modules</strong> from setup to shipping a capstone project</li>
                    <li><strong>Hands-on checkpoints</strong> — you'll build something in every module</li>
                    <li><strong>Streaks & XP</strong> — stay consistent and climb the leaderboard</li>
                  </ul>
                  <p>Module 1 takes about 3 hours, and you'll have your first build by the end.</p>
                  <p>${emailButton("Go to Dashboard", "https://zerotoship.app/dashboard")}</p>`,
                { unsubscribeUrl: `https://zerotoship.app/api/unsubscribe?token=${unsubToken}` }
              ),
            });

            await serviceClient
              .from("profiles")
              .update({ welcome_email_sent: true })
              .eq("id", data.user.id);
          }
        } catch {
          // Don't break auth flow on email failure
        }
      }

      const redirectPath = isNewUser ? "/welcome" : next;

      // Clear the referral cookie if present
      if (refCode) {
        const response = NextResponse.redirect(`${origin}${redirectPath}`);
        response.cookies.set("zts_ref", "", { maxAge: 0, path: "/" });
        return response;
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }

    // Code exchange failed — redirect to error page
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
