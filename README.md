OBSIDIAN V1

Autonomous Multi-Agent DLMM and LP Agent for SolanaOBSIDIAN V1 is an autonomous liquidity provider AI agent designed to manage Liquidity Provider positions in Decentralized Liquidity Market Maker pools on the Solana network.This project is developed as an extension of the open-source Meridian foundation incorporating a multi-agent architecture vector-based memory and backtesting capabilities to support more structured decision making.Main Features
Multi-Agent Swarm: Coordination between Planner Screener Analyst Risk-Assessor and Executor
RAG Memory: Contextual storage and retrieval of lessons from every position
Integrated Backtester: Simulation of strategies using historical data before live execution
Advanced DLMM Strategies: Dynamic bin rebalancing predictive impermanent loss and regime detection
Multi-Source Data: Integration with Meteora API Birdeye Dexscreener as well as on-chain and sentiment analysis
Flexible LLM Support: Compatible with local Ollama or external providers
Safety-First Design: Dry-run simulation and multi-level approval layers
Telegram Control and optional simple web dashboard
HiveMind Integration: Sharing lessons between agent instancesHow It WorksThe Screening Agent scans potential pools at regular intervals
The Planner formulates the overall strategy
The Analyst and Risk-Assessor perform in-depth evaluation
The Executor carries out actions with approval
The Historian stores results in memory for continuous learning

Tech Stack
Node.js 20 plus
Solana Web3.js and meteora-ag dlmm
LangChain for multi-agent orchestration
LanceDB for vector memory
Cron scheduling and PM2 supportSetup Quick
git clone https://github.com/GhostcoinHQ/obsidian-v1.git
cd obsidian-v1
npm install
npm run setup
npm run devSee the full documentation in the docs folder to be added gradually or follow the guide below.Contributions
This project is open-source. Contributions issues and pull requests are highly appreciated.Thanks to yunus-0x for the Meridian project which served as the initial foundation.License: MITStruktur Proyek
obsidian-v1
src
core: Agent swarm and memory
agents: Specialist agents
tools: Tools and executor
strategies: DLMM strategies
backtester: Historical simulator
ui: Telegram and dashboard
config
data
env.example
user-config.example.json
README.md

