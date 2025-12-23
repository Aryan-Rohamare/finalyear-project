import { useState } from "react";
import { 
  Cog, 
  Circle, 
  Square, 
  Box, 
  Wind, 
  Camera, 
  Radio, 
  Battery,
  Cpu,
  Compass,
  Gauge,
  Zap,
  Wifi,
  Thermometer,
  Navigation,
  Target,
  Shield,
  Sun,
  Volume2
} from "lucide-react";

export type IconName = 
  | "cog" | "circle" | "square" | "box" | "wind" | "camera" | "radio" | "battery" | "cpu"
  | "compass" | "gauge" | "zap" | "wifi" | "thermometer" | "navigation" | "target" | "shield" | "sun" | "volume2";

const iconMap: Record<IconName, React.ReactNode> = {
  cog: <Cog className="w-5 h-5" />,
  circle: <Circle className="w-5 h-5" />,
  square: <Square className="w-5 h-5" />,
  box: <Box className="w-5 h-5" />,
  wind: <Wind className="w-5 h-5" />,
  camera: <Camera className="w-5 h-5" />,
  radio: <Radio className="w-5 h-5" />,
  battery: <Battery className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  compass: <Compass className="w-5 h-5" />,
  gauge: <Gauge className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
  thermometer: <Thermometer className="w-5 h-5" />,
  navigation: <Navigation className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  sun: <Sun className="w-5 h-5" />,
  volume2: <Volume2 className="w-5 h-5" />,
};

export interface DroneComponent {
  id: string;
  name: string;
  category: string;
  iconName: IconName;
  color: string;
  specs: {
    weight: string;
    power?: string;
    thrust?: string;
  };
}

