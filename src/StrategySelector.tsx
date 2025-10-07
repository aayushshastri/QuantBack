import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface StrategySelectorProps {
  selectedStrategy: string;
  onStrategyChange: (strategy: string) => void;
}

export const StrategySelector = ({
  selectedStrategy,
  onStrategyChange,
}: StrategySelectorProps) => {
  const strategies = [
    {
      value: "momentum",
      label: "Momentum Strategy",
      description: "Buy when price > SMA(10), Sell when price < SMA(10)",
      icon: TrendingUp,
    },
    {
      value: "meanReversion",
      label: "Mean Reversion Strategy",
      description: "Buy at lower band, Sell at upper band (Bollinger-style)",
      icon: TrendingDown,
    },
    {
      value: "breakout",
      label: "Breakout Strategy",
      description: "Buy on 20-day high, Sell on 20-day low",
      icon: BarChart3,
    },
  ];

  const selectedStrategyData = strategies.find(
    (s) => s.value === selectedStrategy
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Select Trading Strategy</h3>
      <Select value={selectedStrategy} onValueChange={onStrategyChange}>
        <SelectTrigger className="w-full h-12">
          <SelectValue placeholder="Choose a strategy" />
        </SelectTrigger>
        <SelectContent>
          {strategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <SelectItem key={strategy.value} value={strategy.value}>
                <div className="flex items-start gap-3 py-2">
                  <Icon className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {strategy.description}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedStrategyData && (
        <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            {(() => {
              const Icon = selectedStrategyData.icon;
              return <Icon className="w-4 h-4 text-primary" />;
            })()}
            <span className="font-medium text-sm">
              {selectedStrategyData.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedStrategyData.description}
          </p>
        </div>
      )}
    </Card>
  );
};
