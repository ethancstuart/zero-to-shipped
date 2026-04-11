import Link from "next/link";
import { Rocket } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LoginButtonOutline } from "./login-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function MarketingNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Rocket className="size-5 text-primary" />
          Zero to Ship
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button variant="outline" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          ) : (
            <LoginButtonOutline source="nav" />
          )}
        </div>
      </nav>
    </header>
  );
}
