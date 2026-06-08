// =============================================
// OBSIDIAN - Market Scanner (Safe & Smart)
// =============================================

const axios = require('axios');

async function scanMarket() {
  console.log("📡 Scanning market (GMGN + pump.fun + fallback)...");

  let gmgnData = { goodTokens: 0 };
  let pumpData = { newLaunches: 0 };

  // GMGN - dengan safety
  try {
    const res = await axios.get('https://gmgn.ai/api/defi/tokens?limit=15', { timeout: 7000 });
    const tokens = res.data?.data || [];
    gmgnData.goodTokens = tokens.filter(t => t.smart_money?.length > 0).length;
    console.log(`✅ GMGN: ${gmgnData.goodTokens} smart money detected`);
  } catch (e) {
    console.log("⚠️ GMGN skipped (blocked)");
  }

  // pump.fun - dengan safety
  try {
    const res = await axios.get('https://pump.fun/api/trending', { timeout: 7000 });
    const data = res.data || [];
    pumpData.newLaunches = Array.isArray(data) ? data.length : 0;
    console.log(`✅ pump.fun: ${pumpData.newLaunches} trending tokens`);
  } catch (e) {
    console.log("⚠️ pump.fun skipped");
  }

  return {
    gmgn: gmgnData.goodTokens,
    pumpfun: pumpData.newLaunches,
    totalActivity: gmgnData.goodTokens + pumpData.newLaunches
  };
}

module.exports = { scanMarket };