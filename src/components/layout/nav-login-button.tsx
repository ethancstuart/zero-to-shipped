"use client";

import * as Sentry from "@sentry/nextjs";
import { track } from "@vercel/analytics";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function NavLoginButton() {
  async function handleLogin() {
    track("login_click", { source: "nav" });
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

  return (
    <button
      onClick={handleLogin}
      className="bg-[hsl(var(--fg))] text-[hsl(var(--bg))] rounded-full px-5 py-2 text-xs transition-all duration-300 hover:opacity-90"
    >
      Get started
    </button>
  );
}
