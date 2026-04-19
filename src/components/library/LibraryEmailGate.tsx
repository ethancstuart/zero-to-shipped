"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LibraryEmailGateProps {
  storageKey: string;
  heading?: string;
  description?: string;
  onUnlock?: () => void;
  children: React.ReactNode;
}

export function LibraryEmailGate({
  storageKey,
  heading = "Unlock the full library",
  description = "Enter your email to access everything — free.",
  onUnlock,
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

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue === "true") {
        setUnlocked(true);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch("/api/toolkit-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Subscription failed");
      }

      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        // continue even if localStorage unavailable
      }

      setEmail("");
      setStatus("idle");
      setUnlocked(true);
      onUnlock?.();
    } catch (err) {
      clearTimeout(timeout);
      setStatus("error");
      if (err instanceof Error && err.name === "AbortError") {
        setErrorMsg("Request timed out. Please try again.");
      } else {
        setErrorMsg("Something went wrong. Try again.");
      }
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
          autoComplete="email"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button type="submit" disabled={status === "loading"} size="lg">
          {status === "loading" ? "Unlocking..." : "Unlock Free"}
        </Button>
        {status === "error" && (
          <p className="text-sm text-destructive" role="alert">{errorMsg}</p>
        )}
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        No spam. Unsubscribe any time.
      </p>
    </div>
  );
}
