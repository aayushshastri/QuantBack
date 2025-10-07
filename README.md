# QuantBack – Algorithmic Trading Strategy Backtester

**QuantBack** is a modern algorithmic trading strategy backtesting app built using **React**, **TypeScript**, and **TailwindCSS**, designed with an intuitive, quant-style dashboard.

It allows traders, students, and researchers to upload **OHLC (Open, High, Low, Close)** data, choose from **three trading strategies**, and visualize **performance metrics** instantly.

---

##  Features

- **Upload Custom OHLC Data (CSV)**
-  **Choose Strategy:**
  - **Momentum Strategy** → SMA Crossover Logic  
  - **Mean Reversion Strategy** → Bollinger-like dynamic thresholds  
  - **Breakout Strategy** → 20-day high/low breakout system
-  **Performance Metrics:**
  - Total Return  
  - Sharpe Ratio  
  - Max Drawdown  
  - Win Rate  
-  **Visualization:**
  - Equity curve, entry/exit markers, and portfolio performance charts  
-  **Tech Stack:** React + TypeScript + TailwindCSS + Supabase (optional backend)

---

##  Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | React (Vite + TypeScript) |
| Styling | TailwindCSS + Shadcn/UI |
| Charts | Recharts / Plotly.js |
| Backend (optional) | Supabase |
| Deployment | Vercel / Lovable |
| Data | CSV-based OHLC import |

---

## Run Locally

```bash
git clone https://github.com/aayushshastri/QuantBack.git
cd QuantBack
npm install
npm run dev
