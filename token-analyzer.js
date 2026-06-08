/**
 * Enhanced Token Screening System
 * Multi-agent analysis pipeline before Telegram notification
 */

import { log } from "./logger.js";

const VOLUME_MCAP_MIN_RATIO = 0.08; // $2000/$20000 = 0.1, threshold 0.08
const WHALE_WALLET_THRESHOLD_PCT = 10; // Whale = 10%+ of supply
const DEV_CONCENTRATION_WARNING_PCT = 30; // Dev holding >30% = risky

/**
 * ====== AGENT 1: Bundle & Dev Analysis ======
 * Analyzes if dev has excessive token concentration or suspicious bundle
 */
export function analyzeDevBundle(tokenData) {
  const result = {
    pass: true,
    warnings: [],
    score: 100, // 100 = perfect, 0 = reject
  };

  if (!tokenData) return result;

  const {
    audit = {},
    top_holders = [],
    deployer = {},
    freeze_authority = null,
    mint_authority = null,
  } = tokenData;

  // Check 1: Top holder concentration (deployer usually #1)
  if (top_holders.length > 0) {
    const topHolder = top_holders[0];
    const topHolderPct = topHolder.percentage || 0;

    if (topHolderPct > 50) {
      result.warnings.push(`🚨 Top holder: ${topHolderPct}% (MAJOR RED FLAG)`);
      result.pass = false;
      result.score -= 50;
    } else if (topHolderPct > DEV_CONCENTRATION_WARNING_PCT) {
      result.warnings.push(`⚠️ Dev concentration: ${topHolderPct}% (risky)`);
      result.score -= 15;
    }
  }

  // Check 2: Freezeable supply (dev can freeze tokens)
  if (freeze_authority && freeze_authority !== "none") {
    result.warnings.push(`⚠️ Freeze authority active (dev can freeze)`);
    result.score -= 10;
  }

  // Check 3: Mint authority (dev can print more)
  if (mint_authority && mint_authority !== "none") {
    result.warnings.push(`⚠️ Mint authority active (dev can inflate)`);
    result.score -= 15;
  }

  // Check 4: Bot holder percentage
  const botPct = audit?.bot_holders_pct ?? 0;
  if (botPct > 40) {
    result.warnings.push(`🤖 Bot holders: ${botPct}% (suspicious)`);
    result.score -= 20;
    result.pass = false;
  } else if (botPct > 20) {
    result.warnings.push(`⚠️ Bot holders: ${botPct}% (watch out)`);
    result.score -= 8;
  }

  return result;
}

/**
 * ====== AGENT 2: Volume & Market Cap Health ======
 * Checks if volume is healthy relative to market cap
 */
export function analyzeVolumeMcapHealth(tokenData) {
  const result = {
    pass: true,
    warnings: [],
    score: 100,
    ratio: 0,
  };

  if (!tokenData) return result;

  const volume24h = tokenData.volume_24h || tokenData.volume || 0;
  const mcap = tokenData.market_cap || 0;

  if (mcap <= 0) {
    result.warnings.push(`❌ Invalid market cap: ${mcap}`);
    result.pass = false;
    return result;
  }

  const ratio = volume24h / mcap;
  result.ratio = ratio;

  if (ratio < 0.01) {
    result.warnings.push(
      `🔴 Volume/MCap ratio: ${ratio.toFixed(4)} (DEAD POOL)`
    );
    result.pass = false;
    result.score -= 40;
  } else if (ratio < VOLUME_MCAP_MIN_RATIO) {
    result.warnings.push(
      `🟠 Volume/MCap ratio: ${ratio.toFixed(4)} (low liquidity)`
    );
    result.score -= 20;
    result.pass = false;
  } else if (ratio > 0.5) {
    result.warnings.push(
      `✅ Healthy Volume/MCap ratio: ${ratio.toFixed(4)} (active)`
    );
    result.score += 10;
  } else {
    result.warnings.push(`Volume/MCap ratio: ${ratio.toFixed(4)} (acceptable)`);
  }

  return result;
}

/**
 * ====== AGENT 3: Whale Detection ======
 * Detects when large wallets (whales) enter the pool
 */
export function detectWhaleActivity(tokenData, transactionData = {}) {
  const result = {
    whaleDetected: false,
    whales: [],
    warnings: [],
    score: 0, // +1 to +10 for whale activity
  };

  if (!tokenData) return result;

  const { top_holders = [], holders_total = 0 } = tokenData;
  const { recent_large_buys = [] } = transactionData;

  // Check 1: Find existing whale holders
  for (const holder of top_holders) {
    const pct = holder.percentage || 0;
    if (pct >= WHALE_WALLET_THRESHOLD_PCT) {
      result.whales.push({
        address: holder.address,
        percentage: pct,
        lamports: holder.lamports,
      });
      result.whaleDetected = true;
      result.warnings.push(
        `🐋 WHALE DETECTED: ${holder.address.slice(0, 6)}... holding ${pct}%`
      );
      result.score += 5;
    }
  }

  // Check 2: Recent large transactions
  for (const tx of recent_large_buys) {
    const txPct = (tx.amount / (tokenData.total_supply || 1)) * 100;
    if (txPct > WHALE_WALLET_THRESHOLD_PCT) {
      result.whaleDetected = true;
      result.warnings.push(
        `🐋 RECENT WHALE BUY: ${tx.buyer.slice(0, 6)}... bought ${txPct.toFixed(2)}%`
      );
      result.score += 8;
    }
  }

  return result;
}

