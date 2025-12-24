import Header from "@/components/layout/Header";
import ComponentLibrary from "@/components/builder/ComponentLibrary";
import DroneWorkspace from "@/components/builder/DroneWorkspace";
import PerformanceMetrics from "@/components/builder/PerformanceMetrics";
import type { DroneComponent } from "@/components/builder/ComponentLibrary";
import type { PlacedComponent } from "@/components/builder/DroneWorkspace";
import { useDroneState } from "@/hooks/useDroneState";

const Index = () => {
  const { placedComponents, addComponent, removeComponent, clearComponents, droneColors, setDroneColors } = useDroneState();

  const handleDrop = (component: DroneComponent, x: number, y: number) => {
    const newComponent: PlacedComponent = {
      ...component,
      x,
      y,
      z: 0,
      instanceId: `${component.id}-${Date.now()}`,
    };
    addComponent(newComponent);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex">
        {/* Left Panel - Component Library */}
        <aside className="w-72 border-r border-border/50 p-3">
          <ComponentLibrary onDragStart={() => {}} />
        </aside>

        {/* Center - 3D Workspace */}
        <section className="flex-1 p-3">
          <DroneWorkspace 
            placedComponents={placedComponents}
            onDrop={handleDrop}
            onRemove={removeComponent}
            onClear={clearComponents}
            droneColors={droneColors}
            onColorChange={setDroneColors}
          />
        </section>

        {/* Right Panel - Performance Metrics */}
        <aside className="w-80 border-l border-border/50 p-3">
          <PerformanceMetrics components={placedComponents} />
        </aside>
      </main>
    </div>
  );
};

export default Index;
