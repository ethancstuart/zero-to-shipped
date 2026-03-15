"use client";

import { Linkedin, Twitter, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const twitterText = encodeURIComponent(
    `${title}\n\nBuilt with Zero to Ship — learn to build with AI, no engineering degree required.`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(linkedinUrl, "_blank", "width=600,height=600")}
      >
        <Linkedin className="mr-1.5 size-4" />
        LinkedIn
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(twitterUrl, "_blank", "width=600,height=400")}
      >
        <Twitter className="mr-1.5 size-4" />
        Twitter
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <Check className="mr-1.5 size-4" />
        ) : (
          <Link2 className="mr-1.5 size-4" />
        )}
        {copied ? "Copied" : "Copy Link"}
      </Button>
    </div>
  );
}
