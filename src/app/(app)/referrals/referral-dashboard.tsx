"use client";

import { useState } from "react";
import { Check, Copy, Gift, Linkedin, Lock, Twitter, Unlock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";

interface ReferredUser {
  id: string;
  displayName: string;
  joinedAt: string;
  completedModule1: boolean;
}

interface RewardTier {
  threshold: number;
  title: string;
  description: string;
  reward: string;
  slug: string;
  unlocked: boolean;
}

interface ReferralDashboardProps {
  referralCode: string;
  referredUsers: ReferredUser[];
  qualifiedReferrals: number;
  tiers: RewardTier[];
}

export function ReferralDashboard({
  referralCode,
  referredUsers,
  qualifiedReferrals,
  tiers,
}: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [inviteMessage, setInviteMessage] = useState("");
  const referralUrl = `${siteConfig.url}?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(
    "I'm learning to build real products with AI tools on Zero to Ship. Check it out:"
  );
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(referralUrl)}`;

  const badgeProgress = Math.min(qualifiedReferrals, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">
          Invite friends and earn XP when they complete Module 1.
        </p>
      </div>

      {/* Referral Link */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Gift className="size-5 text-primary" />
          Your Referral Link
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-mono truncate">
            {referralUrl}
          </div>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-1.5 size-4" />
            ) : (
              <Copy className="mr-1.5 size-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(linkedinUrl, "_blank", "width=600,height=600")
            }
          >
            <Linkedin className="mr-1.5 size-4" />
            Share on LinkedIn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(twitterUrl, "_blank", "width=600,height=400")
            }
          >
            <Twitter className="mr-1.5 size-4" />
            Share on X
          </Button>
        </div>
      </div>

      {/* Badge Progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <span className="text-xl">🤝</span>
          Referral Champion Badge
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Get 3 friends to sign up and complete Module 1 to earn the Referral
          Champion badge and 100 XP.
        </p>
        <div className="flex items-center gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(badgeProgress / 3) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {badgeProgress}/3
          </span>
        </div>
      </div>

      {/* Invite by Email */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Invite by Email</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter up to 5 email addresses, separated by commas.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setInviteStatus("sending");
            const emails = inviteEmails
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean);
            try {
              const res = await fetch("/api/referral-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emails }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              setInviteStatus("sent");
              setInviteMessage(`Sent ${data.sent} invite${data.sent === 1 ? "" : "s"}!`);
              setInviteEmails("");
            } catch (err) {
              setInviteStatus("error");
              setInviteMessage(
                err instanceof Error ? err.message : "Failed to send invites"
              );
            }
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={inviteEmails}
            onChange={(e) => {
              setInviteEmails(e.target.value);
              setInviteStatus("idle");
            }}
            placeholder="friend@example.com, colleague@work.com"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" disabled={inviteStatus === "sending" || !inviteEmails.trim()}>
            {inviteStatus === "sending" ? "Sending..." : "Send Invites"}
          </Button>
        </form>
        {inviteStatus === "sent" && (
          <p className="mt-2 text-sm text-green-500">{inviteMessage}</p>
        )}
        {inviteStatus === "error" && (
          <p className="mt-2 text-sm text-destructive">{inviteMessage}</p>
        )}
      </div>

      {/* Reward Tiers */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Gift className="size-5 text-primary" />
          Referral Rewards
        </h2>
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div
              key={tier.slug}
              className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
                tier.unlocked
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-border"
              }`}
            >
              {tier.unlocked ? (
                <Unlock className="size-5 shrink-0 text-green-500" />
              ) : (
                <Lock className="size-5 shrink-0 text-muted-foreground/40" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{tier.title}</p>
                <p className="text-xs text-muted-foreground">
                  {tier.description}
                </p>
              </div>
              <span
                className={`text-xs font-medium ${
                  tier.unlocked ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {tier.reward}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Referred Users */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Users className="size-5 text-primary" />
          Referred Users
        </h2>
        {referredUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No referrals yet. Share your link to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {referredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(user.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {user.completedModule1 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                      <Check className="size-3" />
                      Module 1 complete
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      In progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">How it works</h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Share your referral link with friends</li>
          <li>2. They sign up and start learning</li>
          <li>3. When they complete Module 1, you both earn 100 XP</li>
          <li>4. Refer 3 friends who complete Module 1 → Referral Champion badge</li>
        </ol>
      </div>
    </div>
  );
}
