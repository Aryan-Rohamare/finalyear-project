import { useState, useEffect, useCallback } from "react";
import type { PlacedComponent } from "@/components/builder/DroneWorkspace";

const STORAGE_KEY = "droneforge-components";

export const useDroneState = () => {
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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
  };
};
