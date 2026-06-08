/**
 * Integration module: Token Analyzer → Screening Cycle → Telegram
 * This hooks the multi-agent analysis into the pool screening pipeline
 */

import { log } from "./logger.js";
import { config } from "./config.js";
import {
  runComprehensiveTokenAnalysis,
  formatAnalysisForTelegram,
} from "./token-analyzer.js";
import { shouldSendSignal, recordMessageId } from "./signal-dedup.js";

/**
 * Enhanced screening function to be called in index.js before deploy decision
 * Returns: { pass: boolean, analysis: AnalysisResult, message: string }
 */
export async function screenTokenBeforeDeploy(pool, tokenInfo, txData) {
  try {
    // Prepare data for analyzers
    const tokenData = {
      created_at: tokenInfo?.created_at || new Date(Date.now() - 2 * 3600000).toISOString(),
      volume_24h: pool?.volume_window || tokenInfo?.volume_24h || 0,
      market_cap: pool?.mcap || tokenInfo?.market_cap || 0,
      audit: tokenInfo?.audit || {},
      top_holders: tokenInfo?.top_holders || [],
      total_supply: tokenInfo?.total_supply || 1,
      freeze_authority: tokenInfo?.freeze_authority,
      mint_authority: tokenInfo?.mint_authority,
    };

    const poolData = {
      bin_step: pool?.bin_step || 1,
      fee_pct: pool?.fee_pct || 0.05,
      tvl: pool?.tvl || pool?.active_tvl || 0,
      fee_active_tvl_ratio: pool?.fee_active_tvl_ratio || 0.1,
    };

    const transactionData = {
      recent_large_buys: txData?.recent_large_buys || [],
    };

    // Run comprehensive analysis (5 agents)
    log("screening", `Analyzing token: ${pool.name || pool.pool.slice(0, 8)}`);
    const analysis = runComprehensiveTokenAnalysis(
      tokenData,
      poolData,
      transactionData
    );

    // Log each agent's result
    log("screening_analysis", `Bundle Score: ${analysis.agents.bundleAnalysis.score}/100`);
    log("screening_analysis", `Volume Health: ${analysis.agents.volumeHealth.score}/100 (ratio: ${analysis.agents.volumeHealth.ratio.toFixed(4)})`);
    log("screening_analysis", `Token Age: ${analysis.agents.tokenAge.ageHours}h ${analysis.agents.tokenAge.ageMinutes % 60}m - ${analysis.agents.tokenAge.pass ? 'PASS' : 'FAIL'}`);
    log("screening_analysis", `Pool Metrics: ${analysis.agents.poolMetrics.score}/100`);
    if (analysis.agents.whaleDetection.whaleDetected) {
      log("screening_analysis", `🐋 WHALE DETECTED: ${analysis.agents.whaleDetection.whales.length} whale(s)`);
    }

    // Check if passed all criteria
    const finalPass = analysis.pass;
    log(
      finalPass ? "screening_pass" : "screening_reject",
      `Token ${pool.name}: Score ${analysis.score}/100 - ${finalPass ? "✅ APPROVED" : "❌ REJECTED"}`
    );

    return {
      pass: finalPass,
      analysis,
      message: formatAnalysisForTelegram(analysis, pool.name, pool.pool),
    };
  } catch (error) {
    log("screening_error", `Token analysis failed: ${error.message}`);
    return {
      pass: false,
      analysis: null,
      message: `Analysis error: ${error.message}`,
    };
  }
}

/**
 * Send analysis result to Telegram (if passed)
 */
export async function sendScreeningResultToTelegram(
  pool,
  analysisResult,
  sendHTML
) {
  if (!analysisResult.pass) {
    log("screening", `Skipping telegram: ${pool.name} did not pass analysis`);
    return;
  }

  try {
    // Check deduplication (don't spam same pool within 1 hour)
    if (!shouldSendSignal(pool.pool, "screening", pool.name)) {
      log("screening", `Skipping telegram: ${pool.name} already notified in last hour`);
      return;
    }

    // Send to telegram
    const result = await sendHTML(
      `🔍 **SCREENING PASSED**\n\n${analysisResult.message}`
    );

    // Record message ID for tracking
    if (result?.result?.message_id) {
      recordMessageId(pool.pool, "screening", result.result.message_id);
      log("screening", `Telegram sent for ${pool.name}`);
    }
  } catch (error) {
    log("telegram_error", `Failed to send screening result: ${error.message}`);
  }
}

/**
 * Special handling for whale detection
 */
export function handleWhaleAlert(pool, analysis, sendHTML) {
  if (!analysis.agents.whaleDetection.whaleDetected) return;

  const whales = analysis.agents.whaleDetection.whales;
  let whaleMessage = `🐋 **WHALE ALERT** - ${pool.name}\n\n`;

  for (const whale of whales) {
    whaleMessage += `Wallet: \`${whale.address.slice(0, 16)}...\`\n`;
    whaleMessage += `Holding: ${whale.percentage.toFixed(2)}%\n\n`;
  }

  whaleMessage += `Pool: ${pool.pool}\nAnalysis Score: ${analysis.score}/100`;

  // Send as special whale alert (different from regular screening)
  if (shouldSendSignal(pool.pool, "whale_alert", pool.name)) {
    sendHTML(whaleMessage).catch((e) =>
      log("telegram_error", `Whale alert failed: ${e.message}`)
    );
    recordMessageId(pool.pool, "whale_alert", 0); // Mark as sent
  }
}
