"use client";

import { useSearchParams } from "next/navigation";

export function AuthErrorBanner() {
  const params = useSearchParams();
  if (params.get("error") !== "auth") return null;
  return (
    <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-center text-sm text-red-700">
      Sign in failed. Please try again.
    </div>
  );
}
