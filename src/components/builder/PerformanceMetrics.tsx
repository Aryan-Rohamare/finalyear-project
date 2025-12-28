import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Weight, Clock, Gauge, X } from "lucide-react";
import type { PlacedComponent } from "./DroneWorkspace";
import { Button } from "@/components/ui/button";
import { iconMap } from "./ComponentLibrary";

interface PerformanceMetricsProps {
  components: PlacedComponent[];
  onRemoveComponent: (instanceId: string) => void;
}

// Calculate real metrics from component specs
const calculateMetrics = (components: PlacedComponent[]) => {
  // Weight calculation
  const totalWeight = components.reduce((acc, c) => {
    const weight = parseInt(c.specs.weight) || 0;
    return acc + weight;
  }, 0);

  // Motor analysis
  const motors = components.filter(c => c.category === "Motors");
  const motorCount = motors.length;
  const totalThrust = motors.reduce((acc, m) => {
    const thrust = parseInt(m.specs.thrust || "0") || 0;
    return acc + thrust;
  }, 0);

  // Battery analysis
  const batteries = components.filter(c => c.category === "Power" && c.id.includes("battery"));
  const battery = batteries[0];
  let batteryCapacity = 0;
  let batteryVoltage = 0;
  
  if (battery) {
    // Parse capacity from name like "LiPo 4S 1500mAh"
    const capacityMatch = battery.name.match(/(\d+)mAh/);
    batteryCapacity = capacityMatch ? parseInt(capacityMatch[1]) : 0;
    
    // Parse voltage from power spec like "14.8V"
    const voltageMatch = battery.specs.power?.match(/([\d.]+)V/);
    batteryVoltage = voltageMatch ? parseFloat(voltageMatch[1]) : 0;
  }

  // Propeller analysis
  const props = components.filter(c => c.category === "Propellers");
  const propCount = props.length;
  const propSize = props[0]?.name.match(/(\d+)x/)?.[1] || "0";

  // Flight controller check
  const hasFC = components.some(c => c.category === "Electronics" && c.id.includes("fc"));
  const hasFrame = components.some(c => c.category === "Frames");

  // Calculate thrust-to-weight ratio
  const thrustToWeight = totalWeight > 0 ? totalThrust / totalWeight : 0;

  // Calculate estimated flight time (simplified formula)
  // Flight time (min) ≈ (battery capacity in mAh * battery voltage) / (total weight * 10)
  const estimatedFlightTime = totalWeight > 0 && batteryCapacity > 0 
    ? Math.round((batteryCapacity * batteryVoltage) / (totalWeight * 12))
    : 0;

  // Calculate max speed based on thrust and weight
  // Simplified: more thrust per weight = higher speed, prop size affects it
  const propSizeNum = parseInt(propSize) || 5;
  const estimatedSpeed = thrustToWeight > 0 
    ? Math.round(thrustToWeight * 15 * (propSizeNum / 5))
    : 0;

  return {
    totalWeight,
    totalThrust,
    motorCount,
    propCount,
    batteryCapacity,
    batteryVoltage,
    thrustToWeight: thrustToWeight.toFixed(1),
    flightTime: estimatedFlightTime,
    maxSpeed: estimatedSpeed,
    hasFC,
    hasFrame,
    hasBattery: batteries.length > 0,
    hasMotors: motorCount > 0,
  };
};

const PerformanceMetrics = ({ components, onRemoveComponent }: PerformanceMetricsProps) => {
  const metrics = calculateMetrics(components);

  const completeness = [metrics.hasMotors, metrics.hasFrame, metrics.hasBattery, metrics.hasFC].filter(Boolean).length * 25;

  const displayMetrics = [
    {
      label: "Total Weight",
      value: `${metrics.totalWeight}g`,
      icon: <Weight className="w-4 h-4" />,
      status: metrics.totalWeight < 500 ? "good" : metrics.totalWeight < 800 ? "warning" : "bad",
    },
    {
      label: "Flight Time",
      value: metrics.flightTime > 0 ? `~${metrics.flightTime} min` : "N/A",
      icon: <Clock className="w-4 h-4" />,
      status: metrics.flightTime >= 10 ? "good" : metrics.flightTime > 0 ? "warning" : "neutral",
    },
    {
      label: "Max Speed",
      value: metrics.maxSpeed > 0 ? `${metrics.maxSpeed} km/h` : "N/A",
      icon: <Gauge className="w-4 h-4" />,
      status: metrics.maxSpeed >= 50 ? "good" : metrics.maxSpeed > 0 ? "warning" : "neutral",
    },
    {
      label: "Thrust/Weight",
      value: parseFloat(metrics.thrustToWeight) > 0 ? `${metrics.thrustToWeight}:1` : "N/A",
      icon: <Zap className="w-4 h-4" />,
      status: parseFloat(metrics.thrustToWeight) >= 3 ? "good" : parseFloat(metrics.thrustToWeight) >= 2 ? "warning" : "neutral",
    },
  ];

  const suggestions = [
    !metrics.hasFrame && { text: "Add a frame to start your build", priority: "high" },
    !metrics.hasMotors && { text: "Add motors for propulsion", priority: "high" },
    !metrics.hasBattery && { text: "Add a battery for power", priority: "medium" },
    !metrics.hasFC && { text: "Add a flight controller", priority: "medium" },
    metrics.totalWeight > 600 && { text: "Consider lighter components for better agility", priority: "low" },
    metrics.hasMotors && metrics.propCount === 0 && { text: "Don't forget the propellers!", priority: "high" },
    metrics.motorCount > 0 && metrics.propCount < metrics.motorCount && { text: `Add ${metrics.motorCount - metrics.propCount} more propeller(s)`, priority: "medium" },
    parseFloat(metrics.thrustToWeight) > 0 && parseFloat(metrics.thrustToWeight) < 2 && { text: "Low thrust ratio - upgrade motors or reduce weight", priority: "high" },
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
        {displayMetrics.map((metric, i) => (
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

      {/* Placed Components List */}
      <div className="p-4 border-b border-border max-h-48 overflow-y-auto scrollbar-thin">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Components ({components.length})
        </h4>
        {components.length > 0 ? (
          <div className="space-y-1">
            {components.map((c) => (
              <div 
                key={c.instanceId} 
                className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg group"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center text-xs"
                    style={{ backgroundColor: `${c.color}20`, color: c.color }}
                  >
                    {iconMap[c.iconName]}
                  </div>
                  <span className="text-sm text-foreground truncate max-w-[120px]">{c.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => onRemoveComponent(c.instanceId)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No components added</p>
        )}
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
    </div>
  );
};

export default PerformanceMetrics;
