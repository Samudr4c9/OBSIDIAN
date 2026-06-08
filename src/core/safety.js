// =============================================
// OBSIDIAN - Safety & Live Mode Controller
// =============================================

function checkSafetyBeforeLive(walletBalance, positionSize) {
  if (walletBalance < 0.5) {
    return { safe: false, reason: "Saldo SOL terlalu rendah untuk live mode" };
  }
  if (positionSize > walletBalance * 0.4) {
    return { safe: false, reason: "Ukuran posisi terlalu besar (max 40% saldo)" };
  }
  return { safe: true, reason: "Safety check passed" };
}

function isLiveMode() {
  return process.env.DRY_RUN === 'false' || process.env.LIVE_MODE === 'true';
}

module.exports = { checkSafetyBeforeLive, isLiveMode };