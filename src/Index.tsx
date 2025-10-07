import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { StrategySelector } from "@/components/StrategySelector";
import { MetricsDisplay } from "@/components/MetricsDisplay";
import { EquityCurve } from "@/components/EquityCurve";
import { TrendingUp, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState("momentum");
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (data: any[]) => {
    setUploadedData(data);
    toast({
      title: "File uploaded successfully",
      description: `Loaded ${data.length} data points`,
    });
  };

  const runBacktest = async () => {
    if (uploadedData.length === 0) {
      toast({
        title: "No data uploaded",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("backtest", {
        body: {
          data: uploadedData,
          strategy: selectedStrategy,
        },
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Backtest completed",
        description: "Results are ready",
      });
    } catch (error) {
      toast({
        title: "Backtest failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const csv = [
      ["Metric", "Value"],
      ["Total Return", `${results.metrics.totalReturn.toFixed(2)}%`],
      ["Sharpe Ratio", results.metrics.sharpeRatio.toFixed(2)],
      ["Max Drawdown", `${results.metrics.maxDrawdown.toFixed(2)}%`],
      ["Win Rate", `${results.metrics.winRate.toFixed(1)}%`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backtest-results-${selectedStrategy}-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">QuantBack</h1>
              <p className="text-sm text-muted-foreground">
                Algorithmic Trading Strategy Backtester
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Upload and Strategy Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FileUploader onFileUpload={handleFileUpload} />
            <StrategySelector
              selectedStrategy={selectedStrategy}
              onStrategyChange={setSelectedStrategy}
            />
          </div>

          {/* Run Backtest Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={runBacktest}
              disabled={isRunning || uploadedData.length === 0}
              className="min-w-[200px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Run Backtest
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Backtest Results</h2>
                <Button variant="outline" onClick={downloadResults}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>

              <MetricsDisplay metrics={results.metrics} />
              <EquityCurve data={results.equityCurve} />
            </div>
          )}

          {/* Info Section */}
          {!results && uploadedData.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold">Get Started</h2>
                <p className="text-muted-foreground">
                  Upload your historical OHLC data and select a trading strategy
                  to begin backtesting. The system will calculate performance
                  metrics and visualize the results.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">1. Upload Data</h3>
                    <p className="text-sm text-muted-foreground">
                      CSV with Date, Open, High, Low, Close columns
                    </p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">2. Choose Strategy</h3>
                    <p className="text-sm text-muted-foreground">
                      Select from Momentum, Mean Reversion, or Breakout
                    </p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">3. Run Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      View metrics and equity curve visualization
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
