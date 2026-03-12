import Link from "next/link";
import { Rocket } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LoginButtonOutline } from "./login-button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Rocket className="size-5 text-primary" />
          Zero to Shipped
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LoginButtonOutline />
        </div>
      </nav>
    </header>
  );
}
