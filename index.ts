import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OHLCData {
  date: string;
  open: string | number;
  high: string | number;
  low: string | number;
  close: string | number;
}

// Simple Moving Average calculation
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

// Standard Deviation calculation
function calculateStdDev(data: number[], period: number): number[] {
  const stdDev: number[] = [];
  const sma = calculateSMA(data, period);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      stdDev.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      stdDev.push(Math.sqrt(variance));
    }
  }
  return stdDev;
}

// Find highest high over period
function calculateHighest(data: number[], period: number): number[] {
  const highest: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      highest.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      highest.push(Math.max(...slice));
    }
  }
  return highest;
}

// Find lowest low over period
function calculateLowest(data: number[], period: number): number[] {
  const lowest: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      lowest.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      lowest.push(Math.min(...slice));
    }
  }
  return lowest;
}

// Momentum Strategy
function momentumStrategy(closes: number[]): number[] {
  const sma = calculateSMA(closes, 10);
  const signals: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(sma[i])) {
      signals.push(0);
    } else if (closes[i] > sma[i]) {
      signals.push(1); // Buy signal
    } else {
      signals.push(-1); // Sell signal
    }
  }
  return signals;
}

// Mean Reversion Strategy
function meanReversionStrategy(closes: number[]): number[] {
  const sma = calculateSMA(closes, 20);
  const stdDev = calculateStdDev(closes, 20);
  const signals: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(sma[i]) || isNaN(stdDev[i])) {
      signals.push(0);
    } else {
      const lowerBand = sma[i] - 2 * stdDev[i];
      const upperBand = sma[i] + 2 * stdDev[i];
      
      if (closes[i] < lowerBand) {
        signals.push(1); // Buy signal
      } else if (closes[i] > upperBand) {
        signals.push(-1); // Sell signal
      } else {
        signals.push(0); // Hold
      }
    }
  }
  return signals;
}

// Breakout Strategy
function breakoutStrategy(highs: number[], lows: number[], closes: number[]): number[] {
  const highestHigh = calculateHighest(highs, 20);
  const lowestLow = calculateLowest(lows, 20);
  const signals: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(highestHigh[i]) || isNaN(lowestLow[i])) {
      signals.push(0);
    } else if (i > 0 && closes[i] > highestHigh[i - 1]) {
      signals.push(1); // Buy on breakout above
    } else if (i > 0 && closes[i] < lowestLow[i - 1]) {
      signals.push(-1); // Sell on breakdown below
    } else {
      signals.push(0); // Hold
    }
  }
  return signals;
}

// Calculate returns and metrics
function calculateMetrics(closes: number[], signals: number[]) {
  let position = 0;
  let equity = 10000; // Starting capital
  const equityCurve = [equity];
  const returns: number[] = [];
  let wins = 0;
  let totalTrades = 0;
  
  for (let i = 1; i < closes.length; i++) {
    const dailyReturn = (closes[i] - closes[i - 1]) / closes[i - 1];
    
    // Update position based on signal
    if (signals[i] === 1 && position === 0) {
      position = 1;
    } else if (signals[i] === -1 && position === 1) {
      position = 0;
      totalTrades++;
      if (equity > equityCurve[equityCurve.length - 1]) wins++;
    }
    
    // Calculate equity
    if (position === 1) {
      equity *= (1 + dailyReturn);
      returns.push(dailyReturn);
    } else {
      returns.push(0);
    }
    
    equityCurve.push(equity);
  }
  
  // Calculate metrics
  const totalReturn = ((equity - 10000) / 10000) * 100;
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = avgReturn / stdDev * Math.sqrt(252); // Annualized
  
  let maxDrawdown = 0;
  let peak = equityCurve[0];
  for (const value of equityCurve) {
    if (value > peak) peak = value;
    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  
  return {
    totalReturn,
    sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
    maxDrawdown,
    winRate,
    equityCurve,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, strategy } = await req.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid data format");
    }

    console.log(`Running ${strategy} strategy on ${data.length} data points`);

    // Parse data
    const closes = data.map((d: OHLCData) => parseFloat(String(d.close)));
    const highs = data.map((d: OHLCData) => parseFloat(String(d.high)));
    const lows = data.map((d: OHLCData) => parseFloat(String(d.low)));
    const dates = data.map((d: OHLCData) => d.date);

    // Generate signals based on strategy
    let signals: number[];
    switch (strategy) {
      case "momentum":
        signals = momentumStrategy(closes);
        break;
      case "meanReversion":
        signals = meanReversionStrategy(closes);
        break;
      case "breakout":
        signals = breakoutStrategy(highs, lows, closes);
        break;
      default:
        throw new Error("Invalid strategy");
    }

    // Calculate metrics
    const { totalReturn, sharpeRatio, maxDrawdown, winRate, equityCurve } = 
      calculateMetrics(closes, signals);

    // Format equity curve for chart
    const formattedEquityCurve = equityCurve.map((equity, i) => ({
      date: dates[i] || `Day ${i}`,
      equity,
    }));

    const results = {
      metrics: {
        totalReturn,
        sharpeRatio,
        maxDrawdown,
        winRate,
      },
      equityCurve: formattedEquityCurve,
    };

    console.log("Backtest completed successfully");

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error running backtest:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
