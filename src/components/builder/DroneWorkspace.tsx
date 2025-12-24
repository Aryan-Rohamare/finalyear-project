import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Float, Html } from "@react-three/drei";
import { RotateCcw, Maximize2, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DroneComponent } from "./ComponentLibrary";
import type { DroneColors } from "./ColorPicker";
import ColorPicker, { defaultColors } from "./ColorPicker";
import * as THREE from "three";

export interface PlacedComponent extends DroneComponent {
  x: number;
  y: number;
  z: number;
  instanceId: string;
}

interface DroneWorkspaceProps {
  placedComponents: PlacedComponent[];
  onDrop: (component: DroneComponent, x: number, y: number) => void;
  onRemove: (instanceId: string) => void;
  onClear: () => void;
  droneColors: DroneColors;
  onColorChange: (colors: DroneColors) => void;
}

// 3D Motor Component
const Motor = ({ position, color }: { position: [number, number, number]; color: string }) => (
  <group position={position}>
    <mesh>
      <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
      <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
    </mesh>
  </group>
);

// 3D Propeller Component
const Propeller = ({ position, color, spinning = true }: { position: [number, number, number]; color: string; spinning?: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  
  return (
    <Float speed={spinning ? 50 : 0} rotationIntensity={0} floatIntensity={0}>
      <group position={position} ref={ref}>
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.08]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.08]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      </group>
    </Float>
  );
};

// 3D Frame Component
const DroneFrame = ({ hasFrame, color }: { hasFrame: boolean; color: string }) => {
  if (!hasFrame) return null;
  
  // Derive arm color from frame color (slightly lighter)
  const armColor = color;
  
  return (
    <group>
      {/* Center body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Arms */}
      {[
        [0.5, 0, 0.5],
        [0.5, 0, -0.5],
        [-0.5, 0, 0.5],
        [-0.5, 0, -0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.8, 0.06, 0.08]} />
          <meshStandardMaterial color={armColor} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// 3D Battery Component
const Battery = ({ position, color }: { position: [number, number, number]; color: string }) => (
  <mesh position={position}>
    <boxGeometry args={[0.3, 0.12, 0.15]} />
    <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
  </mesh>
);

// 3D Camera Component
const Camera3D = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.12]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
      <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
    </mesh>
  </group>
);

// 3D GPS Module
const GPSModule = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh>
      <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
      <meshStandardMaterial color="#06B6D4" metalness={0.5} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.03, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
      <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

// LED Strip
const LEDStrip = ({ color }: { color: string }) => (
  <group>
    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
      <mesh key={i} position={[Math.cos(angle) * 0.2, -0.05, Math.sin(angle) * 0.2]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    ))}
  </group>
);

// Main Drone Model
const DroneModel = ({ components, colors }: { components: PlacedComponent[]; colors: DroneColors }) => {
  const hasFrame = components.some(c => c.category === "Frames");
  const hasMotors = components.filter(c => c.category === "Motors").length;
  const hasProps = components.filter(c => c.category === "Propellers").length;
  const hasBattery = components.some(c => c.category === "Power" && c.id.includes("battery"));
  const hasCamera = components.some(c => c.category === "Cameras");
  const hasGPS = components.some(c => c.id === "gps");
  const hasLEDs = components.some(c => c.id === "led-strip");

  const motorPositions: [number, number, number][] = [
    [0.7, 0.1, 0.7],
    [0.7, 0.1, -0.7],
    [-0.7, 0.1, 0.7],
    [-0.7, 0.1, -0.7],
  ];

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group>
        <DroneFrame hasFrame={hasFrame} color={colors.frame} />
        
        {/* Motors */}
        {motorPositions.slice(0, hasMotors).map((pos, i) => (
          <Motor key={`motor-${i}`} position={pos} color={colors.motors} />
        ))}
        
        {/* Propellers */}
        {motorPositions.slice(0, Math.min(hasProps, hasMotors)).map((pos, i) => (
          <Propeller key={`prop-${i}`} position={[pos[0], pos[1] + 0.2, pos[2]]} color={colors.propellers} spinning />
        ))}
        
        {/* Battery */}
        {hasBattery && <Battery position={[0, 0.12, 0]} color={colors.battery} />}
        
        {/* Camera */}
        {hasCamera && <Camera3D position={[0, -0.1, 0.3]} />}
        
        {/* GPS */}
        {hasGPS && <GPSModule position={[0, 0.2, -0.1]} />}

        {/* LEDs */}
        {hasLEDs && <LEDStrip color={colors.leds} />}
      </group>
    </Float>
  );
};

// Grid Floor
const GridFloor = ({ accentColor }: { accentColor: string }) => (
  <group position={[0, -1.5, 0]}>
    <gridHelper args={[10, 20, accentColor, "#1a1a2e"]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#0a0a14" transparent opacity={0.8} />
    </mesh>
  </group>
);

const DroneWorkspace = ({ placedComponents, onDrop, onRemove, onClear, droneColors, onColorChange }: DroneWorkspaceProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full gradient-primary" />
          <span>3D Workspace</span>
        </div>
        <div className="flex items-center gap-1">
          <ColorPicker colors={droneColors} onColorChange={onColorChange} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className={`w-4 h-4 ${showGrid ? 'text-primary' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" onClick={onClear}>
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
        <Canvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[3, 2, 3]} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              autoRotate
              autoRotateSpeed={0.5}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <pointLight position={[-5, 3, -5]} intensity={0.5} color={droneColors.motors} />
            <pointLight position={[5, 3, -5]} intensity={0.3} color="#8B5CF6" />
            
            {/* Environment */}
            <Environment preset="night" />
            
            {/* Drone Model */}
            <DroneModel components={placedComponents} colors={droneColors} />
            
            {/* Grid */}
            {showGrid && <GridFloor accentColor={droneColors.motors} />}
            
            {/* Empty state hint */}
            {placedComponents.length === 0 && (
              <Html center>
                <div className="text-center text-muted-foreground text-sm whitespace-nowrap px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50">
                  Drag components to build your drone
                </div>
              </Html>
            )}
          </Suspense>
        </Canvas>

        {/* Drop hint overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none z-10">
            <div className="px-6 py-3 bg-primary/20 border border-primary rounded-xl text-primary font-medium backdrop-blur-sm">
              Drop component to add
            </div>
          </div>
        )}

        {/* Component count badge */}
        {placedComponents.length > 0 && (
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl text-xs">
            <span className="text-muted-foreground">Components:</span>{" "}
            <span className="text-primary font-semibold">{placedComponents.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneWorkspace;