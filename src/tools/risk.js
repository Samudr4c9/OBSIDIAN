// =============================================
// OBSIDIAN - Risk & Decision Maker
// =============================================

function evaluatePool(pool, walletBalance) {
  let score = 0;
  let reason = [];

  // TVL / Liquidity Score
  if (pool.liquidity > 50000) {
    score += 40;
    reason.push("TVL tinggi");
  } else if (pool.liquidity > 10000) {
    score += 20;
    reason.push("TVL sedang");
  }

  // Volume Score
  if (pool.volume24h && pool.volume24h > 100000) {
    score += 30;
    reason.push("Volume 24h bagus");
  }

  // Risk Score
  if (walletBalance < 1) {
    score -= 20;
    reason.push("Saldo SOL rendah");
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    recommendation: finalScore > 70 ? "✅ BAGUS UNTUK LP" : 
                   finalScore > 50 ? "⚠️  BISA DIPERTIMBANGKAN" : 
                   "❌ TIDAK DIREKOMENDASIKAN",
    reasons: reason
  };
}

module.exports = { evaluatePool };