"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      tags: { section: this.props.section ?? "unknown" },
      contexts: {
        react: { componentStack: errorInfo.componentStack ?? "" },
      },
    });
  }

  private retry = (): void => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[hsl(var(--fg-muted))]">
            Something went wrong loading this section.
            <button
              onClick={this.retry}
              className="ml-2 underline hover:text-[hsl(var(--fg))]"
            >
              Try again
            </button>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
