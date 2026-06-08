// =============================================
// OBSIDIAN - Wallet Checker (Super Simple Version)
// =============================================

require('dotenv').config();

async function checkWalletBalance() {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    console.log("❌ WALLET_PRIVATE_KEY belum diisi di .env");
    return { success: false, error: "Private key belum diisi" };
  }

  console.log("👛 Wallet Checker aktif (mode test)");
  console.log("💰 Saldo SOL: [TEST MODE - 2.45 SOL]");

  return {
    success: true,
    address: "TestWallet...",
    balanceSOL: 2.45
  };
}

module.exports = { checkWalletBalance };