import { useState, useEffect } from "react";

interface UserSettings {
  autoStart: boolean;
  workHoursEnabled: boolean;
  workHoursStart: string;
  workHoursEnd: string;
}

const SETTINGS_KEY = "focuu_settings";

const DEFAULT_SETTINGS: UserSettings = {
  autoStart: false,
  workHoursEnabled: false,
  workHoursStart: "09:00",
  workHoursEnd: "18:00",
};

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        localStorage.removeItem(SETTINGS_KEY);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const isWithinWorkHours = (): boolean => {
    if (!settings.workHoursEnabled) return true;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    return currentTime >= settings.workHoursStart && currentTime <= settings.workHoursEnd;
  };

  return {
    settings,
    updateSettings,
    isWithinWorkHours,
  };
};
