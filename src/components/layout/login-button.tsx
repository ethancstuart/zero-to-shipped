"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function LoginButton() {
  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("OAuth error:", error.message);
        alert(`Sign in failed: ${error.message}`);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Login error:", e);
      alert("Sign in failed. Check console for details.");
    }
  };

  return (
    <Button onClick={handleGoogleLogin} className="gap-2">
      <LogIn className="size-4" />
      Sign in with Google
    </Button>
  );
}

export function LoginButtonOutline() {
  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("OAuth error:", error.message);
        alert(`Sign in failed: ${error.message}`);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Login error:", e);
      alert("Sign in failed. Check console for details.");
    }
  };

  return (
    <Button variant="outline" onClick={handleGoogleLogin} className="gap-2">
      <LogIn className="size-4" />
      Sign In
    </Button>
  );
}
