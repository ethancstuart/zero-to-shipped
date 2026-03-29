"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "git101_unlocked";

export function EmailGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  if (unlocked) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: email.toLowerCase().trim() });

      if (error && error.code !== "23505") {
        throw error;
      }

      localStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="my-12 rounded-xl border border-border bg-card p-8 text-center">
      <h3 className="mb-2 text-xl font-bold">Unlock the full guide</h3>
      <p className="mb-6 text-muted-foreground">
        Enter your email to read the rest — free, no sign-up required.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button type="submit" disabled={status === "loading"} size="lg">
          {status === "loading" ? "Unlocking..." : "Unlock Full Guide"}
        </Button>
        {status === "error" && (
          <p className="text-sm text-destructive">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
