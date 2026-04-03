// Shared email template utilities
// Change brand colors/styles here — updates every email in the system.

const BRAND_COLOR = "#6366f1";
const TEXT_COLOR = "#1a1a1a";
const MUTED_COLOR = "#666";
const FOOTER_COLOR = "#999";

// ─── Light theme (user-facing emails) ───────────────────────────

/**
 * Wraps email body content in the standard light-theme container.
 * Adds the sign-off and unsubscribe footer when provided.
 */
export function emailWrapper(
  content: string,
  options?: { unsubscribeUrl?: string; footerNote?: string }
): string {
  const signoff = `<p style="color: ${MUTED_COLOR}; font-size: 14px;">— Zero to Ship</p>`;

  const footer = options?.unsubscribeUrl
    ? `<p style="color: ${FOOTER_COLOR}; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
        ${options.footerNote ? `${options.footerNote}<br>` : ""}
        <a href="${options.unsubscribeUrl}" style="color: ${FOOTER_COLOR};">Unsubscribe</a>
      </p>`
    : "";

  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: ${TEXT_COLOR};">
      ${content}
      ${signoff}
      ${footer}
    </div>
  `;
}

// ─── Dark theme (internal / waitlist emails) ────────────────────

/**
 * Wraps email body content in the dark-theme container used for
 * analytics digests and waitlist launch emails.
 */
export function emailWrapperDark(
  content: string,
  options?: { unsubscribeUrl?: string; footerNote?: string }
): string {
  const signoff = `<p style="color: #888; font-size: 14px; margin-top: 24px;">— Zero to Ship</p>`;

  const footer = options?.unsubscribeUrl
    ? `<p style="color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #333; padding-top: 12px;">
        ${options.footerNote ? `${options.footerNote}<br>` : ""}
        <a href="${options.unsubscribeUrl}" style="color: #666;">Unsubscribe</a>
      </p>`
    : options?.footerNote
      ? `<p style="color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #333; padding-top: 12px;">
          ${options.footerNote}
        </p>`
      : "";

  return `
    <div style="font-family: monospace; max-width: 560px; margin: 0 auto; color: #e0e0e0; background: #0a0a0a; padding: 24px; border-radius: 12px;">
      ${content}
      ${signoff}
      ${footer}
    </div>
  `;
}

// ─── Reusable components ────────────────────────────────────────

/** Standard CTA button */
export function emailButton(text: string, href: string, options?: { large?: boolean }): string {
  const padding = options?.large ? "14px 32px" : "12px 24px";
  const fontSize = options?.large ? "font-size: 16px;" : "";
  return `<a href="${href}" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: ${padding}; border-radius: 8px; text-decoration: none; font-weight: 600; ${fontSize}">${text}</a>`;
}

/** Centered CTA button (for launch / marketing emails) */
export function emailButtonCentered(text: string, href: string): string {
  return `<p style="text-align: center; margin: 24px 0;">${emailButton(text, href, { large: true })}</p>`;
}

/** Inline link in brand color */
export function emailLink(text: string, href: string): string {
  return `<a href="${href}" style="color: ${BRAND_COLOR};">${text}</a>`;
}
