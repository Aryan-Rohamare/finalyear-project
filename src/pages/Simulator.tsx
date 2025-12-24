import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import TestLibrary from "@/components/simulator/TestLibrary";
import SimulationView3D from "@/components/simulator/SimulationView3D";
import TestResults from "@/components/simulator/TestResults";
import type { Test } from "@/components/simulator/TestLibrary";
import { useDroneState } from "@/hooks/useDroneState";

const Simulator = () => {
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { placedComponents } = useDroneState();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 2;
          if (next >= 100) {
            setIsRunning(false);
            setIsComplete(true);
            return 100;
          }
          return next;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isRunning, progress]);

  const handleSelectTest = (test: Test) => {
    setActiveTest(test);
    setProgress(0);
    setIsComplete(false);
    setIsRunning(false);
  };

  const handleToggleRun = () => {
    if (progress >= 100) {
      setProgress(0);
      setIsComplete(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setProgress(0);
    setIsRunning(false);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex">
        {/* Left Panel - Test Library */}
        <aside className="w-72 border-r border-border/50 p-3">
          <TestLibrary 
            onSelectTest={handleSelectTest}
            activeTest={activeTest}
          />
        </aside>

        {/* Center - 3D Simulation View */}
        <section className="flex-1 p-3">
          <SimulationView3D 
            activeTest={activeTest}
            isRunning={isRunning}
            onToggleRun={handleToggleRun}
            onReset={handleReset}
            progress={progress}
            droneComponents={placedComponents}
          />
        </section>

        {/* Right Panel - Test Results */}
        <aside className="w-80 border-l border-border/50 p-3">
          <TestResults 
            activeTest={activeTest}
            isComplete={isComplete}
            progress={progress}
          />
        </aside>
      </main>
    </div>
  );
};

export default Simulator;
