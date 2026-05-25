import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-8">
          {/* Platform */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Platform
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pulse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pulse
                </Link>
              </li>
              <li>
                <Link href="/build" className="text-muted-foreground hover:text-foreground transition-colors">
                  Build
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <Link href="/system" className="text-muted-foreground hover:text-foreground transition-colors">
                  System
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Tools
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tools Directory
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="text-muted-foreground hover:text-foreground transition-colors">
                  Showcase
                </Link>
              </li>
            </ul>
          </div>

          {/* More */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              More
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/transparency" className="text-muted-foreground hover:text-foreground transition-colors">
                  Transparency
                </Link>
              </li>
              <li>
                <Link href="/ask" className="text-muted-foreground hover:text-foreground transition-colors">
                  Ask the Assistant
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Legal
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@prototypestudio.dev"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Prototype Studio
          </p>
          <p className="text-xs text-muted-foreground">
            Built by builders, for builders.
          </p>
        </div>
      </div>
    </footer>
  );
}
