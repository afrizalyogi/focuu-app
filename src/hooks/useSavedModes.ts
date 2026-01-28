import { useState, useEffect, useCallback } from "react";
import { EnergyMode } from "./useSessionTimer";

export interface SavedMode {
  id: string;
  name: string;
  energyMode: EnergyMode;
  sessionLength: number;
  breakLength: number;
  isDefault: boolean;
  createdAt: string;
}

const STORAGE_KEY = "focuu_modes";

export const useSavedModes = () => {
  const [modes, setModes] = useState<SavedMode[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setModes(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveMode = useCallback((
    name: string,
    energyMode: EnergyMode,
    sessionLength: number,
    breakLength: number
  ) => {
    const newMode: SavedMode = {
      id: crypto.randomUUID(),
      name,
      energyMode,
      sessionLength,
      breakLength,
      isDefault: modes.length === 0, // First mode is default
      createdAt: new Date().toISOString(),
    };

    setModes((prev) => {
      const updated = [...prev, newMode];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newMode;
  }, [modes.length]);

  const setDefaultMode = useCallback((modeId: string) => {
    setModes((prev) => {
      const updated = prev.map((mode) => ({
        ...mode,
        isDefault: mode.id === modeId,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteMode = useCallback((modeId: string) => {
    setModes((prev) => {
      const updated = prev.filter((mode) => mode.id !== modeId);
      // If we deleted the default, make the first remaining one default
      if (updated.length > 0 && !updated.some((m) => m.isDefault)) {
        updated[0].isDefault = true;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getDefaultMode = useCallback((): SavedMode | null => {
    return modes.find((m) => m.isDefault) || null;
  }, [modes]);

  return {
    modes,
    saveMode,
    setDefaultMode,
    deleteMode,
    getDefaultMode,
  };
};
