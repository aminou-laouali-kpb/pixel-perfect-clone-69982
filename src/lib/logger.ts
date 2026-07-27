type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

function log(level: LogLevel, message: string, detail?: unknown) {
  if (level === "debug" && !isDev) return;
  const payload = detail !== undefined ? [message, detail] : [message];
  const fn = level === "debug" ? console.log : console[level];
  fn(...payload);
}

/** Lightweight logger — debug silenced in production. */
export const logger = {
  debug: (message: string, detail?: unknown) => log("debug", message, detail),
  info: (message: string, detail?: unknown) => log("info", message, detail),
  warn: (message: string, detail?: unknown) => log("warn", message, detail),
  error: (message: string, detail?: unknown) => log("error", message, detail),
};
