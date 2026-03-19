import { createHmac, timingSafeEqual } from "crypto";

const ALGORITHM = "sha256";

function getSecret(): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET is not set");
  return secret;
}

function toBase64Url(buf: Buffer): string {
  return buf.toString("base64url");
}

function fromBase64Url(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

export function generateUnsubscribeToken(userId: string): string {
  const sig = createHmac(ALGORITHM, getSecret())
    .update(userId)
    .digest();
  return `${toBase64Url(Buffer.from(userId))}:${toBase64Url(sig)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const parts = token.split(":");
  if (parts.length !== 2) return null;

  try {
    const userId = fromBase64Url(parts[0]).toString("utf-8");
    const providedSig = fromBase64Url(parts[1]);
    const expectedSig = createHmac(ALGORITHM, getSecret())
      .update(userId)
      .digest();

    if (
      providedSig.length !== expectedSig.length ||
      !timingSafeEqual(providedSig, expectedSig)
    ) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
