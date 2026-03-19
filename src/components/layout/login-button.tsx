"use client";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

async function handleGoogleLogin() {
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

export function LoginButton() {
  return (
    <Button onClick={handleGoogleLogin} className="gap-2">
      <LogIn className="size-4" />
      Sign in with Google
    </Button>
  );
}

export function LoginButtonOutline() {
  return (
    <Button variant="outline" onClick={handleGoogleLogin} className="gap-2">
      <LogIn className="size-4" />
      Sign In
    </Button>
  );
}
