import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Float, Html } from "@react-three/drei";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Test } from "./TestLibrary";
import type { PlacedComponent } from "@/components/builder/DroneWorkspace";
import type { DroneColors } from "@/components/builder/ColorPicker";
import { defaultColors } from "@/components/builder/ColorPicker";
import * as THREE from "three";
import { Suspense } from "react";

interface SimulationView3DProps {
  activeTest: Test | null;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  progress: number;
  droneComponents: PlacedComponent[];
  droneColors: DroneColors;
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
const Propeller = ({ position, color, rotation = 0 }: { position: [number, number, number]; color: string; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh>
      <boxGeometry args={[0.6, 0.02, 0.08]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <boxGeometry args={[0.6, 0.02, 0.08]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  </group>
);

// 3D Frame Component
const DroneFrame = ({ hasFrame, color }: { hasFrame: boolean; color: string }) => {
  if (!hasFrame) return null;
  
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      
      {[
        [0.5, 0, 0.5],
        [0.5, 0, -0.5],
        [-0.5, 0, 0.5],
        [-0.5, 0, -0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.8, 0.06, 0.08]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
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

// Animated Drone Model for Simulation
const AnimatedDrone = ({ 
  testType, 
  isRunning, 
  progress,
  components,
  colors
}: { 
  testType: string | null;
  isRunning: boolean;
  progress: number;
  components: PlacedComponent[];
  colors: DroneColors;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const propellerRotation = useRef(0);
  
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

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Propeller spinning
    if (isRunning) {
      propellerRotation.current += 0.5;
    }

    if (!isRunning) {
      groupRef.current.position.y = 0;
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }

    // Test-specific animations
    switch (testType) {
      case "hover":
        groupRef.current.position.y = Math.sin(time * 2) * 0.05;
        groupRef.current.rotation.x = Math.sin(time * 1.5) * 0.02;
        groupRef.current.rotation.z = Math.cos(time * 1.5) * 0.02;
        break;
        
      case "ascent":
        groupRef.current.position.y = (progress / 100) * 2;
        groupRef.current.rotation.x = -0.1;
        break;
        
      case "rotation":
        groupRef.current.rotation.y = (progress / 100) * Math.PI * 4;
        groupRef.current.position.y = Math.sin(time * 2) * 0.05;
        break;
        
      case "wind":
        groupRef.current.position.x = Math.sin(time * 3) * 0.3;
        groupRef.current.position.y = Math.sin(time * 2) * 0.1;
        groupRef.current.rotation.z = Math.sin(time * 3) * 0.15;
        groupRef.current.rotation.x = Math.cos(time * 2) * 0.1;
        break;
        
      case "speed":
        groupRef.current.position.z = -2 + (progress / 100) * 4;
        groupRef.current.rotation.x = -0.2;
        groupRef.current.position.y = Math.sin(time * 4) * 0.03;
        break;
        
      case "thermal":
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.03;
        break;
        
      case "weather":
        groupRef.current.position.x = Math.sin(time * 4) * 0.4 + Math.sin(time * 7) * 0.1;
        groupRef.current.position.y = Math.sin(time * 2.5) * 0.2;
        groupRef.current.rotation.z = Math.sin(time * 3) * 0.2;
        groupRef.current.rotation.x = Math.cos(time * 2.5) * 0.15;
        break;
        
      case "waypoint":
        const t = (progress / 100) * Math.PI * 2;
        groupRef.current.position.x = Math.sin(t) * 1.5;
        groupRef.current.position.z = Math.sin(t * 2) * 0.75;
        groupRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.05;
        groupRef.current.rotation.y = Math.atan2(Math.cos(t) * 1.5, Math.cos(t * 2) * 1.5);
        break;
        
      default:
        groupRef.current.position.y = Math.sin(time * 2) * 0.05;
    }
  });

  // Show empty state if no components
  if (components.length === 0) {
    return (
      <Html center>
        <div className="text-center px-6 py-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl">
          <p className="text-sm text-muted-foreground">Build a drone first</p>
        </div>
      </Html>
    );
  }

  return (
    <group ref={groupRef}>
      <DroneFrame hasFrame={hasFrame} color={colors.frame} />
      
      {/* Motors */}
      {motorPositions.slice(0, hasMotors).map((pos, i) => (
        <Motor key={`motor-${i}`} position={pos} color={colors.motors} />
      ))}
      
      {/* Propellers */}
      {motorPositions.slice(0, Math.min(hasProps, hasMotors)).map((pos, i) => (
        <Propeller 
          key={`prop-${i}`} 
          position={[pos[0], pos[1] + 0.2, pos[2]]} 
          color={colors.propellers} 
          rotation={isRunning ? propellerRotation.current + (i % 2 === 0 ? 0.1 : -0.1) : 0}
        />
      ))}
      
      {/* Battery */}
      {hasBattery && <Battery position={[0, 0.12, 0]} color={colors.battery} />}
      
      {/* Camera */}
      {hasCamera && <Camera3D position={[0, -0.1, 0.3]} />}
      
      {/* GPS */}
      {hasGPS && <GPSModule position={[0, 0.2, -0.1]} />}

      {/* LEDs */}
      {hasLEDs && <LEDStrip color={colors.leds} />}
      
      {/* Status LED */}
      <mesh position={[0, 0.1, 0.2]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial 
          color={isRunning ? "#22C55E" : "#F59E0B"} 
          emissive={isRunning ? "#22C55E" : "#F59E0B"}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
};

// Wind particles for wind test
const WindParticles = ({ isRunning, testType }: { isRunning: boolean; testType: string | null }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 4 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (!particlesRef.current || !isRunning) return;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      if (testType === "wind" || testType === "weather") {
        positions[i] -= 0.15; // Move left (wind direction)
        if (positions[i] < -5) positions[i] = 5;
      }
      if (testType === "weather") {
        positions[i + 1] -= 0.05; // Rain falling
        if (positions[i + 1] < -1) positions[i + 1] = 3;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!isRunning || (testType !== "wind" && testType !== "weather")) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={testType === "weather" ? 0.03 : 0.02} 
        color={testType === "weather" ? "#6B7280" : "#94A3B8"}
        transparent
        opacity={0.6}
      />
    </points>
  );
};

// Waypoint markers
const Waypoints = ({ testType, progress }: { testType: string | null; progress: number }) => {
  if (testType !== "waypoint") return null;
  
  const waypointPositions: [number, number, number][] = [
    [0, 0.5, 0],
    [1.5, 0.5, 0],
    [0, 0.5, 0.75],
    [-1.5, 0.5, 0],
    [0, 0.5, -0.75],
  ];

  return (
    <>
      {waypointPositions.map((pos, i) => {
        const isReached = progress > (i / waypointPositions.length) * 100;
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color={isReached ? "#22C55E" : "#00D4FF"} 
              emissive={isReached ? "#22C55E" : "#00D4FF"}
              emissiveIntensity={isReached ? 1 : 0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </>
  );
};

// Grid Floor
const GridFloor = () => (
  <group position={[0, -1.5, 0]}>
    <gridHelper args={[10, 20, "#00D4FF", "#1a1a2e"]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#0a0a14" transparent opacity={0.8} />
    </mesh>
  </group>
);

const SimulationView3D = ({ 
  activeTest, 
  isRunning, 
  onToggleRun, 
  onReset, 
  progress,
  droneComponents,
  droneColors
}: SimulationView3DProps) => {
  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden animate-fade-in">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-card to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium tracking-wide">Simulation View</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <Canvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[4, 2, 4]} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={12}
              autoRotate={!isRunning}
              autoRotateSpeed={0.3}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, 3, -5]} intensity={0.5} color="#00D4FF" />
            <pointLight position={[5, 3, -5]} intensity={0.3} color="#8B5CF6" />
            
            {/* Environment */}
            <Environment preset="night" />
            <fog attach="fog" args={['#0a0a14', 8, 20]} />
            
            {/* Animated Drone */}
            <AnimatedDrone 
              testType={activeTest?.id || null} 
              isRunning={isRunning} 
              progress={progress}
              components={droneComponents}
              colors={droneColors}
            />
            
            {/* Test-specific effects */}
            <WindParticles isRunning={isRunning} testType={activeTest?.id || null} />
            <Waypoints testType={activeTest?.id || null} progress={progress} />
            
            {/* Grid */}
            <GridFloor />
            
            {/* Empty state */}
            {!activeTest && (
              <Html center>
                <div className="text-center px-6 py-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl">
                  <p className="text-sm text-muted-foreground">Select a test to begin</p>
                </div>
              </Html>
            )}
          </Suspense>
        </Canvas>

        {/* Test info overlay */}
        {activeTest && (
          <div className="absolute top-4 left-4 p-4 bg-card/80 backdrop-blur-md rounded-xl border border-border/50 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20">
                {activeTest.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{activeTest.name}</p>
                <p className="text-xs text-muted-foreground">{activeTest.category} • {activeTest.duration}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {activeTest && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-md rounded-xl border border-border/50 shadow-xl">
              <Button 
                variant={isRunning ? "outline" : "glow"} 
                size="icon" 
                className="h-10 w-10 flex-shrink-0"
                onClick={onToggleRun}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-secondary/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-mono text-primary w-14 text-right">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationView3D;
