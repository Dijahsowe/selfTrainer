const tracker = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  limit = 10,
  windowMs = 60_000,
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const existing = tracker.get(userId);

  if (!existing || now >= existing.resetAt) {
    tracker.set(userId, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetInMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetInMs: Math.max(0, existing.resetAt - now),
  };
}
