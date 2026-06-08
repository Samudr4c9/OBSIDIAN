// =============================================
// OBSIDIAN - Risk Manager Agent
// =============================================

function assessRisk(position, walletBalance, marketVolatility = "MEDIUM") {
  let riskScore = 0;
  let warnings = [];

  if (walletBalance < 0.5) {
    riskScore += 40;
    warnings.push("Saldo SOL sangat rendah");
  }
  if (position.riskLevel === "HIGH") {
    riskScore += 35;
    warnings.push("Risiko Impermanent Loss tinggi");
  }
  if (marketVolatility === "HIGH") {
    riskScore += 25;
    warnings.push("Pasar sedang volatile");
  }

  const riskLevel = riskScore > 70 ? "HIGH" : riskScore > 40 ? "MEDIUM" : "LOW";

  return {
    riskScore,
    riskLevel,
    warnings,
    maxAllocation: riskLevel === "HIGH" ? 0.2 : riskLevel === "MEDIUM" ? 0.35 : 0.5
  };
}

module.exports = { assessRisk };