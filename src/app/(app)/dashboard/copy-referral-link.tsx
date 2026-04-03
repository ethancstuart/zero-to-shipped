"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export function CopyReferralLink({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${siteConfig.url}?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
        {referralUrl}
      </code>
      <button
        onClick={handleCopy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="size-3" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-3" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
