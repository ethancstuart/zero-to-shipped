import { WaitlistForm } from "./waitlist-form";

export const metadata = {
  title: "Join the Waitlist",
  description: "Be the first to know when Zero to Ship Premium launches.",
};

export default function WaitlistPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-20">
      <div className="mx-auto max-w-md px-4 text-center">
        <h1 className="mb-4 text-3xl font-bold">Join the Waitlist</h1>
        <p className="mb-8 text-muted-foreground">
          Be the first to know when the full curriculum launches. We&apos;ll
          only email you about the launch — no spam.
        </p>
        <WaitlistForm />
      </div>
    </div>
  );
}
