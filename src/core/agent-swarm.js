// =============================================
// OBSIDIAN - Main Agent Swarm (Updated)
// =============================================

const { scanPools } = require('../tools/screener');
const { checkWalletBalance } = require('../tools/wallet');
const { scanMarket } = require('../tools/market-scanner');
const { recommendAndSimulate } = require('../tools/position-manager');
const { assessRisk } = require('../agents/risk-manager');
const { runBacktest } = require('../backtester/backtester');
const { checkSafetyBeforeLive } = require('./safety');
const { sendNotification } = require('../ui/telegram');
const { askAI } = require('./llm');

class AgentSwarm {
  constructor() {
    this.cycleCount = 0;
  }

  async runCycle() {
    this.cycleCount++;
    console.log(`\n🔄 === CYCLE ${this.cycleCount} DIMULAI ===`);

    const wallet = await checkWalletBalance();
    const dlmm = await scanPools();
    const market = await scanMarket();

    const position = recommendAndSimulate(dlmm, market, wallet.balanceSOL || 0);
    const risk = assessRisk(position, wallet.balanceSOL || 0);

    const aiAdvice = await askAI("Berikan saran singkat dalam Bahasa Indonesia berdasarkan kondisi saat ini.");

    const safety = checkSafetyBeforeLive(wallet.balanceSOL || 0, position.sizeSOL || 0);

    const notif = 
`OBSIDIAN LAPORAN CYCLE ${this.cycleCount}

Saldo Wallet     : ${wallet.balanceSOL} SOL
Pool DLMM        : ${dlmm.goodPools}
GMGN             : ${market.gmgn}
pump.fun         : ${market.pumpfun}

Rekomendasi      : ${position.action}
Risiko           : ${risk.riskLevel}
Ukuran           : ${(position.sizeSOL || 0).toFixed(2)} SOL
Safety Check     : ${safety.safe ? "AMAN" : "TIDAK AMAN"}

Saran AI:
${aiAdvice}`;

    await sendNotification(notif);

    console.log(`✅ Cycle ${this.cycleCount} selesai.\n`);
  }
}

module.exports = { AgentSwarm };