const components: DroneComponent[] = [
  // Motors
  { id: "motor-2212", name: "Motor 2212", category: "Motors", iconName: "cog", color: "#00D4FF", specs: { weight: "45g", thrust: "850g" } },
  { id: "motor-2806", name: "Motor 2806", category: "Motors", iconName: "cog", color: "#00D4FF", specs: { weight: "62g", thrust: "1200g" } },
  { id: "motor-2207", name: "Motor 2207", category: "Motors", iconName: "cog", color: "#00D4FF", specs: { weight: "32g", thrust: "1050g" } },
  { id: "motor-2306", name: "Motor 2306", category: "Motors", iconName: "cog", color: "#00D4FF", specs: { weight: "28g", thrust: "980g" } },
  
  // Propellers
  { id: "prop-5x4", name: "Propeller 5x4", category: "Propellers", iconName: "wind", color: "#10B981", specs: { weight: "8g" } },
  { id: "prop-7x3", name: "Propeller 7x3", category: "Propellers", iconName: "wind", color: "#10B981", specs: { weight: "12g" } },
  { id: "prop-6x4", name: "Propeller 6x4.5", category: "Propellers", iconName: "wind", color: "#10B981", specs: { weight: "10g" } },
  { id: "prop-3blade", name: "Tri-Blade 5x4x3", category: "Propellers", iconName: "wind", color: "#10B981", specs: { weight: "11g" } },
  
  // Frames
  { id: "frame-x", name: "X-Frame 250", category: "Frames", iconName: "box", color: "#8B5CF6", specs: { weight: "120g" } },
  { id: "frame-h", name: "H-Frame 450", category: "Frames", iconName: "square", color: "#8B5CF6", specs: { weight: "180g" } },
  { id: "frame-racing", name: "Racing Frame 210", category: "Frames", iconName: "box", color: "#8B5CF6", specs: { weight: "95g" } },
  { id: "frame-long", name: "Long Range 500", category: "Frames", iconName: "square", color: "#8B5CF6", specs: { weight: "220g" } },
  
  // Power
  { id: "battery-4s", name: "LiPo 4S 1500mAh", category: "Power", iconName: "battery", color: "#F59E0B", specs: { weight: "165g", power: "14.8V" } },
  { id: "battery-6s", name: "LiPo 6S 2200mAh", category: "Power", iconName: "battery", color: "#F59E0B", specs: { weight: "280g", power: "22.2V" } },
  { id: "battery-3s", name: "LiPo 3S 1300mAh", category: "Power", iconName: "battery", color: "#F59E0B", specs: { weight: "110g", power: "11.1V" } },
  { id: "esc-4in1", name: "ESC 4-in-1 45A", category: "Power", iconName: "zap", color: "#F59E0B", specs: { weight: "12g" } },
  { id: "pdb", name: "Power Distribution Board", category: "Power", iconName: "zap", color: "#F59E0B", specs: { weight: "8g" } },
  
  // Electronics
  { id: "fc-f4", name: "Flight Controller F4", category: "Electronics", iconName: "cpu", color: "#EF4444", specs: { weight: "8g" } },
  { id: "fc-f7", name: "Flight Controller F7", category: "Electronics", iconName: "cpu", color: "#EF4444", specs: { weight: "10g" } },
  { id: "fc-h7", name: "Flight Controller H7", category: "Electronics", iconName: "cpu", color: "#EF4444", specs: { weight: "11g" } },
  { id: "receiver", name: "RC Receiver 2.4GHz", category: "Electronics", iconName: "wifi", color: "#EF4444", specs: { weight: "5g" } },
  { id: "buzzer", name: "Lost Drone Buzzer", category: "Electronics", iconName: "volume2", color: "#EF4444", specs: { weight: "3g" } },
  
  // Sensors
  { id: "gps", name: "GPS Module", category: "Sensors", iconName: "navigation", color: "#06B6D4", specs: { weight: "15g" } },
  { id: "compass", name: "Compass Module", category: "Sensors", iconName: "compass", color: "#06B6D4", specs: { weight: "4g" } },
  { id: "barometer", name: "Barometer", category: "Sensors", iconName: "gauge", color: "#06B6D4", specs: { weight: "2g" } },
  { id: "lidar", name: "LiDAR Sensor", category: "Sensors", iconName: "target", color: "#06B6D4", specs: { weight: "28g" } },
  { id: "optical-flow", name: "Optical Flow Sensor", category: "Sensors", iconName: "circle", color: "#06B6D4", specs: { weight: "8g" } },
  { id: "temp-sensor", name: "Temperature Sensor", category: "Sensors", iconName: "thermometer", color: "#06B6D4", specs: { weight: "2g" } },
  
  // Cameras & FPV
  { id: "camera-hd", name: "HD Camera 1080p", category: "Cameras", iconName: "camera", color: "#EC4899", specs: { weight: "25g" } },
  { id: "camera-4k", name: "4K Action Camera", category: "Cameras", iconName: "camera", color: "#EC4899", specs: { weight: "65g" } },
  { id: "fpv-cam", name: "FPV Camera", category: "Cameras", iconName: "camera", color: "#EC4899", specs: { weight: "8g" } },
  { id: "vtx", name: "Video TX 600mW", category: "Cameras", iconName: "radio", color: "#EC4899", specs: { weight: "8g" } },
  { id: "vtx-25mw", name: "Video TX 25mW", category: "Cameras", iconName: "radio", color: "#EC4899", specs: { weight: "4g" } },
  
  // Accessories
  { id: "led-strip", name: "LED Strip RGB", category: "Accessories", iconName: "sun", color: "#A855F7", specs: { weight: "6g" } },
  { id: "prop-guard", name: "Propeller Guards", category: "Accessories", iconName: "shield", color: "#A855F7", specs: { weight: "40g" } },
  { id: "landing-gear", name: "Landing Gear", category: "Accessories", iconName: "box", color: "#A855F7", specs: { weight: "25g" } },
  { id: "antenna", name: "FPV Antenna", category: "Accessories", iconName: "radio", color: "#A855F7", specs: { weight: "12g" } },
];

const categories = ["Motors", "Propellers", "Frames", "Power", "Electronics", "Sensors", "Cameras", "Accessories"];

interface ComponentLibraryProps {
  onDragStart: (component: DroneComponent) => void;
}

const ComponentLibrary = ({ onDragStart }: ComponentLibraryProps) => {
  const [activeCategory, setActiveCategory] = useState("Motors");

  const filteredComponents = components.filter(c => c.category === activeCategory);

  const handleDragStart = (e: React.DragEvent, component: DroneComponent) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
    onDragStart(component);
  };

  return (
    <div className="h-full flex flex-col panel animate-slide-in-left">
      <div className="panel-header">Components</div>
      
      <div className="p-3 border-b border-border">
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                activeCategory === cat 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {filteredComponents.map(component => (
          <div
            key={component.id}
            draggable
            onDragStart={(e) => handleDragStart(e, component)}
            className="p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:glow-primary group"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${component.color}20`, color: component.color }}
              >
                {iconMap[component.iconName]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{component.name}</p>
                <p className="text-xs text-muted-foreground">{component.specs.weight}</p>
              </div>
            </div>
            {(component.specs.thrust || component.specs.power) && (
              <div className="mt-2 flex gap-2 text-xs flex-wrap">
                {component.specs.thrust && (
                  <span className="px-2 py-0.5 bg-success/10 text-success rounded">
                    {component.specs.thrust} thrust
                  </span>
                )}
                {component.specs.power && (
                  <span className="px-2 py-0.5 bg-warning/10 text-warning rounded">
                    {component.specs.power}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentLibrary;
export { iconMap };
