import * as Sentry from "@sentry/nextjs";

type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownMs: number;
  name: string;
}

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly cooldownMs: number;
  private readonly name: string;

  constructor(config: CircuitBreakerConfig) {
    this.failureThreshold = config.failureThreshold;
    this.cooldownMs = config.cooldownMs;
    this.name = config.name;
  }

  async execute<T>(
    fn: () => Promise<T>,
    fallback: () => T | Promise<T>,
  ): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = "half-open";
      } else {
        return fallback();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      Sentry.captureException(error, { tags: { circuit: this.name } });
      return fallback();
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = "open";
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.state = "closed";
    this.lastFailureTime = 0;
  }
}

export const supabaseBreaker = new CircuitBreaker({
  name: "supabase",
  failureThreshold: 3,
  cooldownMs: 60_000,
});
export const claudeBreaker = new CircuitBreaker({
  name: "claude",
  failureThreshold: 3,
  cooldownMs: 60_000,
});
export const geminiBreaker = new CircuitBreaker({
  name: "gemini",
  failureThreshold: 5,
  cooldownMs: 120_000,
});
