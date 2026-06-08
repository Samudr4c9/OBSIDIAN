// =============================================
// OBSIDIAN - Logger System
// =============================================

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../data/logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function writeLog(cycleNumber, data) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    cycle: cycleNumber,
    ...data
  };

  const logFile = path.join(logDir, `cycle-${Math.floor(Date.now()/100000)}.json`);

  fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + ",\n");
  
  console.log(`💾 Log cycle ${cycleNumber} disimpan`);
}

module.exports = { writeLog };