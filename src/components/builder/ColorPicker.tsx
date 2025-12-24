import { useState } from "react";
import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DroneColors {
  motors: string;
  frame: string;
  propellers: string;
  battery: string;
  leds: string;
}

const defaultColors: DroneColors = {
  motors: "#00D4FF",
  frame: "#2a2a4a",
  propellers: "#1a1a2e",
  battery: "#F59E0B",
  leds: "#22C55E",
};

const presetColors = [
  "#00D4FF", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", 
  "#22C55E", "#06B6D4", "#3B82F6", "#A855F7", "#F97316",
  "#14B8A6", "#84CC16", "#FBBF24", "#FB7185", "#818CF8",
];

interface ColorPickerProps {
  colors: DroneColors;
  onColorChange: (colors: DroneColors) => void;
}

const ColorPicker = ({ colors, onColorChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (part: keyof DroneColors, color: string) => {
    onColorChange({ ...colors, [part]: color });
  };

  const colorParts: { key: keyof DroneColors; label: string }[] = [
    { key: "motors", label: "Motors" },
    { key: "frame", label: "Frame" },
    { key: "propellers", label: "Propellers" },
    { key: "battery", label: "Battery" },
    { key: "leds", label: "LEDs" },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-primary/10"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0 bg-card/95 backdrop-blur-xl border-border/50" 
        align="end"
        sideOffset={8}
      >
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Drone Colors</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onColorChange(defaultColors)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
          {colorParts.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {label}
                </label>
                <div 
                  className="w-6 h-6 rounded-md border border-border/50 shadow-inner"
                  style={{ backgroundColor: colors[key] }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(key, color)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                      colors[key] === color 
                        ? "border-foreground shadow-lg" 
                        : "border-transparent hover:border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <label className="w-7 h-7 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-xs text-muted-foreground">+</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t border-border/50 bg-secondary/30">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => onColorChange(defaultColors)}
          >
            Reset to Defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
export { defaultColors };
export type { DroneColors };
