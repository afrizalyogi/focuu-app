import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserPreferences {
  musicUrl: string;
  backgroundUrl: string;
  backgroundType: "image" | "video" | "none";
  theme: "dark" | "light" | "book";
}

const LOCAL_PREFS_KEY = "focuu_user_prefs";

const defaultPrefs: UserPreferences = {
  musicUrl: "",
  backgroundUrl: "",
  backgroundType: "none",
  theme: "dark",
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPrefs);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      
      if (user) {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          setPreferences({
            musicUrl: data.music_url || "",
            backgroundUrl: data.background_url || "",
            backgroundType: (data.background_type as any) || "none",
            theme: (data.theme as any) || "dark",
          });
        }
      } else {
        const stored = localStorage.getItem(LOCAL_PREFS_KEY);
        if (stored) {
          try {
            setPreferences({ ...defaultPrefs, ...JSON.parse(stored) });
          } catch {
            localStorage.removeItem(LOCAL_PREFS_KEY);
          }
        }
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    if (user) {
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          music_url: newPrefs.musicUrl,
          background_url: newPrefs.backgroundUrl,
          background_type: newPrefs.backgroundType,
          theme: newPrefs.theme,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    } else {
      localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(newPrefs));
    }
  }, [user, preferences]);

  // Shorthand setters
  const setMusicUrl = useCallback((url: string) => {
    updatePreferences({ musicUrl: url });
  }, [updatePreferences]);

  const setBackgroundUrl = useCallback((url: string, type: "image" | "video" | "none") => {
    updatePreferences({ backgroundUrl: url, backgroundType: type });
  }, [updatePreferences]);

  const setTheme = useCallback((theme: "dark" | "light" | "book") => {
    updatePreferences({ theme });
    // Also apply to document
    document.documentElement.classList.remove("dark", "light", "book");
    document.documentElement.classList.add(theme);
  }, [updatePreferences]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    setMusicUrl,
    setBackgroundUrl,
    setTheme,
  };
};
