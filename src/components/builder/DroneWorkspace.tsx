import { useState } from "react";
import { Trash2, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DroneComponent } from "./ComponentLibrary";

interface PlacedComponent extends DroneComponent {
  x: number;
  y: number;
  instanceId: string;
}

interface DroneWorkspaceProps {
  placedComponents: PlacedComponent[];
  onDrop: (component: DroneComponent, x: number, y: number) => void;
  onRemove: (instanceId: string) => void;
  onClear: () => void;
}

const DroneWorkspace = ({ placedComponents, onDrop, onRemove, onClear }: DroneWorkspaceProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData("component");
    if (data) {
      const component = JSON.parse(data) as DroneComponent;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onDrop(component, x, y);
    }
  };

  return (
    <div className="h-full flex flex-col panel animate-fade-in">
      <div className="panel-header flex items-center justify-between">
        <span>3D Workspace</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Move className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className={`flex-1 relative overflow-hidden transition-all ${
          isDragOver ? "ring-2 ring-primary ring-inset" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Center drone visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Drone frame placeholder */}
            <div className="w-48 h-48 border-2 border-dashed border-primary/30 rounded-full flex items-center justify-center animate-pulse-glow">
              <div className="w-32 h-32 border border-primary/50 rotate-45 relative">
                {/* Motor positions */}
                <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-primary/20 border border-primary" />
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary/20 border border-primary" />
                <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-primary/20 border border-primary" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-primary/20 border border-primary" />
                
                {/* Center body */}
                <div className="absolute inset-4 bg-secondary rounded-lg border border-border -rotate-45 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">BODY</span>
                </div>
              </div>
            </div>

            {/* Propeller animation hints */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
              Front
            </div>
          </div>
        </div>

        {/* Placed components */}
        {placedComponents.map(comp => (
          <div
            key={comp.instanceId}
            className="absolute group"
            style={{ left: `${comp.x}%`, top: `${comp.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="p-2 bg-card border border-primary/50 rounded-lg glow-primary flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">
                {comp.icon}
              </div>
              <span className="text-xs font-medium">{comp.name}</span>
              <button
                onClick={() => onRemove(comp.instanceId)}
                className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-1 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Drop hint */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
            <div className="px-4 py-2 bg-primary/20 border border-primary rounded-lg text-primary font-medium">
              Drop component here
            </div>
          </div>
        )}

        {/* Empty state */}
        {placedComponents.length === 0 && !isDragOver && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm text-muted-foreground">
              Drag components from the left panel
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneWorkspace;
export type { PlacedComponent };
