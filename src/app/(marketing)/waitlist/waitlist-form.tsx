"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

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
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        throw new Error("Subscribe failed");
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
          Check your inbox — we&apos;ll email you when doors open April 28.
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
        {status === "loading" ? "Joining..." : "Notify me April 28"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}
    </form>
  );
}
