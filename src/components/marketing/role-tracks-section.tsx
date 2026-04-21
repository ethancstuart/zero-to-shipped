import Link from "next/link";
import { MODULE_METADATA } from "@/lib/content/modules";
import { ROLE_LABELS } from "@/lib/constants";
import { getRoleLandingSlugByRoleKey } from "@/lib/content/role-landing";
import type { RoleTrack } from "@/types";

const ROLE_EMOJIS: Record<RoleTrack, string> = {
  pm: "📋",
  pjm: "📊",
  ba: "🔍",
  bi: "📈",
};

export function RoleTracksSection() {
  return (
    <section className="border-b border-slate-100 px-6 py-14 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        Pick your track
      </p>
      <p className="mb-8 text-sm text-slate-500">
        Every module is available to everyone. Your track surfaces the most
        relevant ones first.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(ROLE_LABELS) as RoleTrack[]).map((role) => {
          const coreCount = MODULE_METADATA.filter(
            (m) => m.roleRelevance[role] === "core"
          ).length;
          const slug = getRoleLandingSlugByRoleKey(role);
          return (
            <Link
              key={role}
              href={`/for/${slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">{ROLE_EMOJIS[role]}</div>
              <p className="mb-1 font-bold text-slate-900 group-hover:text-indigo-600">
                {ROLE_LABELS[role]}
              </p>
              <p className="text-xs text-slate-400">{coreCount} core modules</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
