// =============================================
// OBSIDIAN - Telegram (Plain Text Only)
// =============================================

const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
let swarmInstance = null;

bot.start((ctx) => ctx.reply('OBSIDIAN telah aktif'));
bot.command('status', (ctx) => ctx.reply('OBSIDIAN sedang berjalan'));
bot.command('cycle', async (ctx) => {
  if (swarmInstance) await swarmInstance.runCycle();
});

bot.launch()
  .then(() => console.log("✅ Telegram Bot aktif (Plain Text Mode)"))
  .catch(err => console.error("❌ Telegram error:", err.message));

async function sendNotification(message) {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (chatId) {
      await bot.telegram.sendMessage(chatId, message);   // Tanpa parse_mode
      console.log("✅ Notifikasi terkirim");
    }
  } catch (err) {
    console.log("❌ Gagal kirim notifikasi:", err.message);
  }
}

module.exports = { sendNotification, setSwarm: (swarm) => { swarmInstance = swarm; } };