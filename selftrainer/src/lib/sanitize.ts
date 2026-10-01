export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";

  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .trim();
}
