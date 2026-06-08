/**
 * Telegram Signal Deduplicator
 * Prevents duplicate Telegram notifications for the same pool within a time window
 * Tracks by: pool_address + event_type
 */

import fs from "fs";
import { log } from "./logger.js";
import { repoPath } from "./repo-root.js";

const DEDUP_FILE = repoPath("signal-dedup-cache.json");
const DEDUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour window to deduplicate

interface DedupRecord {
  pool: string; // pool address
  type: string; // "deploy" | "close" | "claim" | "swap" | "oor" | "alert"
  pair?: string; // token pair for logging
  timestamp: number;
  messageId?: number; // Telegram message ID (optional, for editing)
}

function loadDedupCache(): DedupRecord[] {
  if (!fs.existsSync(DEDUP_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DEDUP_FILE, "utf8"));
  } catch (e) {
    log("dedup_warn", `Failed to load dedup cache: ${e.message}`);
    return [];
  }
}

function saveDedupCache(cache: DedupRecord[]): void {
  try {
    fs.writeFileSync(DEDUP_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    log("dedup_error", `Failed to save dedup cache: ${e.message}`);
  }
}

function cleanExpiredEntries(cache: DedupRecord[], now: number): DedupRecord[] {
  // Remove entries older than DEDUP_WINDOW_MS
  return cache.filter((entry) => now - entry.timestamp < DEDUP_WINDOW_MS);
}

/**
 * Check if this signal should be sent (not a duplicate)
 * @returns true if allowed (not a duplicate), false if it's a duplicate
 */
export function shouldSendSignal(
  poolAddress: string,
  eventType: "deploy" | "close" | "claim" | "swap" | "oor" | "alert",
  pairName?: string
): boolean {
  const now = Date.now();
  let cache = loadDedupCache();
  
  // Clean expired entries
  cache = cleanExpiredEntries(cache, now);
  
  // Check for existing entry with same pool + type within window
  const existing = cache.find(
    (entry) => entry.pool === poolAddress && entry.type === eventType
  );
  
  if (existing) {
    const ageSeconds = Math.floor((now - existing.timestamp) / 1000);
    const ageMinutes = Math.floor(ageSeconds / 60);
    log(
      "dedup_blocked",
      `Blocked duplicate ${eventType} for ${pairName || poolAddress} (sent ${ageMinutes}m ${ageSeconds % 60}s ago)`
    );
    return false;
  }
  
  // Record this signal
  cache.push({
    pool: poolAddress,
    type: eventType,
    pair: pairName,
    timestamp: now,
  });
  
  saveDedupCache(cache);
  log("dedup_allow", `Allowed ${eventType} for ${pairName || poolAddress}`);
  return true;
}

/**
 * Register a Telegram message ID for an event (for later editing)
 */
export function recordMessageId(
  poolAddress: string,
  eventType: string,
  messageId: number
): void {
  let cache = loadDedupCache();
  const entry = cache.find(
    (e) => e.pool === poolAddress && e.type === eventType
  );
  if (entry) {
    entry.messageId = messageId;
    saveDedupCache(cache);
    log("dedup_track", `Tracked message ID ${messageId} for ${eventType}`);
  }
}

/**
 * Get the message ID for an event (if already sent)
 */
export function getMessageId(
  poolAddress: string,
  eventType: string
): number | null {
  const cache = loadDedupCache();
  const entry = cache.find(
    (e) => e.pool === poolAddress && e.type === eventType
  );
  return entry?.messageId ?? null;
}

/**
 * Clear all dedup records (useful for testing)
 */
export function clearDedupCache(): void {
  try {
    fs.unlinkSync(DEDUP_FILE);
    log("dedup", "Cleared dedup cache");
  } catch (e) {
    if (!(e instanceof Error && e.message.includes("ENOENT"))) {
      log("dedup_error", `Failed to clear dedup cache: ${e.message}`);
    }
  }
}

/**
 * Get cache stats (for debugging)
 */
export function getDedupStats(): {
  total: number;
  byType: Record<string, number>;
} {
  const cache = loadDedupCache();
  const now = Date.now();
  const active = cleanExpiredEntries(cache, now);
  
  const byType: Record<string, number> = {};
  for (const entry of active) {
    byType[entry.type] = (byType[entry.type] ?? 0) + 1;
  }
  
  return {
    total: active.length,
    byType,
  };
}
