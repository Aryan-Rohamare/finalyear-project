import { TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Test, TestConfig } from "./TestLibrary";
import type { PlacedComponent } from "@/components/builder/DroneWorkspace";

interface TestResultsProps {
  activeTest: Test | null;
  isComplete: boolean;
  progress: number;
  droneComponents: PlacedComponent[];
  testConfig: TestConfig;
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

const TestResults = ({ activeTest, isComplete, progress, droneComponents, testConfig }: TestResultsProps) => {
  const capabilities = calculateDroneCapabilities(droneComponents);
  
  // Generate results based on actual drone components and test config
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

    // Base capability calculations
    const baseStabilityScore = Math.min(98, 70 + (capabilities.thrustToWeight * 8) + (capabilities.hasGPS ? 10 : 0));
    const basePowerEfficiency = Math.min(95, 60 + (capabilities.batteryCapacity / 50) + (capabilities.thrustToWeight > 3 ? 10 : 0));
    const baseResponseTime = Math.max(15, 40 - (capabilities.thrustToWeight * 5));
    const baseMaxSpeed = Math.round(capabilities.thrustToWeight * 18);
    const maxHandledWind = 15 + (capabilities.thrustToWeight * 5) + (capabilities.totalWeight > 400 ? 5 : 0);

    // Test-specific results with config influence
    if (activeTest.id === "hover") {
      const windPenalty = testConfig.windSpeed * 0.8;
      const altitudePenalty = testConfig.altitude > 50 ? (testConfig.altitude - 50) * 0.1 : 0;
      const stabilityScore = Math.max(0, baseStabilityScore - windPenalty - altitudePenalty);
      const positionHold = capabilities.hasGPS ? (0.2 + testConfig.windSpeed * 0.02) : (0.8 + testConfig.windSpeed * 0.05);
      
      return [
        { label: "Hover Stability", value: `${Math.round(stabilityScore)}%`, trend: stabilityScore > 85 ? "up" : stabilityScore > 60 ? "neutral" : "down", status: stabilityScore > 80 ? "pass" : stabilityScore > 50 ? "warning" : "fail" },
        { label: "Position Hold", value: `±${positionHold.toFixed(2)}m`, trend: positionHold < 0.5 ? "up" : positionHold < 1 ? "neutral" : "down", status: positionHold < 0.5 ? "pass" : positionHold < 1 ? "warning" : "fail" },
        { label: "Altitude Hold", value: `${testConfig.altitude}m`, trend: "neutral", status: testConfig.altitude <= 100 ? "pass" : "warning" },
        { label: "Wind Disturbance", value: `${testConfig.windSpeed} km/h`, trend: testConfig.windSpeed < 10 ? "up" : "down", status: testConfig.windSpeed <= maxHandledWind ? "pass" : "fail" },
      ];
    }

    if (activeTest.id === "ascent") {
      const tempFactor = testConfig.temperature < 0 ? 0.8 : testConfig.temperature > 35 ? 0.85 : 1;
      const climbRate = (capabilities.thrustToWeight * 2.5 * tempFactor).toFixed(1);
      const powerDraw = Math.round(100 + testConfig.altitude * 0.3 + (testConfig.temperature < 0 ? 15 : 0));
      const efficiency = Math.round(basePowerEfficiency * tempFactor - testConfig.altitude * 0.05);
      
      return [
        { label: "Climb Rate", value: `${climbRate} m/s`, trend: parseFloat(climbRate) > 5 ? "up" : parseFloat(climbRate) > 3 ? "neutral" : "down", status: parseFloat(climbRate) > 4 ? "pass" : parseFloat(climbRate) > 2 ? "warning" : "fail" },
        { label: "Target Altitude", value: `${testConfig.altitude}m`, trend: "neutral", status: testConfig.altitude <= 200 ? "pass" : testConfig.altitude <= 400 ? "warning" : "fail" },
        { label: "Power Draw", value: `${powerDraw}W`, trend: powerDraw < 150 ? "up" : "down", status: powerDraw < 150 ? "pass" : powerDraw < 200 ? "warning" : "fail" },
        { label: "Air Temp Impact", value: `${testConfig.temperature}°C`, trend: testConfig.temperature > 0 && testConfig.temperature < 35 ? "up" : "down", status: testConfig.temperature > 0 && testConfig.temperature < 35 ? "pass" : "warning" },
      ];
    }

    if (activeTest.id === "rotation") {
      const rotationSpeed = (testConfig.precision * 45).toFixed(0);
      const accuracy = Math.max(90, 99 - testConfig.precision * 0.5);
      const responseMs = Math.round(baseResponseTime + testConfig.precision * 2);
      
      return [
        { label: "Rotation Speed", value: `${rotationSpeed}°/s`, trend: parseInt(rotationSpeed) > 200 ? "up" : "neutral", status: parseInt(rotationSpeed) > 150 ? "pass" : "warning" },
        { label: "Accuracy", value: `${accuracy.toFixed(1)}%`, trend: accuracy > 95 ? "up" : "neutral", status: accuracy > 95 ? "pass" : accuracy > 90 ? "warning" : "fail" },
        { label: "Response Time", value: `${responseMs}ms`, trend: responseMs < 30 ? "up" : "neutral", status: responseMs < 30 ? "pass" : responseMs < 50 ? "warning" : "fail" },
        { label: "Speed Setting", value: `${testConfig.precision}x`, trend: "neutral", status: "pass" },
      ];
    }

    if (activeTest.id === "wind") {
      const canHandle = testConfig.windSpeed <= maxHandledWind;
      const stabilityUnderWind = Math.max(0, baseStabilityScore - (testConfig.windSpeed * 1.2) - (testConfig.altitude * 0.1));
      const batteryImpact = Math.round(12 + testConfig.windSpeed * 0.5);
      const driftAmount = canHandle ? (testConfig.windSpeed * 0.03).toFixed(2) : "N/A";
      
      return [
        { label: "Wind Compensation", value: `${Math.round(stabilityUnderWind)}%`, trend: stabilityUnderWind > 70 ? "up" : stabilityUnderWind > 40 ? "neutral" : "down", status: canHandle ? (stabilityUnderWind > 60 ? "pass" : "warning") : "fail" },
        { label: "Wind Speed", value: `${testConfig.windSpeed} km/h`, trend: testConfig.windSpeed < 20 ? "up" : testConfig.windSpeed < 50 ? "neutral" : "down", status: canHandle ? "pass" : "fail" },
        { label: "Position Drift", value: driftAmount === "N/A" ? driftAmount : `±${driftAmount}m`, trend: canHandle ? "neutral" : "down", status: canHandle ? "pass" : "fail" },
        { label: "Battery Impact", value: `+${batteryImpact}%`, trend: "down", status: batteryImpact < 20 ? "pass" : batteryImpact < 35 ? "warning" : "fail" },
      ];
    }

    if (activeTest.id === "speed") {
      const targetSpeed = testConfig.precision * 10;
      const headwindPenalty = testConfig.windSpeed * 0.5;
      const achievedSpeed = Math.min(baseMaxSpeed, targetSpeed) - headwindPenalty;
      const acceleration = (capabilities.thrustToWeight * 1.2).toFixed(1);
      const brakingDist = (6 - capabilities.thrustToWeight * 0.8 + (achievedSpeed / 30)).toFixed(1);
      const motorTemp = 55 + achievedSpeed * 0.3 + testConfig.windSpeed * 0.2;
      
      return [
        { label: "Achieved Speed", value: `${Math.round(Math.max(0, achievedSpeed))} km/h`, trend: achievedSpeed >= targetSpeed * 0.9 ? "up" : "down", status: achievedSpeed >= targetSpeed * 0.9 ? "pass" : achievedSpeed >= targetSpeed * 0.7 ? "warning" : "fail" },
        { label: "Target Speed", value: `${targetSpeed} km/h`, trend: "neutral", status: targetSpeed <= baseMaxSpeed ? "pass" : "warning" },
        { label: "Headwind", value: `${testConfig.windSpeed} km/h`, trend: testConfig.windSpeed < 10 ? "up" : "down", status: testConfig.windSpeed < 20 ? "pass" : "warning" },
        { label: "Motor Temp", value: `${Math.round(motorTemp)}°C`, trend: motorTemp < 70 ? "up" : "down", status: motorTemp < 65 ? "pass" : motorTemp < 85 ? "warning" : "fail" },
      ];
    }

    if (activeTest.id === "thermal") {
      const ambientTemp = testConfig.temperature;
      const humidityFactor = testConfig.humidity > 70 ? 1.1 : testConfig.humidity > 40 ? 1 : 0.95;
      const motorTemp = Math.round((45 + ambientTemp * 0.5) * humidityFactor);
      const escTemp = Math.round((40 + ambientTemp * 0.4) * humidityFactor);
      const batteryTemp = Math.round(35 + ambientTemp * 0.3);
      const coolingEfficiency = Math.max(50, 95 - testConfig.humidity * 0.3 - Math.max(0, ambientTemp - 25) * 0.5);
      
      return [
        { label: "Motor Temperature", value: `${motorTemp}°C`, trend: motorTemp < 60 ? "up" : motorTemp < 80 ? "neutral" : "down", status: motorTemp < 65 ? "pass" : motorTemp < 85 ? "warning" : "fail" },
        { label: "ESC Temperature", value: `${escTemp}°C`, trend: escTemp < 55 ? "up" : escTemp < 75 ? "neutral" : "down", status: escTemp < 60 ? "pass" : escTemp < 80 ? "warning" : "fail" },
        { label: "Battery Temperature", value: `${batteryTemp}°C`, trend: batteryTemp < 40 ? "up" : batteryTemp < 50 ? "neutral" : "down", status: batteryTemp < 45 ? "pass" : batteryTemp < 55 ? "warning" : "fail" },
        { label: "Cooling Efficiency", value: `${Math.round(coolingEfficiency)}%`, trend: coolingEfficiency > 80 ? "up" : coolingEfficiency > 60 ? "neutral" : "down", status: coolingEfficiency > 75 ? "pass" : coolingEfficiency > 50 ? "warning" : "fail" },
      ];
    }

    if (activeTest.id === "weather") {
      const canHandleWind = testConfig.windSpeed <= maxHandledWind * 0.8;
      const rainSeverity = testConfig.humidity;
      const tempPenalty = testConfig.temperature < 5 ? 15 : testConfig.temperature > 35 ? 10 : 0;
      const overallScore = Math.max(0, baseStabilityScore - testConfig.windSpeed * 0.8 - rainSeverity * 0.2 - tempPenalty);
      const visibilityImpact = rainSeverity > 70 ? "Poor" : rainSeverity > 40 ? "Moderate" : "Good";
      
      return [
        { label: "Weather Resilience", value: `${Math.round(overallScore)}%`, trend: overallScore > 70 ? "up" : overallScore > 40 ? "neutral" : "down", status: overallScore > 70 ? "pass" : overallScore > 40 ? "warning" : "fail" },
        { label: "Wind Handling", value: canHandleWind ? "OK" : "Exceeded", trend: canHandleWind ? "up" : "down", status: canHandleWind ? "pass" : "fail" },
        { label: "Rain Intensity", value: `${rainSeverity}%`, trend: rainSeverity < 30 ? "up" : rainSeverity < 60 ? "neutral" : "down", status: rainSeverity < 50 ? "pass" : rainSeverity < 80 ? "warning" : "fail" },
        { label: "Visibility", value: visibilityImpact, trend: visibilityImpact === "Good" ? "up" : visibilityImpact === "Moderate" ? "neutral" : "down", status: visibilityImpact === "Good" ? "pass" : visibilityImpact === "Moderate" ? "warning" : "fail" },
      ];
    }

    if (activeTest.id === "waypoint") {
      const precisionRequired = testConfig.precision;
      const windFactor = testConfig.windSpeed * 0.02;
      const achievedPrecision = capabilities.hasGPS ? Math.max(1, precisionRequired - 2 + windFactor) : precisionRequired + 3 + windFactor;
      const navigationScore = Math.max(0, 95 - Math.abs(achievedPrecision - precisionRequired) * 5 - testConfig.windSpeed * 0.3);
      const pathDeviation = (0.3 + testConfig.windSpeed * 0.01 + (capabilities.hasGPS ? 0 : 0.5)).toFixed(2);
      
      return [
        { label: "Navigation Score", value: `${Math.round(navigationScore)}%`, trend: navigationScore > 85 ? "up" : navigationScore > 60 ? "neutral" : "down", status: navigationScore > 85 ? "pass" : navigationScore > 60 ? "warning" : "fail" },
        { label: "Precision Required", value: `Level ${precisionRequired}`, trend: "neutral", status: achievedPrecision <= precisionRequired ? "pass" : "warning" },
        { label: "Path Deviation", value: `±${pathDeviation}m`, trend: parseFloat(pathDeviation) < 0.5 ? "up" : parseFloat(pathDeviation) < 1 ? "neutral" : "down", status: parseFloat(pathDeviation) < 0.5 ? "pass" : parseFloat(pathDeviation) < 1 ? "warning" : "fail" },
        { label: "GPS Status", value: capabilities.hasGPS ? "Active" : "No GPS", trend: capabilities.hasGPS ? "up" : "down", status: capabilities.hasGPS ? "pass" : "fail" },
      ];
    }

    // Default stability test
    return [
      { label: "Stability Score", value: `${Math.round(baseStabilityScore)}%`, trend: baseStabilityScore > 85 ? "up" : "neutral", status: baseStabilityScore > 85 ? "pass" : baseStabilityScore > 70 ? "warning" : "fail" },
      { label: "Power Efficiency", value: `${Math.round(basePowerEfficiency)}%`, trend: basePowerEfficiency > 80 ? "up" : "neutral", status: basePowerEfficiency > 80 ? "pass" : basePowerEfficiency > 60 ? "warning" : "fail" },
      { label: "Response Time", value: `${Math.round(baseResponseTime)}ms`, trend: baseResponseTime < 25 ? "up" : "down", status: baseResponseTime < 25 ? "pass" : baseResponseTime < 35 ? "warning" : "fail" },
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
