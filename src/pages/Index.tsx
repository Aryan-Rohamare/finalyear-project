import { useState } from "react";
import Header from "@/components/layout/Header";
import ComponentLibrary from "@/components/builder/ComponentLibrary";
import DroneWorkspace from "@/components/builder/DroneWorkspace";
import PerformanceMetrics from "@/components/builder/PerformanceMetrics";
import type { DroneComponent } from "@/components/builder/ComponentLibrary";
import type { PlacedComponent } from "@/components/builder/DroneWorkspace";

const Index = () => {
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [draggedComponent, setDraggedComponent] = useState<DroneComponent | null>(null);

  const handleDrop = (component: DroneComponent, x: number, y: number) => {
    const newComponent: PlacedComponent = {
      ...component,
      x,
      y,
      z: 0,
      instanceId: `${component.id}-${Date.now()}`,
    };
    setPlacedComponents(prev => [...prev, newComponent]);
    setDraggedComponent(null);
  };

  const handleRemove = (instanceId: string) => {
    setPlacedComponents(prev => prev.filter(c => c.instanceId !== instanceId));
  };

  const handleClear = () => {
    setPlacedComponents([]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex">
        {/* Left Panel - Component Library */}
        <aside className="w-72 border-r border-border p-3">
          <ComponentLibrary onDragStart={setDraggedComponent} />
        </aside>

        {/* Center - 3D Workspace */}
        <section className="flex-1 p-3">
          <DroneWorkspace 
            placedComponents={placedComponents}
            onDrop={handleDrop}
            onRemove={handleRemove}
            onClear={handleClear}
          />
        </section>

        {/* Right Panel - Performance Metrics */}
        <aside className="w-80 border-l border-border p-3">
          <PerformanceMetrics components={placedComponents} />
        </aside>
      </main>
    </div>
  );
};

export default Index;
