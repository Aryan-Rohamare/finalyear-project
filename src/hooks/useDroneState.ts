import { useState, useEffect, useCallback } from "react";
import type { PlacedComponent } from "@/components/builder/DroneWorkspace";
import type { DroneColors } from "@/components/builder/ColorPicker";
import { defaultColors } from "@/components/builder/ColorPicker";

const STORAGE_KEY = "droneforge-components";
const COLORS_KEY = "droneforge-colors";

export const useDroneState = () => {
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [droneColors, setDroneColors] = useState<DroneColors>(() => {
    try {
      const saved = localStorage.getItem(COLORS_KEY);
      return saved ? JSON.parse(saved) : defaultColors;
    } catch {
      return defaultColors;
    }
  });

  // Persist to localStorage whenever components change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(placedComponents));
    } catch (e) {
      console.error("Failed to save drone state:", e);
    }
  }, [placedComponents]);

  // Persist colors
  useEffect(() => {
    try {
      localStorage.setItem(COLORS_KEY, JSON.stringify(droneColors));
    } catch (e) {
      console.error("Failed to save drone colors:", e);
    }
  }, [droneColors]);

  const addComponent = useCallback((component: PlacedComponent) => {
    setPlacedComponents(prev => [...prev, component]);
  }, []);

  const removeComponent = useCallback((instanceId: string) => {
    setPlacedComponents(prev => prev.filter(c => c.instanceId !== instanceId));
  }, []);

  const clearComponents = useCallback(() => {
    setPlacedComponents([]);
  }, []);

  return {
    placedComponents,
    setPlacedComponents,
    addComponent,
    removeComponent,
    clearComponents,
    droneColors,
    setDroneColors,
  };
};
