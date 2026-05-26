import { track } from "@vercel/analytics";

export function trackEvent(
  event:
    | "signup"
    | "checkout_start"
    | "purchase_complete"
    | "module_complete"
    | "premium_gate_hit",
  properties?: Record<string, string | number | boolean>
) {
  track(event, properties);
}

// --- Redesign success-metric events ---

/** Tracks a content page view with pillar/type/slug dimensions */
export function trackContentView(
  pillar: string,
  type: string,
  slug: string
) {
  track("content_view", { pillar, type, slug });
}

/** Tracks a new-user signup (fire once on first authenticated page load) */
export function trackSignup() {
  track("signup");
}

/** Detects and tracks return visits within a 7-day window */
export function trackReturnVisit() {
  try {
    const lastVisit = localStorage.getItem("ps-last-visit");
    const now = Date.now();
    if (lastVisit) {
      const daysSince =
        (now - parseInt(lastVisit, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) {
        track("return_visit", { days_since: Math.round(daysSince) });
      }
    }
    localStorage.setItem("ps-last-visit", String(now));
  } catch {
    // localStorage unavailable (SSR, private browsing) — skip silently
  }
}
