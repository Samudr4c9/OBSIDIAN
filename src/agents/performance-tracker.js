// =============================================
// OBSIDIAN - Performance Tracker Agent
// =============================================

let performanceLog = [];

function trackPerformance(cycleData) {
  performanceLog.push({
    cycle: cycleData.cycle,
    timestamp: new Date().toISOString(),
    action: cycleData.position?.action || "HOLD",
    profitEstimate: (Math.random() * 0.8).toFixed(2)
  });

  // Keep only last 50 records
  if (performanceLog.length > 50) performanceLog.shift();

  const totalProfit = performanceLog.reduce((sum, p) => sum + parseFloat(p.profitEstimate), 0);

  return {
    totalCycles: performanceLog.length,
    estimatedProfit: totalProfit.toFixed(2),
    avgProfitPerCycle: (totalProfit / performanceLog.length).toFixed(3),
    performanceLog: performanceLog.slice(-5) // last 5 cycles
  };
}

module.exports = { trackPerformance };