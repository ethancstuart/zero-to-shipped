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

  const profile = await getProfile(user.id);

  if (!profile) {
    redirect("/");
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
