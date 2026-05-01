import { Collection } from "discord.js";
import { BotClient } from "../types";

// ─── Cooldown Manager ─────────────────────────────────────────────────────────

export function checkCooldown(
  client: BotClient,
  userId: string,
  commandName: string,
  cooldownSeconds: number
): { onCooldown: boolean; remaining: number } {
  if (!client.cooldowns.has(commandName)) {
    client.cooldowns.set(commandName, new Collection<string, number>());
  }

  const timestamps = client.cooldowns.get(commandName)!;
  const now = Date.now();
  const cooldownMs = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expiresAt = (timestamps.get(userId) ?? 0) + cooldownMs;

    if (now < expiresAt) {
      const remaining = (expiresAt - now) / 1000;
      return { onCooldown: true, remaining };
    }
  }

  timestamps.set(userId, now);

  // Clean up old timestamps to prevent memory leaks
  setTimeout(() => timestamps.delete(userId), cooldownMs);

  return { onCooldown: false, remaining: 0 };
}

export function formatCooldown(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.ceil((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

// ─── Daily Cooldown Check ─────────────────────────────────────────────────────

export function checkDailyCooldown(lastDaily: Date | null): {
  canClaim: boolean;
  remaining: number;
} {
  if (!lastDaily) return { canClaim: true, remaining: 0 };

  const now = Date.now();
  const lastTime = lastDaily.getTime();
  const cooldown = 24 * 60 * 60 * 1000; // 24 hours in ms
  const elapsed = now - lastTime;

  if (elapsed >= cooldown) {
    return { canClaim: true, remaining: 0 };
  }

  const remaining = (cooldown - elapsed) / 1000;
  return { canClaim: false, remaining };
}