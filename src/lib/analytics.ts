import { track } from "@vercel/analytics";

export function trackEvent(
  event: "signup" | "checkout_start" | "purchase_complete" | "module_complete",
  properties?: Record<string, string | number | boolean>
) {
  track(event, properties);
}
