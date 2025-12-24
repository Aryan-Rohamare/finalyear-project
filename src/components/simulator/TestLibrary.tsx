import { useState } from "react";
import { 
  Wind, 
  ArrowUp, 
  RotateCw, 
  Target, 
  Zap, 
  ThermometerSun,
  Cloud,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Test {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  category: string;
}

const tests: Test[] = [
  { 
    id: "hover", 
    name: "Hover Stability", 
    description: "Test drone stability during stationary hover",
    icon: <Target className="w-5 h-5" />, 
    duration: "30s",
    category: "Basic"
  },
  { 
    id: "ascent", 
    name: "Vertical Ascent", 
    description: "Measure climb rate and power consumption",
    icon: <ArrowUp className="w-5 h-5" />, 
    duration: "45s",
    category: "Basic"
  },
  { 
    id: "rotation", 
    name: "Yaw Rotation", 
    description: "Test rotation speed and accuracy",
    icon: <RotateCw className="w-5 h-5" />, 
    duration: "20s",
    category: "Basic"
  },
  { 
    id: "wind", 
    name: "Wind Resistance", 
    description: "Simulate various wind conditions",
    icon: <Wind className="w-5 h-5" />, 
    duration: "60s",
    category: "Advanced"
  },
  { 
    id: "speed", 
    name: "Max Speed Test", 
    description: "Determine maximum forward velocity",
    icon: <Zap className="w-5 h-5" />, 
    duration: "90s",
    category: "Advanced"
  },
  { 
    id: "thermal", 
    name: "Thermal Analysis", 
    description: "Monitor motor and ESC temperatures",
    icon: <ThermometerSun className="w-5 h-5" />, 
    duration: "120s",
    category: "Advanced"
  },
  { 
    id: "weather", 
    name: "Weather Sim", 
    description: "Combined rain and wind simulation",
    icon: <Cloud className="w-5 h-5" />, 
    duration: "180s",
    category: "Extreme"
  },
  { 
    id: "waypoint", 
    name: "Waypoint Navigation", 
    description: "Test autonomous navigation accuracy",
    icon: <Navigation className="w-5 h-5" />, 
    duration: "300s",
    category: "Extreme"
  },
];

interface TestLibraryProps {
  onSelectTest: (test: Test) => void;
  activeTest: Test | null;
}

const TestLibrary = ({ onSelectTest, activeTest }: TestLibraryProps) => {
  const [activeCategory, setActiveCategory] = useState("Basic");
  const categories = ["Basic", "Advanced", "Extreme"];

  const filteredTests = tests.filter(t => t.category === activeCategory);

  return (
    <div className="h-full flex flex-col panel animate-slide-in-left">
      <div className="panel-header">
        <div className="w-2 h-2 rounded-full gradient-primary" />
        Test Library
      </div>
      
      <div className="p-3 border-b border-border/50">
        <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                activeCategory === cat 
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {filteredTests.map(test => (
          <div
            key={test.id}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
              activeTest?.id === test.id 
                ? "bg-primary/10 border-primary/50 glow-primary" 
                : "bg-secondary/30 border-border/50 hover:border-primary/30 hover:bg-secondary/50"
            }`}
            onClick={() => onSelectTest(test)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                activeTest?.id === test.id 
                  ? "gradient-primary text-primary-foreground shadow-lg" 
                  : "bg-primary/10 text-primary"
              }`}>
                {test.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm text-foreground">{test.name}</p>
                  <span className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded">{test.duration}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{test.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border/50">
        <Button 
          className="w-full" 
          variant="glow"
          disabled={!activeTest}
        >
          Run Selected Test
        </Button>
      </div>
    </div>
  );
};

export default TestLibrary;
export type { Test };
