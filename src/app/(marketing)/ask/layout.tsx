import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask",
  description:
    "Ask questions about AI coding tools and get answers powered by our AI assistant.",
};

export default function AskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
