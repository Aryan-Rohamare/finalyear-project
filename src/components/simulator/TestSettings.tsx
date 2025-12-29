import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Wind, ThermometerSun, Zap, Cloud, Target, ArrowUp, RotateCw, Navigation } from "lucide-react";

export interface TestConfig {
  windSpeed: number;        // 0-100 km/h
  temperature: number;      // -20 to 50°C
  altitude: number;         // 0-500m
  humidity: number;         // 0-100%
  precision: number;        // 1-10 (waypoint accuracy requirement)
}

export const defaultTestConfig: TestConfig = {
  windSpeed: 20,
  temperature: 25,
  altitude: 50,
  humidity: 40,
  precision: 5,
};

interface TestSettingsProps {
  testId: string | undefined;
  config: TestConfig;
  onConfigChange: (config: TestConfig) => void;
}

const TestSettings = ({ testId, config, onConfigChange }: TestSettingsProps) => {
  if (!testId) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Select a test to configure parameters
      </div>
    );
  }

  const updateConfig = (key: keyof TestConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  const renderSettingsByTest = () => {
    switch (testId) {
      case "hover":
        return (
          <>
            <SettingSlider
              icon={<Wind className="w-4 h-4" />}
              label="Wind Disturbance"
              value={config.windSpeed}
              min={0}
              max={30}
              unit="km/h"
              onChange={(v) => updateConfig("windSpeed", v)}
            />
            <SettingSlider
              icon={<Target className="w-4 h-4" />}
              label="Hold Altitude"
              value={config.altitude}
              min={1}
              max={100}
              unit="m"
              onChange={(v) => updateConfig("altitude", v)}
            />
          </>
        );
      case "ascent":
        return (
          <>
            <SettingSlider
              icon={<ArrowUp className="w-4 h-4" />}
              label="Target Altitude"
              value={config.altitude}
              min={10}
              max={500}
              unit="m"
              onChange={(v) => updateConfig("altitude", v)}
            />
            <SettingSlider
              icon={<ThermometerSun className="w-4 h-4" />}
              label="Air Temperature"
              value={config.temperature}
              min={-20}
              max={50}
              unit="°C"
              onChange={(v) => updateConfig("temperature", v)}
            />
          </>
        );
      case "rotation":
        return (
          <>
            <SettingSlider
              icon={<RotateCw className="w-4 h-4" />}
              label="Rotation Speed"
              value={config.precision}
              min={1}
              max={10}
              unit="x"
              onChange={(v) => updateConfig("precision", v)}
            />
          </>
        );
      case "wind":
        return (
          <>
            <SettingSlider
              icon={<Wind className="w-4 h-4" />}
              label="Wind Speed"
              value={config.windSpeed}
              min={0}
              max={100}
              unit="km/h"
              onChange={(v) => updateConfig("windSpeed", v)}
            />
            <SettingSlider
              icon={<Target className="w-4 h-4" />}
              label="Test Altitude"
              value={config.altitude}
              min={10}
              max={200}
              unit="m"
              onChange={(v) => updateConfig("altitude", v)}
            />
          </>
        );
      case "speed":
        return (
          <>
            <SettingSlider
              icon={<Zap className="w-4 h-4" />}
              label="Target Speed"
              value={config.precision * 10}
              min={20}
              max={150}
              unit="km/h"
              onChange={(v) => updateConfig("precision", v / 10)}
            />
            <SettingSlider
              icon={<Wind className="w-4 h-4" />}
              label="Headwind"
              value={config.windSpeed}
              min={0}
              max={50}
              unit="km/h"
              onChange={(v) => updateConfig("windSpeed", v)}
            />
          </>
        );
      case "thermal":
        return (
          <>
            <SettingSlider
              icon={<ThermometerSun className="w-4 h-4" />}
              label="Ambient Temperature"
              value={config.temperature}
              min={-20}
              max={50}
              unit="°C"
              onChange={(v) => updateConfig("temperature", v)}
            />
            <SettingSlider
              icon={<Cloud className="w-4 h-4" />}
              label="Humidity"
              value={config.humidity}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateConfig("humidity", v)}
            />
          </>
        );
      case "weather":
        return (
          <>
            <SettingSlider
              icon={<Wind className="w-4 h-4" />}
              label="Wind Speed"
              value={config.windSpeed}
              min={0}
              max={100}
              unit="km/h"
              onChange={(v) => updateConfig("windSpeed", v)}
            />
            <SettingSlider
              icon={<Cloud className="w-4 h-4" />}
              label="Rain Intensity"
              value={config.humidity}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateConfig("humidity", v)}
            />
            <SettingSlider
              icon={<ThermometerSun className="w-4 h-4" />}
              label="Temperature"
              value={config.temperature}
              min={-10}
              max={40}
              unit="°C"
              onChange={(v) => updateConfig("temperature", v)}
            />
          </>
        );
      case "waypoint":
        return (
          <>
            <SettingSlider
              icon={<Navigation className="w-4 h-4" />}
              label="Precision Required"
              value={config.precision}
              min={1}
              max={10}
              unit="level"
              onChange={(v) => updateConfig("precision", v)}
            />
            <SettingSlider
              icon={<Wind className="w-4 h-4" />}
              label="Wind Conditions"
              value={config.windSpeed}
              min={0}
              max={50}
              unit="km/h"
              onChange={(v) => updateConfig("windSpeed", v)}
            />
            <SettingSlider
              icon={<Target className="w-4 h-4" />}
              label="Flight Altitude"
              value={config.altitude}
              min={10}
              max={300}
              unit="m"
              onChange={(v) => updateConfig("altitude", v)}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderSettingsByTest()}
    </div>
  );
};

interface SettingSliderProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

const SettingSlider = ({ icon, label, value, min, max, unit, onChange }: SettingSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </Label>
        <span className="text-xs font-mono text-primary">
          {Math.round(value)}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
};

export default TestSettings;
