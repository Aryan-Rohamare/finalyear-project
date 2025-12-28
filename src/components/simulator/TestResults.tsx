import { TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Test } from "./TestLibrary";
import type { PlacedComponent } from "@/components/builder/DroneWorkspace";

interface TestResultsProps {
  activeTest: Test | null;
  isComplete: boolean;
  progress: number;
  droneComponents: PlacedComponent[];
}

// Calculate actual drone capabilities from components
const calculateDroneCapabilities = (components: PlacedComponent[]) => {
  const hasFrame = components.some(c => c.category === "Frames");
  const hasMotors = components.some(c => c.category === "Motors");
  const hasBattery = components.some(c => c.category === "Power" && c.id.includes("battery"));
  const hasFC = components.some(c => c.category === "Electronics" && c.id.includes("fc"));
  const hasProps = components.some(c => c.category === "Propellers");
  const hasGPS = components.some(c => c.id === "gps");

  const totalWeight = components.reduce((acc, c) => acc + (parseInt(c.specs.weight) || 0), 0);
  
  const motors = components.filter(c => c.category === "Motors");
  const totalThrust = motors.reduce((acc, m) => acc + (parseInt(m.specs.thrust || "0") || 0), 0);
  const thrustToWeight = totalWeight > 0 ? totalThrust / totalWeight : 0;

  const batteries = components.filter(c => c.category === "Power" && c.id.includes("battery"));
  const battery = batteries[0];
  let batteryCapacity = 0;
  if (battery) {
    const capacityMatch = battery.name.match(/(\d+)mAh/);
    batteryCapacity = capacityMatch ? parseInt(capacityMatch[1]) : 0;
  }

  const motorCount = motors.length;
  const propCount = components.filter(c => c.category === "Propellers").length;

  return {
    isFlightReady: hasFrame && hasMotors && hasBattery && hasFC && hasProps,
    hasFrame,
    hasMotors,
    hasBattery,
    hasFC,
    hasProps,
    hasGPS,
    totalWeight,
    totalThrust,
    thrustToWeight,
    batteryCapacity,
    motorCount,
    propCount,
    componentCount: components.length,
  };
};

