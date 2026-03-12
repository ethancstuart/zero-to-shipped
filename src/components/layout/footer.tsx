export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Zero to Shipped. Built by Ethan Stuart.</p>
      </div>
    </footer>
  );
}
