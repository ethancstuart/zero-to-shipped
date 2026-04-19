"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LibraryEmailGateProps {
  storageKey: string;
  heading?: string;
  description?: string;
  children: React.ReactNode;
}

export function LibraryEmailGate({
  storageKey,
  heading = "Unlock the full library",
  description = "Enter your email to access everything — free.",
  children,
}: LibraryEmailGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === "true") {
        setUnlocked(true);
      }
    } catch {
      // SSR safety
    }
  }, [storageKey]);

  if (unlocked) {
    return (
      <div className="animate-in fade-in duration-300">
        {children}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/toolkit-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Subscription failed");
      }

      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        // continue even if localStorage fails
      }
      setUnlocked(true);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  };

  return (
    <div className="my-8 rounded-xl border border-border bg-card p-8 text-center">
      <h3 className="mb-2 text-xl font-bold">{heading}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
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
          {status === "loading" ? "Unlocking..." : "Unlock Full Library"}
        </Button>
        {status === "error" && (
          <p className="text-sm text-destructive">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
