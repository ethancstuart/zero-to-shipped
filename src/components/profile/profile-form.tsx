"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/(app)/profile/actions";
import { ROLE_LABELS, TOOL_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { Profile, RoleTrack, ToolPreference } from "@/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateProfile(formData);
      toast.success("Profile updated");
    });
  };

  return (
    <form action={handleSubmit} className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 font-semibold">Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Display Name</label>
          <input
            name="display_name"
            defaultValue={profile.display_name ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Role Track</label>
          <select
            name="role_track"
            defaultValue={profile.role_track ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {(Object.keys(ROLE_LABELS) as RoleTrack[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Preferred Tool
          </label>
          <select
            name="tool_preference"
            defaultValue={profile.tool_preference}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {(Object.keys(TOOL_LABELS) as ToolPreference[]).map((tool) => (
              <option key={tool} value={tool}>
                {TOOL_LABELS[tool]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="public_profile"
            id="public_profile"
            defaultChecked={profile.public_profile}
            className="rounded border-border"
          />
          <label htmlFor="public_profile" className="text-sm">
            Make profile public (visible at /u/your-name)
          </label>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
