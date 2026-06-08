const fs = require('fs');
const path = require('path');

// Path root proyek (folder OBSIDIAN)
const rootDir = path.join(__dirname, '..');

console.log("🚀 OBSIDIAN Setup Wizard");
console.log("Membuat file konfigurasi...\n");

// Copy .env.example → .env
const envExample = path.join(rootDir, '.env.example');
const envFile = path.join(rootDir, '.env');

if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
  fs.copyFileSync(envExample, envFile);
  console.log("✅ .env telah dibuat");
} else if (fs.existsSync(envFile)) {
  console.log("✅ .env sudah ada");
}

// Copy user-config.example.json → user-config.json
const configExample = path.join(rootDir, 'user-config.example.json');
const configFile = path.join(rootDir, 'user-config.json');

if (fs.existsSync(configExample) && !fs.existsSync(configFile)) {
  fs.copyFileSync(configExample, configFile);
  console.log("✅ user-config.json telah dibuat");
} else if (fs.existsSync(configFile)) {
  console.log("✅ user-config.json sudah ada");
}

console.log("\n✅ Setup selesai!");
console.log("Sekarang jalankan: npm run dev");