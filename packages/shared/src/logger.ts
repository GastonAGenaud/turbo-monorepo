import pino from "pino";

const VALID_LEVELS = new Set([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

function resolveLogLevel(rawLevel: string | undefined): string {
  const normalized = rawLevel?.trim().toLowerCase();
  return normalized && VALID_LEVELS.has(normalized) ? normalized : "info";
}

export const logger = pino({
  level: resolveLogLevel(process.env.LOG_LEVEL),
  redact: ["req.headers.authorization", "password", "token"],
  base: {
    app: "ggseeds",
  },
});
