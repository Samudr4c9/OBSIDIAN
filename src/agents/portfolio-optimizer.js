// =============================================
// OBSIDIAN - Portfolio Optimizer Agent
// =============================================

function optimizePortfolio(currentPositions, walletBalance) {
  const totalAllocated = currentPositions.reduce((sum, p) => sum + p.sizeSOL, 0);
  const remaining = walletBalance - totalAllocated;

  return {
    totalAllocated: totalAllocated.toFixed(2),
    remainingBalance: remaining.toFixed(2),
    diversificationScore: currentPositions.length > 3 ? "GOOD" : "NEED IMPROVEMENT",
    suggestion: remaining > 0.5 ? 
      `Deploy ${remaining.toFixed(2)} SOL ke pool baru` : 
      "Portfolio sudah optimal, fokus monitoring"
  };
}

module.exports = { optimizePortfolio };