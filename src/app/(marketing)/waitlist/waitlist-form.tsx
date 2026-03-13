"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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

      if (error) {
        if (error.code === "23505") {
          // Unique constraint — already signed up
          setStatus("success");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3">
        <CheckCircle2 className="size-12 text-green-500" />
        <p className="font-semibold">You&apos;re on the list!</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll let you know when Premium launches.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Button type="submit" disabled={status === "loading"} size="lg">
        {status === "loading" ? "Joining..." : "Join Waitlist"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}
    </form>
  );
}
