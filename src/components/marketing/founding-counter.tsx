"use client";

import { useEffect, useState } from "react";

export function FoundingCounter() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/founding-spots")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.remaining === "number") {
          setRemaining(data.remaining);
        }
      })
      .catch(() => {
        // Silently fail — counter just won't show
      });
  }, []);

  if (remaining === null) return null;

  return (
    <p className="text-sm font-medium text-amber-500">
      {remaining} of 100 founding member spots remaining · Ends Apr 15
    </p>
  );
}
