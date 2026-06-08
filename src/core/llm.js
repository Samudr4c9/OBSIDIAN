// =============================================
// OBSIDIAN - LLM AI Brain (Model Stabil)
// =============================================

require('dotenv').config();

async function askAI(prompt) {
  try {
    console.log("🧠 Meminta keputusan dari AI...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Samudr4c9/obsidian",
        "X-Title": "OBSIDIAN"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",     // Model yang stabil & cepat
        messages: [
          { 
            role: "system", 
            content: "Kamu adalah AI trader Liquidity Provider berpengalaman di Solana DLMM. Jawab singkat dan jelas." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.log("❌ LLM Error:", error.message);
    return "AI sedang tidak bisa diakses. Menggunakan keputusan default.";
  }
}

module.exports = { askAI };