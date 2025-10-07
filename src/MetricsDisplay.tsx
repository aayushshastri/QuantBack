import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

interface MetricsDisplayProps {
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

export const MetricsDisplay = ({ metrics }: MetricsDisplayProps) => {
  const metricCards = [
    {
      label: "Total Return",
      value: `${metrics.totalReturn > 0 ? "+" : ""}${metrics.totalReturn.toFixed(2)}%`,
      icon: metrics.totalReturn >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalReturn >= 0 ? "text-success" : "text-destructive",
      bgColor: metrics.totalReturn >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      label: "Sharpe Ratio",
      value: metrics.sharpeRatio.toFixed(2),
      icon: Activity,
      color: metrics.sharpeRatio >= 1 ? "text-success" : "text-muted-foreground",
      bgColor: "bg-primary/10",
    },
    {
      label: "Max Drawdown",
      value: `${metrics.maxDrawdown.toFixed(2)}%`,
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Win Rate",
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Target,
      color: metrics.winRate >= 50 ? "text-success" : "text-muted-foreground",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.label}
            className="p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
