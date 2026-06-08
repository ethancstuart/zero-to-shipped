interface LogContext {
  requestId?: string;
  userId?: string;
  route?: string;
  duration_ms?: number;
  [key: string]: unknown;
}

export function log(
  level: "info" | "warn" | "error",
  message: string,
  context?: LogContext,
): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
