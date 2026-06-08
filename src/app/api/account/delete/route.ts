import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      {
        error: "unauthorized",
        message: "You must be signed in to delete your account.",
      },
      { status: 401 },
    );
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const tablesToCleanup = [
    "profiles",
    "progress",
    "bookmarks",
    "user_context",
    "user_ai_usage",
  ];

  const errors: string[] = [];

  for (const table of tablesToCleanup) {
    const { error } = await serviceClient
      .from(table)
      .delete()
      .eq("user_id", user.id);
    if (error) {
      // 'profiles' table uses 'id' not 'user_id' — retry
      if (table === "profiles") {
        const { error: profileError } = await serviceClient
          .from("profiles")
          .delete()
          .eq("id", user.id);
        if (profileError) errors.push(`${table}: ${profileError.message}`);
      } else {
        errors.push(`${table}: ${error.message}`);
      }
    }
  }

  // Delete the auth user last
  const { error: deleteUserError } = await serviceClient.auth.admin.deleteUser(
    user.id,
  );
  if (deleteUserError) {
    errors.push(`auth user: ${deleteUserError.message}`);
  }

  if (errors.length > 0) {
    log("error", "Account deletion partial failure", {
      userId: user.id,
      errors,
    });
    Sentry.captureMessage("Account deletion errors", {
      level: "warning",
      tags: { userId: user.id },
      extra: { errors },
    });
    return Response.json(
      {
        error: "partial_failure",
        message: "Some data could not be deleted. Please contact support.",
        details: errors,
      },
      { status: 500 },
    );
  }

  log("info", "Account deleted", { userId: user.id });

  return Response.json({
    success: true,
    message:
      "Your account and all associated data have been permanently deleted.",
  });
}
