"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/profile/share-buttons";
import { siteConfig } from "@/lib/constants";

interface ShareAchievementProps {
  type: "badge" | "level" | "streak";
  title: string;
  description: string;
  icon: string;
  onClose: () => void;
}

export function ShareAchievement({
  type,
  title,
  description,
  icon,
  onClose,
}: ShareAchievementProps) {
  const [isVisible] = useState(true);

  const ogParams = new URLSearchParams({
    template: "achievement",
    icon,
    title,
  });
  const shareUrl = `${siteConfig.url}?og=${encodeURIComponent(ogParams.toString())}`;

  const shareTextMap = {
    badge: `I just earned the ${title} badge on Zero to Ship!`,
    level: `I just leveled up to ${title} on Zero to Ship!`,
    streak: `${title} on Zero to Ship!`,
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0">
          <X className="size-4" />
        </Button>
      </div>
      <ShareButtons url={shareUrl} title={shareTextMap[type]} />
    </div>
  );
}
