export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Zero to Shipped.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Last updated: March 14, 2026
      </p>

      <div className="space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
        <section>
          <h2>Account Terms</h2>
          <p>You must sign in with a valid Google account to use Zero to Shipped. You are responsible for maintaining the security of your account. You must be at least 16 years old to use this service.</p>
        </section>

        <section>
          <h2>Payment Terms</h2>
          <p>Premium access is a one-time purchase — there are no recurring charges or subscriptions. All payments are processed securely through Stripe. Prices are displayed in USD and may include applicable taxes.</p>
        </section>

        <section>
          <h2>Refund Policy</h2>
          <p>If you&apos;re not satisfied with your purchase, contact us within 14 days for a full refund. After 14 days, refunds are handled on a case-by-case basis. Refunds are processed back to the original payment method.</p>
        </section>

        <section>
          <h2>Content & Intellectual Property</h2>
          <p>All course content, including modules, code examples, and materials, is owned by Zero to Shipped. Your purchase grants you a personal, non-transferable license to access the content. You may not redistribute, resell, or share your account access.</p>
        </section>

        <section>
          <h2>What You Build</h2>
          <p>Any projects, code, or products you create while using our course materials belong entirely to you. We claim no ownership over your work.</p>
        </section>

        <section>
          <h2>Acceptable Use</h2>
          <p>You agree not to: abuse the platform, attempt to access other users&apos; accounts, scrape or redistribute course content, or use the service for any illegal purpose.</p>
        </section>

        <section>
          <h2>Service Availability</h2>
          <p>We aim for high availability but don&apos;t guarantee uninterrupted access. We may update, modify, or discontinue features with reasonable notice. Your purchased content access will be maintained.</p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>Zero to Shipped is an educational platform. We provide learning materials as-is and make no guarantees about specific outcomes. Our liability is limited to the amount you paid for the service.</p>
        </section>

        <section>
          <h2>Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance. We&apos;ll notify registered users of significant changes via email.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms? Email us at{" "}
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
