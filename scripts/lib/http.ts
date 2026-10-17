// Wikimedia asks API clients to identify themselves with a descriptive User-Agent.
export const USER_AGENT =
  "Patelin/0.1 (https://github.com/seishiiinsan/patelin)";

const RETRIES = 6;

// Fetches a JSON document, retrying on network errors, 429 and 5xx answers. Waits as long as
// the server's Retry-After asks (rate limits), otherwise backs off exponentially.
export async function fetchJson<T>(
  url: string | URL,
  init: RequestInit = {},
): Promise<T> {
  let lastError: unknown;
  let wait = 0;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    if (attempt > 0) await sleep(wait || 1000 * 2 ** attempt);
    wait = 0;
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
          ...init.headers,
        },
      });
      if (response.ok) return (await response.json()) as T;
      lastError = new Error(
        `${response.status} ${response.statusText} for ${url}`,
      );
      if (response.status !== 429 && response.status < 500) break;
      const retryAfter = Number(response.headers.get("retry-after"));
      if (retryAfter > 0) wait = Math.min(retryAfter, 120) * 1000;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size));
  return chunks;
}
