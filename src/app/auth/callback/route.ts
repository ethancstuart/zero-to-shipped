import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Capture referral from cookie
      const cookieStore = await cookies();
      const refCode = cookieStore.get("zts_ref")?.value;

      if (refCode && /^[a-f0-9]{8}$/.test(refCode) && data.user) {
        try {
          const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

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

        // Clear the referral cookie
        const response = NextResponse.redirect(`${origin}${next}`);
        response.cookies.set("zts_ref", "", { maxAge: 0, path: "/" });
        return response;
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    // Signal signup event via query param — client-side analytics will pick it up
    const redirectUrl = new URL(`${origin}${next}`);
    redirectUrl.searchParams.set("event", "signup");
    return NextResponse.redirect(redirectUrl.toString());
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
