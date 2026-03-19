import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Account Setup Error — Zero to Ship",
};

export default function SetupErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 size-12 text-destructive/60" />
        <h1 className="mb-2 text-xl font-bold">
          We couldn&apos;t set up your account
        </h1>
        <p className="mb-6 text-muted-foreground">
          Something went wrong while creating your profile. Try logging out and
          back in. If the problem persists, email us at{" "}
          <a
            href="mailto:hello@zerotoship.app"
            className="text-primary underline"
          >
            hello@zerotoship.app
          </a>
          .
        </p>
        <Button render={<Link href="/" />}>Go Home</Button>
      </div>
    </div>
  );
}
