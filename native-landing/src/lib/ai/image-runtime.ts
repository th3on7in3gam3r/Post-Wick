import axios from "axios";
import { createHash } from "node:crypto";

export type ImageProviderId = "openai" | "gemini" | "ideogram";

export type CircuitHealth = {
  provider: ImageProviderId;
  state: "closed" | "open" | "half-open";
  consecutiveFailures: number;
  openedAt: string | null;
  nextAttemptAt: string | null;
};

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 60_000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

type CircuitState = CircuitHealth["state"];

class CircuitBreaker {
  private state: CircuitState = "closed";
  private consecutiveFailures = 0;
  private openedAt = 0;

  constructor(readonly provider: ImageProviderId) {}

  canAttempt(now = Date.now()) {
    if (this.state === "closed") return true;
    if (this.state === "open" && now - this.openedAt >= COOLDOWN_MS) {
      this.state = "half-open";
      return true;
    }
    return this.state === "half-open";
  }

  recordSuccess() {
    this.state = "closed";
    this.consecutiveFailures = 0;
    this.openedAt = 0;
  }

  recordFailure() {
    if (this.state === "half-open") {
      this.openCircuit();
      return;
    }

    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= FAILURE_THRESHOLD) {
      this.openCircuit();
    }
  }

  getHealth(): CircuitHealth {
    const now = Date.now();
    const readyForProbe =
      this.state === "open" && this.openedAt > 0 && now - this.openedAt >= COOLDOWN_MS;
    const reportedState: CircuitState =
      this.state === "open" && readyForProbe ? "half-open" : this.state;
    const nextAttemptAt =
      this.state === "open" && this.openedAt > 0 && !readyForProbe
        ? new Date(this.openedAt + COOLDOWN_MS).toISOString()
        : null;

    return {
      provider: this.provider,
      state: reportedState,
      consecutiveFailures: this.consecutiveFailures,
      openedAt: this.openedAt > 0 ? new Date(this.openedAt).toISOString() : null,
      nextAttemptAt,
    };
  }

  private openCircuit() {
    this.state = "open";
    this.openedAt = Date.now();
    this.consecutiveFailures = 0;
  }
}

const circuits: Record<ImageProviderId, CircuitBreaker> = {
  openai: new CircuitBreaker("openai"),
  gemini: new CircuitBreaker("gemini"),
  ideogram: new CircuitBreaker("ideogram"),
};

type CacheEntry = { url: string; expiresAt: number };

const promptCache = new Map<string, CacheEntry>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hashPrompt(prompt: string) {
  return createHash("sha256").update(prompt).digest("hex");
}

export function getCachedImageUrl(prompt: string) {
  const key = hashPrompt(prompt);
  const entry = promptCache.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    promptCache.delete(key);
    return null;
  }

  return entry.url;
}

export function setCachedImageUrl(prompt: string, url: string) {
  promptCache.set(hashPrompt(prompt), {
    url,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function getImageProviderCircuitHealth(): CircuitHealth[] {
  return (Object.keys(circuits) as ImageProviderId[]).map((provider) =>
    circuits[provider].getHealth(),
  );
}

export function isRetryableProviderError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!status) return true;
    if (status === 401 || status === 402 || status === 403) return false;
    if (status === 429 || status >= 500) return true;
    return false;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("timeout") || message.includes("network")) {
      return true;
    }
  }

  return false;
}

export async function callProviderWithResilience<T>(
  provider: ImageProviderId,
  operation: () => Promise<T>,
): Promise<T> {
  const circuit = circuits[provider];

  if (!circuit.canAttempt()) {
    const health = circuit.getHealth();
    throw new Error(
      `${provider} circuit is open until ${health.nextAttemptAt ?? "later"}`,
    );
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const result = await operation();
      circuit.recordSuccess();
      return result;
    } catch (error) {
      lastError = error;
      const retryable = isRetryableProviderError(error);
      const isLastAttempt = attempt === MAX_RETRY_ATTEMPTS;

      if (!retryable || isLastAttempt) {
        circuit.recordFailure();
        throw error;
      }

      const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(
        `[image-generation] ${provider} transient error, retry ${attempt}/${MAX_RETRY_ATTEMPTS} in ${delay}ms`,
      );
      await sleep(delay);
    }
  }

  circuit.recordFailure();
  throw lastError;
}
