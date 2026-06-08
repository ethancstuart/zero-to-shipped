import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/assistant/chat-widget";
import { ReturnVisitTracker } from "@/components/analytics/return-visit-tracker";
import { CookieConsent } from "@/components/privacy/cookie-consent";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ReturnVisitTracker />
      <MarketingNav />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ChatWidget />
      <CookieConsent />
    </>
  );
}
