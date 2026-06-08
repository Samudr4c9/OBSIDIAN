// =============================================
// OBSIDIAN - Main Entry Point
// =============================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../user-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log("🚀 OBSIDIAN sedang dijalankan...");
console.log("📌 Mode: DRY RUN (aman)");

// Import Agent Swarm
const { AgentSwarm } = require('./core/agent-swarm');
const swarm = new AgentSwarm();

// Import Telegram
const { bot, setSwarm } = require('./ui/telegram');
setSwarm(swarm);   // Hubungkan swarm ke telegram

// Jalankan cycle otomatis
setInterval(() => {
  swarm.runCycle();
}, 30000);

// Jalankan cycle pertama
swarm.runCycle();

console.log("\n✅ OBSIDIAN + Telegram terintegrasi!");
console.log("Bot siap dikontrol dari Telegram.");
console.log("Tekan Ctrl + C untuk stop.");