const TestResults = ({ activeTest, isComplete, progress, droneComponents }: TestResultsProps) => {
  const capabilities = calculateDroneCapabilities(droneComponents);
  
  // Generate results based on actual drone components
  const getResults = () => {
    if (!activeTest) return [];
    
    // No drone - everything fails
    if (droneComponents.length === 0) {
      return [
        { label: "Drone Detected", value: "None", trend: "neutral", status: "fail" },
        { label: "Flight Capability", value: "N/A", trend: "neutral", status: "fail" },
        { label: "Power System", value: "N/A", trend: "neutral", status: "fail" },
        { label: "Control System", value: "N/A", trend: "neutral", status: "fail" },
      ];
    }

    // Incomplete drone - partial failures
    if (!capabilities.isFlightReady) {
      return [
        { label: "Frame", value: capabilities.hasFrame ? "OK" : "Missing", trend: "neutral", status: capabilities.hasFrame ? "pass" : "fail" },
        { label: "Motors", value: capabilities.hasMotors ? `${capabilities.motorCount}x` : "Missing", trend: "neutral", status: capabilities.hasMotors ? "pass" : "fail" },
        { label: "Propellers", value: capabilities.hasProps ? `${capabilities.propCount}x` : "Missing", trend: "neutral", status: capabilities.hasProps ? "pass" : "fail" },
        { label: "Battery", value: capabilities.hasBattery ? "OK" : "Missing", trend: "neutral", status: capabilities.hasBattery ? "pass" : "fail" },
        { label: "Flight Controller", value: capabilities.hasFC ? "OK" : "Missing", trend: "neutral", status: capabilities.hasFC ? "pass" : "fail" },
      ];
    }

    // Calculate dynamic values based on components
    const stabilityScore = Math.min(98, 70 + (capabilities.thrustToWeight * 8) + (capabilities.hasGPS ? 10 : 0));
    const powerEfficiency = Math.min(95, 60 + (capabilities.batteryCapacity / 50) + (capabilities.thrustToWeight > 3 ? 10 : 0));
    const responseTime = Math.max(15, 40 - (capabilities.thrustToWeight * 5));
    const maxSpeed = Math.round(capabilities.thrustToWeight * 18);

    if (activeTest.id === "wind") {
      const windHandled = Math.round(15 + (capabilities.thrustToWeight * 5) + (capabilities.totalWeight > 400 ? 5 : 0));
      const batteryImpact = capabilities.thrustToWeight < 2.5 ? 25 : capabilities.thrustToWeight < 3 ? 18 : 12;
      
      return [
        { label: "Wind Compensation", value: `${Math.round(stabilityScore - 5)}%`, trend: stabilityScore > 85 ? "up" : "neutral", status: stabilityScore > 80 ? "pass" : stabilityScore > 60 ? "warning" : "fail" },
        { label: "Position Hold", value: capabilities.hasGPS ? "±0.3m" : "±1.2m", trend: capabilities.hasGPS ? "up" : "down", status: capabilities.hasGPS ? "pass" : "warning" },
        { label: "Max Wind Handled", value: `${windHandled} km/h`, trend: windHandled > 20 ? "up" : "neutral", status: windHandled > 20 ? "pass" : windHandled > 15 ? "warning" : "fail" },
        { label: "Battery Impact", value: `+${batteryImpact}%`, trend: "down", status: batteryImpact < 15 ? "pass" : batteryImpact < 22 ? "warning" : "fail" },
      ];
    }

    if (activeTest.id === "speed") {
      const acceleration = (capabilities.thrustToWeight * 1.2).toFixed(1);
      const brakingDist = (6 - capabilities.thrustToWeight * 0.8).toFixed(1);
      const motorTemp = capabilities.thrustToWeight > 3.5 ? 78 : capabilities.thrustToWeight > 2.5 ? 68 : 55;
      
      return [
        { label: "Max Velocity", value: `${maxSpeed} km/h`, trend: maxSpeed > 50 ? "up" : "neutral", status: maxSpeed > 50 ? "pass" : maxSpeed > 30 ? "warning" : "fail" },
        { label: "Acceleration", value: `${acceleration} m/s²`, trend: parseFloat(acceleration) > 3 ? "up" : "neutral", status: parseFloat(acceleration) > 3 ? "pass" : "warning" },
        { label: "Braking Distance", value: `${brakingDist}m`, trend: parseFloat(brakingDist) < 4 ? "up" : "down", status: parseFloat(brakingDist) < 4 ? "pass" : "warning" },
        { label: "Motor Temp", value: `${motorTemp}°C`, trend: motorTemp > 70 ? "down" : "up", status: motorTemp < 65 ? "pass" : motorTemp < 80 ? "warning" : "fail" },
      ];
    }

    // Default stability test
    return [
      { label: "Stability Score", value: `${Math.round(stabilityScore)}%`, trend: stabilityScore > 85 ? "up" : "neutral", status: stabilityScore > 85 ? "pass" : stabilityScore > 70 ? "warning" : "fail" },
      { label: "Power Efficiency", value: `${Math.round(powerEfficiency)}%`, trend: powerEfficiency > 80 ? "up" : "neutral", status: powerEfficiency > 80 ? "pass" : powerEfficiency > 60 ? "warning" : "fail" },
      { label: "Response Time", value: `${Math.round(responseTime)}ms`, trend: responseTime < 25 ? "up" : "down", status: responseTime < 25 ? "pass" : responseTime < 35 ? "warning" : "fail" },
      { label: "Thrust/Weight", value: `${capabilities.thrustToWeight.toFixed(1)}:1`, trend: capabilities.thrustToWeight > 2.5 ? "up" : "down", status: capabilities.thrustToWeight > 3 ? "pass" : capabilities.thrustToWeight > 2 ? "warning" : "fail" },
    ];
  };

  const results = getResults();
  const passCount = results.filter(r => r.status === "pass").length;
  const warningCount = results.filter(r => r.status === "warning").length;
  const failCount = results.filter(r => r.status === "fail").length;

  const overallStatus = failCount > 0 ? "fail" : warningCount > 0 ? "warning" : "pass";

  return (
    <div className="h-full flex flex-col panel animate-slide-in-right">
      <div className="panel-header">
        <div className="w-2 h-2 rounded-full gradient-accent" />
        Test Results
      </div>
      
      {activeTest ? (
        <>
          {/* Overall Status */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Test Status</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                isComplete 
                  ? overallStatus === "fail" 
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : overallStatus === "warning"
                      ? "bg-warning/20 text-warning border border-warning/30"
                      : "bg-success/20 text-success border border-success/30"
                  : progress > 0 
                    ? "bg-primary/20 text-primary border border-primary/30 animate-pulse" 
                    : "bg-secondary text-muted-foreground border border-border/50"
              }`}>
                {isComplete 
                  ? overallStatus === "fail" ? "Failed" : overallStatus === "warning" ? "Warnings" : "Passed"
                  : progress > 0 ? "Running" : "Ready"}
              </span>
            </div>
            
            {/* Summary badges */}
            <div className="flex gap-3">
              <div className={`flex items-center gap-1.5 text-xs ${passCount > 0 ? "text-success" : "text-muted-foreground"}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-medium">{passCount} Pass</span>
              </div>
              {warningCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="font-medium">{warningCount} Warning</span>
                </div>
              )}
              {failCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="font-medium">{failCount} Fail</span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {results.map((result, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border transition-all ${
                  isComplete 
                    ? "bg-secondary/40 border-border/50" 
                    : "bg-secondary/20 border-border/30 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{result.label}</span>
                  {result.trend === "up" && <TrendingUp className="w-4 h-4 text-success" />}
                  {result.trend === "down" && <TrendingDown className="w-4 h-4 text-warning" />}
                  {result.trend === "neutral" && <Minus className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xl font-bold ${
                    result.status === "pass" ? "text-foreground" :
                    result.status === "warning" ? "text-warning" :
                    "text-destructive"
                  }`}>
                    {isComplete ? result.value : "—"}
                  </span>
                  {isComplete && (
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
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
            <div className="p-4 border-t border-border/50">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Recommendations
              </h4>
              <div className="p-3 bg-gradient-to-r from-secondary/50 to-transparent rounded-xl border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {droneComponents.length === 0 
                    ? "No drone detected. Build a drone in the Builder first."
                    : !capabilities.isFlightReady
                      ? "Drone is incomplete. Add missing components to pass all tests."
                      : failCount > 0
                        ? "Critical issues detected. Review failed components and upgrade where needed."
                        : warningCount > 0 
                          ? "Consider optimizing motor cooling or upgrading components for better performance."
                          : "Performance is within optimal parameters. Ready for deployment."
                  }
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No test selected</p>
            <p className="text-xs text-muted-foreground/60">Results will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults;
