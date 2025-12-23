import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Test } from "./TestLibrary";

interface SimulationViewProps {
  activeTest: Test | null;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  progress: number;
}

const SimulationView = ({ activeTest, isRunning, onToggleRun, onReset, progress }: SimulationViewProps) => {
  return (
    <div className="h-full flex flex-col panel animate-fade-in">
      <div className="panel-header flex items-center justify-between">
        <span>Simulation View</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        {/* Sky gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, hsl(210 50% 15%) 0%, hsl(210 40% 25%) 50%, hsl(210 30% 35%) 100%)'
          }}
        />

        {/* Ground grid */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(120 20% 8%) 100%)',
          }}
        >
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'bottom'
            }}
          />
        </div>

        {/* Drone visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative ${isRunning ? 'animate-float' : ''}`}>
            {/* Drone body */}
            <div className="w-20 h-20 relative">
              <div className="absolute inset-0 border-2 border-primary/50 rotate-45 bg-card/80 rounded-lg" />
              
              {/* Propellers */}
              {[
                { top: '-12px', left: '-12px' },
                { top: '-12px', right: '-12px' },
                { bottom: '-12px', left: '-12px' },
                { bottom: '-12px', right: '-12px' },
              ].map((pos, i) => (
                <div 
                  key={i}
                  className={`absolute w-8 h-8 ${isRunning ? 'animate-spin-slow' : ''}`}
                  style={pos}
                >
                  <div className="w-full h-0.5 bg-primary/60 absolute top-1/2 -translate-y-1/2 rounded-full" />
                  <div className="h-full w-0.5 bg-primary/60 absolute left-1/2 -translate-x-1/2 rounded-full" />
                </div>
              ))}

              {/* Status light */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
                isRunning ? 'bg-success animate-pulse' : 'bg-warning'
              }`} />
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-md" />
          </div>
        </div>

        {/* Test info overlay */}
        {activeTest && (
          <div className="absolute top-4 left-4 p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                {activeTest.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{activeTest.name}</p>
                <p className="text-xs text-muted-foreground">{activeTest.category}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {activeTest && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
              <Button 
                variant={isRunning ? "outline" : "glow"} 
                size="icon" 
                className="h-8 w-8 flex-shrink-0"
                onClick={onToggleRun}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!activeTest && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Select a test to begin simulation</p>
              <p className="text-xs text-muted-foreground/60">Choose from the test library on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationView;
