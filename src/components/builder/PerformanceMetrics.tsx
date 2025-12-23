import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Weight, Clock, Gauge } from "lucide-react";
import type { PlacedComponent } from "./DroneWorkspace";

interface PerformanceMetricsProps {
  components: PlacedComponent[];
}

const PerformanceMetrics = ({ components }: PerformanceMetricsProps) => {
  // Calculate mock metrics based on components
  const totalWeight = components.reduce((acc, c) => {
    const weight = parseInt(c.specs.weight) || 0;
    return acc + weight;
  }, 0);

  const hasMotors = components.some(c => c.category === "Motors");
  const hasFrame = components.some(c => c.category === "Frames");
  const hasBattery = components.some(c => c.category === "Power");
  const hasFC = components.some(c => c.category === "Electronics");

  const completeness = [hasMotors, hasFrame, hasBattery, hasFC].filter(Boolean).length * 25;

  const metrics = [
    {
      label: "Total Weight",
      value: `${totalWeight}g`,
      icon: <Weight className="w-4 h-4" />,
      status: totalWeight < 500 ? "good" : totalWeight < 800 ? "warning" : "bad",
    },
    {
      label: "Flight Time",
      value: hasBattery ? "~12 min" : "N/A",
      icon: <Clock className="w-4 h-4" />,
      status: hasBattery ? "good" : "neutral",
    },
    {
      label: "Max Speed",
      value: hasMotors ? "65 km/h" : "N/A",
      icon: <Gauge className="w-4 h-4" />,
      status: hasMotors ? "good" : "neutral",
    },
    {
      label: "Thrust/Weight",
      value: hasMotors ? "3.2:1" : "N/A",
      icon: <Zap className="w-4 h-4" />,
      status: hasMotors ? "good" : "neutral",
    },
  ];

  const suggestions = [
    !hasFrame && { text: "Add a frame to start your build", priority: "high" },
    !hasMotors && { text: "Add motors for propulsion", priority: "high" },
    !hasBattery && { text: "Add a battery for power", priority: "medium" },
    !hasFC && { text: "Add a flight controller", priority: "medium" },
    totalWeight > 600 && { text: "Consider lighter components for better agility", priority: "low" },
    hasMotors && !components.some(c => c.category === "Propellers") && { text: "Don't forget the propellers!", priority: "high" },
  ].filter(Boolean);

  return (
    <div className="h-full flex flex-col panel animate-slide-in-right">
      <div className="panel-header">Performance</div>
      
      {/* Build Progress */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Build Progress</span>
          <span className="text-sm text-primary font-mono">{completeness}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3 border-b border-border">
        {metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              {metric.icon}
              <span className="text-sm">{metric.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm ${
                metric.status === "good" ? "text-success" :
                metric.status === "warning" ? "text-warning" :
                metric.status === "bad" ? "text-destructive" :
                "text-muted-foreground"
              }`}>
                {metric.value}
              </span>
              {metric.status === "good" && <TrendingUp className="w-3 h-3 text-success" />}
              {metric.status === "warning" && <AlertTriangle className="w-3 h-3 text-warning" />}
              {metric.status === "bad" && <TrendingDown className="w-3 h-3 text-destructive" />}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Suggestions
        </h4>
        <div className="space-y-2">
          {suggestions.length > 0 ? suggestions.map((s, i) => s && (
            <div key={i} className="flex items-start gap-2 p-2 bg-secondary/50 rounded-lg">
              {s.priority === "high" ? (
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm text-muted-foreground">{s.text}</span>
            </div>
          )) : (
            <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-success">Looking good! Ready to simulate.</span>
            </div>
          )}
        </div>
      </div>

      {/* Component count */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Components</span>
          <span className="font-mono text-foreground">{components.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
