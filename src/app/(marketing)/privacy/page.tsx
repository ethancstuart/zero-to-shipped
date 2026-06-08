export const metadata = {
  title: "Privacy Policy",
  description: "How Prototype Studio collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="mb-8 font-display text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Last updated: June 8, 2026
      </p>

      <div className="space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1">
        <section>
          <h2>What We Collect</h2>
          <ul>
            <li>
              <strong>Account info:</strong> name, email, and profile image
              (provided via Google OAuth when you sign in)
            </li>
            <li>
              <strong>Usage data:</strong> pages visited, content viewed, time
              on site, module progress, XP earned, and checkpoint completions
            </li>
            <li>
              <strong>AI conversations:</strong> questions you ask the
              assistant (used to generate a response; see retention below)
            </li>
            <li>
              <strong>Cookies:</strong> authentication tokens (essential) and
              analytics (optional, opt-in via the consent banner)
            </li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Data</h2>
          <ul>
            <li>To provide and personalize the learning experience</li>
            <li>To track your progress, streaks, and achievements</li>
            <li>To process payments via Stripe (we never see your card details)</li>
            <li>To send transactional emails via Resend (purchase confirmations only)</li>
            <li>To display public profiles and leaderboards (opt-in)</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <ul>
            <li>
              <strong>Supabase</strong> — database and authentication (your data
              is stored in Supabase-managed Postgres)
            </li>
            <li>
              <strong>Anthropic</strong> — Claude API for the AI assistant and
              content pipeline
            </li>
            <li>
              <strong>Google</strong> — Gemini API for embeddings, and OAuth
              for sign-in
            </li>
            <li>
              <strong>Vercel</strong> — hosting, analytics, and speed insights
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery
            </li>
            <li>
              <strong>Sentry</strong> — error monitoring and crash reporting
            </li>
            <li>
              <strong>Upstash</strong> — rate limiting (when enabled)
            </li>
            <li>
              <strong>Stripe</strong> — payment processing (PCI-compliant, we
              never store card data)
            </li>
          </ul>
        </section>

        <section>
          <h2>Cookies</h2>
          <ul>
            <li>
              <strong>Essential:</strong> authentication session cookies
              (Supabase). Without these, you cannot sign in.
            </li>
            <li>
              <strong>Optional:</strong> Vercel Analytics and Vercel Speed
              Insights. Controlled via the cookie consent banner.
            </li>
            <li>
              <strong>Referral:</strong> <code>zts_ref</code> stores a referral
              code temporarily and is cleared after sign-up.
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Retention</h2>
          <ul>
            <li>
              <strong>Account data:</strong> retained until you delete your
              account
            </li>
            <li>
              <strong>Analytics:</strong> anonymized after 24 months
            </li>
            <li>
              <strong>AI conversation logs:</strong> not retained — your
              queries are processed in real time but not stored as conversation
              history
            </li>
            <li>
              <strong>Server logs:</strong> 30 days
            </li>
          </ul>
        </section>

        <section>
          <h2>Your Rights</h2>
          <ul>
            <li>Access your data — request a copy by emailing us</li>
            <li>
              Delete your account and all associated data — use the in-app
              deletion flow which calls{" "}
              <code>POST /api/account/delete</code>, or email us
            </li>
            <li>
              Opt out of analytics cookies — decline via the cookie consent
              banner shown on your first visit
            </li>
            <li>
              Correct your personal data — email us and we&apos;ll respond
              within 30 days
            </li>
          </ul>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy, or want to exercise your data rights?
            Email us at{" "}
            <a
              href="mailto:ethan.c.stuart@gmail.com"
              className="text-primary hover:underline"
            >
              ethan.c.stuart@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
