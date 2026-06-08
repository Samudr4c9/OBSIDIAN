// =============================================
// OBSIDIAN - Position Manager (Improved)
// =============================================

function recommendAndSimulate(dlmmData, marketData, walletBalance) {
  const position = {
    action: "HOLD",
    sizeSOL: 0,
    riskLevel: "MEDIUM",
    reason: "Market condition is neutral",
    expectedReturn: "Conservative"
  };

  if (walletBalance < 0.3) {
    position.reason = "Saldo terlalu rendah";
    return position;
  }

  if (dlmmData.goodPools > 50) {
    position.action = "DEPLOY_DLMM";
    position.sizeSOL = Math.min(1.2, walletBalance * 0.35);
    position.riskLevel = "LOW";
    position.reason = "Banyak pool DLMM berkualitas tinggi";
    position.expectedReturn = "8-15% per bulan";
  } 
  else if (marketData.gmgn > 4) {
    position.action = "SNIPE_MEME";
    position.sizeSOL = Math.min(0.7, walletBalance * 0.2);
    position.riskLevel = "HIGH";
    position.reason = "Smart money aktif di GMGN";
    position.expectedReturn = "High risk, high reward";
  } 
  else if (marketData.pumpfun > 8) {
    position.action = "MONITOR_PUMP";
    position.reason = "Banyak token baru di pump.fun";
  }

  return position;
}

module.exports = { recommendAndSimulate };