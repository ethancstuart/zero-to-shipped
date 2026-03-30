"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/(app)/profile/actions";
import { ROLE_LABELS, TOOL_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { Profile, RoleTrack, ToolPreference } from "@/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const newRole = formData.get("role_track") as string;
    if (profile.role_track && newRole !== profile.role_track) {
      if (!confirm("Changing your role will update your recommended modules. Continue?")) {
        return;
      }
    }

    startTransition(async () => {
      await updateProfile(formData);
      toast.success("Profile updated");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
      <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="display_name" className="mb-1">Display Name</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile.display_name ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="role_track" className="mb-1">Role Track</Label>
            <select
              id="role_track"
              name="role_track"
              defaultValue={profile.role_track ?? ""}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {(Object.keys(ROLE_LABELS) as RoleTrack[]).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="tool_preference" className="mb-1">Preferred Tool</Label>
            <select
              id="tool_preference"
              name="tool_preference"
              defaultValue={profile.tool_preference}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {(Object.keys(TOOL_LABELS) as ToolPreference[]).map((tool) => (
                <option key={tool} value={tool}>
                  {TOOL_LABELS[tool]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="github_username" className="mb-1">GitHub Username</Label>
            <Input
              id="github_username"
              name="github_username"
              defaultValue={profile.github_username ?? ""}
              placeholder="your-username"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Optional. Displayed on your public profile.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="public_profile"
              id="public_profile"
              defaultChecked={profile.public_profile}
              className="rounded border-border"
            />
            <Label htmlFor="public_profile" className="text-sm font-normal">
              Make profile public (visible at /u/your-name)
            </Label>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
      </form>
      </CardContent>
    </Card>
  );
}
