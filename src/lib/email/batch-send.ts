import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";

interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const BATCH_SIZE = 100;

/**
 * Send emails in batches of 100 using Resend's batch API.
 * Returns the number of successfully sent emails.
 */
export async function batchSendEmails(
  resend: Resend,
  emails: EmailPayload[]
): Promise<number> {
  if (emails.length === 0) return 0;

  let sent = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    try {
      const { data, error } = await resend.batch.send(batch);
      if (error) {
        Sentry.captureException(error);
      }
      // Count successful sends from the batch response
      if (data?.data) {
        sent += data.data.length;
      } else if (!error) {
        // If no error and no detailed data, assume all sent
        sent += batch.length;
      }
    } catch (error) {
      Sentry.captureException(error);
      // On total failure, try individual sends as fallback
      for (const email of batch) {
        try {
          await resend.emails.send(email);
          sent++;
        } catch (innerError) {
          Sentry.captureException(innerError);
        }
      }
    }
  }

  return sent;
}
