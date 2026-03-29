"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ShareYourBuildProps {
  userId: string;
  moduleNumber: number;
  existingUrl: string | null;
}

export function ShareYourBuild({
  userId,
  moduleNumber,
  existingUrl,
}: ShareYourBuildProps) {
  const [url, setUrl] = useState(existingUrl ?? "");
  const [status, setStatus] = useState<"idle" | "verifying" | "saved">(
    existingUrl ? "saved" : "idle"
  );

  const handleVerify = async () => {
    if (!url.trim()) return;

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setStatus("verifying");

    try {
      // Simple check — just verify it looks like a valid URL
      // We can't do a HEAD request from the client due to CORS,
      // so we save it and trust the user
      const supabase = createClient();
      const { error } = await supabase
        .from("module_progress")
        .update({ capstone_url: parsedUrl.toString() })
        .eq("user_id", userId)
        .eq("module_number", moduleNumber);

      if (error) throw error;

      setUrl(parsedUrl.toString());
      setStatus("saved");
      toast.success("Capstone URL saved!");
    } catch {
      setStatus("idle");
      toast.error("Failed to save URL. Please try again.");
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
      <h3 className="mb-2 flex items-center gap-2 font-semibold">
        {status === "saved" ? (
          <CheckCircle2 className="size-5 text-green-500" />
        ) : (
          <ExternalLink className="size-5 text-primary" />
        )}
        Share Your Build
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Shipped your capstone? Add the live URL to showcase it on your profile.
      </p>
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status === "saved") setStatus("idle");
          }}
          placeholder="https://your-project.vercel.app"
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button
          onClick={handleVerify}
          disabled={status === "verifying" || !url.trim()}
        >
          {status === "verifying" ? (
            <>
              <Loader2 className="mr-1.5 size-4 animate-spin" />
              Saving...
            </>
          ) : status === "saved" ? (
            <>
              <CheckCircle2 className="mr-1.5 size-4" />
              Saved
            </>
          ) : (
            "Save URL"
          )}
        </Button>
      </div>
      {status === "saved" && url && (
        <p className="mt-2 text-xs text-muted-foreground">
          Visible on your public profile.{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View your build
          </a>
        </p>
      )}
    </div>
  );
}
