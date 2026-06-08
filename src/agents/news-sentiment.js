// =============================================
// OBSIDIAN - News & Sentiment Agent
// =============================================

async function getMarketSentiment() {
  // Simulasi untuk saat ini (bisa diintegrasikan dengan X/Twitter nanti)
  const sentiments = ["BULLISH", "NEUTRAL", "BEARISH"];
  const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

  return {
    sentiment: randomSentiment,
    strength: randomSentiment === "BULLISH" ? "STRONG" : "MODERATE",
    advice: randomSentiment === "BULLISH" ? 
      "Pasar sedang positif, cocok untuk deploy LP" : 
      "Hati-hati, market sedang sideways/bearish"
  };
}

module.exports = { getMarketSentiment };