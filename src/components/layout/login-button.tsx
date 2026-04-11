"use client";

import * as Sentry from "@sentry/nextjs";
import { track } from "@vercel/analytics";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

/**
 * Where the LoginButton is being rendered. Used to attribute signups to the
 * surface that drove them — closes the launch-day funnel on "what CTA worked"
 * without adding a new events table.
 */
export type LoginSource =
  | "landing_hero"
  | "landing_cta"
  | "pricing_page"
  | "preview_gate"
  | "nav"
  | "unknown";

async function handleGoogleLogin(source: LoginSource) {
  track("login_click", { source });
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      Sentry.captureException(error);
      toast.error("Sign in failed. Please try again.");
    } else if (data.url) {
      window.location.href = data.url;
    }
  } catch (e) {
    Sentry.captureException(e);
    toast.error("Sign in failed. Please try again.");
  }
}

export function LoginButton({
  source = "unknown",
  label = "Sign in with Google",
}: {
  source?: LoginSource;
  label?: string;
} = {}) {
  return (
    <Button onClick={() => handleGoogleLogin(source)} className="gap-2">
      <LogIn className="size-4" />
      {label}
    </Button>
  );
}

export function LoginButtonOutline({
  source = "unknown",
}: {
  source?: LoginSource;
} = {}) {
  return (
    <Button
      variant="outline"
      onClick={() => handleGoogleLogin(source)}
      className="gap-2"
    >
      <LogIn className="size-4" />
      Sign In
    </Button>
  );
}
