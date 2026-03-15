import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getModuleByNumber } from "@/lib/content/modules";
import { EmailGate } from "@/components/modules/email-gate";
import type { Metadata } from "next";

const MODULE_1 = getModuleByNumber(1)!;

export const metadata: Metadata = {
  title: `Free Preview: Module 1 — ${MODULE_1.title}`,
  description: MODULE_1.description,
};

export default async function Module1PreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated users go straight to the real module
  if (user) {
    redirect(`/modules/${MODULE_1.slug}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium uppercase tracking-wider text-primary">
          Module 1
        </p>
        <h1 className="text-3xl font-bold">{MODULE_1.title}</h1>
      </div>
      <EmailGate
        moduleTitle={MODULE_1.title}
        description={MODULE_1.description}
      />
    </div>
  );
}
