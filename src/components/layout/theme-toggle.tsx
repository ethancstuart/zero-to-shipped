"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type ThemeChoice = "light" | "dark" | "system";

const NEXT_THEME: Record<ThemeChoice, ThemeChoice> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const LABEL: Record<ThemeChoice, string> = {
  light: "Light theme — switch to dark",
  dark: "Dark theme — switch to system",
  system: "System theme — switch to light",
};

// No-op subscribe — we just want the SSR snapshot to differ from the client one
// so React knows to swap the icon on hydration without warning. next-themes
// itself drives re-renders when the theme changes.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const current: ThemeChoice = mounted
    ? ((theme as ThemeChoice | undefined) ?? "system")
    : "system";

  const Icon =
    current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(NEXT_THEME[current])}
      aria-label={LABEL[current]}
      title={LABEL[current]}
    >
      <Icon className="size-4" />
    </Button>
  );
}
