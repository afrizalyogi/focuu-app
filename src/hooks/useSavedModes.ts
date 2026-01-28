import { useState, useEffect, useCallback } from "react";
import { supabase, SavedMode as SupabaseSavedMode } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

const LOCAL_STORAGE_KEY = "focuu_modes";

export const useSavedModes = () => {
  const { user } = useAuth();
  const [modes, setModes] = useState<SavedMode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch modes from Supabase if logged in, otherwise from localStorage
  useEffect(() => {
    const fetchModes = async () => {
      if (user) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("saved_modes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (!error && data) {
          const mapped: SavedMode[] = data.map((m) => ({
            id: m.id,
            name: m.name,
            energyMode: m.energy_mode as EnergyMode,
            sessionLength: m.session_length,
            breakLength: m.break_length,
            isDefault: m.is_default,
            createdAt: m.created_at,
          }));
          setModes(mapped);
        }
        setIsLoading(false);
      } else {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            setModes(JSON.parse(stored));
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      }
    };

    fetchModes();
  }, [user]);

  const saveMode = useCallback(async (
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
      isDefault: modes.length === 0,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      const { error } = await supabase.from("saved_modes").insert({
        id: newMode.id,
        user_id: user.id,
        name,
        energy_mode: energyMode,
        session_length: sessionLength,
        break_length: breakLength,
        is_default: newMode.isDefault,
      });

      if (!error) {
        setModes((prev) => [...prev, newMode]);
      }
    } else {
      setModes((prev) => {
        const updated = [...prev, newMode];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }

    return newMode;
  }, [modes.length, user]);

  const setDefaultMode = useCallback(async (modeId: string) => {
    if (user) {
      // First, unset all defaults
      await supabase
        .from("saved_modes")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Then set the new default
      await supabase
        .from("saved_modes")
        .update({ is_default: true })
        .eq("id", modeId);
    }

    setModes((prev) => {
      const updated = prev.map((mode) => ({
        ...mode,
        isDefault: mode.id === modeId,
      }));
      if (!user) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user]);

  const deleteMode = useCallback(async (modeId: string) => {
    if (user) {
      await supabase.from("saved_modes").delete().eq("id", modeId);
    }

    setModes((prev) => {
      const updated = prev.filter((mode) => mode.id !== modeId);
      // If we deleted the default, make the first remaining one default
      if (updated.length > 0 && !updated.some((m) => m.isDefault)) {
        updated[0].isDefault = true;
        if (user) {
          supabase
            .from("saved_modes")
            .update({ is_default: true })
            .eq("id", updated[0].id);
        }
      }
      if (!user) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user]);

  const getDefaultMode = useCallback((): SavedMode | null => {
    return modes.find((m) => m.isDefault) || null;
  }, [modes]);

  return {
    modes,
    isLoading,
    saveMode,
    setDefaultMode,
    deleteMode,
    getDefaultMode,
  };
};
