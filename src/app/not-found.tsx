import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button render={<Link href="/" />}>
            <Home className="mr-2 size-4" />
            Home
          </Button>
          <Button variant="outline" render={<Link href="/modules" />}>
            <BookOpen className="mr-2 size-4" />
            Browse Modules
          </Button>
        </div>
      </div>
    </div>
  );
}
