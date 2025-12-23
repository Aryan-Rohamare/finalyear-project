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
  Cpu
} from "lucide-react";

export type IconName = "cog" | "circle" | "square" | "box" | "wind" | "camera" | "radio" | "battery" | "cpu";

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
};

export interface DroneComponent {
  id: string;
  name: string;
  category: string;
  iconName: IconName;
  specs: {
    weight: string;
    power?: string;
    thrust?: string;
  };
}

const components: DroneComponent[] = [
  { id: "motor-2212", name: "Motor 2212", category: "Motors", iconName: "cog", specs: { weight: "45g", thrust: "850g" } },
  { id: "motor-2806", name: "Motor 2806", category: "Motors", iconName: "cog", specs: { weight: "62g", thrust: "1200g" } },
  { id: "prop-5x4", name: "Propeller 5x4", category: "Propellers", iconName: "wind", specs: { weight: "8g" } },
  { id: "prop-7x3", name: "Propeller 7x3", category: "Propellers", iconName: "wind", specs: { weight: "12g" } },
  { id: "frame-x", name: "X-Frame 250", category: "Frames", iconName: "box", specs: { weight: "120g" } },
  { id: "frame-h", name: "H-Frame 450", category: "Frames", iconName: "square", specs: { weight: "180g" } },
  { id: "battery-4s", name: "LiPo 4S 1500mAh", category: "Power", iconName: "battery", specs: { weight: "165g", power: "22.2V" } },
  { id: "battery-6s", name: "LiPo 6S 2200mAh", category: "Power", iconName: "battery", specs: { weight: "280g", power: "22.2V" } },
  { id: "fc-f4", name: "Flight Controller F4", category: "Electronics", iconName: "cpu", specs: { weight: "8g" } },
  { id: "fc-f7", name: "Flight Controller F7", category: "Electronics", iconName: "cpu", specs: { weight: "10g" } },
  { id: "camera-hd", name: "HD Camera", category: "Attachments", iconName: "camera", specs: { weight: "25g" } },
  { id: "gps", name: "GPS Module", category: "Attachments", iconName: "circle", specs: { weight: "15g" } },
  { id: "vtx", name: "Video TX 600mW", category: "Attachments", iconName: "radio", specs: { weight: "8g" } },
];

const categories = ["Motors", "Propellers", "Frames", "Power", "Electronics", "Attachments"];

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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                {iconMap[component.iconName]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{component.name}</p>
                <p className="text-xs text-muted-foreground">{component.specs.weight}</p>
              </div>
            </div>
            {component.specs.thrust && (
              <div className="mt-2 flex gap-2 text-xs">
                <span className="px-2 py-0.5 bg-success/10 text-success rounded">
                  {component.specs.thrust} thrust
                </span>
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