/**
 * ====== AGENT 4: Token Age Filter ======
 * Ensures token is at least 1 hour old
 */
export function checkTokenAge(tokenData) {
  const result = {
    pass: false,
    ageHours: 0,
    ageMinutes: 0,
    warnings: [],
  };

  if (!tokenData || !tokenData.created_at) {
    result.warnings.push(`⚠️ Token creation time unknown`);
    return result;
  }

  const createdAt = new Date(tokenData.created_at).getTime();
  const now = Date.now();
  const ageMs = now - createdAt;
  const ageMinutes = Math.floor(ageMs / (1000 * 60));
  const ageHours = Math.floor(ageMinutes / 60);

  result.ageMinutes = ageMinutes;
  result.ageHours = ageHours;

  if (ageHours >= 1) {
    result.pass = true;
    result.warnings.push(`✅ Token age: ${ageHours}h ${ageMinutes % 60}m`);
  } else {
    result.pass = false;
    result.warnings.push(
      `🔴 Token too new: ${ageMinutes}m (need 1+ hour)`
    );
  }

  return result;
}

/**
 * ====== AGENT 5: Pool Metrics Integration ======
 * Cross-checks against Meteora pool metrics (bin step, fee, etc)
 */
export function validatePoolMetrics(poolData) {
  const result = {
    pass: true,
    warnings: [],
    score: 100,
  };

  if (!poolData) return result;

  const {
    bin_step = 1,
    fee_pct = 0,
    tvl = 0,
    fee_active_tvl_ratio = 0,
  } = poolData;

  // Check bin step (should be reasonable: 1-125)
  if (bin_step < 1 || bin_step > 125) {
    result.warnings.push(`❌ Invalid bin step: ${bin_step}`);
    result.score -= 30;
    result.pass = false;
  }

  // Check fee consistency
  if (fee_pct < 0.01 || fee_pct > 1) {
    result.warnings.push(`⚠️ Unusual fee: ${fee_pct}%`);
    result.score -= 10;
  }

  // Check TVL
  if (tvl < 1000) {
    result.warnings.push(`🟠 Low TVL: $${tvl}`);
    result.score -= 15;
  }

  // Check fee/TVL ratio
  if (fee_active_tvl_ratio > 0.5) {
    result.warnings.push(`✅ High fee earning potential: ${fee_active_tvl_ratio.toFixed(4)}`);
    result.score += 5;
  }

  return result;
}

/**
 * ====== MASTER ANALYZER: Orchestrate all agents ======
 * Runs all 5 agents and combines scores for final decision
 */
export function runComprehensiveTokenAnalysis(tokenData, poolData, transactionData) {
  const agents = {
    bundleAnalysis: analyzeDevBundle(tokenData),
    volumeHealth: analyzeVolumeMcapHealth(tokenData),
    whaleDetection: detectWhaleActivity(tokenData, transactionData),
    tokenAge: checkTokenAge(tokenData),
    poolMetrics: validatePoolMetrics(poolData),
  };

  // Combine scores
  let finalScore = 0;
  let failCount = 0;
  let allWarnings = [];

  for (const [agentName, result] of Object.entries(agents)) {
    if (result.pass === false) {
      failCount++;
    }
    if (result.score !== undefined) {
      finalScore += result.score;
    }
    if (result.warnings) {
      allWarnings.push(
        ...result.warnings.map((w) => `[${agentName}] ${w}`)
      );
    }
  }

  // Final decision logic
  const finalDecision = {
    pass: failCount === 0 && agents.tokenAge.pass, // Must pass token age + no hard failures
    score: Math.round(finalScore / Object.keys(agents).length),
    agents,
    warnings: allWarnings,
    summary: buildSummary(agents),
  };

  return finalDecision;
}

/**
 * Build human-readable summary for Telegram
 */
function buildSummary(agents) {
  const lines = [];

  if (agents.whaleDetection.whaleDetected) {
    lines.push(`🐋 **WHALE ACTIVITY** - ${agents.whaleDetection.whales.length} whale(s) detected`);
  }

  lines.push(`📊 Volume/MCap Ratio: ${agents.volumeHealth.ratio.toFixed(4)}`);
  lines.push(`⏱️ Token Age: ${agents.tokenAge.ageHours}h ${agents.tokenAge.ageMinutes % 60}m`);

  const bundleScore = agents.bundleAnalysis.score;
  if (bundleScore < 70) {
    lines.push(`🚨 Dev/Bundle Risk: ${bundleScore}/100`);
  } else {
    lines.push(`✅ Dev/Bundle Safe: ${bundleScore}/100`);
  }

  if (agents.poolMetrics.score < 80) {
    lines.push(`⚠️ Pool Metrics: ${agents.poolMetrics.score}/100`);
  }

  return lines.join("\n");
}

/**
 * Utility: Format analysis result for Telegram
 */
export function formatAnalysisForTelegram(analysis, tokenName, poolAddress) {
  if (!analysis) {
    return `❌ Analysis failed for ${tokenName}`;
  }

  const status = analysis.pass ? "✅ PASS" : "❌ FAIL";
  const warnings = analysis.warnings
    .slice(0, 5) // Limit to 5 warnings for telegram
    .join("\n");

  return `**${tokenName}** ${status}\nScore: ${analysis.score}/100\n\n${analysis.summary}\n\nDetails:\n${warnings}`;
}
