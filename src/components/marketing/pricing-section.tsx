import { CheckoutButton } from "@/components/pricing/checkout-button";
import { FoundingCounter } from "@/components/marketing/founding-counter";
import { LoginButton } from "@/components/layout/login-button";

export function PricingSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50 px-6 py-14 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        Pricing
      </p>
      <p className="mb-8 text-sm text-slate-500">
        Start free. Upgrade when you&apos;re ready.
      </p>

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        {/* Free card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-slate-900">Free</p>
          <p className="mb-1 text-3xl font-extrabold text-slate-950">$0</p>
          <p className="mb-5 text-xs text-slate-400">forever</p>
          <ul className="mb-6 flex flex-col gap-2 text-sm text-slate-600">
            {[
              "Modules 1–5 (Foundations)",
              "XP, badges, and streaks",
              "Progress tracking",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <LoginButton source="pricing_page" label="Start free" />
        </div>

        {/* Full access card */}
        <div className="relative rounded-2xl border-2 border-indigo-500 bg-white p-6 shadow-md">
          <div className="absolute -top-px right-4 rounded-b-lg bg-indigo-500 px-3 py-1 text-[10px] font-bold text-white">
            Founding
          </div>
          <p className="mb-1 font-bold text-slate-900">Full Access</p>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950">$99</span>
            <span className="text-sm text-slate-400 line-through">$199</span>
          </div>
          <p className="mb-2 text-xs text-slate-400">one-time · no subscription</p>
          <FoundingCounter />
          <ul className="my-4 flex flex-col gap-2 text-sm text-slate-600">
            {[
              "Everything in Free",
              "Modules 6–16 (Intermediate → Capstone)",
              "Role-specific learning paths",
              "Capstone project templates",
              "Certificate of completion",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="w-full">
            <CheckoutButton
              tier="full_access"
              label="Get founding access"
              source="pricing_page"
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        14-day money-back guarantee · No questions asked
      </p>
    </section>
  );
}
