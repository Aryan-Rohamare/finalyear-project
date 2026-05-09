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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex gap-3 p-4">
        {/* Left Panel - Component Library */}
        <aside className="w-72 panel p-3 overflow-hidden">
          <ComponentLibrary onDragStart={() => {}} />
        </aside>

        {/* Center - 3D Workspace */}
        <section className="flex-1 panel p-3 overflow-hidden">
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
        <aside className="w-80 panel p-3 overflow-hidden">
          <PerformanceMetrics components={placedComponents} onRemoveComponent={removeComponent} />
        </aside>
      </main>
    </div>
  );
};

export default Index;
