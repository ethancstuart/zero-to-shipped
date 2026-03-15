import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Award, Lock } from "lucide-react";
import { MODULE_METADATA } from "@/lib/content/modules";
import { CertificateDownload } from "@/components/profile/certificate-download";
import { ShareButtons } from "@/components/profile/share-buttons";
import { siteConfig } from "@/lib/constants";
import type { Profile, ModuleProgress } from "@/types";

export const metadata = { title: "Certificate" };

export default async function CertificatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profileRes, progressRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("module_progress").select("*").eq("user_id", user.id),
  ]);

  const profile = profileRes.data as Profile;
  const progress = (progressRes.data ?? []) as ModuleProgress[];
  const completedModules = progress.filter((p) => p.status === "completed");
  const capstoneComplete = progress.find(
    (p) => p.module_number === 16 && p.status === "completed"
  );

  if (!capstoneComplete) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Lock className="mx-auto mb-4 size-12 text-muted-foreground/30" />
        <h1 className="mb-2 text-xl font-bold">Certificate Locked</h1>
        <p className="mb-4 text-muted-foreground">
          Complete the capstone project (Module 16) to earn your certificate.
        </p>
        <p className="text-sm text-muted-foreground">
          {completedModules.length}/16 modules completed
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <Award className="mx-auto mb-4 size-16 text-primary" />
      <h1 className="mb-2 text-2xl font-bold">Congratulations!</h1>
      <p className="mb-8 text-muted-foreground">
        You&apos;ve completed the Zero to Ship curriculum. Download your
        certificate below.
      </p>

      {/* Certificate Preview */}
      <div className="mb-8 rounded-xl border-2 border-primary/20 bg-card p-12">
        <p className="mb-2 text-sm uppercase tracking-widest text-primary">
          Certificate of Completion
        </p>
        <h2 className="mb-1 text-3xl font-bold">Zero to Ship</h2>
        <p className="mb-6 text-muted-foreground">
          Build with AI, No Engineering Degree Required
        </p>
        <p className="mb-1 text-lg font-semibold">{profile.display_name}</p>
        <p className="mb-6 text-sm text-muted-foreground">
          has successfully completed all 16 modules including the capstone
          project
        </p>
        <p className="text-xs text-muted-foreground">
          {capstoneComplete.completed_at
            ? new Date(capstoneComplete.completed_at).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )
            : ""}
        </p>
      </div>

      <CertificateDownload
        name={profile.display_name ?? "Learner"}
        date={capstoneComplete.completed_at ?? new Date().toISOString()}
      />

      {/* Share */}
      {profile.public_profile && (
        <div className="mt-6 flex justify-center">
          <ShareButtons
            url={`${siteConfig.url}/u/${encodeURIComponent(profile.display_name ?? "")}`}
            title={`I just completed Zero to Ship! 🚀 All 16 modules done.`}
          />
        </div>
      )}
    </div>
  );
}
