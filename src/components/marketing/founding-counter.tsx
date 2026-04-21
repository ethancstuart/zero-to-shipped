"use client";

import { useEffect, useState, useCallback } from "react";

export function FoundingCounter() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [total, setTotal] = useState<number>(200);

  const fetchSpots = useCallback(() => {
    fetch("/api/founding-spots")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.remaining === "number") {
          setRemaining(data.remaining);
        }
        if (typeof data.total === "number") {
          setTotal(data.total);
        }
      })
      .catch(() => {
        // Silently fail — counter just won't show
      });
  }, []);

  useEffect(() => {
    fetchSpots();
    const interval = setInterval(fetchSpots, 60_000);
    return () => clearInterval(interval);
  }, [fetchSpots]);

  if (remaining === null) {
    return (
      <p className="text-sm font-medium text-transparent select-none" aria-hidden>
        &nbsp;
      </p>
    );
  }

  const colorClass =
    remaining < 10
      ? "text-red-500"
      : remaining < 50
        ? "text-amber-500"
        : "text-green-500";

  const pulseClass = remaining < 25 ? "animate-pulse" : "";

  return (
    <p className={`text-sm font-medium ${colorClass} ${pulseClass}`}>
      {remaining} of {total} founding spots remaining
    </p>
  );
}
