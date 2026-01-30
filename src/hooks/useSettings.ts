import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";

export type ThemeMode = "dark" | "light" | "book";

export interface UserSettings {
  autoStart: boolean;
  workHoursEnabled: boolean;
  workHoursStart: string;
  workHoursEnd: string;
  theme: ThemeMode;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

const LOCAL_STORAGE_KEY = "focuu_settings";

const DEFAULT_SETTINGS: UserSettings = {
  autoStart: false,
  workHoursEnabled: false,
  workHoursStart: "09:00",
  workHoursEnd: "18:00",
  theme: "dark",
  soundEnabled: true,
  notificationsEnabled: true,
};

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme to document
  const applyTheme = useCallback((theme: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light", "book");
    root.classList.add(theme);

    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const colors: Record<ThemeMode, string> = {
        dark: "#0f1114",
        light: "#fafafa",
        book: "#f5f0e6",
      };
      meta.setAttribute("content", colors[theme]);
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);

      if (user) {
        // Try to fetch from database
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          const dbSettings: UserSettings = {
            autoStart: data.auto_start ?? DEFAULT_SETTINGS.autoStart,
            workHoursEnabled:
              data.work_hours_enabled ?? DEFAULT_SETTINGS.workHoursEnabled,
            workHoursStart:
              data.work_hours_start ?? DEFAULT_SETTINGS.workHoursStart,
            workHoursEnd: data.work_hours_end ?? DEFAULT_SETTINGS.workHoursEnd,
            theme: (data.theme as ThemeMode) ?? DEFAULT_SETTINGS.theme,
            soundEnabled: data.sound_enabled ?? DEFAULT_SETTINGS.soundEnabled,
            notificationsEnabled:
              data.notifications_enabled ??
              DEFAULT_SETTINGS.notificationsEnabled,
          };
          setSettings(dbSettings);
          applyTheme(dbSettings.theme);
        } else {
          // No DB settings yet, use localStorage or defaults
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored) {
            try {
              const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
              setSettings(parsed);
              applyTheme(parsed.theme);
            } catch {
              applyTheme(DEFAULT_SETTINGS.theme);
            }
          } else {
            applyTheme(DEFAULT_SETTINGS.theme);
          }
        }
      } else {
        // Not logged in, use localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            setSettings(parsed);
            applyTheme(parsed.theme);
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            applyTheme(DEFAULT_SETTINGS.theme);
          }
        } else {
          applyTheme(DEFAULT_SETTINGS.theme);
        }
      }

      setIsLoading(false);
    };

    fetchSettings();
  }, [user, applyTheme]);

  const { track } = useAnalytics();

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      // Apply theme immediately if changed
      if (updates.theme) {
        applyTheme(updates.theme);
        track({
          eventType: "feature_usage",
          eventData: { feature: "theme", value: updates.theme },
        });
      }

      if (updates.notificationsEnabled !== undefined) {
        track({
          eventType: "feature_usage",
          eventData: {
            feature: "notifications",
            value: updates.notificationsEnabled,
          },
        });
      }

      // Always save to localStorage as backup
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));

      if (user) {
        // Upsert to database
        const { error } = await supabase.from("user_settings").upsert(
          {
            user_id: user.id,
            auto_start: newSettings.autoStart,
            work_hours_enabled: newSettings.workHoursEnabled,
            work_hours_start: newSettings.workHoursStart,
            work_hours_end: newSettings.workHoursEnd,
            theme: newSettings.theme,
            sound_enabled: newSettings.soundEnabled,
            notifications_enabled: newSettings.notificationsEnabled,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );

        if (error) {
          console.error("Failed to save settings:", error);
        }
      }
    },
    [settings, user, applyTheme, track],
  );

  const isWithinWorkHours = useCallback((): boolean => {
    if (!settings.workHoursEnabled) return true;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    return (
      currentTime >= settings.workHoursStart &&
      currentTime <= settings.workHoursEnd
    );
  }, [settings]);

  return {
    settings,
    isLoading,
    updateSettings,
    isWithinWorkHours,
  };
};
