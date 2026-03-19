import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/cached-queries";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import type { Profile } from "@/types";

const RoleOnboarding = dynamic(
  () => import("@/components/layout/role-onboarding").then(m => m.RoleOnboarding)
);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  let profile = await getProfile(user.id);

  // Safety net: auto-recover missing profile
  if (!profile) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const name =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Learner";
    const avatar =
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      null;
    const refCode = crypto.randomUUID().slice(0, 8);

    const { data: recovered } = await admin
      .from("profiles")
      .upsert(
        { id: user.id, display_name: name, avatar_url: avatar, referral_code: refCode },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (!recovered) {
      redirect("/setup-error");
    }

    // Seed module progress if missing
    const { count } = await admin
      .from("module_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!count || count === 0) {
      const rows = Array.from({ length: 16 }, (_, i) => ({
        user_id: user.id,
        module_number: i + 1,
        status: i === 0 ? "available" : "locked",
      }));
      await admin.from("module_progress").insert(rows);
    }

    profile = recovered;
  }

  const typedProfile = profile as Profile;

  // Show onboarding if no role selected
  if (!typedProfile.role_track) {
    return <RoleOnboarding />;
  }

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to content
      </a>
      <AppSidebar profile={typedProfile} />
      <div className="lg:pl-64">
        <AppTopbar profile={typedProfile} />
        <main id="main" className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
