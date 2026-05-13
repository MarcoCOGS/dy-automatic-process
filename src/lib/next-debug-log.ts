type DebugDetails = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN = /token|password|secret|key|authorization|cookie/i;

const isDebugEnabled = () => {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_DEBUG_LOGS === 'true' ||
    process.env.NEXT_PUBLIC_NEXT_DEBUG_LOGS === 'true'
  );
};

const sanitizeDetails = (details?: DebugDetails): DebugDetails | undefined => {
  if (!details) return undefined;

  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : value]),
  );
};

export const nextDebugLog = (scope: string, event: string, details?: DebugDetails) => {
  if (!isDebugEnabled()) return;

  const sanitizedDetails = sanitizeDetails(details);
  const label = `[next-debug:${scope}] ${event}`;

  if (sanitizedDetails) {
    console.info(label, sanitizedDetails);
    return;
  }

  console.info(label);
};

export const nextDebugError = (scope: string, event: string, details?: DebugDetails) => {
  if (!isDebugEnabled()) return;

  const sanitizedDetails = sanitizeDetails(details);
  const label = `[next-debug:${scope}] ${event}`;

  if (sanitizedDetails) {
    console.error(label, sanitizedDetails);
    return;
  }

  console.error(label);
};
