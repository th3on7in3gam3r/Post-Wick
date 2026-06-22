import { logger } from "./logger.js";
import { getOrigin } from "./url-utils.js";

type RobotsRules = {
  disallowed: string[];
  allowed: string[];
  crawlDelayMs?: number;
};

export class RobotsTxt {
  private rules: RobotsRules = { disallowed: [], allowed: [] };
  private loaded = false;

  constructor(
    private readonly origin: string,
    private readonly userAgent: string,
  ) {}

  async load(signal?: AbortSignal): Promise<void> {
    const robotsUrl = `${this.origin}/robots.txt`;

    try {
      const response = await fetch(robotsUrl, {
        headers: { "User-Agent": this.userAgent },
        signal,
      });

      if (!response.ok) {
        logger.warn(`No robots.txt at ${robotsUrl} (${response.status})`);
        this.loaded = true;
        return;
      }

      const text = await response.text();
      this.rules = parseRobots(text, this.userAgent);
      this.loaded = true;
      logger.info(`Loaded robots.txt from ${robotsUrl}`);
    } catch (error) {
      logger.warn(`Failed to fetch robots.txt: ${(error as Error).message}`);
      this.loaded = true;
    }
  }

  get crawlDelayMs(): number | undefined {
    return this.rules.crawlDelayMs;
  }

  isAllowed(url: string): boolean {
    if (!this.loaded) return true;

    let path: string;
    try {
      path = new URL(url).pathname || "/";
    } catch {
      return false;
    }

    const matchingAllow = longestMatch(path, this.rules.allowed);
    const matchingDisallow = longestMatch(path, this.rules.disallowed);

    if (matchingAllow.length > matchingDisallow.length) {
      return true;
    }
    if (matchingDisallow.length > 0) {
      return false;
    }
    return true;
  }
}

function longestMatch(path: string, rules: string[]): string {
  let best = "";
  for (const rule of rules) {
    if (rule === "") continue;
    if (path.startsWith(rule) && rule.length > best.length) {
      best = rule;
    }
  }
  return best;
}

function parseRobots(text: string, userAgent: string): RobotsRules {
  const lines = text
    .split("\n")
    .map((line) => line.split("#")[0].trim())
    .filter(Boolean);

  const groups: Array<{ agents: string[]; rules: RobotsRules }> = [];
  let current: { agents: string[]; rules: RobotsRules } | null = null;

  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      if (!current || current.rules.disallowed.length || current.rules.allowed.length) {
        current = { agents: [], rules: { disallowed: [], allowed: [] } };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (!current) continue;

    if (key === "disallow") {
      current.rules.disallowed.push(value || "/");
    } else if (key === "allow") {
      current.rules.allowed.push(value);
    } else if (key === "crawl-delay") {
      const seconds = Number.parseFloat(value);
      if (!Number.isNaN(seconds)) {
        current.rules.crawlDelayMs = Math.max(
          current.rules.crawlDelayMs ?? 0,
          seconds * 1000,
        );
      }
    }
  }

  const ua = userAgent.toLowerCase();
  const match =
    groups.find((group) => group.agents.includes(ua)) ??
    groups.find((group) => group.agents.includes("*"));

  return match?.rules ?? { disallowed: [], allowed: [] };
}

export async function createRobotsForSeed(
  seedUrl: string,
  userAgent: string,
  signal?: AbortSignal,
): Promise<RobotsTxt> {
  const robots = new RobotsTxt(getOrigin(seedUrl), userAgent);
  await robots.load(signal);
  return robots;
}
