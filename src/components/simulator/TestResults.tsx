import { TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Test } from "./TestLibrary";

interface TestResultsProps {
  activeTest: Test | null;
  isComplete: boolean;
  progress: number;
}

const TestResults = ({ activeTest, isComplete, progress }: TestResultsProps) => {
  // Mock results based on test type
  const getResults = () => {
    if (!activeTest) return [];
    
    const baseResults = [
      { label: "Stability Score", value: "94%", trend: "up", status: "pass" },
      { label: "Power Efficiency", value: "87%", trend: "up", status: "pass" },
      { label: "Response Time", value: "23ms", trend: "down", status: "pass" },
      { label: "Vibration Level", value: "Low", trend: "neutral", status: "pass" },
    ];

    if (activeTest.id === "wind") {
      return [
        { label: "Wind Compensation", value: "92%", trend: "up", status: "pass" },
        { label: "Position Hold", value: "±0.3m", trend: "neutral", status: "pass" },
        { label: "Max Wind Handled", value: "25 km/h", trend: "up", status: "pass" },
        { label: "Battery Impact", value: "+18%", trend: "down", status: "warning" },
      ];
    }

    if (activeTest.id === "speed") {
      return [
        { label: "Max Velocity", value: "68 km/h", trend: "up", status: "pass" },
        { label: "Acceleration", value: "4.2 m/s²", trend: "up", status: "pass" },
        { label: "Braking Distance", value: "3.8m", trend: "neutral", status: "pass" },
        { label: "Motor Temp", value: "72°C", trend: "down", status: "warning" },
      ];
    }

    return baseResults;
  };

  const results = getResults();
  const passCount = results.filter(r => r.status === "pass").length;
  const warningCount = results.filter(r => r.status === "warning").length;
  const failCount = results.filter(r => r.status === "fail").length;

  return (
    <div className="h-full flex flex-col panel animate-slide-in-right">
      <div className="panel-header">Test Results</div>
      
      {activeTest ? (
        <>
          {/* Overall Status */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Test Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isComplete 
                  ? "bg-success/20 text-success" 
                  : progress > 0 
                    ? "bg-primary/20 text-primary" 
                    : "bg-secondary text-muted-foreground"
              }`}>
                {isComplete ? "Complete" : progress > 0 ? "Running" : "Ready"}
              </span>
            </div>
            
            {/* Summary badges */}
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs text-success">
                <CheckCircle className="w-3 h-3" />
                <span>{passCount} Pass</span>
              </div>
              {warningCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{warningCount} Warning</span>
                </div>
              )}
              {failCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <XCircle className="w-3 h-3" />
                  <span>{failCount} Fail</span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {results.map((result, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg border transition-all ${
                  isComplete 
                    ? "bg-secondary/50 border-border" 
                    : "bg-secondary/20 border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{result.label}</span>
                  {result.trend === "up" && <TrendingUp className="w-3 h-3 text-success" />}
                  {result.trend === "down" && <TrendingDown className="w-3 h-3 text-warning" />}
                  {result.trend === "neutral" && <Minus className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-lg font-bold ${
                    result.status === "pass" ? "text-foreground" :
                    result.status === "warning" ? "text-warning" :
                    "text-destructive"
                  }`}>
                    {isComplete ? result.value : "--"}
                  </span>
                  {isComplete && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      result.status === "pass" ? "bg-success/20 text-success" :
                      result.status === "warning" ? "bg-warning/20 text-warning" :
                      "bg-destructive/20 text-destructive"
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {isComplete && (
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Recommendations
              </h4>
              <div className="p-2 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {warningCount > 0 
                    ? "Consider optimizing motor cooling or reducing sustained high-power operations."
                    : "Performance is within optimal parameters. Ready for deployment."
                  }
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm mb-1">No test selected</p>
            <p className="text-xs text-muted-foreground/60">Results will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults;
