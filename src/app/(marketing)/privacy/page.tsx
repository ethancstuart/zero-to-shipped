export const metadata = {
  title: "Privacy Policy",
  description: "How Zero to Shipped collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Last updated: March 14, 2026
      </p>

      <div className="space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1">
        <section>
          <h2>What We Collect</h2>
          <p>When you sign in with Google, we receive your name, email address, and profile picture. We also collect usage data such as module progress, XP earned, and checkpoint completions.</p>
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
            <li><strong>Supabase</strong> — database and authentication (your data is stored in Supabase-managed Postgres)</li>
            <li><strong>Stripe</strong> — payment processing (PCI-compliant, we never store card data)</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Vercel</strong> — hosting, analytics, and speed insights</li>
            <li><strong>Google OAuth</strong> — authentication provider</li>
          </ul>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>We use essential cookies for authentication sessions. We also use a referral tracking cookie (<code>zts_ref</code>) that stores a referral code and is cleared after sign-up. Vercel Analytics uses privacy-friendly, cookie-less analytics.</p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>Your account data is retained as long as your account is active. You can request deletion of your account and associated data by contacting us.</p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>You can request access to, correction of, or deletion of your personal data at any time. Email us and we&apos;ll respond within 30 days.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Email us at{" "}
            <a
              href="mailto:hello@zerotoship.app"
              className="text-primary hover:underline"
            >
              hello@zerotoship.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
